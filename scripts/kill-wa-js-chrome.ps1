# Script PowerShell para matar apenas os processos Chrome/Chromium do WA-JS/Puppeteer da sessão NERDWHATS_AMERICA
# Não afeta o navegador Chrome principal do usuário

$sessionName = "NERDWHATS_AMERICA"
$userDataDir = "userDataDir\\$sessionName"

# Lista todos os processos chrome.exe com o userDataDir da sessão
$chromeProcs = Get-WmiObject Win32_Process -Filter "name = 'chrome.exe'" | Where-Object { $_.CommandLine -like "*${userDataDir}*" }

if ($chromeProcs.Count -eq 0) {
    Write-Host "Nenhum processo Chrome do WA-JS encontrado para a sessão $sessionName."
} else {
    foreach ($proc in $chromeProcs) {
        Write-Host "Matando PID $($proc.ProcessId) - $($proc.CommandLine)"
        Stop-Process -Id $proc.ProcessId -Force
    }
    Write-Host "Todos os processos Chrome do WA-JS para a sessão $sessionName foram finalizados."
} 