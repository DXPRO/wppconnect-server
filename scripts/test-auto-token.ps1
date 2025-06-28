# Script para testar a aplicação automática de token
# Este script abre a rota /apply-token no navegador para aplicar automaticamente o token no Swagger UI

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$SecretKey = "THISISMYSECURETOKEN",
    [string]$Host = "localhost",
    [int]$Port = 21470
)

Write-Host "🔐 Testando Aplicação Automática de Token" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# URL da rota de aplicação automática
$applyTokenUrl = "http://${Host}:${Port}/api/apply-token/${Session}/${SecretKey}"

Write-Host "📋 Detalhes da requisição:" -ForegroundColor Yellow
Write-Host "   Sessão: $Session" -ForegroundColor White
Write-Host "   URL: $applyTokenUrl" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Abrindo no navegador..." -ForegroundColor Green
Write-Host "   A página irá aplicar automaticamente o token no Swagger UI" -ForegroundColor White
Write-Host ""

try {
    # Abrir no navegador padrão
    Start-Process $applyTokenUrl
    
    Write-Host "✅ Página aberta no navegador!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 Instruções:" -ForegroundColor Yellow
    Write-Host "   1. A página irá tentar aplicar o token automaticamente" -ForegroundColor White
    Write-Host "   2. Se não conseguir, use o botão 'Abrir Swagger UI'" -ForegroundColor White
    Write-Host "   3. O token será aplicado automaticamente no Swagger" -ForegroundColor White
    Write-Host "   4. Você poderá usar todas as rotas protegidas sem copiar/colar" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Para testar o QR Code após aplicar o token:" -ForegroundColor Yellow
    Write-Host "   Use o botão 'Testar QR Code' na página ou acesse:" -ForegroundColor White
    Write-Host "   http://${Host}:${Port}/api-docs" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao abrir no navegador: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Solução manual:" -ForegroundColor Yellow
    Write-Host "   Copie e cole esta URL no seu navegador:" -ForegroundColor White
    Write-Host "   $applyTokenUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Dica: Esta funcionalidade só funciona no navegador, não via curl!" -ForegroundColor Magenta 