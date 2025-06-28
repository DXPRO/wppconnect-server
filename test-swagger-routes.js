const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'http://localhost:21465';
const SESSION = 'NERDWHATS_AMERICA';
const SECRET_KEY = 'THISISMYSECURETOKEN';
const SWAGGER_PATH = path.join(__dirname, 'src', 'swagger.json');

async function getToken() {
  const url = `${BASE_URL}/api/${SESSION}/${SECRET_KEY}/generate-token`;
  const resp = await axios.post(url);
  return resp.data.token;
}

function getProtectedRoutes(swagger) {
  const routes = [];
  for (const [route, methods] of Object.entries(swagger.paths)) {
    for (const [method, def] of Object.entries(methods)) {
      if (def.security && def.security.some((sec) => sec.bearerAuth)) {
        routes.push({ route, method: method.toUpperCase(), def });
      }
    }
  }
  return routes;
}

async function testRoute(route, method, def, token) {
  let url =
    BASE_URL +
    route.replace('{session}', SESSION).replace('{secretkey}', SECRET_KEY);
  let config = {
    method,
    url,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  };
  // Monta body de exemplo se necessário
  if (
    def.requestBody &&
    def.requestBody.content &&
    def.requestBody.content['application/json']
  ) {
    const example =
      def.requestBody.content['application/json'].example ||
      (def.requestBody.content['application/json'].examples &&
        Object.values(def.requestBody.content['application/json'].examples)[0]
          ?.value) ||
      undefined;
    if (example) config.data = example;
    else config.data = {};
  }
  try {
    const resp = await axios(config);
    return { status: resp.status, ok: resp.status < 400, url, method };
  } catch (e) {
    return { status: 'ERR', ok: false, url, method, error: e.message };
  }
}

(async () => {
  console.log('Lendo swagger.json...');
  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf8'));
  console.log('Gerando token...');
  const token = await getToken();
  console.log('Token:', token);
  const routes = getProtectedRoutes(swagger);
  console.log(`Testando ${routes.length} rotas protegidas...`);
  const results = [];
  for (const { route, method, def } of routes) {
    process.stdout.write(`${method} ${route} ... `);
    const result = await testRoute(route, method, def, token);
    results.push(result);
    console.log(result.ok ? 'OK' : `ERRO (${result.status})`);
  }
  console.log('\nResumo:');
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} [${r.status}] ${r.method} ${r.url}`);
    if (r.error) console.log('   Erro:', r.error);
  }
})();
