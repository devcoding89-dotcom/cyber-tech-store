$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    if ($content -ne $null) {
        $updated = $content `
            -replace '#EF4444', '#3B82F6' `
            -replace '#DC2626', '#2563EB' `
            -replace '#991B1B', '#1D4ED8' `
            -replace '#B91C1C', '#1E40AF' `
            -replace 'red-500', 'blue-500' `
            -replace 'red-600', 'blue-600' `
            -replace 'red-400', 'blue-400' `
            -replace 'red-300', 'blue-300' `
            -replace 'red-200', 'blue-200' `
            -replace 'red-100', 'blue-100' `
            -replace 'red-900', 'blue-900' `
            -replace 'red-800', 'blue-800' `
            -replace 'red-700', 'blue-700' `
            -replace 'text-red-', 'text-blue-' `
            -replace 'bg-red-', 'bg-blue-' `
            -replace 'border-red-', 'border-blue-' `
            -replace 'from-red-', 'from-blue-' `
            -replace 'to-red-', 'to-blue-' `
            -replace 'via-red-', 'via-blue-' `
            -replace 'ring-red-', 'ring-blue-' `
            -replace 'fill-red-', 'fill-blue-' `
            -replace '0a0000', '030712' `
            -replace '100000', '020510' `
            -replace 'from-\[#3B82F6\] via-white to-\[#3B82F6\]', 'from-[#3B82F6] via-[#60A5FA] to-[#3B82F6]'
        Set-Content -Path $f.FullName -Value $updated -Encoding UTF8 -NoNewline
        if ($content -ne $updated) {
            Write-Host "Updated: $($f.Name)"
        }
    }
}
Write-Host "Done!"
