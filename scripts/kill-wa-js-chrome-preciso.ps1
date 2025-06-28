# Script para matar apenas os Chromes/Chromiums do Puppeteer/WA-JS
# Filtra pelo argumento --user-data-dir do projeto

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$ProjectPath = ".."
)

Write-Host "🔍 Procurando processos Chrome/Chromium do WA-JS para a sessão: $Session" -ForegroundColor Cyan

# Caminho do userDataDir da sessão
$userDataDir = Join-Path $ProjectPath "userDataDir"
$sessionDir = Join-Path $userDataDir $Session

# Pega todos os processos chrome/chromium
$chromeProcs = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -match "chrome.exe|chromium.exe"
}

$waJsProcs = @()
foreach ($proc in $chromeProcs) {
    if ($proc.CommandLine -and $proc.CommandLine -match [regex]::Escape($sessionDir)) {
        $waJsProcs += $proc
    }
}

if ($waJsProcs.Count -eq 0) {
    Write-Host "ℹ️ Nenhum processo Chrome/Chromium do WA-JS encontrado para a sessão $Session." -ForegroundColor Yellow
    exit 0
}

Write-Host "⚠️ Encontrados $($waJsProcs.Count) processos WA-JS Chrome/Chromium para a sessão $Session:" -ForegroundColor Yellow
foreach ($proc in $waJsProcs) {
    Write-Host "   - PID: $($proc.ProcessId), Caminho: $($proc.ExecutablePath)" -ForegroundColor White
    Write-Host "     Linha de comando: $($proc.CommandLine)" -ForegroundColor Gray
}

# Listar todos os processos Chrome/Chromium e seus argumentos para depuração
Write-Host "\n==== TODOS OS PROCESSOS CHROME/CHROMIUM ====" -ForegroundColor Yellow
foreach ($proc in $chromeProcs) {
    Write-Host "PID: $($proc.ProcessId) | Caminho: $($proc.ExecutablePath)" -ForegroundColor White
    Write-Host "CMD: $($proc.CommandLine)" -ForegroundColor Gray
    Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
}
Write-Host "==== FIM DA LISTAGEM ====" -ForegroundColor Yellow

# Confirmar antes de matar
Write-Host ""
Write-Host "Deseja finalizar esses processos? (S/N)" -ForegroundColor Cyan
$resp = Read-Host
if ($resp -ne 'S' -and $resp -ne 's') {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Yellow
    exit 0
}

foreach ($proc in $waJsProcs) {
    try {
        Stop-Process -Id $proc.ProcessId -Force
        Write-Host "✅ Processo $($proc.ProcessId) finalizado." -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao finalizar processo $($proc.ProcessId): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Apenas os Chromes do WA-JS foram finalizados. O navegador do usuário permanece aberto!" -ForegroundColor Green 