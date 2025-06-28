# Script para testar se a documentação Swagger está atualizada
# Este script verifica se o parâmetro session tem o valor padrão NERDWHATS_AMERICA

param(
    [string]$Host = "localhost",
    [int]$Port = 21470
)

Write-Host "🔍 Verificando Documentação Swagger" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$swaggerUrl = "http://${Host}:${Port}/api-docs"

Write-Host "📋 URL do Swagger: $swaggerUrl" -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 Abrindo Swagger UI no navegador..." -ForegroundColor Green
Write-Host "   Verifique se o parâmetro 'session' aparece com:" -ForegroundColor White
Write-Host "   - Valor padrão: NERDWHATS_AMERICA" -ForegroundColor White
Write-Host "   - Exemplo: NERDWHATS_AMERICA" -ForegroundColor White
Write-Host "   - Descrição: Session name" -ForegroundColor White
Write-Host ""

try {
    # Abrir no navegador padrão
    Start-Process $swaggerUrl
    
    Write-Host "✅ Swagger UI aberto no navegador!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 Instruções para verificar:" -ForegroundColor Yellow
    Write-Host "   1. Vá para a tag 'WA-JS'" -ForegroundColor White
    Write-Host "   2. Clique em qualquer rota (ex: GET /api/{session}/qrcode-session)" -ForegroundColor White
    Write-Host "   3. Verifique se o parâmetro 'session' tem:" -ForegroundColor White
    Write-Host "      - Schema: NERDWHATS_AMERICA" -ForegroundColor White
    Write-Host "      - Example: NERDWHATS_AMERICA" -ForegroundColor White
    Write-Host "      - Description: Session name" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Rotas principais para verificar:" -ForegroundColor Yellow
    Write-Host "   - GET /api/{session}/qrcode-session" -ForegroundColor White
    Write-Host "   - POST /api/{session}/start-session" -ForegroundColor White
    Write-Host "   - DELETE /api/{session}/close-session" -ForegroundColor White
    Write-Host "   - GET /api/{session}/all-unread-messages" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Erro ao abrir no navegador: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Solução manual:" -ForegroundColor Yellow
    Write-Host "   Copie e cole esta URL no seu navegador:" -ForegroundColor White
    Write-Host "   $swaggerUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Dica: Se o servidor não estiver rodando, inicie-o primeiro!" -ForegroundColor Magenta 