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

import { NextFunction, Request, Response } from 'express';

import { contactToArray } from '../util/functions';
import WAJsUtil from '../util/waJsUtil';

export default async function statusConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Verificar se é uma rota WA-JS (que não usa req.client)
    const isWAJsRoute =
      req.path.includes('/all-chats') ||
      req.path.includes('/all-contacts') ||
      req.path.includes('/send-message') ||
      req.path.includes('/execute-script');

    if (isWAJsRoute) {
      // Para rotas WA-JS, verificar se a sessão está ativa
      const session = req.session;
      if (!session) {
        return res.status(400).json({
          response: null,
          status: 'Error',
          message: 'Session parameter is required.',
        });
      }

      const waJsUtil = new WAJsUtil();
      const client = waJsUtil.getClient(session);

      if (!client || client.status === 'CLOSED') {
        return res.status(404).json({
          response: null,
          status: 'Disconnected',
          message: 'A sessão do WhatsApp não está ativa.',
        });
      }

      // Para rotas que precisam verificar números (como envio de mensagem)
      if (req.body && req.body.to) {
        const localArr = contactToArray(
          req.body.to || [],
          req.body.isGroup,
          req.body.isNewsletter,
          req.body.isLid
        );

        // Para WA-JS, vamos pular a verificação de número por enquanto
        // já que o sistema WA-JS tem suas próprias validações
        req.body.phone = localArr;
      }

      return next();
    }

    // Código original para rotas que usam req.client
    if (req.client && typeof req.client.isConnected === 'function') {
      await req.client.isConnected();

      const localArr = contactToArray(
        req.body.phone || [],
        req.body.isGroup,
        req.body.isNewsletter,
        req.body.isLid
      );
      let index = 0;
      for (const contact of localArr) {
        if (req.body.isGroup || req.body.isNewsletter) {
          localArr[index] = contact;
        } else {
          console.log(contact);
          const profile: any = await req.client
            .checkNumberStatus(contact)
            .catch((error) => console.log(error));
          if (!profile?.numberExists) {
            const num = (contact as any).split('@')[0];
            res.status(400).json({
              response: null,
              status: 'Connected',
              message: `O número ${num} não existe.`,
            });
          } else {
            (localArr as any)[index] = profile.id._serialized;
          }
        }
        index++;
      }
      req.body.phone = localArr;
    } else {
      res.status(404).json({
        response: null,
        status: 'Disconnected',
        message: 'A sessão do WhatsApp não está ativa.',
      });
    }
    next();
  } catch (error) {
    if (req.logger) {
      req.logger.error(error);
    } else {
      console.error('StatusConnection middleware error:', error);
    }
    res.status(404).json({
      response: null,
      status: 'Disconnected',
      message: 'A sessão do WhatsApp não está ativa.',
    });
  }
}
