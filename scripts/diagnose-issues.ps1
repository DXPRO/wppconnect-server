# Script de diagnóstico completo para identificar problemas do servidor
# Verifica todos os aspectos que podem causar falhas na inicialização

param(
    [string]$ProjectPath = ".."
)

Write-Host "🔍 Diagnóstico Completo do Servidor WPPConnect" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Informações do sistema
Write-Host "💻 Informações do Sistema" -ForegroundColor Yellow
Write-Host "   OS: $($env:OS)" -ForegroundColor White
Write-Host "   Versão: $([System.Environment]::OSVersion)" -ForegroundColor White
Write-Host "   Arquitetura: $(if ([System.Environment]::Is64BitOperatingSystem) { '64-bit' } else { '32-bit' })" -ForegroundColor White
Write-Host "   Usuário: $($env:USERNAME)" -ForegroundColor White
Write-Host "   Diretório: $(Get-Location)" -ForegroundColor White

# 2. Verificar Node.js
Write-Host ""
Write-Host "📦 Verificando Node.js" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado" -ForegroundColor Red
}

# 3. Verificar diretório do projeto
Write-Host ""
Write-Host "📂 Verificando Diretório do Projeto" -ForegroundColor Yellow
$packageJson = Join-Path $ProjectPath "package.json"
if (Test-Path $packageJson) {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
    
    # Ler informações do package.json
    try {
        $packageInfo = Get-Content $packageJson | ConvertFrom-Json
        Write-Host "   📋 Nome: $($packageInfo.name)" -ForegroundColor White
        Write-Host "   📋 Versão: $($packageInfo.version)" -ForegroundColor White
        Write-Host "   📋 Scripts disponíveis: $($packageInfo.scripts.PSObject.Properties.Name -join ', ')" -ForegroundColor White
    } catch {
        Write-Host "   ⚠️ Erro ao ler package.json: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ package.json não encontrado" -ForegroundColor Red
}

# 4. Verificar dependências
Write-Host ""
Write-Host "📦 Verificando Dependências" -ForegroundColor Yellow
$nodeModules = Join-Path $ProjectPath "node_modules"
if (Test-Path $nodeModules) {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
    
    # Verificar dependências críticas
    $criticalDeps = @("puppeteer", "@wppconnect/wa-js", "express")
    foreach ($dep in $criticalDeps) {
        $depPath = Join-Path $nodeModules $dep
        if (Test-Path $depPath) {
            Write-Host "   ✅ $dep instalado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $dep não encontrado" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ node_modules não encontrado" -ForegroundColor Red
}

# 5. Verificar Chromium
Write-Host ""
Write-Host "🔍 Verificando Chromium" -ForegroundColor Yellow
$userProfile = $env:USERPROFILE
$chromiumPath = Join-Path $userProfile ".cache\puppeteer\chrome"

if (Test-Path $chromiumPath) {
    $versions = Get-ChildItem -Path $chromiumPath -Directory | Sort-Object Name -Descending
    if ($versions) {
        $latestVersion = $versions[0].Name
        $chromeExe = Join-Path $chromiumPath "$latestVersion\chrome-win64\chrome.exe"
        
        Write-Host "   ✅ Pasta do Chromium encontrada" -ForegroundColor Green
        Write-Host "   📋 Versão: $latestVersion" -ForegroundColor White
        
        if (Test-Path $chromeExe) {
            Write-Host "   ✅ chrome.exe encontrado" -ForegroundColor Green
            
            # Testar execução
            try {
                $process = Start-Process -FilePath $chromeExe -ArgumentList "--version" -PassThru -WindowStyle Hidden
                Start-Sleep -Seconds 2
                if ($process.HasExited) {
                    Write-Host "   ✅ Chrome pode ser executado" -ForegroundColor Green
                } else {
                    $process.Kill()
                    Write-Host "   ✅ Chrome pode ser executado" -ForegroundColor Green
                }
            } catch {
                Write-Host "   ❌ Erro ao executar Chrome: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "   ❌ chrome.exe não encontrado" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Nenhuma versão do Chromium encontrada" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Pasta do Chromium não encontrada" -ForegroundColor Red
}

# 6. Verificar processos Chrome
Write-Host ""
Write-Host "🔄 Verificando Processos Chrome" -ForegroundColor Yellow
$chromeProcesses = Get-Process -Name "chrome", "chromium", "chrome.exe", "chromium.exe" -ErrorAction SilentlyContinue
if ($chromeProcesses) {
    Write-Host "   ⚠️ Encontrados $($chromeProcesses.Count) processos Chrome rodando:" -ForegroundColor Yellow
    foreach ($proc in $chromeProcesses) {
        Write-Host "      - PID: $($proc.Id), Nome: $($proc.ProcessName)" -ForegroundColor White
    }
} else {
    Write-Host "   ✅ Nenhum processo Chrome rodando" -ForegroundColor Green
}

# 7. Verificar pastas do projeto
Write-Host ""
Write-Host "📁 Verificando Pastas do Projeto" -ForegroundColor Yellow
$folders = @(
    "userDataDir",
    "tokens", 
    "wppconnect_tokens",
    "WhatsAppImages"
)

foreach ($folder in $folders) {
    $folderPath = Join-Path $ProjectPath $folder
    if (Test-Path $folderPath) {
        try {
            # Testar permissões de escrita
            $testFile = Join-Path $folderPath "test_write.tmp"
            New-Item -Path $testFile -ItemType File -Force | Out-Null
            Remove-Item -Path $testFile -Force
            Write-Host "   ✅ $folder (permissões OK)" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ $folder (problema de permissão)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ℹ️ $folder (não existe)" -ForegroundColor Blue
    }
}

# 8. Verificar porta
Write-Host ""
Write-Host "🌐 Verificando Porta 21470" -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 21470 -InformationLevel Quiet
    if ($connection) {
        Write-Host "   ⚠️ Porta 21470 está em uso" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Porta 21470 está livre" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✅ Porta 21470 está livre" -ForegroundColor Green
}

# 9. Verificar arquivos de configuração
Write-Host ""
Write-Host "⚙️ Verificando Arquivos de Configuração" -ForegroundColor Yellow
$configFiles = @(
    "src/config.ts",
    "tsconfig.json",
    "package.json"
)

foreach ($file in $configFiles) {
    $filePath = Join-Path $ProjectPath $file
    if (Test-Path $filePath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file não encontrado" -ForegroundColor Red
    }
}

# 10. Resumo e recomendações
Write-Host ""
Write-Host "📊 Resumo do Diagnóstico" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

$issues = @()

# Verificar problemas críticos
if (-not (Test-Path $packageJson)) { $issues += "package.json não encontrado" }
if (-not (Test-Path $nodeModules)) { $issues += "node_modules não encontrado" }
if (-not (Test-Path $chromiumPath)) { $issues += "Chromium não instalado" }
if ($chromeProcesses) { $issues += "Processos Chrome rodando" }

if ($issues.Count -eq 0) {
    Write-Host "✅ Sistema pronto para iniciar!" -ForegroundColor Green
    Write-Host "🚀 Execute: .\start-server-safe.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Problemas encontrados:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   - $issue" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔧 Soluções recomendadas:" -ForegroundColor Yellow
    if ($issues -contains "package.json não encontrado") {
        Write-Host "   1. Verifique se está no diretório correto do projeto" -ForegroundColor White
    }
    if ($issues -contains "node_modules não encontrado") {
        Write-Host "   2. Execute: npm install" -ForegroundColor White
    }
    if ($issues -contains "Chromium não instalado") {
        Write-Host "   3. Execute: .\check-chromium.ps1 -Reinstall" -ForegroundColor White
    }
    if ($issues -contains "Processos Chrome rodando") {
        Write-Host "   4. Execute: .\fix-browser-issues.ps1" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "💡 Dicas adicionais:" -ForegroundColor Cyan
Write-Host "   - Execute como administrador se houver problemas de permissão" -ForegroundColor White
Write-Host "   - Verifique se o antivírus não está bloqueando o Chrome" -ForegroundColor White
Write-Host "   - Use: .\start-server-safe.ps1 para iniciar com verificações" -ForegroundColor White 