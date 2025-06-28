# 🔗 Código de Link de Dispositivo - WA-JS

Esta funcionalidade permite conectar dispositivos ao WhatsApp Web usando um código numérico em vez do QR code tradicional. É uma alternativa mais conveniente para alguns casos de uso.

## 📋 Visão Geral

A função `genLinkDeviceCodeForPhoneNumber` do WA-JS gera um código de 8 dígitos que pode ser inserido no WhatsApp do telefone para vincular o dispositivo web.

## 🚀 Como Usar

### 1. Via API REST

```bash
GET /api/{session}/generate-link-device-code?phone={phone}&sendPushNotification={boolean}
```

**Parâmetros:**

- `session` (path): Nome da sessão (ex: `NERDWHATS_AMERICA`)
- `phone` (query): Número de telefone no formato internacional (ex: `5511999999999`)
- `sendPushNotification` (query, opcional): Se deve enviar notificação push (padrão: `true`)

**Exemplo:**

```bash
curl -X GET "http://localhost:21470/api/NERDWHATS_AMERICA/generate-link-device-code?phone=5511999999999&sendPushNotification=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "accept: */*"
```

**Resposta:**

```json
{
  "status": "success",
  "code": "12345678",
  "session": "NERDWHATS_AMERICA",
  "phone": "5511999999999",
  "message": "Link device code generated successfully"
}
```

### 2. Via Script PowerShell

```powershell
# Teste básico
.\scripts\test-link-device-code.ps1

# Teste com múltiplos números
.\scripts\test-link-device-multiple.ps1

# Teste com parâmetros customizados
.\scripts\test-link-device-code.ps1 -Phone "5511888888888" -SendPushNotification $false
```

### 3. Via Swagger UI

1. Acesse: `http://localhost:21470/api-docs`
2. Vá para a tag **WA-JS**
3. Clique em `GET /api/{session}/generate-link-device-code`
4. Preencha os parâmetros:
   - `session`: `NERDWHATS_AMERICA`
   - `phone`: `5511999999999`
   - `sendPushNotification`: `true`
5. Clique em **Execute**

## 📱 Como Conectar no Telefone

1. **Abra o WhatsApp** no seu telefone
2. **Vá em Configurações** (ícone de engrenagem)
3. **Toque em "Dispositivos vinculados"**
4. **Toque em "Vincular um dispositivo"**
5. **Digite o código** de 8 dígitos gerado pela API
6. **Confirme** a vinculação

## ⚠️ Requisitos e Limitações

### ✅ Requisitos

- Navegador inicializado com WA-JS
- Número de telefone válido no formato internacional
- Token de autenticação válido
- WhatsApp instalado no telefone

### ❌ Limitações

- Não funciona se já estiver autenticado
- Requer conexão com internet
- Código expira após alguns minutos
- Apenas um código ativo por vez

## 🔧 Formato do Número de Telefone

**Recomendado:** Formato internacional completo

- ✅ `5511999999999` (Brasil)
- ✅ `1234567890` (EUA)
- ✅ `447911123456` (Reino Unido)

**Não recomendado:**

- ❌ `11999999999` (sem código do país)
- ❌ `+5511999999999` (com +)
- ❌ `(11) 99999-9999` (com formatação)

## 🛠️ Implementação Técnica

### Utilitário WA-JS

```typescript
// Função adicionada ao cliente WA-JS
genLinkDeviceCodeForPhoneNumber: async (
  phone: string,
  sendPushNotification: boolean = true
) =>
  this.page?.evaluate(
    ({ p, s }) => {
      // @ts-ignore - WA-JS types podem não estar atualizados
      return window.WPP.conn.genLinkDeviceCodeForPhoneNumber(p, s);
    },
    { p: phone, s: sendPushNotification }
  );
```

### Controller

```typescript
export async function generateLinkDeviceCode(req: any, res: any): Promise<any> {
  const session = req.session;
  const { phone, sendPushNotification = true } = req.query;

  // Validações
  if (!phone) {
    return res.status(400).json({
      status: 'error',
      message: 'Phone number is required',
    });
  }

  // Gerar código
  const code = await waJsUtil.genLinkDeviceCodeForPhoneNumber(
    session,
    phone,
    sendPushNotification === 'true' || sendPushNotification === true
  );

  return res.status(200).json({
    status: 'success',
    code: code,
    session: session,
    phone: phone,
    message: 'Link device code generated successfully',
  });
}
```

## 🧪 Testes

### Scripts Disponíveis

1. **`test-link-device-code.ps1`**

   - Teste básico com um número
   - Gera token automaticamente
   - Mostra instruções de uso

2. **`test-link-device-multiple.ps1`**
   - Testa múltiplos formatos de número
   - Compara resultados
   - Identifica formatos válidos

### Exemplo de Teste Manual

```bash
# 1. Gerar token
curl -X GET "http://localhost:21470/api/apply-token/NERDWHATS_AMERICA/THISISMYSECURETOKEN"

# 2. Gerar código de link
curl -X GET "http://localhost:21470/api/NERDWHATS_AMERICA/generate-link-device-code?phone=5511999999999" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Usar o código no WhatsApp do telefone
```

## 🔍 Troubleshooting

### Erro: "Phone number is required"

- Verifique se o parâmetro `phone` está sendo enviado
- Use o formato internacional: `5511999999999`

### Erro: "Can't get code for already authenticated user"

- A sessão já está conectada
- Use a rota de logout primeiro se necessário

### Erro: "Client not found"

- A sessão não foi inicializada
- Use a rota `/start-session` primeiro

### Erro: "Failed to generate link device code"

- Verifique se o navegador está funcionando
- Tente reiniciar a sessão
- Verifique a conexão com internet

## 📚 Referências

- [WA-JS Documentation](https://wppconnect-team.github.io/wa-js/)
- [WhatsApp Web API](https://web.whatsapp.com/)
- [WPPConnect Documentation](https://wppconnect.io/)

## 🤝 Contribuição

Para reportar bugs ou sugerir melhorias:

1. Abra uma issue no repositório
2. Inclua logs detalhados
3. Descreva os passos para reproduzir
4. Informe a versão do WA-JS e do servidor
