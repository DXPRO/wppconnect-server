# Script para corrigir problemas de inicialização do navegador
# Resolve problemas de permissão e arquivos travados

param(
    [string]$Session = "NERDWHATS_AMERICA",
    [string]$ProjectPath = ".."
)

Write-Host "🔧 Corrigindo Problemas de Inicialização do Navegador" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Matar todos os processos Chrome/Chromium
Write-Host "🔄 Matando processos Chrome/Chromium..." -ForegroundColor Yellow
try {
    $chromeProcesses = Get-Process -Name "chrome", "chromium", "chrome.exe", "chromium.exe" -ErrorAction SilentlyContinue
    if ($chromeProcesses) {
        $chromeProcesses | Stop-Process -Force
        Write-Host "✅ Processos Chrome/Chromium finalizados" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Nenhum processo Chrome/Chromium encontrado" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️ Erro ao matar processos: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Limpar pasta userDataDir
Write-Host "🧹 Limpando pasta userDataDir..." -ForegroundColor Yellow
$userDataDir = Join-Path $ProjectPath "userDataDir"
$sessionDir = Join-Path $userDataDir $Session

if (Test-Path $sessionDir) {
    try {
        Remove-Item -Path $sessionDir -Recurse -Force
        Write-Host "✅ Pasta da sessão removida: $sessionDir" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao remover pasta da sessão: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ Pasta da sessão não encontrada: $sessionDir" -ForegroundColor Blue
}

# 3. Limpar pasta tokens
Write-Host "🗂️ Limpando pasta tokens..." -ForegroundColor Yellow
$tokensDir = Join-Path $ProjectPath "tokens"
$tokenFile = Join-Path $tokensDir "$Session.data.json"

if (Test-Path $tokenFile) {
    try {
        Remove-Item -Path $tokenFile -Force
        Write-Host "✅ Arquivo de token removido: $tokenFile" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao remover arquivo de token: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ Arquivo de token não encontrado: $tokenFile" -ForegroundColor Blue
}

# 4. Limpar pasta wppconnect_tokens
Write-Host "🗂️ Limpando pasta wppconnect_tokens..." -ForegroundColor Yellow
$wppTokensDir = Join-Path $ProjectPath "wppconnect_tokens"
$wppSessionDir = Join-Path $wppTokensDir $Session

if (Test-Path $wppSessionDir) {
    try {
        Remove-Item -Path $wppSessionDir -Recurse -Force
        Write-Host "✅ Pasta WPP tokens removida: $wppSessionDir" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao remover pasta WPP tokens: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ Pasta WPP tokens não encontrada: $wppSessionDir" -ForegroundColor Blue
}

# 5. Verificar e corrigir permissões
Write-Host "🔐 Verificando permissões..." -ForegroundColor Yellow
$directories = @($userDataDir, $tokensDir, $wppTokensDir)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        try {
            # Verificar se podemos escrever na pasta
            $testFile = Join-Path $dir "test_permission.tmp"
            New-Item -Path $testFile -ItemType File -Force | Out-Null
            Remove-Item -Path $testFile -Force
            Write-Host "✅ Permissões OK: $dir" -ForegroundColor Green
        } catch {
            Write-Host "❌ Problema de permissão: $dir" -ForegroundColor Red
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        try {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-Host "✅ Pasta criada: $dir" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao criar pasta: $dir" -ForegroundColor Red
        }
    }
}

# 6. Verificar se o Chromium está disponível
Write-Host "🔍 Verificando Chromium..." -ForegroundColor Yellow
$userProfile = $env:USERPROFILE
$chromiumPath = Join-Path $userProfile ".cache\puppeteer\chrome"

if (Test-Path $chromiumPath) {
    $versions = Get-ChildItem -Path $chromiumPath -Directory | Sort-Object Name -Descending
    if ($versions) {
        $latestVersion = $versions[0].Name
        $chromeExe = Join-Path $chromiumPath "$latestVersion\chrome-win64\chrome.exe"
        if (Test-Path $chromeExe) {
            Write-Host "✅ Chromium encontrado: $chromeExe" -ForegroundColor Green
        } else {
            Write-Host "❌ Chrome.exe não encontrado em: $chromeExe" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Nenhuma versão do Chromium encontrada" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Pasta do Chromium não encontrada: $chromiumPath" -ForegroundColor Red
}

# 7. Aguardar um pouco para garantir que tudo foi limpo
Write-Host "⏳ Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎯 Resumo das correções:" -ForegroundColor Cyan
Write-Host "   ✅ Processos Chrome finalizados" -ForegroundColor Green
Write-Host "   ✅ Pastas de sessão limpas" -ForegroundColor Green
Write-Host "   ✅ Arquivos de token removidos" -ForegroundColor Green
Write-Host "   ✅ Permissões verificadas" -ForegroundColor Green
Write-Host "   ✅ Chromium verificado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora você pode tentar iniciar o servidor novamente!" -ForegroundColor Green
Write-Host "   Use: npm start" -ForegroundColor White 