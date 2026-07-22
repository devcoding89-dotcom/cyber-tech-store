$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts","*.css"
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    if ($content -ne $null) {
        $updated = $content -replace '#FFD700', '#EF4444' -replace '#FFA500', '#DC2626'
        Set-Content -Path $f.FullName -Value $updated -Encoding UTF8 -NoNewline
        if ($content -ne $updated) {
            Write-Host "Updated: $($f.Name)"
        }
    }
}
Write-Host "Done!"
