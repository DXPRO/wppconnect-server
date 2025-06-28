# Teste de debug para getAllContacts
$baseUrl = "http://localhost:21465"
$session = "test-debug"
$secretKey = "THISISMYSECURETOKEN"

Write-Host "🔍 Debug: Testando getAllContacts..." -ForegroundColor Cyan

# 1. Gerar token
Write-Host "1️⃣ Gerando token..." -ForegroundColor Yellow
try {
    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/$secretKey/generate-token" -Method POST
    $token = $tokenResponse.token
    $headers = @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ Token obtido" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao gerar token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Iniciar sessão
Write-Host "2️⃣ Iniciando sessão..." -ForegroundColor Yellow
try {
    $initResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/start-session" -Method POST -ContentType "application/json" -Headers $headers
    Write-Host "✅ Sessão iniciada" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar sessão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3

# 3. Verificar status
Write-Host "3️⃣ Verificando status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/status-session" -Method GET -ContentType "application/json" -Headers $headers
    Write-Host "Status: $($statusResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Testar getAllContacts com detalhes do erro
Write-Host "4️⃣ Testando getAllContacts..." -ForegroundColor Yellow
try {
    $contactsResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/all-contacts" -Method GET -ContentType "application/json" -Headers $headers
    Write-Host "✅ Contatos obtidos: $($contactsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao obter contatos: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

Write-Host "✅ Debug concluído!" -ForegroundColor Cyan 