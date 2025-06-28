# Teste comparativo entre get-auth-code e qrcode
$baseUrl = "http://localhost:21465"
$session = "test-comparison"

Write-Host "🧪 Teste comparativo: AuthCode vs QR Code..." -ForegroundColor Cyan

# 1. Iniciar sessão
Write-Host "1️⃣ Iniciando sessão..." -ForegroundColor Yellow
$initResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/start" -Method POST -ContentType "application/json"
Write-Host "Resposta do start: $($initResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green

# Aguardar inicialização
Start-Sleep -Seconds 3

# 2. Testar AuthCode (método novo)
Write-Host "2️⃣ Testando AuthCode via eventos..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/get-auth-code" -Method GET -ContentType "application/json"
    Write-Host "✅ AuthCode obtido: $($authResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no AuthCode: $($_.Exception.Message)" -ForegroundColor Red
}

# Aguardar um pouco
Start-Sleep -Seconds 2

# 3. Testar QR Code (método tradicional)
Write-Host "3️⃣ Testando QR Code tradicional..." -ForegroundColor Yellow
try {
    $qrResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/qrcode" -Method GET -ContentType "application/json"
    Write-Host "✅ QR Code obtido: $($qrResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no QR Code: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Verificar status
Write-Host "4️⃣ Status final da sessão..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/status" -Method GET -ContentType "application/json"
    Write-Host "Status: $($statusResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Comparação concluída!" -ForegroundColor Cyan 