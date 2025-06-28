# Teste para debugar o middleware de autenticação

$BASE_URL = "http://localhost:21465"
$SESSION = "NERDWHATS_AMERICA"
$SECRET_KEY = "THISISMYSECURETOKEN"

Write-Host "=== DEBUG DO MIDDLEWARE DE AUTENTICAÇÃO ===" -ForegroundColor Green
Write-Host ""

# 1. Gerar token
Write-Host "1. Gerando token..." -ForegroundColor Yellow
try {
    $tokenResponse = Invoke-RestMethod -Uri "$BASE_URL/api/$SESSION/$SECRET_KEY/generate-token" -Method POST
    $token = $tokenResponse.token
    Write-Host "✅ Token gerado: $token" -ForegroundColor Green
    Write-Host "   Session: $($tokenResponse.session)" -ForegroundColor Cyan
    Write-Host "   Full: $($tokenResponse.full)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao gerar token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Testar com header Authorization
Write-Host "2. Testando com header Authorization..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/$SESSION/qrcode-session" -Method GET -Headers $headers
    Write-Host "✅ Sucesso com header Authorization!" -ForegroundColor Green
    Write-Host "   Resposta: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro com header Authorization: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Testar com token no parâmetro da URL (formato legado)
Write-Host "3. Testando com token no parâmetro da URL..." -ForegroundColor Yellow
$sessionWithToken = "$SESSION`:$token"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/$sessionWithToken/qrcode-session" -Method GET
    Write-Host "✅ Sucesso com token no parâmetro!" -ForegroundColor Green
    Write-Host "   Resposta: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro com token no parâmetro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Token: $token" -ForegroundColor Cyan
Write-Host "Session: $SESSION" -ForegroundColor Cyan
Write-Host "URL com token: $BASE_URL/api/$sessionWithToken/qrcode-session" -ForegroundColor Cyan
Write-Host "" 