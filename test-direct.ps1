# Teste direto da função
Write-Host "=== Teste Direto da Função ===" -ForegroundColor Green

# 1. Gerar token
$token = (Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/THISISMYSECURETOKEN/generate-token" -Method POST).token
Write-Host "Token gerado: $token" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Verificar status da sessão
Write-Host "`nVerificando status da sessão..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/status-session" -Method GET -Headers $headers
    Write-Host "Status: $($statusResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Testar uma rota que sabemos que funciona
Write-Host "`nTestando rota que funciona (list-chats)..." -ForegroundColor Yellow
try {
    $chatsResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/list-chats" -Method GET -Headers $headers
    Write-Host "✅ List-chats funcionou: $($chatsResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ List-chats falhou: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# 4. Testar a rota problemática
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
        
        # Tentar fazer parse do JSON
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Host "Erro JSON: $($errorJson | ConvertTo-Json -Depth 10)" -ForegroundColor Red
        } catch {
            Write-Host "Erro não é JSON válido" -ForegroundColor Red
        }
    } catch {
        Write-Host "Não foi possível obter detalhes do erro" -ForegroundColor Red
    }
}

Write-Host "`n=== Teste concluído ===" -ForegroundColor Green 