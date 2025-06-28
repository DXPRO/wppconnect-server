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
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const saltRounds = 10;

export async function encryptSession(
  req: Request,
  res: Response
): Promise<any> {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.operationId = 'encryptSession'
   * #swagger.summary = 'Generate Bearer token for session'
   * #swagger.description = 'Generates a Bearer token for the specified session. Use this token in the Authorization header for protected routes.'
   * #swagger.autoBody = false
   * #swagger.parameters['secretkey'] = {
       required: true,
       schema: 'THISISMYSECURETOKEN',
       description: 'Secret key for authentication'
     }
   * #swagger.parameters["session"] = {
      required: true,
      schema: 'NERDWHATS_AMERICA',
      description: 'Session name'
     }
   * #swagger.responses[201] = {
       description: 'Token generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'success' },
               message: { type: 'string', example: 'Token gerado e aplicado automaticamente!' },
               session: { type: 'string', example: 'NERDWHATS_AMERICA' },
               token: { type: 'string', example: '$2b$10$...' },
               full: { type: 'string', example: 'NERDWHATS_AMERICA:$2b$10$...' },
               instructions: {
                 type: 'object',
                 properties: {
                   curl: { type: 'string', example: 'curl -H "Authorization: Bearer $2b$10$..." http://localhost:21470/api/NERDWHATS_AMERICA/qrcode-session' },
                   swagger: { type: 'string', example: 'Use the token "$2b$10$..." in the Swagger Authorize button' },
                   header: { type: 'string', example: 'Authorization: Bearer $2b$10$...' },
                   session_param: { type: 'string', example: 'NERDWHATS_AMERICA:$2b$10$...' }
                 }
               },
               note: { type: 'string', example: 'O token foi gerado e está pronto para uso. Use-o no header Authorization ou como parâmetro de sessão.' }
             }
           }
         }
       }
     }
   * #swagger.responses[400] = {
       description: 'Invalid secret key',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               response: { type: 'boolean', example: false },
               message: { type: 'string', example: 'The SECRET_KEY is incorrect' }
             }
           }
         }
       }
     }
   */
  const { session, secretkey } = req.params;
  const { authorization: token } = req.headers;
  const secureTokenEnv = req.serverOptions.secretKey;

  let tokenDecrypt = '';

  if (secretkey === undefined) {
    tokenDecrypt = (token as string).split(' ')[0];
  } else {
    tokenDecrypt = secretkey;
  }

  if (tokenDecrypt !== secureTokenEnv) {
    return res.status(400).json({
      response: false,
      message: 'The SECRET_KEY is incorrect',
    });
  }

  bcrypt.hash(session + secureTokenEnv, saltRounds, function (err, hash) {
    if (err) return res.status(500).json(err);

    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    const fullToken = `${session}:${hashFormat}`;

    return res.status(201).json({
      status: 'success',
      message: 'Token gerado e aplicado automaticamente!',
      session: session,
      token: hashFormat,
      full: fullToken,
      instructions: {
        curl: `curl -H "Authorization: Bearer ${hashFormat}" http://localhost:${req.serverOptions.port}/api/${session}/qrcode-session`,
        swagger: `Use o token "${hashFormat}" no botão Authorize do Swagger`,
        header: `Authorization: Bearer ${hashFormat}`,
        session_param: fullToken,
      },
      note: 'O token foi gerado e está pronto para uso. Use-o no header Authorization ou como parâmetro de sessão.',
    });
  });
}

export async function generateAndApplyToken(
  req: Request,
  res: Response
): Promise<any> {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.operationId = 'generateAndApplyToken'
   * #swagger.summary = 'Generate and automatically apply token'
   * #swagger.description = 'Generates a Bearer token for the session and provides instructions to apply it to the Swagger UI'
   * #swagger.autoBody = false
   * #swagger.parameters['secretkey'] = {
       required: true,
       schema: 'THISISMYSECURETOKEN',
       description: 'Secret key for authentication'
     }
   * #swagger.parameters["session"] = {
      required: true,
      schema: 'NERDWHATS_AMERICA',
      description: 'Session name'
     }
   * #swagger.responses[200] = {
       description: 'Token generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'success' },
               message: { type: 'string', example: 'Token gerado com sucesso!' },
               session: { type: 'string', example: 'NERDWHATS_AMERICA' },
               token: { type: 'string', example: '$2b$10$...' },
               full: { type: 'string', example: 'NERDWHATS_AMERICA:$2b$10$...' },
               instructions: {
                 type: 'object',
                 properties: {
                   step1: { type: 'string', example: '1. Clique no botão "Authorize" no topo da página' },
                   step2: { type: 'string', example: '2. Cole o token no campo "Value"' },
                   step3: { type: 'string', example: '3. Clique em "Authorize"' },
                   step4: { type: 'string', example: '4. Clique em "Close"' },
                   step5: { type: 'string', example: '5. Agora você pode usar todas as rotas protegidas!' }
                 }
               },
               curl_example: { type: 'string', example: 'curl -H "Authorization: Bearer $2b$10$..." http://localhost:21470/api/NERDWHATS_AMERICA/qrcode-session' },
               swagger_url: { type: 'string', example: 'http://localhost:21470/api-docs' }
             }
           }
         }
       }
     }
   * #swagger.responses[400] = {
       description: 'Invalid secret key',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               response: { type: 'boolean', example: false },
               message: { type: 'string', example: 'The SECRET_KEY is incorrect' }
             }
           }
         }
       }
     }
   */
  const { session, secretkey } = req.params;
  const secureTokenEnv = req.serverOptions.secretKey;

  if (secretkey !== secureTokenEnv) {
    return res.status(400).json({
      response: false,
      message: 'The SECRET_KEY is incorrect',
    });
  }

  bcrypt.hash(session + secureTokenEnv, saltRounds, function (err, hash) {
    if (err) return res.status(500).json(err);

    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    const fullToken = `${session}:${hashFormat}`;
    const swaggerUrl = `http://${req.serverOptions.host}:${req.serverOptions.port}/api-docs`;

    return res.status(200).json({
      status: 'success',
      message: 'Token gerado com sucesso!',
      session: session,
      token: hashFormat,
      full: fullToken,
      instructions: {
        step1: '1. Clique no botão "Authorize" no topo da página',
        step2: `2. Cole o token "${hashFormat}" no campo "Value"`,
        step3: '3. Clique em "Authorize"',
        step4: '4. Clique em "Close"',
        step5: '5. Agora você pode usar todas as rotas protegidas!',
      },
      curl_example: `curl -H "Authorization: Bearer ${hashFormat}" http://${req.serverOptions.host}:${req.serverOptions.port}/api/${session}/qrcode-session`,
      swagger_url: swaggerUrl,
      note: 'Use o token no header Authorization: Bearer [token] para todas as rotas protegidas.',
    });
  });
}

export async function applyTokenAndRedirect(
  req: Request,
  res: Response
): Promise<any> {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.operationId = 'applyTokenAndRedirect'
   * #swagger.summary = 'Apply token and redirect to Swagger UI'
   * #swagger.description = 'Generates a token and redirects to Swagger UI with the token automatically applied'
   * #swagger.autoBody = false
   * #swagger.parameters['secretkey'] = {
       required: true,
       schema: 'THISISMYSECURETOKEN',
       description: 'Secret key for authentication'
     }
   * #swagger.parameters["session"] = {
      required: true,
      schema: 'NERDWHATS_AMERICA',
      description: 'Session name'
     }
   * #swagger.responses[200] = {
       description: 'Token applied and redirecting to Swagger UI',
       content: {
         'text/html': {
           schema: {
             type: 'string',
             example: '<!DOCTYPE html>...'
           }
         }
       }
     }
   */
  const { session, secretkey } = req.params;
  const secureTokenEnv = req.serverOptions.secretKey;

  if (secretkey !== secureTokenEnv) {
    return res.status(400).json({
      response: false,
      message: 'The SECRET_KEY is incorrect',
    });
  }

  bcrypt.hash(session + secureTokenEnv, saltRounds, function (err, hash) {
    if (err) return res.status(500).json(err);

    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    const swaggerUrl = `http://${req.serverOptions.host}:${req.serverOptions.port}/api-docs`;

    // Retornar HTML que aplica o token e redireciona para o Swagger UI
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Aplicando Token e Redirecionando...</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .token { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 5px; 
            font-family: monospace; 
            margin: 10px 0; 
            word-break: break-all;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🔐 Aplicando Token Automaticamente</h2>
        <div class="spinner"></div>
        <p>Aplicando token no Swagger UI...</p>
        <p><strong>Token:</strong></p>
        <div class="token">${hashFormat}</div>
        <p>Redirecionando em <span id="countdown">3</span> segundos...</p>
    </div>

    <script>
        // Armazenar o token no localStorage
        localStorage.setItem('wppconnect_token', '${hashFormat}');
        localStorage.setItem('wppconnect_session', '${session}');
        localStorage.setItem('wppconnect_server_url', 'http://${req.serverOptions.host}:${req.serverOptions.port}');
        
        // Contador regressivo
        let countdown = 3;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                
                // Abrir o Swagger UI em uma nova janela
                const newWindow = window.open('${swaggerUrl}', '_blank');
                
                // Aguardar o Swagger carregar e aplicar o token
                setTimeout(() => {
                    if (newWindow) {
                        try {
                            // Tentar aplicar o token diretamente
                            newWindow.swaggerUi.preauthorizeApiKey('bearerAuth', '${hashFormat}');
                            console.log('Token aplicado com sucesso!');
                        } catch (error) {
                            console.log('Token armazenado no localStorage');
                        }
                    }
                }, 2000);
                
                // Fechar esta janela
                setTimeout(() => {
                    window.close();
                }, 1000);
            }
        }, 1000);
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  });
}

export async function applyTokenAuto(
  req: Request,
  res: Response
): Promise<any> {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.operationId = 'applyTokenAuto'
   * #swagger.summary = 'Apply token automatically in popup'
   * #swagger.description = 'Generates a token and shows a popup modal to apply it to the Swagger UI'
   * #swagger.autoBody = false
   * #swagger.parameters['secretkey'] = {
       required: true,
       schema: 'THISISMYSECURETOKEN',
       description: 'Secret key for authentication'
     }
   * #swagger.parameters["session"] = {
      required: true,
      schema: 'NERDWHATS_AMERICA',
      description: 'Session name'
     }
   * #swagger.responses[200] = {
       description: 'Token applied automatically',
       content: {
         'text/html': {
           schema: {
             type: 'string',
             example: '<!DOCTYPE html>...'
           }
         }
       }
     }
   */
  const { session, secretkey } = req.params;
  const secureTokenEnv = req.serverOptions.secretKey;

  if (secretkey !== secureTokenEnv) {
    return res.status(400).json({
      response: false,
      message: 'The SECRET_KEY is incorrect',
    });
  }

  bcrypt.hash(session + secureTokenEnv, saltRounds, function (err, hash) {
    if (err) return res.status(500).json(err);

    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    const swaggerUrl = `http://${req.serverOptions.host}:${req.serverOptions.port}/api-docs`;

    // Retornar HTML com popup modal para aplicar o token
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Token Aplicado Automaticamente</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .info { color: #17a2b8; font-weight: bold; }
        .token { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            font-family: monospace; 
            margin: 15px 0; 
            word-break: break-all;
            border: 2px solid #e9ecef;
            font-size: 14px;
        }
        .button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px;
            margin: 8px 4px;
            transition: transform 0.2s;
        }
        .button:hover { 
            transform: translateY(-2px);
        }
        .button.secondary {
            background: #6c757d;
        }
        .button.success {
            background: #28a745;
        }
        .status {
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            font-weight: bold;
        }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .status.info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            margin-top: -20px;
            margin-right: -10px;
        }
        .close:hover {
            color: #000;
        }
        .steps {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .step {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .step:last-child {
            border-bottom: none;
        }
        .step-number {
            background: #667eea;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Token Gerado com Sucesso!</h1>
        
        <div id="status" class="status info">
            ⏳ Token pronto para aplicação...
        </div>
        
        <h3>Detalhes do Token:</h3>
        <p><strong>Sessão:</strong> ${session}</p>
        <p><strong>Token:</strong></p>
        <div class="token">${hashFormat}</div>
        
        <h3>Ações Disponíveis:</h3>
        <button class="button" onclick="showApplyInstructions()">📋 Mostrar Instruções</button>
        <button class="button" onclick="copyToken()">📋 Copiar Token</button>
        <button class="button" onclick="testQRCode()">🔍 Testar QR Code</button>
        <button class="button secondary" onclick="window.close()">❌ Fechar</button>
    </div>

    <!-- Modal com instruções -->
    <div id="instructionsModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>📋 Como Aplicar o Token no Swagger UI</h2>
            
            <div class="steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Abra o Swagger UI:</strong> <a href="${swaggerUrl}" target="_blank">${swaggerUrl}</a>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Clique no botão "Authorize"</strong> no canto superior direito da página
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Cole o token no campo "Value":</strong>
                    <div class="token" style="margin-top: 8px;">${hashFormat}</div>
                </div>
                <div class="step">
                    <span class="step-number">4</span>
                    <strong>Clique em "Authorize"</strong> para aplicar o token
                </div>
                <div class="step">
                    <span class="step-number">5</span>
                    <strong>Clique em "Close"</strong> para fechar o modal
                </div>
                <div class="step">
                    <span class="step-number">6</span>
                    <strong>Pronto!</strong> Agora você pode usar todas as rotas protegidas
                </div>
            </div>
            
            <button class="button success" onclick="copyTokenAndOpenSwagger()">🚀 Copiar Token e Abrir Swagger</button>
            <button class="button" onclick="closeModal()">Fechar</button>
        </div>
    </div>

    <script>
        // Função para mostrar o modal com instruções
        function showApplyInstructions() {
            document.getElementById('instructionsModal').style.display = 'block';
        }
        
        // Função para fechar o modal
        function closeModal() {
            document.getElementById('instructionsModal').style.display = 'none';
        }
        
        // Fechar modal ao clicar fora dele
        window.onclick = function(event) {
            const modal = document.getElementById('instructionsModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
        
        // Função para copiar o token
        function copyToken() {
            navigator.clipboard.writeText('${hashFormat}').then(() => {
                updateStatus('✅ Token copiado para a área de transferência!', 'success');
            }).catch(() => {
                updateStatus('❌ Erro ao copiar token', 'error');
            });
        }
        
        // Função para copiar token e abrir Swagger
        function copyTokenAndOpenSwagger() {
            // Copiar o token
            navigator.clipboard.writeText('${hashFormat}').then(() => {
                updateStatus('✅ Token copiado! Abrindo Swagger UI...', 'success');
                
                // Abrir Swagger UI em nova aba
                window.open('${swaggerUrl}', '_blank');
                
                // Fechar modal
                closeModal();
            }).catch(() => {
                updateStatus('❌ Erro ao copiar token', 'error');
            });
        }
        
        // Função para testar o QR Code
        function testQRCode() {
            const testUrl = 'http://${req.serverOptions.host}:${req.serverOptions.port}/api/${session}/qrcode-session';
            const headers = {
                'Authorization': 'Bearer ${hashFormat}',
                'accept': '*/*'
            };
            
            updateStatus('🔍 Testando QR Code...', 'info');
            
            fetch(testUrl, {
                method: 'GET',
                headers: headers
            })
            .then(response => response.json())
            .then(data => {
                updateStatus('✅ QR Code testado: ' + (data.status || data.message), 'success');
            })
            .catch(error => {
                updateStatus('❌ Erro ao testar QR Code: ' + error.message, 'error');
            });
        }
        
        // Função para atualizar o status
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
        }
        
        // Copiar token automaticamente ao carregar a página
        setTimeout(() => {
            copyToken();
        }, 1000);
        
        // Mostrar instruções automaticamente após 2 segundos
        setTimeout(() => {
            showApplyInstructions();
        }, 2000);
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  });
}

export async function testWebhookWithToken(
  req: Request,
  res: Response
): Promise<any> {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.operationId = 'testWebhookWithToken'
   * #swagger.summary = 'Test webhook with generated token'
   * #swagger.description = 'Generates a token and sends it to the webhook for testing'
   * #swagger.autoBody = false
   * #swagger.parameters['secretkey'] = {
       required: true,
       schema: 'THISISMYSECURETOKEN',
       description: 'Secret key for authentication'
     }
   * #swagger.parameters["session"] = {
      required: true,
      schema: 'NERDWHATS_AMERICA',
      description: 'Session name'
     }
   * #swagger.responses[200] = {
       description: 'Webhook test completed',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'success' },
               message: { type: 'string', example: 'Webhook test completed' },
               token: { type: 'string', example: '$2b$10$...' },
               webhook_url: { type: 'string', example: 'https://whats.li/api/webhook.php' },
               webhook_response: { type: 'object' }
             }
           }
         }
       }
     }
   */
  const { session, secretkey } = req.params;
  const secureTokenEnv = req.serverOptions.secretKey;

  if (secretkey !== secureTokenEnv) {
    return res.status(400).json({
      response: false,
      message: 'The SECRET_KEY is incorrect',
    });
  }

  bcrypt.hash(session + secureTokenEnv, saltRounds, async function (err, hash) {
    if (err) return res.status(500).json(err);

    const hashFormat = hash.replace(/\//g, '_').replace(/\+/g, '-');
    const webhookUrl =
      req.serverOptions.webhook?.url || 'https://whats.li/api/webhook.php';

    try {
      // Enviar o token para o webhook como teste
      const webhookData = {
        event: 'token_test',
        session: session,
        token: hashFormat,
        timestamp: new Date().toISOString(),
        test: true,
        message: 'Token gerado para teste do webhook',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hashFormat}`,
          'X-Test-Token': hashFormat,
        },
        body: JSON.stringify(webhookData),
      });

      const webhookResponse = await response.text();

      return res.status(200).json({
        status: 'success',
        message: 'Webhook test completed',
        session: session,
        token: hashFormat,
        webhook_url: webhookUrl,
        webhook_response: {
          status: response.status,
          statusText: response.statusText,
          body: webhookResponse,
        },
        note: 'Verifique o webhook para confirmar se recebeu o token corretamente',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao testar webhook',
        error: error instanceof Error ? error.message : String(error),
        token: hashFormat,
        webhook_url: webhookUrl,
      });
    }
  });
}
