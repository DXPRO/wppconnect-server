# Script PowerShell para testar a rota execute-script do WA-JS
$Session = "NERDWHATS_AMERICA"
$SecretKey = "THISISMYSECURETOKEN"
$Server = "http://localhost:21465"

Write-Host "=== Teste Automático WA-JS execute-script ===" -ForegroundColor Green

# 1. Gerar token
Write-Host "1. Gerando token..." -ForegroundColor Yellow
$tokenUrl = "$Server/api/$Session/$SecretKey/generate-token"
$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST
if ($tokenResponse.status -ne "success") {
    Write-Host "Erro ao gerar token: $($tokenResponse.message)" -ForegroundColor Red
    exit 1
}
$Token = $tokenResponse.token
Write-Host "Token: $Token" -ForegroundColor Green
$headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }

# 2. Iniciar sessão
Write-Host "2. Iniciando sessão..." -ForegroundColor Yellow
$startUrl = "$Server/api/$Session/start-session"
try {
    $startResponse = Invoke-RestMethod -Uri $startUrl -Method POST -Headers $headers
    Write-Host "Sessão iniciada: $($startResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao iniciar sessão: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Aguardar inicialização
Write-Host "3. Aguardando 10 segundos para inicialização do navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Verificar status da sessão
Write-Host "4. Verificando status da sessão..." -ForegroundColor Yellow
$statusUrl = "$Server/api/$Session/status-session"
$statusResponse = Invoke-RestMethod -Uri $statusUrl -Method GET -Headers $headers
Write-Host "Status: $($statusResponse.status)" -ForegroundColor Green

# 5. Executar script WA-JS
Write-Host "5. Executando script WA-JS (isAuthenticated)..." -ForegroundColor Yellow
$scriptBody = @{ script = "return WPP.conn.isAuthenticated();"; args = @() } | ConvertTo-Json
$execUrl = "$Server/api/$Session/execute-script"
try {
    $execResponse = Invoke-RestMethod -Uri $execUrl -Method POST -Headers $headers -Body $scriptBody
    Write-Host "Resultado: $($execResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao executar script: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorContent" -ForegroundColor Red
    } catch {
        Write-Host "Não foi possível obter detalhes do erro" -ForegroundColor Red
    }
}

Write-Host "\n=== Teste concluído ===" -ForegroundColor Green 