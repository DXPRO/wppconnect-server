# Script para verificar e reinstalar o Chromium se necessário

param(
    [switch]$Reinstall = $false
)

Write-Host "🔍 Verificando Instalação do Chromium" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$userProfile = $env:USERPROFILE
$chromiumPath = Join-Path $userProfile ".cache\puppeteer\chrome"

Write-Host "📂 Pasta do Chromium: $chromiumPath" -ForegroundColor Yellow

if (Test-Path $chromiumPath) {
    $versions = Get-ChildItem -Path $chromiumPath -Directory | Sort-Object Name -Descending
    if ($versions) {
        $latestVersion = $versions[0].Name
        $chromeExe = Join-Path $chromiumPath "$latestVersion\chrome-win64\chrome.exe"
        
        Write-Host "✅ Versão encontrada: $latestVersion" -ForegroundColor Green
        Write-Host "📍 Caminho do Chrome: $chromeExe" -ForegroundColor White
        
        if (Test-Path $chromeExe) {
            Write-Host "✅ Chrome.exe encontrado e acessível" -ForegroundColor Green
            
            # Testar se o Chrome pode ser executado
            try {
                $process = Start-Process -FilePath $chromeExe -ArgumentList "--version" -PassThru -WindowStyle Hidden
                Start-Sleep -Seconds 2
                if ($process.HasExited) {
                    Write-Host "✅ Chrome pode ser executado corretamente" -ForegroundColor Green
                } else {
                    $process.Kill()
                    Write-Host "✅ Chrome pode ser executado corretamente" -ForegroundColor Green
                }
            } catch {
                Write-Host "❌ Erro ao executar Chrome: $($_.Exception.Message)" -ForegroundColor Red
                $Reinstall = $true
            }
        } else {
            Write-Host "❌ Chrome.exe não encontrado" -ForegroundColor Red
            $Reinstall = $true
        }
    } else {
        Write-Host "❌ Nenhuma versão do Chromium encontrada" -ForegroundColor Red
        $Reinstall = $true
    }
} else {
    Write-Host "❌ Pasta do Chromium não encontrada" -ForegroundColor Red
    $Reinstall = $true
}

if ($Reinstall) {
    Write-Host ""
    Write-Host "🔄 Reinstalando Chromium..." -ForegroundColor Yellow
    
    # Navegar para o diretório do projeto
    $projectPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    Set-Location $projectPath
    
    Write-Host "📂 Diretório do projeto: $projectPath" -ForegroundColor White
    
    # Remover pasta do Chromium se existir
    if (Test-Path $chromiumPath) {
        try {
            Remove-Item -Path $chromiumPath -Recurse -Force
            Write-Host "✅ Pasta do Chromium removida" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Erro ao remover pasta do Chromium: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    # Reinstalar Puppeteer para baixar o Chromium
    Write-Host "📦 Reinstalando Puppeteer..." -ForegroundColor Yellow
    try {
        npm uninstall puppeteer
        npm install puppeteer
        Write-Host "✅ Puppeteer reinstalado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao reinstalar Puppeteer: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Verificar novamente
    Write-Host ""
    Write-Host "🔍 Verificando instalação após reinstalação..." -ForegroundColor Yellow
    if (Test-Path $chromiumPath) {
        $versions = Get-ChildItem -Path $chromiumPath -Directory | Sort-Object Name -Descending
        if ($versions) {
            $latestVersion = $versions[0].Name
            $chromeExe = Join-Path $chromiumPath "$latestVersion\chrome-win64\chrome.exe"
            if (Test-Path $chromeExe) {
                Write-Host "✅ Chromium reinstalado com sucesso!" -ForegroundColor Green
                Write-Host "📍 Novo caminho: $chromeExe" -ForegroundColor White
            } else {
                Write-Host "❌ Problema na reinstalação - Chrome.exe não encontrado" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Problema na reinstalação - Nenhuma versão encontrada" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Problema na reinstalação - Pasta não criada" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✅ Chromium está funcionando corretamente!" -ForegroundColor Green
    Write-Host "🚀 Você pode iniciar o servidor normalmente." -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Cyan
Write-Host "   - Se ainda houver problemas, execute: .\fix-browser-issues.ps1" -ForegroundColor White
Write-Host "   - Para forçar reinstalação: .\check-chromium.ps1 -Reinstall" -ForegroundColor White
Write-Host "   - Verifique se o antivírus não está bloqueando o Chrome" -ForegroundColor White 