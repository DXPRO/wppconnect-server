# Script para testar se a função está sendo importada corretamente
$ServerHost = "localhost"
$Port = "21465"
$Session = "NERDWHATS_AMERICA"
$SecretKey = "THISISMYSECURETOKEN"

Write-Host "=== Teste de Importação da Função ===" -ForegroundColor Green

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
    
    # 2. Testar uma rota que sabemos que funciona
    Write-Host "`n2. Testando rota que funciona (status-session)..." -ForegroundColor Yellow
    $statusUrl = "http://${ServerHost}:${Port}/api/${Session}/status-session"
    try {
        $statusResponse = Invoke-RestMethod -Uri $statusUrl -Method GET -Headers $headers
        Write-Host "✅ Status da sessão: $($statusResponse.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 3. Testar a rota problemática
    Write-Host "`n3. Testando rota generate-link-device-code..." -ForegroundColor Yellow
    $testUrl = "http://${ServerHost}:${Port}/api/${Session}/generate-link-device-code"
    
    $body = @{
        phone = "558187906393"
        sendPushNotification = $true
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $testUrl -Method POST -Headers $headers -Body $body
        Write-Host "✅ Sucesso! Status: $($response.status)" -ForegroundColor Green
        if ($response.code) {
            Write-Host "Código gerado: $($response.code)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)" -ForegroundColor Red
        
        # 4. Verificar se é um problema de rota não encontrada
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "`n4. Verificando se a rota está registrada..." -ForegroundColor Yellow
            
            # Testar outras rotas do WA-JS para ver se estão funcionando
            $testRoutes = @(
                "http://${ServerHost}:${Port}/api/${Session}/list-chats",
                "http://${ServerHost}:${Port}/api/${Session}/all-contacts",
                "http://${ServerHost}:${Port}/api/${Session}/qrcode-session"
            )
            
            foreach ($route in $testRoutes) {
                try {
                    $routeResponse = Invoke-RestMethod -Uri $route -Method GET -Headers $headers
                    Write-Host "✅ $route - OK" -ForegroundColor Green
                }
                catch {
                    Write-Host "❌ $route - $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                }
            }
        }
    }
    
} else {
    Write-Host "Erro ao gerar token: $($tokenResponse.message)" -ForegroundColor Red
}

Write-Host "`n=== Teste concluído ===" -ForegroundColor Green 