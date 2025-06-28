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

import { clientsArray } from '../util/sessionUtil';
import WAJsUtil from '../util/waJsUtil';

// ===== SESSÃO =====
export async function startSession(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'startSession'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Session started successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           message: { type: 'string', example: 'Session started successfully' },
   *           session: { type: 'string', example: 'NERDWHATS_AMERICA' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[500] = {
   *   description: 'Internal server error',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Failed to start session: Error message' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const waJsUtil = new WAJsUtil();
    const client = waJsUtil.getClient(session);
    if (!client || client.status === 'CLOSED') {
      await waJsUtil.opendata(req, session);
    }
    // Se chegou até aqui, a sessão foi iniciada com sucesso
    if (!res.headersSent) {
      res.status(200).json({
        status: 'success',
        message: 'Session started successfully',
        session: session,
      });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: `Failed to start session: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }
}

export async function getQRCode(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getQRCode'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'QR Code generated successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'qrcode' },
   *           qrcode: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' },
   *           session: { type: 'string', example: 'NERDWHATS_AMERICA' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[401] = {
   *   description: 'Unauthorized - Token is not present',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           message: { type: 'string', example: 'Token is not present. Check your header and try again' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const waJsUtil = new WAJsUtil();
    const client = waJsUtil.getClient(session);

    if (!client || client.status === 'CLOSED') {
      if (!res.headersSent) {
        await waJsUtil.opendata(req, session);
      }
      return;
    }

    // Verificar se já está autenticado
    const isAuthenticated = await waJsUtil.isAuthenticated(session);
    if (isAuthenticated) {
      if (!res.headersSent) {
        return res.status(200).json({
          status: 'authenticated',
          message: 'WhatsApp já está autenticado',
          session: session,
        });
      }
      return;
    }

    // Obter o QR code usando o novo sistema
    try {
      const qrCode = await waJsUtil.getQRCode(session);
      if (qrCode) {
        if (!res.headersSent) {
          return res.status(200).json({
            status: 'qrcode',
            qrcode: qrCode,
            session: session,
          });
        }
      } else {
        if (!res.headersSent) {
          return res.status(200).json({
            status: 'waiting',
            message: 'Waiting for QR code to be generated...',
            session: session,
          });
        }
      }
    } catch (qrError) {
      if (!res.headersSent) {
        return res.status(200).json({
          status: 'waiting',
          message: 'QR code not available yet, please wait...',
          session: session,
        });
      }
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function closeSession(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'closeSession'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Session closed successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           message: { type: 'string', example: 'Session closed successfully' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Session not found',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Session not found' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const client = req.client;

    if (!client) {
      return res.status(400).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    await client.close();

    res.status(200).json({
      status: 'success',
      message: 'Session closed successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function logoutSession(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'logoutSession'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Logged out successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           message: { type: 'string', example: 'Logged out successfully' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Session not found',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Session not found' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const client = req.client;

    if (!client) {
      return res.status(400).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    await client.logout();

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// ===== CHATS =====
export async function listAllChats(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'listAllChats'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Chats listed successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'array', items: { type: 'object' } }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[500] = {
   *   description: 'Internal server error',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Error message' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.listAllChats(session);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function getChatDetails(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getChatDetails'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.parameters["chatId"] = {
   *   in: 'query',
   *   required: true,
   *   schema: '5511999999999@c.us',
   *   description: 'Chat ID to get details',
   *   example: '5511999999999@c.us'
   * }
   * #swagger.responses[200] = {
   *   description: 'Chat details retrieved successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'object' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'chatId is required',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'chatId is required' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const { chatId } = req.query;
    if (!chatId) {
      if (!res.headersSent) {
        return res
          .status(400)
          .json({ status: 'error', message: 'chatId is required' });
      }
      return;
    }

    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.getChatDetails(session, chatId);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function getAllUnreadMessages(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getAllUnreadMessages'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Unread messages retrieved successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'array', items: { type: 'object' } }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[500] = {
   *   description: 'Internal server error',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Error message' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const response = await req.client.getAllUnreadMessages();
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// ===== CONTATOS =====
export async function getAllContacts(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getAllContacts'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Contacts retrieved successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'array', items: { type: 'object' } }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[500] = {
   *   description: 'Internal server error',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Error message' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.getAllContacts(session);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function getContactDetails(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getContactDetails'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   * #swagger.parameters["contactId"] = {
   *   in: 'query',
   *   required: true,
   *   schema: '5511999999999@c.us'
   * }
   */
  try {
    const { contactId } = req.query;
    if (!contactId) {
      return res
        .status(400)
        .json({ status: 'error', message: 'contactId is required' });
    }

    const response = await req.client.getContact(contactId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function blockContact(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'blockContact'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { contactId } = req.body;
    if (!contactId) {
      return res
        .status(400)
        .json({ status: 'error', message: 'contactId is required' });
    }

    const response = await req.client.blockContact(contactId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function unblockContact(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'unblockContact'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { contactId } = req.body;
    if (!contactId) {
      return res
        .status(400)
        .json({ status: 'error', message: 'contactId is required' });
    }

    const response = await req.client.unblockContact(contactId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// ===== GRUPOS =====
export async function getAllGroups(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getAllGroups'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const chats = await req.client.list();
    const groups = chats.filter((chat: any) => chat.isGroup);
    res.status(200).json({ status: 'success', response: groups });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function createGroup(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'createGroup'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { name, participants } = req.body;
    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        status: 'error',
        message: 'name and participants array are required',
      });
    }

    const response = await req.client.createGroup(name, participants);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function addParticipant(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'addParticipant'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { groupId, participantId } = req.body;
    if (!groupId || !participantId) {
      return res.status(400).json({
        status: 'error',
        message: 'groupId and participantId are required',
      });
    }

    const response = await req.client.addParticipant(groupId, participantId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function removeParticipant(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'removeParticipant'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { groupId, participantId } = req.body;
    if (!groupId || !participantId) {
      return res.status(400).json({
        status: 'error',
        message: 'groupId and participantId are required',
      });
    }

    const response = await req.client.removeParticipant(groupId, participantId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function promoteParticipant(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'promoteParticipant'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { groupId, participantId } = req.body;
    if (!groupId || !participantId) {
      return res.status(400).json({
        status: 'error',
        message: 'groupId and participantId are required',
      });
    }

    const response = await req.client.promoteParticipant(
      groupId,
      participantId
    );
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

export async function demoteParticipant(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'demoteParticipant'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { groupId, participantId } = req.body;
    if (!groupId || !participantId) {
      return res.status(400).json({
        status: 'error',
        message: 'groupId and participantId are required',
      });
    }

    const response = await req.client.demoteParticipant(groupId, participantId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// ===== MENSAGENS =====
export async function sendMessage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendMessage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.requestBody = {
   *   required: true,
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           to: { type: 'string', example: '5511999999999@c.us' },
   *           content: { type: 'string', example: 'Hello World!' }
   *         },
   *         required: ['to', 'content']
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[200] = {
   *   description: 'Message sent successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'object' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Missing required parameters',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'to and content are required' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const { to, content } = req.body;

    if (!to || !content) {
      if (!res.headersSent) {
        return res.status(400).json({
          status: 'error',
          message: 'to and content are required',
        });
      }
      return;
    }

    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.sendMessage(session, to, content);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function sendImage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendImage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.requestBody = {
   *   required: true,
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           to: { type: 'string', example: '5511999999999@c.us' },
   *           image: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' },
   *           caption: { type: 'string', example: 'Image caption' }
   *         },
   *         required: ['to', 'image']
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[200] = {
   *   description: 'Image sent successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'object' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Missing required parameters',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'to and image are required' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const { to, image, caption } = req.body;

    if (!to || !image) {
      return res.status(400).json({
        status: 'error',
        message: 'to and image are required',
      });
    }

    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.sendImage(session, to, image, caption);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendVideo(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendVideo'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { to, video, caption } = req.body;
    if (!to || !video) {
      return res.status(400).json({
        status: 'error',
        message: 'to and video are required',
      });
    }

    const response = await req.client.sendVideoMessage(to, video, caption);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function sendFile(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendFile'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { to, file, caption } = req.body;
    if (!to || !file) {
      return res.status(400).json({
        status: 'error',
        message: 'to and file are required',
      });
    }

    const response = await req.client.sendFileMessage(to, file, caption);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function sendAudio(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendAudio'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { to, audio } = req.body;
    if (!to || !audio) {
      return res.status(400).json({
        status: 'error',
        message: 'to and audio are required',
      });
    }

    const response = await req.client.sendAudioMessage(to, audio);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function deleteMessage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'deleteMessage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.requestBody = {
   *   required: true,
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           chatId: { type: 'string', example: '5511999999999@c.us' },
   *           messageId: { type: 'string', example: 'true_5511999999999@c.us_3EB0C767D82B0A78B532' }
   *         },
   *         required: ['chatId', 'messageId']
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[200] = {
   *   description: 'Message deleted successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           response: { type: 'object' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Missing required parameters',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'chatId and messageId are required' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const { chatId, messageId } = req.body;

    if (!chatId || !messageId) {
      return res.status(400).json({
        status: 'error',
        message: 'chatId and messageId are required',
      });
    }

    const waJsUtil = new WAJsUtil();
    const response = await waJsUtil.deleteMessage(session, chatId, messageId);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function editMessage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'editMessage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { chatId, messageId, newText } = req.body;
    if (!chatId || !messageId || !newText) {
      return res.status(400).json({
        status: 'error',
        message: 'chatId, messageId and newText are required',
      });
    }

    // WA-JS não tem função nativa de editar mensagem, então usamos a função do WPPConnect
    const response = await req.client.editMessage(messageId, newText);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

// ===== FUNÇÕES ADICIONAIS =====
export async function getContactDetailsByPhone(
  req: any,
  res: any
): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'getContactDetailsByPhone'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   * #swagger.parameters["phone"] = {
   *   in: 'path',
   *   required: true,
   *   schema: '5511999999999'
   * }
   */
  try {
    const { phone } = req.params;
    if (!phone) {
      return res
        .status(400)
        .json({ status: 'error', message: 'phone is required' });
    }

    const contactId = `${phone}@c.us`;
    const response = await req.client.getContact(contactId);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function sendVideoMessage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendVideoMessage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { to, video, caption } = req.body;
    if (!to || !video) {
      return res.status(400).json({
        status: 'error',
        message: 'to and video are required',
      });
    }

    const response = await req.client.sendVideoMessage(to, video, caption);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function sendAudioMessage(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'sendAudioMessage'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   schema: 'NERDWHATS_AMERICA'
   * }
   */
  try {
    const { to, audio } = req.body;
    if (!to || !audio) {
      return res.status(400).json({
        status: 'error',
        message: 'to and audio are required',
      });
    }

    const response = await req.client.sendAudioMessage(to, audio);
    if (!res.headersSent) {
      res.status(200).json({ status: 'success', response: response });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

// ===== ADMINISTRAÇÃO =====
export async function cleanSession(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'cleanSession'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.responses[200] = {
   *   description: 'Session cleaned successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           message: { type: 'string', example: 'Session cleaned successfully' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const client = req.client;

    if (!client) {
      return res.status(400).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    await client.close();

    if (!res.headersSent) {
      res.status(200).json({
        status: 'success',
        message: 'Session cleaned successfully',
      });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error });
    }
  }
}

export async function generateLinkDeviceCode(req: any, res: any): Promise<any> {
  /**
   * #swagger.tags = ["WA-JS"]
   * #swagger.operationId = 'generateLinkDeviceCode'
   * #swagger.autoBody=true
   * #swagger.security = [{
   *   "bearerAuth": []
   * }]
   * #swagger.parameters["session"] = {
   *   required: true,
   *   schema: 'NERDWHATS_AMERICA',
   *   description: 'Session name',
   *   example: 'NERDWHATS_AMERICA'
   * }
   * #swagger.requestBody = {
   *   required: true,
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           phone: {
   *             type: 'string',
   *             required: true,
   *             description: 'Phone number in international format',
   *             example: '5511999999999'
   *           },
   *           sendPushNotification: {
   *             type: 'boolean',
   *             required: false,
   *             description: 'Whether to send push notification',
   *             example: true
   *           }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[200] = {
   *   description: 'Link device code generated successfully',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'success' },
   *           code: { type: 'string', example: '123456789' },
   *           session: { type: 'string', example: 'NERDWHATS_AMERICA' },
   *           phone: { type: 'string', example: '5511999999999' },
   *           message: { type: 'string', example: 'Link device code generated successfully' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[400] = {
   *   description: 'Invalid parameters',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Phone number is required' }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[500] = {
   *   description: 'Internal server error',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           status: { type: 'string', example: 'error' },
   *           message: { type: 'string', example: 'Failed to generate link device code' }
   *         }
   *       }
   *     }
   *   }
   * }
   */
  try {
    const session = req.session;
    const { phone, sendPushNotification = true } = req.body;

    console.log('generateLinkDeviceCode called with:', {
      session,
      phone,
      sendPushNotification,
      body: req.body,
    });

    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required',
        debug: { session, phone, sendPushNotification, body: req.body },
      });
    }

    // Primeiro, garantir que a sessão está inicializada
    const waJsUtil = new WAJsUtil();
    console.log('WAJsUtil created');

    // Sempre inicializar a sessão para garantir que o cliente existe
    console.log('Initializing session...');
    await waJsUtil.opendata(req, session);

    console.log('Session parameters:', {
      session,
      phone,
      sendPushNotification,
    });

    // Buscar o client diretamente
    const client = clientsArray[session];
    console.log('Client found directly:', !!client);

    if (!client) {
      throw new Error('Client not found after initialization');
    }

    if (!client.genLinkDeviceCodeForPhoneNumber) {
      throw new Error('genLinkDeviceCodeForPhoneNumber method not available');
    }

    // Chamar a função diretamente no cliente
    const code = await client.genLinkDeviceCodeForPhoneNumber(
      phone,
      sendPushNotification === 'true' || sendPushNotification === true
    );

    console.log('Code generated:', code);

    if (!res.headersSent) {
      return res.status(200).json({
        status: 'success',
        code: code,
        session: session,
        phone: phone,
        message: 'Link device code generated successfully',
      });
    }
  } catch (error) {
    console.error('Error in generateLinkDeviceCode:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: `Failed to generate link device code: ${
          error instanceof Error ? error.message : String(error)
        }`,
        debug: {
          session: req.params.session || req.session,
          phone: req.body?.phone,
          sendPushNotification: req.body?.sendPushNotification,
          clientExists: !!req.client,
          errorType:
            error instanceof Error ? error.constructor.name : typeof error,
        },
      });
    }
  }
}

/**
 * Executa um script arbitrário no contexto da página WA-JS via Puppeteer
 * Body: { script: string, args?: any[] }
 */
export async function executeScriptInPage(req: any, res: any): Promise<any> {
  try {
    const session = req.session;
    const { script, args = [] } = req.body;
    if (!script) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Script é obrigatório no body.' });
    }
    // Buscar o client diretamente
    const client = clientsArray[session];
    if (!client || !client.page) {
      return res.status(404).json({
        status: 'error',
        message: 'Sessão não encontrada ou página não inicializada.',
      });
    }
    // Executar o script no contexto da página
    const result = await client.page.evaluate(
      new Function('...args', script),
      ...args
    );
    return res.status(200).json({ status: 'success', result });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

// Adiciona rota para obter o AuthCode WA-JS
export async function getAuthCode(req: any, res: any): Promise<any> {
  try {
    const session = req.session;
    const waJsUtil = new WAJsUtil();
    const authCode = await waJsUtil.getAuthCode(session);
    if (authCode) {
      return res.status(200).json({ status: 'success', authCode, session });
    } else {
      return res
        .status(404)
        .json({ status: 'error', message: 'AuthCode não disponível', session });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
