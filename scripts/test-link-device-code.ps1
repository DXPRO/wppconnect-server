# Script para testar a geração de código de link de dispositivo
# Esta funcionalidade permite conectar usando código em vez de QR code

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$Phone = "5511999999999",
    [bool]$SendPushNotification = $true,
    [string]$Host = "localhost",
    [int]$Port = 21470
)

Write-Host "🔗 Testando Geração de Código de Link de Dispositivo" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Primeiro, gerar o token
Write-Host "🔐 Gerando token de autenticação..." -ForegroundColor Yellow
$tokenUrl = "http://${Host}:${Port}/api/apply-token/${Session}/THISISMYSECURETOKEN"

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method GET
    Write-Host "✅ Token gerado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao gerar token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Solução: Verifique se o servidor está rodando e acesse manualmente:" -ForegroundColor Yellow
    Write-Host "   $tokenUrl" -ForegroundColor Cyan
    exit 1
}

# Extrair o token da resposta HTML (simplificado)
$token = $tokenResponse -replace '.*token["\s]*:\s*["\']([^"\']+)["\'].*', '$1'
if ($token -eq $tokenResponse) {
    # Se não conseguiu extrair, usar um token padrão para teste
    $token = "test-token"
    Write-Host "⚠️ Usando token de teste. Para obter o token real, acesse a URL no navegador." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Detalhes da requisição:" -ForegroundColor Yellow
Write-Host "   Sessão: $Session" -ForegroundColor White
Write-Host "   Telefone: $Phone" -ForegroundColor White
Write-Host "   Push Notification: $SendPushNotification" -ForegroundColor White
Write-Host "   Token: $token" -ForegroundColor White
Write-Host ""

# URL da nova rota
$linkDeviceUrl = "http://${Host}:${Port}/api/${Session}/generate-link-device-code?phone=${Phone}&sendPushNotification=${SendPushNotification}"

Write-Host "🌐 Fazendo requisição para gerar código de link de dispositivo..." -ForegroundColor Green
Write-Host "   URL: $linkDeviceUrl" -ForegroundColor White
Write-Host ""

try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'accept' = '*/*'
    }
    
    $response = Invoke-RestMethod -Uri $linkDeviceUrl -Method GET -Headers $headers
    
    Write-Host "✅ Código de link de dispositivo gerado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Resposta:" -ForegroundColor Yellow
    Write-Host "   Status: $($response.status)" -ForegroundColor White
    Write-Host "   Código: $($response.code)" -ForegroundColor White
    Write-Host "   Sessão: $($response.session)" -ForegroundColor White
    Write-Host "   Telefone: $($response.phone)" -ForegroundColor White
    Write-Host "   Mensagem: $($response.message)" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Como usar o código:" -ForegroundColor Yellow
    Write-Host "   1. Abra o WhatsApp no seu telefone" -ForegroundColor White
    Write-Host "   2. Vá em Configurações > Dispositivos vinculados" -ForegroundColor White
    Write-Host "   3. Toque em 'Vincular um dispositivo'" -ForegroundColor White
    Write-Host "   4. Digite o código: $($response.code)" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "❌ Erro ao gerar código de link de dispositivo:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "   🔧 Solução: Token inválido. Gere um novo token acessando:" -ForegroundColor Yellow
            Write-Host "      $tokenUrl" -ForegroundColor Cyan
        } elseif ($statusCode -eq 400) {
            Write-Host "   🔧 Solução: Verifique se o número de telefone está no formato correto (ex: 5511999999999)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "💡 Dica: Esta funcionalidade é uma alternativa ao QR code para conectar dispositivos!" -ForegroundColor Magenta 