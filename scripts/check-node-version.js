#!/usr/bin/env node
const [major] = process.versions.node.split('.');
if (major !== '22') {
  console.error(
    `\n[ERRO] Versão do Node.js incompatível! Necessário: 22.x.x, atual: ${process.versions.node}\nUse nvm (ou nvm-windows) para ajustar.\n`
  );
  process.exit(1);
}
