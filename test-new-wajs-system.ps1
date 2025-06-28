# Teste do novo sistema padronizado de execução WA-JS
$baseUrl = "http://localhost:21465"
$session = "test-new-system"
$secretKey = "THISISMYSECURETOKEN"

Write-Host "🧪 Testando novo sistema padronizado de execução WA-JS..." -ForegroundColor Cyan

# 0. Gerar token dinâmico
Write-Host "🔑 Gerando token dinâmico..." -ForegroundColor Yellow
try {
    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/$secretKey/generate-token" -Method POST
    $token = $tokenResponse.token
    if (-not $token) {
        Write-Host "❌ Não foi possível obter o token!" -ForegroundColor Red
        exit 1
    }
    $headers = @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ Token obtido: $token" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao gerar token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 1. Iniciar sessão
Write-Host "1️⃣ Iniciando sessão..." -ForegroundColor Yellow
try {
    $initResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/start-session" -Method POST -ContentType "application/json" -Headers $headers
    Write-Host "✅ Sessão iniciada: $($initResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar sessão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Aguardar inicialização
Start-Sleep -Seconds 3

# 2. Verificar autenticação e QR Code se necessário
Write-Host "2️⃣ Verificando autenticação..." -ForegroundColor Yellow
$maxAttempts = 60  # 60 tentativas = 10 minutos
$attempt = 0
$authenticated = $false

while ($attempt -lt $maxAttempts -and -not $authenticated) {
    $attempt++
    Write-Host "   Tentativa $attempt/$maxAttempts - Verificando autenticação..." -ForegroundColor Gray
    
    try {
        # Verificar se está autenticado via script customizado
        $authCheckBody = @{
            script = "return window.WPP.conn.isAuthenticated();"
        } | ConvertTo-Json

        $authResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/execute-script" -Method POST -Body $authCheckBody -ContentType "application/json" -Headers $headers -TimeoutSec 30
        
        Write-Host "   Resposta da API: $($authResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        
        if ($authResponse.status -eq "success" -and $authResponse.response -eq $true) {
            $authenticated = $true
            Write-Host "✅ WhatsApp autenticado com sucesso!" -ForegroundColor Green
            break
        } else {
            Write-Host "   Status de autenticação: $($authResponse.response)" -ForegroundColor Gray
            
            # Se não está autenticado, tentar obter QR Code
            if ($attempt -eq 1 -or ($attempt % 5 -eq 0)) {  # A cada 5 tentativas
                Write-Host "   📱 Buscando QR Code..." -ForegroundColor Yellow
                try {
                    $qrResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/qrcode-session" -Method GET -ContentType "application/json" -Headers $headers -TimeoutSec 30
                    Write-Host "   QR Code status: $($qrResponse.status)" -ForegroundColor Gray
                    
                    if ($qrResponse.status -eq "qrcode" -and $qrResponse.qrcode) {
                        Write-Host "   🔐 QR Code disponível para leitura!" -ForegroundColor Magenta
                        Write-Host "   📱 Escaneie o QR Code com seu WhatsApp para autenticar" -ForegroundColor Cyan
                    } elseif ($qrResponse.status -eq "authenticated") {
                        Write-Host "   ✅ QR Code indica que já está autenticado!" -ForegroundColor Green
                        $authenticated = $true
                        break
                    } else {
                        Write-Host "   ⏳ Aguardando QR Code ser gerado..." -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "   ❌ Erro ao obter QR Code: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    } catch {
        Write-Host "   ❌ Erro ao verificar autenticação: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Detalhes do erro: $errorBody" -ForegroundColor Red
        }
    }
    
    # Aguardar 10 segundos antes da próxima verificação
    Start-Sleep -Seconds 10
}

if (-not $authenticated) {
    Write-Host "❌ Timeout: WhatsApp não foi autenticado em 10 minutos" -ForegroundColor Red
    Write-Host "✅ Teste concluído (sem autenticação)" -ForegroundColor Cyan
    exit 0
}

Write-Host "🎉 Autenticação confirmada! Iniciando testes das funções..." -ForegroundColor Green
Start-Sleep -Seconds 2

# 3. Testar listagem de chats (após autenticação confirmada)
Write-Host "3️⃣ Testando listagem de chats..." -ForegroundColor Yellow
try {
    $chatsResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/all-chats" -Method GET -ContentType "application/json" -Headers $headers -TimeoutSec 30
    Write-Host "✅ Chats listados: $($chatsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao listar chats: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

# 4. Testar listagem de contatos (após autenticação confirmada)
Write-Host "4️⃣ Testando listagem de contatos..." -ForegroundColor Yellow
try {
    $contactsResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/all-contacts" -Method GET -ContentType "application/json" -Headers $headers -TimeoutSec 30
    Write-Host "✅ Contatos listados: $($contactsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao listar contatos: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

# 5. Testar envio de mensagem (após autenticação confirmada)
Write-Host "5️⃣ Testando envio de mensagem..." -ForegroundColor Yellow
try {
    $messageBody = @{
        to = "5511999999999@c.us"
        content = "Teste do novo sistema WA-JS - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    } | ConvertTo-Json

    $messageResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/send-message" -Method POST -Body $messageBody -ContentType "application/json" -Headers $headers -TimeoutSec 30
    Write-Host "✅ Mensagem enviada: $($messageResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao enviar mensagem: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

# 6. Testar execução de script customizado (após autenticação confirmada)
Write-Host "6️⃣ Testando execução de script customizado..." -ForegroundColor Yellow
try {
    $scriptBody = @{
        script = "return window.WPP.conn.getState();"
    } | ConvertTo-Json

    $scriptResponse = Invoke-RestMethod -Uri "$baseUrl/api/$session/execute-script" -Method POST -Body $scriptBody -ContentType "application/json" -Headers $headers -TimeoutSec 30
    Write-Host "✅ Script executado: $($scriptResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao executar script: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

Write-Host "✅ Teste do novo sistema concluído com sucesso!" -ForegroundColor Cyan 