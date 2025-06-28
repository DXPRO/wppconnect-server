# Teste simples da rota generate-link-device-code
$token = (Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/THISISMYSECURETOKEN/generate-token" -Method POST).token
Write-Host "Token: $token"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 1. Verificar status da sessão
Write-Host "`n1. Verificando status da sessão..."
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/status-session" -Method GET -Headers $headers
    Write-Host "Status: $($statusResponse.status)"
} catch {
    Write-Host "Erro ao verificar status: $($_.Exception.Message)"
}

# 2. Iniciar sessão se necessário
Write-Host "`n2. Iniciando sessão..."
try {
    $startResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/start-session" -Method POST -Headers $headers
    Write-Host "Sessão iniciada: $($startResponse.status)"
    Start-Sleep -Seconds 5
} catch {
    Write-Host "Erro ao iniciar sessão: $($_.Exception.Message)"
}

# 3. Testar a rota generate-link-device-code
Write-Host "`n3. Testando generate-link-device-code..."
$body = @{
    phone = "558187906393"
    sendPushNotification = $true
} | ConvertTo-Json

Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/generate-link-device-code" -Method POST -Headers $headers -Body $body
    Write-Host "Sucesso: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Erro: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
    
    # Tentar obter detalhes do erro
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Detalhes: $errorContent"
    } catch {
        Write-Host "Não foi possível obter detalhes do erro"
    }
} 