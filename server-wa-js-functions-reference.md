# Referência de Funções WA-JS no Backend

Este arquivo lista as funções do backend que executam comandos WA-JS no contexto do navegador (via Puppeteer). Preencha cada bloco com a chamada real no console, conforme o padrão abaixo.

---

## Exemplo de envio de mensagem

```ts
async function sendText(page: puppeteer.Page, chatId: string, message: string) {
  const result = await page.evaluate(
    async (chatId, message) => {
      // WPP é a variável global exposta pelo wa-js
      return await window.WPP.chat.sendTextMessage(chatId, message);
    },
    chatId,
    message
  );
  console.log('[INFO] Resultado do envio:', result);
}
```

---

## Funções disponíveis

### Mensagens

- **sendTextMessage**
- **sendImageMessage**
- **sendVideoMessage**
- **sendFileMessage**
- **sendAudioMessage**
- **deleteMessage**

### Chats

- **getAllUnreadMessages**
- **getChat**

### Contatos

- **getContact**
- **getAllContacts**
- **blockContact**
- **unblockContact**

### Grupos

- **createGroup**
- **addParticipant**
- **removeParticipant**
- **promoteParticipant**
- **demoteParticipant**

### Sessão

- **getQRCode**
- **isAuthenticated**
- **genLinkDeviceCodeForPhoneNumber**
- **close**

---

## Preencha aqui a chamada real de cada função no console:

### Exemplo:

```ts
// Enviar mensagem de texto
await page.evaluate(
  (to, msg) => window.WPP.chat.sendTextMessage(to, msg),
  '5511999999999@c.us',
  'Olá!'
);
```

### getAllUnreadMessages

```ts
// ...
```

### getChat

```ts
// ...
```

### sendTextMessage

```ts
// ...
```

### sendImageMessage

```ts
// ...
```

### sendVideoMessage

```ts
// ...
```

### sendFileMessage

```ts
// ...
```

### sendAudioMessage

```ts
// ...
```

### deleteMessage

```ts
// ...
```

### getContact

```ts
// ...
```

### getAllContacts

```ts
// ...
```

### blockContact

```ts
// ...
```

### unblockContact

```ts
// ...
```

### createGroup

```ts
// ...
```

### addParticipant

```ts
// ...
```

### removeParticipant

```ts
// ...
```

### promoteParticipant

```ts
// ...
```

### demoteParticipant

```ts
// ...
```

### getQRCode

```ts
// ...
```

### isAuthenticated

```ts
// ...
```

### genLinkDeviceCodeForPhoneNumber

```ts
// ...
```

### close

```ts
// ...
```
