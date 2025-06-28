# Script PowerShell para matar processos Chrome/Chromium do WA-JS/Puppeteer
# Lê dinamicamente o nome da sessão do arquivo src/index.ts

# Caminho para o arquivo de configuração
$configFile = "..\src\index.ts"

# Verificar se o arquivo existe
if (-Not (Test-Path $configFile)) {
    Write-Host "Arquivo de configuração não encontrado: $configFile"
    exit 1
}

# Ler o arquivo e extrair o nome da sessão
$content = Get-Content $configFile -Raw
$sessionMatch = [regex]::Match($content, "const sessionName = ['`"]([^'`"]+)['`"];")

if ($sessionMatch.Success) {
    $sessionName = $sessionMatch.Groups[1].Value
    Write-Host "Sessão encontrada: $sessionName"
} else {
    Write-Host "Não foi possível encontrar a variável sessionName no arquivo $configFile"
    Write-Host "Usando valor padrão: NERDWHATS_AMERICA"
    $sessionName = "NERDWHATS_AMERICA"
}

$userDataDir = "..\userDataDir\\$sessionName"

# Lista todos os processos chrome.exe com o userDataDir da sessão
$chromeProcs = Get-WmiObject Win32_Process -Filter "name = 'chrome.exe'" | Where-Object { $_.CommandLine -like "*${userDataDir}*" }

if ($chromeProcs.Count -eq 0) {
    Write-Host "Nenhum processo Chrome do WA-JS encontrado para a sessão $sessionName."
} else {
    Write-Host "Encontrados $($chromeProcs.Count) processo(s) Chrome do WA-JS para a sessão $sessionName"
    foreach ($proc in $chromeProcs) {
        Write-Host "  - PID: $($proc.ProcessId)"
        Stop-Process -Id $proc.ProcessId -Force
        Write-Host "    ✓ Processo finalizado"
    }
    Write-Host "Todos os processos Chrome do WA-JS para a sessão $sessionName foram finalizados."
} 