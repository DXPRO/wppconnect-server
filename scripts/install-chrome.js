#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🚀 Baixando Chromium via Puppeteer (multiplataforma)...');
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
  console.log(
    '✅ Chromium baixado com sucesso! O Puppeteer irá utilizá-lo automaticamente.'
  );
} catch (error) {
  console.error('❌ Erro ao baixar Chromium:', error.message);
  console.log(
    '💡 Você pode instalar manualmente rodando: npx puppeteer browsers install chrome'
  );
}
