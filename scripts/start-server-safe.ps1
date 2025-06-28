# Script para iniciar o servidor de forma segura
# Executa verificações prévias e inicia o servidor com tratamento de erros

param(
    [string]$ProjectPath = "..",
    [switch]$SkipChecks = $false
)

Write-Host "🚀 Iniciando Servidor WPPConnect de Forma Segura" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Verificar se estamos no diretório correto
Write-Host "📂 Verificando diretório..." -ForegroundColor Yellow
$packageJson = Join-Path $ProjectPath "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "❌ package.json não encontrado. Navegando para o diretório correto..." -ForegroundColor Red
    Set-Location $ProjectPath
    $packageJson = Join-Path $ProjectPath "package.json"
    if (-not (Test-Path $packageJson)) {
        Write-Host "❌ Erro: Não foi possível encontrar o package.json" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Diretório correto: $(Get-Location)" -ForegroundColor Green

# 2. Verificações prévias (se não pular)
if (-not $SkipChecks) {
    Write-Host "🔍 Executando verificações prévias..." -ForegroundColor Yellow
    
    # Verificar se há processos Chrome rodando
    $chromeProcesses = Get-Process -Name "chrome", "chromium", "chrome.exe", "chromium.exe" -ErrorAction SilentlyContinue
    if ($chromeProcesses) {
        Write-Host "⚠️ Encontrados processos Chrome rodando. Matando processos..." -ForegroundColor Yellow
        $chromeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
    
    # Verificar Chromium
    Write-Host "🔍 Verificando Chromium..." -ForegroundColor Yellow
    $userProfile = $env:USERPROFILE
    $chromiumPath = Join-Path $userProfile ".cache\puppeteer\chrome"
    
    if (Test-Path $chromiumPath) {
        $versions = Get-ChildItem -Path $chromiumPath -Directory | Sort-Object Name -Descending
        if ($versions) {
            $latestVersion = $versions[0].Name
            $chromeExe = Join-Path $chromiumPath "$latestVersion\chrome-win64\chrome.exe"
            if (Test-Path $chromeExe) {
                Write-Host "✅ Chromium OK: $latestVersion" -ForegroundColor Green
            } else {
                Write-Host "❌ Chrome.exe não encontrado. Execute: .\check-chromium.ps1 -Reinstall" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ Nenhuma versão do Chromium encontrada. Execute: .\check-chromium.ps1 -Reinstall" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Chromium não encontrado. Execute: .\check-chromium.ps1 -Reinstall" -ForegroundColor Red
        exit 1
    }
    
    # Verificar dependências
    Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
    $nodeModules = Join-Path $ProjectPath "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "❌ node_modules não encontrado. Instalando dependências..." -ForegroundColor Red
        try {
            npm install
            Write-Host "✅ Dependências instaladas" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao instalar dependências: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Dependências OK" -ForegroundColor Green
    }
}

# 3. Limpar pastas problemáticas
Write-Host "🧹 Limpando pastas problemáticas..." -ForegroundColor Yellow
$sessionName = "NERDWHATS_AMERICA"

# Limpar userDataDir
$userDataDir = Join-Path $ProjectPath "userDataDir"
$sessionDir = Join-Path $userDataDir $sessionName
if (Test-Path $sessionDir) {
    try {
        Remove-Item -Path $sessionDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Pasta da sessão limpa" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao limpar pasta da sessão: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Limpar tokens
$tokensDir = Join-Path $ProjectPath "tokens"
$tokenFile = Join-Path $tokensDir "$sessionName.data.json"
if (Test-Path $tokenFile) {
    try {
        Remove-Item -Path $tokenFile -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Arquivo de token limpo" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao limpar arquivo de token: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 4. Iniciar o servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host "   Aguarde, isso pode demorar alguns segundos..." -ForegroundColor White
Write-Host ""

try {
    # Navegar para o diretório do projeto
    Set-Location $ProjectPath
    
    # Iniciar o servidor
    npm start
} catch {
    Write-Host "❌ Erro ao iniciar o servidor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Soluções possíveis:" -ForegroundColor Yellow
    Write-Host "   1. Execute: .\fix-browser-issues.ps1" -ForegroundColor White
    Write-Host "   2. Execute: .\check-chromium.ps1 -Reinstall" -ForegroundColor White
    Write-Host "   3. Verifique se a porta 21470 não está em uso" -ForegroundColor White
    Write-Host "   4. Execute como administrador se necessário" -ForegroundColor White
    exit 1
} 