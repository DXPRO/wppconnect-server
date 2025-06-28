# Script para testar diferentes parâmetros na rota generate-link-device-code
$ServerHost = "localhost"
$Port = "21465"
$Session = "NERDWHATS_AMERICA"
$SecretKey = "THISISMYSECURETOKEN"

Write-Host "=== Teste de Parâmetros da Rota ===" -ForegroundColor Green

# 1. Gerar token
Write-Host "1. Gerando token..." -ForegroundColor Yellow
$tokenUrl = "http://${ServerHost}:${Port}/api/${Session}/${SecretKey}/generate-token"
$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST

if ($tokenResponse.status -eq "success") {
    $token = $tokenResponse.token
    Write-Host "Token gerado: $token" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. Iniciar sessão primeiro
    Write-Host "`n2. Iniciando sessão..." -ForegroundColor Yellow
    $startUrl = "http://${ServerHost}:${Port}/api/${Session}/start-session"
    try {
        $startResponse = Invoke-RestMethod -Uri $startUrl -Method POST -Headers $headers
        Write-Host "Sessão iniciada: $($startResponse.status)" -ForegroundColor Green
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Host "Erro ao iniciar sessão: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 3. Testar diferentes combinações de parâmetros
    Write-Host "`n3. Testando diferentes parâmetros..." -ForegroundColor Yellow
    
    $testCases = @(
        @{
            name = "Apenas phone"
            body = @{ phone = "558187906393" }
        },
        @{
            name = "Phone como string"
            body = @{ phone = "558187906393"; sendPushNotification = "true" }
        },
        @{
            name = "Phone como string, sendPushNotification como boolean"
            body = @{ phone = "558187906393"; sendPushNotification = $true }
        },
        @{
            name = "Phone como string, sendPushNotification como string false"
            body = @{ phone = "558187906393"; sendPushNotification = "false" }
        },
        @{
            name = "Phone como string, sendPushNotification como boolean false"
            body = @{ phone = "558187906393"; sendPushNotification = $false }
        },
        @{
            name = "Phone sem formatação"
            body = @{ phone = "558187906393"; sendPushNotification = $true }
        },
        @{
            name = "Phone com formatação"
            body = @{ phone = "+558187906393"; sendPushNotification = $true }
        }
    )
    
    $testUrl = "http://${ServerHost}:${Port}/api/${Session}/generate-link-device-code"
    
    foreach ($testCase in $testCases) {
        Write-Host "`nTestando: $($testCase.name)" -ForegroundColor Cyan
        Write-Host "Parâmetros: $($testCase.body | ConvertTo-Json)" -ForegroundColor Gray
        
        try {
            $body = $testCase.body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $testUrl -Method POST -Headers $headers -Body $body
            Write-Host "✅ Sucesso! Status: $($response.status)" -ForegroundColor Green
            if ($response.code) {
                Write-Host "Código gerado: $($response.code)" -ForegroundColor Green
            }
            break
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode
            $errorMessage = $_.Exception.Message
            
            Write-Host "❌ Erro $statusCode: $errorMessage" -ForegroundColor Red
            
            # Se for 400, tentar obter mais detalhes do erro
            if ($statusCode -eq 400) {
                try {
                    $errorResponse = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorResponse)
                    $errorContent = $reader.ReadToEnd()
                    Write-Host "Detalhes do erro: $errorContent" -ForegroundColor Red
                }
                catch {
                    Write-Host "Não foi possível obter detalhes do erro" -ForegroundColor Red
                }
            }
        }
    }
    
} else {
    Write-Host "Erro ao gerar token: $($tokenResponse.message)" -ForegroundColor Red
}

Write-Host "`n=== Teste concluído ===" -ForegroundColor Green 