/*
 * Copyright 2023 WPPConnect Team
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

import archiver from 'archiver';
import { execSync } from 'child_process';
import { Request } from 'express';
import fileSystem from 'fs';
import os from 'os';
import path from 'path';
import unzipper from 'unzipper';

import { logger } from '..';
import config from '../config';
import { startAllSessions } from './functions';
import getAllTokens from './getAllTokens';
import { clientsArray } from './sessionUtil';

export function backupSessions(req: Request): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    await closeAllSessions(req);
    const output = fileSystem.createWriteStream(
      __dirname + '/../backupSessions.zip'
    );
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    archive.on('error', function (err) {
      reject(err);
      req.logger.error(err);
    });
    archive.pipe(output);
    archive.directory(__dirname + '/../../tokens', 'tokens');
    fileSystem.cpSync(
      config.customUserDataDir,
      __dirname + '/../../backupFolder',
      { force: true, recursive: true }
    );

    archive.directory(__dirname + '/../../backupFolder', 'userDataDir');
    archive.finalize();

    output.on('close', () => {
      fileSystem.rmSync(__dirname + '/../../backupFolder', { recursive: true });
      const myStream = fileSystem.createReadStream(
        __dirname + '/../backupSessions.zip'
      );
      myStream.pipe(req.res as any);
      myStream.on('end', () => {
        logger.info('Sessions successfully backuped. Restarting sessions...');
        startAllSessions(config, logger);
        req.res?.end();
      });
      myStream.on('error', function (err: any) {
        console.log(err);
        reject(err);
      });
    });
  });
}

export async function restoreSessions(
  req: Request,
  file: Express.Multer.File
): Promise<any> {
  if (!file?.mimetype?.includes('zip')) {
    throw new Error('Please, send zipped file');
  }
  const path = file.path;
  logger.info('Starting restore sessions...');
  await closeAllSessions(req);

  const extract = fileSystem
    .createReadStream(path)
    .pipe(unzipper.Extract({ path: './restore' }));
  extract.on('close', () => {
    try {
      fileSystem.cpSync(__dirname + '/../../restore/tokens', 'tokens', {
        force: true,
        recursive: true,
      });
    } catch (error) {
      logger.info("Folder 'tokens' not found.");
    }
    try {
      fileSystem.cpSync(
        __dirname + '/../../restore/userDataDir',
        config.customUserDataDir,
        {
          force: false,
          recursive: true,
        }
      );
    } catch (error) {
      logger.info("Folder 'userDataDir' not found.");
    }
    logger.info('Sessions successfully restored. Starting...');
    startAllSessions(config, logger);
  });

  return { success: true };
}

export async function closeAllSessions(req: Request) {
  const names = await getAllTokens(req);
  names.forEach(async (session: string) => {
    const client = clientsArray[session];
    try {
      if (client) {
        delete clientsArray[session];
        if (client.status && client.page && client.page.browser) {
          logger.info('Stopping session: ' + session);
          await client.page.browser().close();
        }
      }
    } catch (error) {
      logger.error('Not was possible stop session: ' + session);
    }
  });
}

/**
 * Função utilitária para encerrar processos do navegador e remover a pasta da sessão travada.
 * Compatível com Windows e Linux.
 * @param session Nome da sessão (ex: 'NERDWHATS_AMERICA')
 * @param userDataDir Caminho base do userDataDir (ex: './userDataDir')
 */
export function cleanSession(
  session: string,
  userDataDir: string = './userDataDir'
) {
  try {
    const platform = os.platform();
    // 1. Matar processos do navegador
    if (platform === 'win32') {
      // Mata todos os processos chrome.exe
      try {
        execSync('taskkill /IM chrome.exe /F', { stdio: 'ignore' });
      } catch {}
    } else {
      // Linux/Mac: mata todos os processos chromium ou chrome
      try {
        execSync('pkill -f chromium', { stdio: 'ignore' });
      } catch {}
      try {
        execSync('pkill -f chrome', { stdio: 'ignore' });
      } catch {}
    }
    // 2. Remover pasta da sessão
    const sessionPath = path.join(userDataDir, session);
    if (fileSystem.existsSync(sessionPath)) {
      fileSystem.rmSync(sessionPath, { recursive: true, force: true });
    }
    console.log(`[cleanSession] Sessão ${session} limpa com sucesso!`);
    return true;
  } catch (error) {
    console.error(`[cleanSession] Erro ao limpar sessão ${session}:`, error);
    return false;
  }
}
