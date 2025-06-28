const puppeteer = require('puppeteer');
(async () => {
  console.log('Iniciando Puppeteer...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.google.com');
  console.log('Navegador aberto. Aguarde 15 segundos...');
  await new Promise((r) => setTimeout(r, 15000)); // Aguarda 15 segundos
  await browser.close();
  console.log('Navegador fechado.');
})();
