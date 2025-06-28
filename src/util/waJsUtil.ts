/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Request } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as puppeteer from 'puppeteer';

import { WhatsAppServer } from '../types/WhatsAppServer';
import { callWebHook } from './functions';
import { clientsArray, eventEmitter } from './sessionUtil';

export default class WAJsUtil {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;

  private getChromiumPath(): string | undefined {
    // Caminho padrão do Chromium baixado pelo Puppeteer
    const home = os.homedir();
    const basePath = path.join(home, '.cache', 'puppeteer', 'chrome');
    if (fs.existsSync(basePath)) {
      const versions = fs.readdirSync(basePath);
      if (versions.length > 0) {
        // Pega a versão mais recente
        const latest = versions.sort().reverse()[0];
        const chromePath = path.join(
          basePath,
          latest,
          'chrome-win64',
          'chrome.exe'
        );
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      }
    }
    return undefined;
  }

  async createSessionUtil(req: any, session: string): Promise<void> {
    try {
      let client = this.getClient(session) as any;

      // Se o client não existe, inicializar com estrutura básica
      if (!client) {
        client = {
          session: session,
          status: 'CLOSED',
          config: {},
        };
        clientsArray[session] = client;
      }

      // Verificar se já está inicializando ou conectado
      if (client.status != null && client.status !== 'CLOSED') {
        return;
      }

      client.status = 'INITIALIZING';
      client.config = req.body;

      // Usar Chromium baixado pelo Puppeteer
      const executablePath = this.getChromiumPath();
      const puppeteerLaunchOptions = {
        headless: false,
        executablePath,
        args: req.serverOptions.createOptions?.puppeteerOptions?.args ?? [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        // userDataDir: req.serverOptions.customUserDataDir
        //   ? `${req.serverOptions.customUserDataDir}${session}`
        //   : undefined,
      };
      console.log('Puppeteer launch options:', puppeteerLaunchOptions);
      this.browser = await puppeteer.launch(puppeteerLaunchOptions);

      // Reutilizar a primeira página aberta pelo Puppeteer
      const pages = await this.browser.pages();
      this.page = pages[0];

      // Configurar viewport e user agent
      await this.page.setViewport({ width: 1280, height: 720 });
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // INJEÇÃO ANTECIPADA: Usar evaluateOnNewDocument() para injetar WA-JS antes do carregamento
      const waJsPath = require.resolve('@wppconnect/wa-js');
      const waJsContent = fs.readFileSync(waJsPath, 'utf8');
      console.log('==== INÍCIO DO SCRIPT WA-JS PARA INJEÇÃO ANTECIPADA ====');
      console.log(waJsContent.slice(0, 2000)); // Mostra os primeiros 2000 caracteres
      console.log('==== FIM DO SCRIPT WA-JS (parcial) ====');

      try {
        // Injetar WA-JS ANTES de navegar para a página
        await this.page.evaluateOnNewDocument(waJsContent);
        console.log(
          '✅ WA-JS injetado via evaluateOnNewDocument() - estará disponível desde o início!'
        );
      } catch (e) {
        console.error(
          '❌ Erro ao injetar WA-JS via evaluateOnNewDocument():',
          e
        );
      }

      // Navegar para o WhatsApp Web com timeout otimizado
      await this.page.goto('https://web.whatsapp.com/', {
        waitUntil: 'domcontentloaded', // Mais rápido que networkidle2
        timeout: 30000, // 30 segundos de timeout
      });

      // FALLBACK: Se a página já estava carregada, injetar via evaluate()
      try {
        const wppExists = await this.page.evaluate(
          () => typeof window.WPP !== 'undefined'
        );
        if (!wppExists) {
          console.log(
            '⚠️ WPP não encontrado após carregamento, injetando via evaluate()...'
          );
          await this.page.evaluate(waJsContent);
          console.log('✅ WA-JS injetado via evaluate() como fallback!');
        } else {
          console.log(
            '✅ WPP já está disponível! (injeção antecipada funcionou)'
          );
        }
      } catch (e) {
        console.error('❌ Erro no fallback de injeção:', e);
      }

      // LOG E DUMP AUTOMÁTICO APÓS INJEÇÃO
      const wppExistsFinal = await this.page.evaluate(
        () => typeof window.WPP !== 'undefined'
      );
      if (wppExistsFinal) {
        console.log(
          '✅ Variável global WPP detectada no contexto do navegador!'
        );
      } else {
        console.error(
          '❌ Variável global WPP NÃO encontrada após injeção! Dumpando window e erros...'
        );
        // Dump parcial do window (apenas chaves)
        const windowKeys = await this.page.evaluate(() => Object.keys(window));
        console.error('Chaves do window:', windowKeys);
        // Dump de erros do console
        const consoleErrors = await this.page.evaluate(() => {
          const errors: string[] = [];
          window.addEventListener('error', (e) => {
            errors.push(e.message);
          });
          return errors;
        });
        console.error('Erros capturados no console:', consoleErrors);
      }

      // Fechar outras abas em branco, se existirem
      for (const p of pages) {
        if (p !== this.page && (await p.url()) === 'about:blank') {
          await p.close();
        }
      }

      // Aguardar o WA-JS carregar com timeout otimizado
      await this.page.waitForFunction(
        () => window.WPP?.isReady,
        { timeout: 30000 } // 30 segundos de timeout
      );

      // Configurar o cliente com as funções do WA-JS
      client = clientsArray[session] = {
        ...client,
        page: this.page,
        browser: this.browser,
        session: session,
        status: 'CONNECTED',
        // Expor funções do WA-JS diretamente
        getAllUnreadMessages: () =>
          this.page?.evaluate(() => window.WPP.chat.getAllUnreadMessages()),
        getChat: (chatId: string) =>
          this.page?.evaluate(({ id }) => window.WPP.chat.getChat(id), {
            id: chatId,
          }),
        sendTextMessage: (to: string, message: string) =>
          this.page?.evaluate(
            ({ t, m }) => window.WPP.chat.sendTextMessage(t, m),
            { t: to, m: message }
          ),
        sendImageMessage: (to: string, image: string, caption?: string) =>
          this.page?.evaluate(
            ({ t, i, c }) => window.WPP.chat.sendImageMessage(t, i, c),
            { t: to, i: image, c: caption }
          ),
        sendVideoMessage: (to: string, video: string, caption?: string) =>
          this.page?.evaluate(
            ({ t, v, c }) => window.WPP.chat.sendVideoMessage(t, v, c),
            { t: to, v: video, c: caption }
          ),
        sendFileMessage: (to: string, file: string, caption?: string) =>
          this.page?.evaluate(
            ({ t, f, c }) => window.WPP.chat.sendFileMessage(t, f, c),
            { t: to, f: file, c: caption }
          ),
        sendAudioMessage: (to: string, audio: string) =>
          this.page?.evaluate(
            ({ t, a }) => window.WPP.chat.sendAudioMessage(t, a),
            { t: to, a: audio }
          ),
        deleteMessage: (chatId: string, messageId: string) =>
          this.page?.evaluate(
            ({ c, m }) => window.WPP.chat.deleteMessage(c, m),
            { c: chatId, m: messageId }
          ),
        getContact: (contactId: string) =>
          this.page?.evaluate(({ id }) => window.WPP.contact.getContact(id), {
            id: contactId,
          }),
        getAllContacts: () =>
          this.page?.evaluate(() => window.WPP.contact.getAllContacts()),
        blockContact: (contactId: string) =>
          this.page?.evaluate(({ id }) => window.WPP.contact.blockContact(id), {
            id: contactId,
          }),
        unblockContact: (contactId: string) =>
          this.page?.evaluate(
            ({ id }) => window.WPP.contact.unblockContact(id),
            { id: contactId }
          ),
        createGroup: (name: string, participants: string[]) =>
          this.page?.evaluate(
            ({ n, p }) => window.WPP.group.createGroup(n, p),
            { n: name, p: participants }
          ),
        addParticipant: (groupId: string, participantId: string) =>
          this.page?.evaluate(
            ({ g, p }) => window.WPP.group.addParticipant(g, p),
            { g: groupId, p: participantId }
          ),
        removeParticipant: (groupId: string, participantId: string) =>
          this.page?.evaluate(
            ({ g, p }) => window.WPP.group.removeParticipant(g, p),
            { g: groupId, p: participantId }
          ),
        promoteParticipant: (groupId: string, participantId: string) =>
          this.page?.evaluate(
            ({ g, p }) => window.WPP.group.promoteParticipant(g, p),
            { g: groupId, p: participantId }
          ),
        demoteParticipant: (groupId: string, participantId: string) =>
          this.page?.evaluate(
            ({ g, p }) => window.WPP.group.demoteParticipant(g, p),
            { g: groupId, p: participantId }
          ),
        // Função para obter QR code
        getQRCode: () =>
          this.page?.evaluate(() => {
            if (window.WPP?.conn?.isAuthenticated()) {
              return null; // Se já está autenticado, não há QR code
            }
            // @ts-expect-error - WA-JS types podem não estar atualizados
            return window.WPP.conn.getQrCode();
          }),
        // Função para verificar autenticação
        isAuthenticated: () =>
          this.page?.evaluate(
            () => window.WPP?.conn?.isAuthenticated() || false
          ),
        // Função para gerar código de link de dispositivo
        genLinkDeviceCodeForPhoneNumber: (
          phone: string,
          sendPushNotification: boolean = true
        ) =>
          this.page?.evaluate(
            ({ p, s }) => {
              // @ts-expect-error - WA-JS types podem não estar atualizados
              return window.WPP.conn.genLinkDeviceCodeForPhoneNumber(p, s);
            },
            { p: phone, s: sendPushNotification }
          ),
        // Função para fechar a sessão
        close: async () => {
          if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
          }
        },
      };

      // Configurar listeners de eventos
      // await this.setupEventListeners(client, req);

      // Adicionar listener para o evento de QR code do WA-JS
      await this.page.exposeFunction('onQrCode', (qrCode: string) => {
        (client as any).lastQrCode = qrCode;
        if (req && req.logger) {
          req.logger.info(
            `[${client.session}] QR code capturado via evento: ${qrCode}`
          );
        } else {
          console.log(
            `[${client.session}] QR code capturado via evento: ${qrCode}`
          );
        }
      });
      await this.page.evaluate(() => {
        if (window.WPP && typeof (window.WPP as any).on === 'function') {
          (window.WPP as any).on('conn.change.qr', (qr: any) => {
            // @ts-expect-error - onQrCode é exposto via exposeFunction
            window.onQrCode(qr);
          });
        }
      });

      // Verificar autenticação imediatamente
      // const isAuthenticated = await client.isAuthenticated();
      // if (!isAuthenticated) {
      //   client.status = 'QRCODE';
      //   // Emitir evento de QR Code
      //   this.exportQR(req, null, null, client, res);
      // } else {
      //   client.status = 'CONNECTED';
      //   await this.start(req, client);
      // }

      // Por enquanto, sempre definir como CONNECTED para testar
      client.status = 'CONNECTED';
      await this.start(req, client);
    } catch (error) {
      if (req && req.logger) {
        req.logger.error(`Erro ao criar sessão WA-JS: ${error}`);
      } else {
        console.error(`Erro ao criar sessão WA-JS: ${error}`);
      }
      const client = this.getClient(session);
      if (client) {
        client.status = 'CLOSED';
      }
    }
  }

  private async setupEventListeners(
    client: WhatsAppServer,
    req: any
  ): Promise<void> {
    if (!this.page) return;

    // Listener para novas mensagens
    await this.page.evaluate(() => {
      window.WPP.chat.on('chat.new_message', (message: any) => {
        window.dispatchEvent(
          new CustomEvent('newMessage', { detail: message })
        );
      });
    });

    // Listener para mudanças de status
    await this.page.evaluate(() => {
      window.WPP.conn.on('change.state', (state: any) => {
        window.dispatchEvent(new CustomEvent('stateChange', { detail: state }));
      });
    });

    // Escutar eventos do navegador
    this.page.on('console', (msg) => {
      if (msg.type() === 'log') {
        if (req && req.logger) {
          req.logger.info(`[${client.session}] Browser: ${msg.text()}`);
        } else {
          console.log(`[${client.session}] Browser: ${msg.text()}`);
        }
      }
    });

    // Escutar eventos customizados
    await this.page.exposeFunction('onNewMessage', (message: any) => {
      callWebHook(client, req, 'onMessage', message);
    });

    await this.page.exposeFunction('onStateChange', (state: any) => {
      eventEmitter.emit(`status-${client.session}`, client, state);
    });
  }

  private exportQR(
    req: any,
    qrCode: any,
    urlCode: any,
    client: WhatsAppServer,
    res?: any
  ): void {
    // Implementar lógica de QR Code similar ao createSessionUtil original
    // eventEmitter.emit(`qrcode-${client.session}`, qrCode, client);

    Object.assign(client, {
      status: 'QRCODE',
      qrcode: qrCode,
    });

    // req.io.emit('qrCode', {
    //   data: qrCode,
    //   session: client.session,
    // });

    // callWebHook(client, req, 'qrCode', {
    //   qrcode: qrCode,
    //   session: client.session,
    // });

    if (res && !res._headerSent) {
      res.status(200).json({
        status: 'qrcode',
        qrcode: qrCode,
        session: client.session,
      });
    }
  }

  private async start(req: Request, client: WhatsAppServer): Promise<void> {
    // Implementar lógica de inicialização
    if (req && req.logger) {
      req.logger.info(`[${client.session}] Sessão WA-JS iniciada com sucesso`);
    } else {
      console.log(`[${client.session}] Sessão WA-JS iniciada com sucesso`);
    }
  }

  public getClient(session: string): WhatsAppServer | undefined {
    return clientsArray[session] as WhatsAppServer;
  }

  async opendata(req: Request, session: string): Promise<void> {
    await this.createSessionUtil(req, session);
  }

  async getQRCode(session: string): Promise<string | null> {
    const client = this.getClient(session);
    if (!client || !(client as any).getQRCode) {
      return null;
    }
    return await (client as any).getQRCode();
  }

  /**
   * Generate Link Device Code for Authentication using phone number
   * Alternative login method using code instead of QR code
   *
   * @param session - Session name
   * @param phone - Phone number in international format (e.g., "5511999999999")
   * @param sendPushNotification - Whether to send push notification (default: true)
   * @returns Promise<string> - The generated link device code
   */
  async genLinkDeviceCodeForPhoneNumber(
    session: string,
    phone: string,
    sendPushNotification: boolean = true
  ): Promise<string> {
    console.log('genLinkDeviceCodeForPhoneNumber called with:', {
      session,
      phone,
      sendPushNotification,
    });

    const client = this.getClient(session);
    console.log('Client found:', !!client);

    if (!client) {
      console.log('Client not found');
      throw new Error('Client not found');
    }

    if (!(client as any).genLinkDeviceCodeForPhoneNumber) {
      console.log('Method genLinkDeviceCodeForPhoneNumber not available');
      console.log('Available methods:', Object.getOwnPropertyNames(client));
      throw new Error('genLinkDeviceCodeForPhoneNumber method not available');
    }

    if (!phone || typeof phone !== 'string') {
      console.log('Invalid phone parameter');
      throw new Error("Can't get code without phone number param");
    }

    try {
      console.log('Calling client.genLinkDeviceCodeForPhoneNumber...');
      console.log('Client type:', typeof client);
      console.log(
        'Method type:',
        typeof (client as any).genLinkDeviceCodeForPhoneNumber
      );

      const code = await (client as any).genLinkDeviceCodeForPhoneNumber(
        phone,
        sendPushNotification
      );

      console.log('Code generated successfully:', code);
      return code;
    } catch (error) {
      console.error('Error in genLinkDeviceCodeForPhoneNumber:', error);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );
      throw new Error(
        `Failed to generate link device code: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getAuthCode(session: string): Promise<any> {
    const client = this.getClient(session);
    if (!client || !client.page) {
      throw new Error('Sessão não encontrada ou página não inicializada');
    }

    return new Promise((resolve, reject) => {
      let authCodeCaptured = false;
      const timeout = setTimeout(() => {
        if (!authCodeCaptured) {
          reject(
            new Error('Timeout: AuthCode não foi capturado em 30 segundos')
          );
        }
      }, 30000);

      // Capturar logs do console do navegador
      client.page!.on('console', async (msg) => {
        const text = msg.text();
        if (text.startsWith('[WA-JS] Novo QR Code:')) {
          const code = text.replace('[WA-JS] Novo QR Code:', '').trim();
          console.log('✅ AuthCode capturado via evento:', code);
          authCodeCaptured = true;
          clearTimeout(timeout);
          resolve({ fullCode: code, method: 'event_capture' });
        }
      });

      // Executar no contexto do navegador para configurar o listener
      client
        .page!.evaluate(() => {
          if (window.WPP && typeof (window.WPP as any).on === 'function') {
            (window.WPP as any).on('conn.auth_code_change', (authCode: any) => {
              console.log('[WA-JS] Novo QR Code:', authCode.fullCode);
            });
            console.log('✅ Listener de auth_code_change configurado');
          } else {
            console.log('❌ WPP.on não disponível para configurar listener');
          }
        })
        .catch(reject);
    });
  }

  // ===== SISTEMA PADRONIZADO DE EXECUÇÃO WA-JS =====

  /**
   * Executa uma função WA-JS no contexto do navegador e captura o resultado via console
   * @param session - Nome da sessão
   * @param functionName - Nome da função WA-JS a executar
   * @param params - Parâmetros para a função
   * @param timeout - Timeout em ms (padrão: 10000)
   * @returns Promise com o resultado da execução
   */
  async executeWAJsFunction(
    session: string,
    functionName: string,
    params: any = {},
    timeout: number = 10000
  ): Promise<any> {
    const client = this.getClient(session);
    if (!client || !client.page) {
      throw new Error('Sessão não encontrada ou página não inicializada');
    }

    return new Promise((resolve, reject) => {
      let resultCaptured = false;
      const timeoutId = setTimeout(() => {
        if (!resultCaptured) {
          reject(
            new Error(
              `Timeout: Função ${functionName} não retornou em ${timeout}ms`
            )
          );
        }
      }, timeout);

      // Capturar logs do console do navegador
      const consoleHandler = async (msg: any) => {
        const text = msg.text();
        if (text.startsWith(`[WA-JS-RESULT] ${functionName}:`)) {
          try {
            const jsonData = text
              .replace(`[WA-JS-RESULT] ${functionName}:`, '')
              .trim();
            const result = JSON.parse(jsonData);
            console.log(`✅ ${functionName} executada com sucesso:`, result);
            resultCaptured = true;
            clearTimeout(timeoutId);
            client.page!.off('console', consoleHandler);
            resolve(result);
          } catch (error) {
            console.error(
              `❌ Erro ao parsear resultado de ${functionName}:`,
              error
            );
            resultCaptured = true;
            clearTimeout(timeoutId);
            client.page!.off('console', consoleHandler);
            reject(new Error(`Erro ao parsear resultado: ${error}`));
          }
        } else if (text.startsWith(`[WA-JS-ERROR] ${functionName}:`)) {
          const errorMsg = text
            .replace(`[WA-JS-ERROR] ${functionName}:`, '')
            .trim();
          console.error(`❌ Erro na execução de ${functionName}:`, errorMsg);
          resultCaptured = true;
          clearTimeout(timeoutId);
          client.page!.off('console', consoleHandler);
          reject(new Error(`Erro na execução: ${errorMsg}`));
        }
      };

      client.page!.on('console', consoleHandler);

      // Executar função no contexto do navegador
      client
        .page!.evaluate(
          ({ fn, p }: { fn: string; p: any[] }) => {
            try {
              // Construir caminho da função WA-JS
              const functionPath = fn.split('.');
              let waJsFunction: any = window.WPP;

              for (const path of functionPath) {
                if (
                  waJsFunction &&
                  typeof waJsFunction === 'object' &&
                  path in waJsFunction
                ) {
                  waJsFunction = waJsFunction[path];
                } else {
                  throw new Error(`Função ${fn} não encontrada no WA-JS`);
                }
              }

              if (typeof waJsFunction !== 'function') {
                throw new Error(`${fn} não é uma função válida`);
              }

              // Executar função com parâmetros
              const result = waJsFunction(...p);

              // Se for uma Promise, aguardar
              if (result && typeof result.then === 'function') {
                result
                  .then((res: any) => {
                    console.log(`[WA-JS-RESULT] ${fn}:`, JSON.stringify(res));
                  })
                  .catch((error: any) => {
                    console.log(`[WA-JS-ERROR] ${fn}:`, error.message || error);
                  });
              } else {
                console.log(`[WA-JS-RESULT] ${fn}:`, JSON.stringify(result));
              }
            } catch (error: any) {
              console.log(`[WA-JS-ERROR] ${fn}:`, error.message || error);
            }
          },
          { fn: functionName, p: Array.isArray(params) ? params : [params] }
        )
        .catch(reject);
    });
  }

  /**
   * Executa múltiplas funções WA-JS em sequência
   * @param session - Nome da sessão
   * @param functions - Array de objetos com functionName e params
   * @returns Promise com array de resultados
   */
  async executeMultipleWAJsFunctions(
    session: string,
    functions: Array<{ functionName: string; params?: any; timeout?: number }>
  ): Promise<
    Array<{
      success: boolean;
      functionName: string;
      result?: any;
      error?: string;
    }>
  > {
    const results: Array<{
      success: boolean;
      functionName: string;
      result?: any;
      error?: string;
    }> = [];

    for (const func of functions) {
      try {
        const result = await this.executeWAJsFunction(
          session,
          func.functionName,
          func.params,
          func.timeout
        );
        results.push({
          success: true,
          functionName: func.functionName,
          result,
        });
      } catch (error) {
        results.push({
          success: false,
          functionName: func.functionName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  // ===== FUNÇÕES ESPECÍFICAS USANDO O SISTEMA PADRONIZADO =====

  async listAllChats(session: string): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.list');
  }

  async getChatDetails(session: string, chatId: string): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.getChat', [chatId]);
  }

  async getAllContacts(session: string): Promise<any> {
    return this.executeWAJsFunction(session, 'contact.getAllContacts');
  }

  async getContactDetails(session: string, contactId: string): Promise<any> {
    return this.executeWAJsFunction(session, 'contact.getContact', [contactId]);
  }

  async sendMessage(
    session: string,
    to: string,
    content: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.sendTextMessage', [
      to,
      content,
    ]);
  }

  async sendImage(
    session: string,
    to: string,
    image: string,
    caption?: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.sendImageMessage', [
      to,
      image,
      caption,
    ]);
  }

  async sendFile(
    session: string,
    to: string,
    file: string,
    caption?: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.sendFileMessage', [
      to,
      file,
      caption,
    ]);
  }

  async deleteMessage(
    session: string,
    chatId: string,
    messageId: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'chat.deleteMessage', [
      chatId,
      messageId,
    ]);
  }

  async createGroup(
    session: string,
    name: string,
    participants: string[]
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'group.createGroup', [
      name,
      participants,
    ]);
  }

  async addParticipant(
    session: string,
    groupId: string,
    participantId: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'group.addParticipant', [
      groupId,
      participantId,
    ]);
  }

  async removeParticipant(
    session: string,
    groupId: string,
    participantId: string
  ): Promise<any> {
    return this.executeWAJsFunction(session, 'group.removeParticipant', [
      groupId,
      participantId,
    ]);
  }

  async blockContact(session: string, contactId: string): Promise<any> {
    return this.executeWAJsFunction(session, 'contact.blockContact', [
      contactId,
    ]);
  }

  async unblockContact(session: string, contactId: string): Promise<any> {
    return this.executeWAJsFunction(session, 'contact.unblockContact', [
      contactId,
    ]);
  }

  async isAuthenticated(session: string): Promise<boolean> {
    try {
      const result = await this.executeWAJsFunction(
        session,
        'conn.isAuthenticated'
      );
      return result === true;
    } catch (error) {
      return false;
    }
  }

  async getConnectionState(session: string): Promise<any> {
    return this.executeWAJsFunction(session, 'conn.getState');
  }

  // ===== FUNÇÕES EXISTENTES MANTIDAS PARA COMPATIBILIDADE =====
}
