# Script para testar a geração de código de link de dispositivo com múltiplos números
# Permite testar diferentes formatos de número de telefone

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$Host = "localhost",
    [int]$Port = 21470
)

Write-Host "🔗 Testando Geração de Código de Link de Dispositivo - Múltiplos Números" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# Array de números de telefone para testar
$phoneNumbers = @(
    "5511999999999",
    "5511888888888", 
    "5511777777777",
    "11999999999",
    "11888888888"
)

Write-Host "📋 Números de telefone para testar:" -ForegroundColor Yellow
foreach ($phone in $phoneNumbers) {
    Write-Host "   - $phone" -ForegroundColor White
}
Write-Host ""

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

Write-Host "   Token: $token" -ForegroundColor White
Write-Host ""

# Testar cada número de telefone
foreach ($phone in $phoneNumbers) {
    Write-Host "📞 Testando número: $phone" -ForegroundColor Yellow
    Write-Host "   " -NoNewline
    
    $linkDeviceUrl = "http://${Host}:${Port}/api/${Session}/generate-link-device-code?phone=${phone}&sendPushNotification=true"
    
    try {
        $headers = @{
            'Authorization' = "Bearer $token"
            'accept' = '*/*'
        }
        
        $response = Invoke-RestMethod -Uri $linkDeviceUrl -Method GET -Headers $headers
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        Write-Host "      Código: $($response.code)" -ForegroundColor Cyan
        Write-Host "      Status: $($response.status)" -ForegroundColor White
        
    } catch {
        $statusCode = $_.Exception.Response?.StatusCode
        if ($statusCode -eq 400) {
            Write-Host "❌ Formato inválido" -ForegroundColor Red
        } elseif ($statusCode -eq 401) {
            Write-Host "❌ Token inválido" -ForegroundColor Red
        } else {
            Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "📊 Resumo dos testes:" -ForegroundColor Yellow
Write-Host "   - Números testados: $($phoneNumbers.Count)" -ForegroundColor White
Write-Host "   - Formato recomendado: 5511999999999 (código do país + DDD + número)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dica: Use números no formato internacional para melhor compatibilidade!" -ForegroundColor Magenta 