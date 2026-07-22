$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    if ($content -ne $null) {
        # Replace dark background from near-black blue to pure black
        $updated = $content -replace '0a0a0f', '0a0000' -replace '0f0f14', '100000' -replace 'bg-\[#EF4444\]\/5', 'bg-red-500/5' -replace 'bg-\[#EF4444\]\/10', 'bg-red-500/10' -replace 'bg-\[#EF4444\]\/20', 'bg-red-500/20' -replace 'border-\[#EF4444\]\/30', 'border-red-500/30' -replace 'border-\[#EF4444\]\/50', 'border-red-500/50' -replace 'from-\[#EF4444\] via-\[#DC2626\] to-\[#EF4444\]', 'from-[#EF4444] via-[#DC2626] to-[#EF4444]'
        Set-Content -Path $f.FullName -Value $updated -Encoding UTF8 -NoNewline
        if ($content -ne $updated) {
            Write-Host "Updated: $($f.Name)"
        }
    }
}
Write-Host "Done!"
