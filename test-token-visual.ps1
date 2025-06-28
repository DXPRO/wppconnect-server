# Teste para verificar se o token está funcionando corretamente
# e se os cadeados ficam verdes no Swagger

$BASE_URL = "http://localhost:21465"
$SESSION = "NERDWHATS_AMERICA"
$SECRET_KEY = "THISISMYSECURETOKEN"

Write-Host "=== TESTE DE TOKEN E AUTORIZAÇÃO ===" -ForegroundColor Green
Write-Host ""

# 1. Gerar token
Write-Host "1. Gerando token..." -ForegroundColor Yellow
$tokenUrl = "$BASE_URL/api/$SESSION/$SECRET_KEY/generate-token"
try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST
    $token = $tokenResponse.token
    Write-Host "✅ Token gerado: $token" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao gerar token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Testar rota sem token (deve dar 401)
Write-Host "2. Testando rota SEM token (deve dar 401)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/$SESSION/all-contacts" -Method GET
    Write-Host "❌ ERRO: Rota deveria ter retornado 401 sem token!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correto: Rota retornou 401 sem token" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Testar rota COM token (deve funcionar)
Write-Host "3. Testando rota COM token (deve funcionar)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/$SESSION/all-contacts" -Method GET -Headers $headers
    Write-Host "✅ Sucesso: Rota funcionou com token!" -ForegroundColor Green
    Write-Host "   Resposta: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao testar com token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== INSTRUÇÕES PARA O SWAGGER ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Acesse: $BASE_URL/api-docs" -ForegroundColor Cyan
Write-Host "2. Clique no botão 'Authorize' (ícone de cadeado)" -ForegroundColor Cyan
Write-Host "3. Cole o token: $token" -ForegroundColor Cyan
Write-Host "4. Clique em 'Authorize' e depois 'Close'" -ForegroundColor Cyan
Write-Host "5. Agora todos os cadeados devem ficar VERDES/ABERTOS" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== EXEMPLO DE CURL ===" -ForegroundColor Green
Write-Host ""
Write-Host "curl -X 'GET' \`"$BASE_URL/api/$SESSION/all-contacts\`" \`" -ForegroundColor Yellow
Write-Host "  -H 'accept: */*' \`" -ForegroundColor Yellow
Write-Host "  -H 'Authorization: Bearer $token'" -ForegroundColor Yellow
Write-Host "" 