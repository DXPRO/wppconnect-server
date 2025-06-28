$uri = "http://localhost:21470/api/NERDWHATS_AMERICA/qrcode-session"
$headers = @{
    "Authorization" = "Bearer `$2b`$10`$87Bq0CYCVm0K_8iTMSvNr.CYVDPkuebkLjpIPyd7ORxcZO0ecObn."
}

try {
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
} 