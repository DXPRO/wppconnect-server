# Script para debugar o problema da rota generate-link-device-code
$ServerHost = "localhost"
$Port = "21465"
$Session = "NERDWHATS_AMERICA"
$SecretKey = "THISISMYSECURETOKEN"

Write-Host "=== Debug da rota generate-link-device-code ===" -ForegroundColor Green

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
    
    # 2. Verificar status da sessão
    Write-Host "`n2. Verificando status da sessão..." -ForegroundColor Yellow
    $statusUrl = "http://${ServerHost}:${Port}/api/${Session}/status-session"
    try {
        $statusResponse = Invoke-RestMethod -Uri $statusUrl -Method GET -Headers $headers
        Write-Host "Status da sessão: $($statusResponse.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 3. Iniciar sessão se necessário
    Write-Host "`n3. Iniciando sessão..." -ForegroundColor Yellow
    $startUrl = "http://${ServerHost}:${Port}/api/${Session}/start-session"
    try {
        $startResponse = Invoke-RestMethod -Uri $startUrl -Method POST -Headers $headers
        Write-Host "Sessão iniciada: $($startResponse.status)" -ForegroundColor Green
        Start-Sleep -Seconds 5  # Aguardar inicialização
    }
    catch {
        Write-Host "Erro ao iniciar sessão: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 4. Testar diferentes variações da rota
    Write-Host "`n4. Testando diferentes variações da rota..." -ForegroundColor Yellow
    
    $testUrls = @(
        "http://${ServerHost}:${Port}/api/${Session}/generate-link-device-code",
        "http://${ServerHost}:${Port}/api/${Session}/gen-link-device-code",
        "http://${ServerHost}:${Port}/api/${Session}/link-device-code"
    )
    
    $body = @{
        phone = "558187906393"
        sendPushNotification = $true
    } | ConvertTo-Json
    
    foreach ($testUrl in $testUrls) {
        Write-Host "Testando: $testUrl" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri $testUrl -Method POST -Headers $headers -Body $body
            Write-Host "✅ Sucesso! Status: $($response.status)" -ForegroundColor Green
            if ($response.code) {
                Write-Host "Código gerado: $($response.code)" -ForegroundColor Green
            }
            break
        }
        catch {
            Write-Host "❌ Erro: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # 5. Testar com método GET (caso a rota esteja definida como GET)
    Write-Host "`n5. Testando com método GET..." -ForegroundColor Yellow
    $getUrl = "http://${ServerHost}:${Port}/api/${Session}/generate-link-device-code?phone=558187906393&sendPushNotification=true"
    try {
        $response = Invoke-RestMethod -Uri $getUrl -Method GET -Headers $headers
        Write-Host "✅ Sucesso com GET! Status: $($response.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro com GET: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 6. Verificar se a rota está registrada
    Write-Host "`n6. Verificando rotas disponíveis..." -ForegroundColor Yellow
    try {
        $swaggerUrl = "http://${ServerHost}:${Port}/api-docs"
        $swaggerResponse = Invoke-WebRequest -Uri $swaggerUrl -Method GET
        if ($swaggerResponse.Content -match "generate-link-device-code") {
            Write-Host "✅ Rota encontrada no Swagger" -ForegroundColor Green
        } else {
            Write-Host "❌ Rota NÃO encontrada no Swagger" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erro ao verificar Swagger: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "Erro ao gerar token: $($tokenResponse.message)" -ForegroundColor Red
}

Write-Host "`n=== Debug concluído ===" -ForegroundColor Green 