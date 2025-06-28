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
import { NextFunction, Request, Response } from 'express';

import { clientsArray } from '../util/sessionUtil';

const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
  const secureToken = req.serverOptions.secretKey;

  const { session } = req.params;
  const { authorization: token } = req.headers;
  if (!session)
    return res.status(401).send({ message: 'Session not informed' });

  // LOG para debug
  if (req.logger)
    req.logger.info(`[AUTH] Session: ${session}, Authorization: ${token}`);

  try {
    let tokenDecrypt = '';
    let sessionDecrypt = '';

    // 1. Priorizar o header Authorization (Bearer token)
    if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
      const token_value = token.split(' ')[1];
      if (token_value) {
        tokenDecrypt = token_value.replace(/_/g, '/').replace(/-/g, '+');
        sessionDecrypt = session.split(':')[0];
      } else {
        return res.status(401).json({
          message: 'Token is not present. Check your header and try again',
        });
      }
    } else if (session && session.includes(':')) {
      // 2. Caso legado: token no parâmetro session
      sessionDecrypt = session.split(':')[0];
      tokenDecrypt = session
        .split(':')[1]
        .replace(/_/g, '/')
        .replace(/-/g, '+');
    } else {
      return res.status(401).json({
        message: 'Token is not present. Check your header and try again',
      });
    }

    bcrypt.compare(
      sessionDecrypt + secureToken,
      tokenDecrypt,
      function (err, result) {
        if (result) {
          req.session = sessionDecrypt;
          req.token = tokenDecrypt;
          req.client = clientsArray[req.session];
          next();
        } else {
          if (req.logger)
            req.logger.warn(
              `[AUTH] Token inválido para sessão: ${sessionDecrypt}`
            );
          return res
            .status(401)
            .json({ error: 'Check that the Session and Token are correct' });
        }
      }
    );
  } catch (error) {
    if (req.logger) req.logger.error(error);
    return res.status(401).json({
      error: 'Check that the Session and Token are correct.',
      message: error,
    });
  }
};

export default verifyToken;
