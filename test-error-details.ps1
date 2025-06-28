# Script para capturar detalhes do erro 500
$token = (Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/THISISMYSECURETOKEN/generate-token" -Method POST).token
Write-Host "Token: $token"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Iniciar sessão
Write-Host "Iniciando sessão..."
try {
    $startResponse = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/start-session" -Method POST -Headers $headers
    Write-Host "Sessão iniciada: $($startResponse.status)"
    Start-Sleep -Seconds 5
} catch {
    Write-Host "Erro ao iniciar sessão: $($_.Exception.Message)"
}

# Testar a rota
$body = @{
    phone = "558187906393"
    sendPushNotification = $true
} | ConvertTo-Json

Write-Host "Testando rota..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:21465/api/NERDWHATS_AMERICA/generate-link-device-code" -Method POST -Headers $headers -Body $body
    Write-Host "Sucesso: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Erro: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
    
    # Capturar detalhes do erro
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorContent"
        
        # Tentar fazer parse do JSON
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Host "Erro JSON: $($errorJson | ConvertTo-Json -Depth 10)"
        } catch {
            Write-Host "Erro não é JSON válido"
        }
    } catch {
        Write-Host "Não foi possível obter detalhes do erro"
    }
} 