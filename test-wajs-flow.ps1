$baseUrl = "http://localhost:21465"
$session = "NERDWHATS_AMERICA"
$secretKey = "THISISMYSECURETOKEN"

Write-Host "Gerando token..."
$tokenResp = Invoke-RestMethod -Uri "$baseUrl/api/$session/$secretKey/generate-token" -Method Post -Headers @{Accept='application/json'}
$token = "Bearer $($tokenResp.token)"
Write-Host "Token gerado: $token"

Write-Host "Iniciando sessão..."
Invoke-RestMethod -Uri "$baseUrl/api/$session/start-session" -Method Post -Headers @{Authorization=$token}

Write-Host "Obtendo QR code..."
$qrResp = Invoke-RestMethod -Uri "$baseUrl/api/$session/qrcode-session" -Headers @{Authorization=$token}
$qrResp | ConvertTo-Json

Write-Host "Enviando mensagem..."
Invoke-RestMethod -Uri "$baseUrl/api/$session/send-message" -Method Post -Headers @{Authorization=$token} -Body (@{phone="5511999999999"; message="Olá do WA-JS!"} | ConvertTo-Json) -ContentType "application/json" 