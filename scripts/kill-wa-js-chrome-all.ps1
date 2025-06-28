# Script PowerShell para matar processos Chrome/Chromium do WA-JS/Puppeteer
# Lê dinamicamente todas as sessões do projeto e mata os processos correspondentes

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

# Array de sessões (por enquanto só uma, mas pode ser expandido)
$sessions = @($sessionName)

Write-Host "=== Limpeza de Processos Chrome do WA-JS ==="
Write-Host ""

$totalKilled = 0

foreach ($sessionName in $sessions) {
    Write-Host "Verificando sessão: $sessionName"
    $userDataDir = "..\userDataDir\\$sessionName"
    
    # Lista todos os processos chrome.exe com o userDataDir da sessão
    $chromeProcs = Get-WmiObject Win32_Process -Filter "name = 'chrome.exe'" | Where-Object { $_.CommandLine -like "*${userDataDir}*" }
    
    if ($chromeProcs.Count -eq 0) {
        Write-Host "  ✓ Nenhum processo encontrado"
    } else {
        Write-Host "  Encontrados $($chromeProcs.Count) processo(s)"
        foreach ($proc in $chromeProcs) {
            Write-Host "    - PID: $($proc.ProcessId)"
            Stop-Process -Id $proc.ProcessId -Force
            Write-Host "      ✓ Finalizado"
            $totalKilled++
        }
    }
    Write-Host ""
}

Write-Host "=== Resumo ==="
Write-Host "Total de processos finalizados: $totalKilled"
Write-Host "Limpeza concluída!"

# Mata todos os processos node, chrome e chromium relacionados ao WA-JS/Puppeteer
Write-Host "Matando processos node, chrome e chromium relacionados ao WA-JS/Puppeteer..." -ForegroundColor Yellow

# Mata todos os node (exceto o próprio PowerShell)
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | ForEach-Object { $_ | Stop-Process -Force }

# Mata todos os chrome.exe
Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { $_ | Stop-Process -Force }

# Mata todos os chromium.exe
Get-Process chromium -ErrorAction SilentlyContinue | ForEach-Object { $_ | Stop-Process -Force }

Write-Host "Processos finalizados." -ForegroundColor Green 