# Teste da rota get-auth-code com captura via eventos
$baseUrl = "http://localhost:21465"
$session = "test-session"

Write-Host "🧪 Testando rota get-auth-code com captura via eventos..." -ForegroundColor Cyan

# 1. Iniciar sessão
Write-Host "1️⃣ Iniciando sessão..." -ForegroundColor Yellow
$initResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/start" -Method POST -ContentType "application/json"
Write-Host "Resposta do start: $($initResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green

# Aguardar um pouco para a sessão inicializar
Start-Sleep -Seconds 3

# 2. Tentar obter AuthCode
Write-Host "2️⃣ Tentando obter AuthCode via eventos..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/get-auth-code" -Method GET -ContentType "application/json"
    Write-Host "✅ AuthCode obtido com sucesso!" -ForegroundColor Green
    Write-Host "Resposta: $($authResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    
    if ($authResponse.fullCode) {
        Write-Host "🔐 Código de autenticação: $($authResponse.fullCode)" -ForegroundColor Magenta
    }
} catch {
    Write-Host "❌ Erro ao obter AuthCode: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

# 3. Verificar status da sessão
Write-Host "3️⃣ Verificando status da sessão..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/status" -Method GET -ContentType "application/json"
    Write-Host "Status da sessão: $($statusResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Teste concluído!" -ForegroundColor Cyan 