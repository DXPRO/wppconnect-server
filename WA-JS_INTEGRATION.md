# Integração com @wppconnect/wa-js

## Visão Geral

Esta integração permite usar a biblioteca `@wppconnect/wa-js` diretamente no servidor WPPConnect, oferecendo acesso direto às funções do WhatsApp Web sem a necessidade de intermediários complexos.

## Vantagens da Integração

### 1. **Acesso Direto às Funções**

- Funções extraídas diretamente do WhatsApp Web
- Sem camadas de abstração desnecessárias
- Performance superior

### 2. **Facilidade para Criar Novas Funções**

- API mais simples e intuitiva
- Menos código boilerplate
- Debugging mais fácil

### 3. **Compatibilidade Total**

- Mantém a estrutura atual do servidor
- Todas as rotas existentes continuam funcionando
- Webhooks e eventos preservados

## Instalação

### 1. Instalar Dependências

```bash
npm install @wppconnect/wa-js playwright-chromium
npm install --save-dev @types/playwright
```

### 2. Configuração

As dependências já foram adicionadas ao `package.json`:

```json
{
  "dependencies": {
    "@wppconnect/wa-js": "^3.17.7",
    "playwright-chromium": "^1.50.0"
  },
  "devDependencies": {
    "@types/playwright": "^1.50.0"
  }
}
```

## Como Funciona

### 1. **Injeção do Script**

O `waJsUtil.ts` injeta o script `@wppconnect/wa-js` diretamente no navegador:

```typescript
// Navegar para o WhatsApp Web
await this.page.goto('https://web.whatsapp.com/');

// Injetar o script WA-JS
await this.page.addScriptTag({
  path: require.resolve('@wppconnect/wa-js'),
});

// Aguardar o WA-JS carregar
await this.page.waitForFunction(() => window.WPP?.isReady);
```

### 2. **Exposição das Funções**

Todas as funções do WA-JS são expostas através do `page.evaluate()`:

```typescript
// Exemplo: Listar todas as conversas
list: () => this.page?.evaluate(() => window.WPP.chat.list()),

// Exemplo: Enviar mensagem
sendTextMessage: (to: string, message: string) =>
  this.page?.evaluate((t, m) => window.WPP.chat.sendTextMessage(t, m), to, message),
```

## Funções Disponíveis

### **Chat Functions**

```typescript
// Listar todas as conversas
await req.client.list();

// Obter conversa específica
await req.client.getChat(chatId);

// Enviar mensagem de texto
await req.client.sendTextMessage(to, message);

// Enviar imagem
await req.client.sendImageMessage(to, image, caption);

// Enviar vídeo
await req.client.sendVideoMessage(to, video, caption);

// Enviar arquivo
await req.client.sendFileMessage(to, file, caption);

// Enviar áudio
await req.client.sendAudioMessage(to, audio);

// Deletar mensagem
await req.client.deleteMessage(chatId, messageId);

// Obter mensagens não lidas
await req.client.getAllUnreadMessages();
```

### **Contact Functions**

```typescript
// Obter todos os contatos
await req.client.getAllContacts();

// Obter contato específico
await req.client.getContact(contactId);

// Bloquear contato
await req.client.blockContact(contactId);

// Desbloquear contato
await req.client.unblockContact(contactId);
```

### **Group Functions**

```typescript
// Criar grupo
await req.client.createGroup(name, participants);

// Adicionar participante
await req.client.addParticipant(groupId, participantId);

// Remover participante
await req.client.removeParticipant(groupId, participantId);

// Promover participante
await req.client.promoteParticipant(groupId, participantId);

// Rebaixar participante
await req.client.demoteParticipant(groupId, participantId);

// Obter informações do grupo por código de convite
await req.client.getGroupInfoFromInviteCode(inviteCode);
```

### **Connection Functions**

```typescript
// Verificar se está autenticado
await req.client.isAuthenticated();

// Fazer logout
await req.client.logout();

// Aguardar autenticação
await req.client.waitForAuthentication();
```

## Exemplos de Uso

### 1. **Listar Todas as Conversas**

```typescript
// Controller
export async function listAllChats(req: Request, res: Response) {
  try {
    const response = await req.client.list();
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// Rota
routes.get(
  '/api/:session/list-chats',
  verifyToken,
  statusConnection,
  listAllChats
);
```

### 2. **Enviar Mensagem**

```typescript
// Controller
export async function sendMessage(req: Request, res: Response) {
  try {
    const { to, message } = req.body;
    const response = await req.client.sendTextMessage(to, message);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// Rota
routes.post(
  '/api/:session/send-message',
  verifyToken,
  statusConnection,
  sendMessage
);
```

### 3. **Criar Grupo**

```typescript
// Controller
export async function createGroup(req: Request, res: Response) {
  try {
    const { name, participants } = req.body;
    const response = await req.client.createGroup(name, participants);
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
}

// Rota
routes.post(
  '/api/:session/create-group',
  verifyToken,
  statusConnection,
  createGroup
);
```

## Eventos e Webhooks

### **Configuração de Eventos**

```typescript
// Listener para novas mensagens
await this.page.evaluate(() => {
  window.WPP.chat.on('chat.new_message', (message: any) => {
    window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
  });
});

// Listener para mudanças de status
await this.page.evaluate(() => {
  window.WPP.conn.on('change.state', (state: any) => {
    window.dispatchEvent(new CustomEvent('stateChange', { detail: state }));
  });
});
```

### **Webhooks Automáticos**

Os webhooks continuam funcionando normalmente:

- `onMessage` - Nova mensagem recebida
- `onStateChange` - Mudança de status da conexão
- `qrCode` - QR Code gerado

## Migração do Sistema Atual

### **Opção 1: Substituição Gradual**

1. Manter o sistema atual funcionando
2. Criar novas rotas usando WA-JS
3. Migrar rotas antigas gradualmente

### **Opção 2: Substituição Completa**

1. Substituir `createSessionUtil.ts` por `waJsUtil.ts`
2. Atualizar todas as rotas para usar as novas funções
3. Testar completamente antes de fazer deploy

## Configuração do Playwright

### **Argumentos do Navegador**

```typescript
const browser = await playwright.chromium.launch({
  headless: false, // ou true para produção
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
  ],
});
```

### **Configurações de Performance**

- **Headless**: `true` para produção, `false` para desenvolvimento
- **User Data Dir**: Para persistir sessões
- **Args**: Otimizações para estabilidade

## Troubleshooting

### **Problemas Comuns**

1. **Erro: "Cannot find module 'playwright-chromium'"**

   ```bash
   npm install playwright-chromium
   ```

2. **Erro: "window.WPP is not defined"**

   - Aguardar o carregamento: `await this.page.waitForFunction(() => window.WPP?.isReady)`

3. **Erro: "Page closed"**
   - Verificar se o navegador não foi fechado inesperadamente
   - Implementar retry logic

### **Debug**

```typescript
// Logs do navegador
this.page.on('console', (msg) => {
  if (msg.type() === 'log') {
    req.logger.info(`[${client.session}] Browser: ${msg.text()}`);
  }
});
```

## Benefícios da Integração

1. **Performance**: Acesso direto às funções do WhatsApp
2. **Simplicidade**: API mais limpa e intuitiva
3. **Manutenibilidade**: Menos código para manter
4. **Flexibilidade**: Fácil adição de novas funcionalidades
5. **Compatibilidade**: Mantém estrutura atual do servidor

## Próximos Passos

1. **Instalar dependências**
2. **Testar a integração**
3. **Migrar rotas gradualmente**
4. **Documentar novas funcionalidades**
5. **Otimizar performance**

Esta integração oferece uma abordagem muito mais eficiente e moderna para interagir com o WhatsApp Web, mantendo toda a compatibilidade com o sistema atual.
