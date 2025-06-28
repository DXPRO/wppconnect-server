# Teste simples da rota generate-link-device-code
Write-Host "=== Teste da Rota generate-link-device-code ===" -ForegroundColor Green

# 1. Gerar token
$token = (Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/THISISMYSECURETOKEN/generate-token" -Method POST).token
Write-Host "Token gerado: $token" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Iniciar sessão
Write-Host "`nIniciando sessão..." -ForegroundColor Yellow
$startResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/start-session" -Method POST -Headers $headers
Write-Host "Sessão iniciada: $($startResponse.status)" -ForegroundColor Green

# 3. Aguardar um pouco
Start-Sleep -Seconds 3

# 4. Testar a rota
Write-Host "`nTestando generate-link-device-code..." -ForegroundColor Yellow
$body = @{
    phone = "558187906393"
    sendPushNotification = $true
} | ConvertTo-Json

Write-Host "Body: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/generate-link-device-code" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Sucesso: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)" -ForegroundColor Red
    
    # Capturar detalhes do erro
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorContent" -ForegroundColor Red
    } catch {
        Write-Host "Não foi possível obter detalhes do erro" -ForegroundColor Red
    }
}

Write-Host "`n=== Teste concluído ===" -ForegroundColor Green 