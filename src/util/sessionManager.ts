import fs from 'fs';
import path from 'path';

import config from '../config';

const userDataDir = config.customUserDataDir;
const tokensDir = path.resolve(__dirname, '../../tokens');

export function listSessions(): string[] {
  const sessions: string[] = [];
  if (fs.existsSync(userDataDir)) {
    fs.readdirSync(userDataDir).forEach((dir) => {
      sessions.push(dir);
    });
  }
  return sessions;
}

function tryRemoveSync(targetPath: string, retries = 5, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
      return true;
    } catch (err: any) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        // Aguarda e tenta novamente
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
      } else {
        // Outro erro, lança
        throw err;
      }
    }
  }
  // Se não conseguiu remover, apenas loga e segue
  console.warn(`Não foi possível remover completamente: ${targetPath}`);
  return false;
}

export function removeSession(session: string) {
  const sessionPath = path.join(userDataDir, session);
  const tokenPath = path.join(tokensDir, `${session}.data.json`);
  tryRemoveSync(sessionPath);
  tryRemoveSync(tokenPath);
  return true;
}

export function removeAllSessions() {
  const sessions = listSessions();
  sessions.forEach(removeSession);
  return true;
}

export function createSessionFolder(session: string) {
  const sessionPath = path.join(userDataDir, session);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }
  return sessionPath;
}

export function ensureBaseFolders() {
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  if (!fs.existsSync(tokensDir)) {
    fs.mkdirSync(tokensDir, { recursive: true });
  }
}
