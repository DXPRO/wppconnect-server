# Script para testar a nova rota apply-token-auto
# Esta rota mostra um popup modal com instruções para aplicar o token

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$SecretKey = "THISISMYSECURETOKEN",
    [string]$ServerUrl = "http://localhost:21470"
)

Write-Host "🔐 Testando rota apply-token-auto (Popup Modal)..." -ForegroundColor Cyan
Write-Host ""

# URL da nova rota
$url = "$ServerUrl/api/$Session/$SecretKey/apply-token-auto"

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "📡 Fazendo requisição..." -ForegroundColor Green
    
    # Fazer a requisição
    $response = Invoke-RestMethod -Uri $url -Method GET -ContentType "text/html"
    
    Write-Host "✅ Resposta recebida!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📄 Conteúdo da resposta (primeiros 500 caracteres):" -ForegroundColor Yellow
    Write-Host $response.Substring(0, [Math]::Min(500, $response.Length)) -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Esta rota deve abrir uma página com popup modal contendo instruções!" -ForegroundColor Cyan
    Write-Host "💡 O token será copiado automaticamente para a área de transferência." -ForegroundColor Cyan
    Write-Host "💡 O popup mostrará instruções passo a passo para aplicar o token no Swagger UI." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao fazer requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 400) {
            Write-Host "💡 Verifique se o SECRET_KEY está correto!" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🎯 Para testar manualmente:" -ForegroundColor Cyan
Write-Host "1. Abra o navegador" -ForegroundColor White
Write-Host "2. Cole a URL: $url" -ForegroundColor White
Write-Host "3. A página abrirá com um popup modal" -ForegroundColor White
Write-Host "4. O token será copiado automaticamente" -ForegroundColor White
Write-Host "5. Siga as instruções no popup para aplicar o token no Swagger UI" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Vantagens do novo sistema:" -ForegroundColor Green
Write-Host "   ✅ Não abre novas abas (mais seguro)" -ForegroundColor White
Write-Host "   ✅ Popup modal na mesma janela" -ForegroundColor White
Write-Host "   ✅ Instruções claras e visuais" -ForegroundColor White
Write-Host "   ✅ Token copiado automaticamente" -ForegroundColor White
Write-Host "   ✅ Botão para abrir Swagger UI diretamente" -ForegroundColor White 