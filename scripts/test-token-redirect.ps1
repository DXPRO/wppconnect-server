# Script para testar a aplicação automática de token com redirecionamento
# Esta rota aplica o token e redireciona automaticamente para o Swagger UI

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$SecretKey = "THISISMYSECURETOKEN",
    [string]$Host = "localhost",
    [int]$Port = 21470
)

Write-Host "🔐 Testando Aplicação Automática de Token com Redirecionamento" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# URL da nova rota de aplicação automática com redirecionamento
$redirectUrl = "http://${Host}:${Port}/api/apply-token-redirect/${Session}/${SecretKey}"

Write-Host "📋 Detalhes da requisição:" -ForegroundColor Yellow
Write-Host "   Sessão: $Session" -ForegroundColor White
Write-Host "   URL: $redirectUrl" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Abrindo no navegador..." -ForegroundColor Green
Write-Host "   A página irá:" -ForegroundColor White
Write-Host "   1. Gerar o token automaticamente" -ForegroundColor White
Write-Host "   2. Armazenar no localStorage" -ForegroundColor White
Write-Host "   3. Abrir o Swagger UI em nova janela" -ForegroundColor White
Write-Host "   4. Aplicar o token automaticamente" -ForegroundColor White
Write-Host ""

try {
    # Abrir no navegador padrão
    Start-Process $redirectUrl
    
    Write-Host "✅ Página aberta no navegador!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 O que acontecerá:" -ForegroundColor Yellow
    Write-Host "   1. Uma página de loading aparecerá" -ForegroundColor White
    Write-Host "   2. O token será gerado e armazenado" -ForegroundColor White
    Write-Host "   3. Após 3 segundos, o Swagger UI abrirá automaticamente" -ForegroundColor White
    Write-Host "   4. O token será aplicado automaticamente no Swagger" -ForegroundColor White
    Write-Host "   5. A página de loading fechará automaticamente" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Resultado esperado:" -ForegroundColor Yellow
    Write-Host "   - Swagger UI aberto com token já aplicado" -ForegroundColor White
    Write-Host "   - Todas as rotas protegidas funcionando" -ForegroundColor White
    Write-Host "   - Não precisa copiar/colar token manualmente" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erro ao abrir no navegador: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Solução manual:" -ForegroundColor Yellow
    Write-Host "   Copie e cole esta URL no seu navegador:" -ForegroundColor White
    Write-Host "   $redirectUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Dica: Esta é a solução mais eficaz para aplicar tokens automaticamente!" -ForegroundColor Magenta 