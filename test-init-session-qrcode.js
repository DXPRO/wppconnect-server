// Script automatizado para criar sessão, gerar token e obter QR code com logs detalhados
const axios = require('axios');
const qrcode = require('qrcode-terminal');

const SESSION = process.env.SESSION || 'NERDWHATS_AMERICA';
const SECRET = process.env.SECRET || 'THISISMYSECURETOKEN';
const BASE_URL = process.env.BASE_URL || 'http://localhost:21465';

async function criarSessao() {
  const url = `${BASE_URL}/api/${SECRET}/start-all`;
  console.log(`\n[CRIAR SESSÃO] POST ${url}`);
  try {
    const res = await axios.post(url);
    console.log('[CRIAR SESSÃO] Resposta:', res.data);
    return true;
  } catch (e) {
    console.error('[CRIAR SESSÃO] Erro:', e.response?.data || e.message);
    return false;
  }
}

async function gerarToken() {
  const url = `${BASE_URL}/api/${SESSION}/${SECRET}/generate-token`;
  console.log(`\n[GERAR TOKEN] POST ${url}`);
  const res = await axios.post(url);
  console.log('[GERAR TOKEN] Resposta:', res.data);
  return res.data.token;
}

async function iniciarSessao(token) {
  const url = `${BASE_URL}/api/${SESSION}/start-session`;
  console.log(`\n[INICIAR SESSÃO] POST ${url}`);
  const res = await axios.post(
    url,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log('[INICIAR SESSÃO] Resposta:', res.data);
  return res.data;
}

async function aguardarQRCode(token, tentativas = 30) {
  const url = `${BASE_URL}/api/${SESSION}/qrcode-session`;
  console.log(`\n[OBTER QRCODE] GET ${url}`);
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`\n[QRCODE] Tentativa ${i + 1}:`, res.data.status);
      if (res.data.status === 'qrcode' && res.data.qrcode) {
        return res.data.qrcode;
      }
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(
        `[QRCODE] Erro tentativa ${i + 1}:`,
        e.response?.data || e.message
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('QR code não disponível após várias tentativas');
}

(async () => {
  try {
    await criarSessao();
    const token = await gerarToken();
    await iniciarSessao(token);
    const qrcodeBase64 = await aguardarQRCode(token);
    console.log('\nQR code recebido! Exibindo no terminal:');
    qrcode.generate(qrcodeBase64, { small: true });
    require('fs').writeFileSync('qrcode.txt', qrcodeBase64);
    console.log('QR code base64 salvo em qrcode.txt');
  } catch (e) {
    console.error('\nErro:', e.message);
    process.exit(1);
  }
})();
