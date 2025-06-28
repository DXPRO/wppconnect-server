// Script para testar a nova rota get-auth-code
const axios = require('axios');
const qrcode = require('qrcode-terminal');

const SESSION = process.env.SESSION || 'NERDWHATS_AMERICA';
const SECRET = process.env.SECRET || 'THISISMYSECURETOKEN';
const BASE_URL = process.env.BASE_URL || 'http://localhost:21465';

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

async function obterAuthCode(token) {
  const url = `${BASE_URL}/api/${SESSION}/get-auth-code`;
  console.log(`\n[OBTER AUTH CODE] GET ${url}`);
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('[OBTER AUTH CODE] Resposta:', res.data);
  return res.data;
}

async function obterQRCode(token) {
  const url = `${BASE_URL}/api/${SESSION}/qrcode-session`;
  console.log(`\n[OBTER QR CODE] GET ${url}`);
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('[OBTER QR CODE] Resposta:', res.data);
  return res.data;
}

(async () => {
  try {
    console.log('=== TESTE DA NOVA ROTA GET-AUTH-CODE ===');

    // 1. Gerar token
    const token = await gerarToken();

    // 2. Iniciar sessão
    await iniciarSessao(token);

    // 3. Aguardar um pouco para a sessão inicializar
    console.log('\nAguardando 5 segundos para a sessão inicializar...');
    await new Promise((r) => setTimeout(r, 5000));

    // 4. Tentar obter AuthCode (nova rota)
    try {
      const authCodeData = await obterAuthCode(token);
      if (authCodeData.status === 'success' && authCodeData.authCode) {
        console.log('\n✅ AUTH CODE OBTIDO COM SUCESSO!');
        console.log('AuthCode:', authCodeData.authCode);

        // Se tiver fullCode, gerar QR code
        if (authCodeData.authCode.fullCode) {
          console.log('\nGerando QR code do AuthCode...');
          qrcode.generate(authCodeData.authCode.fullCode, { small: true });

          // Salvar em arquivo
          require('fs').writeFileSync(
            'authcode.txt',
            JSON.stringify(authCodeData.authCode, null, 2)
          );
          console.log('AuthCode salvo em authcode.txt');
        }
      }
    } catch (authError) {
      console.log(
        '\n❌ Erro ao obter AuthCode:',
        authError.response?.data || authError.message
      );
    }

    // 5. Comparar com QR Code tradicional
    try {
      const qrData = await obterQRCode(token);
      console.log('\n📊 COMPARAÇÃO:');
      console.log('- AuthCode (nova rota):', authCodeData?.status || 'erro');
      console.log('- QR Code (rota tradicional):', qrData?.status || 'erro');
    } catch (qrError) {
      console.log(
        '\n❌ Erro ao obter QR Code:',
        qrError.response?.data || qrError.message
      );
    }
  } catch (e) {
    console.error('\n❌ Erro geral:', e.message);
    process.exit(1);
  }
})();
