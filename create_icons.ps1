Add-Type -AssemblyName System.Drawing

$sizes = @(16, 48, 128)
$iconPath = "c:\Users\Aby.Thomas\Desktop\extensions\clipboard_manager\icons"

foreach ($size in $sizes) {
    # Create bitmap
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Fill with blue background
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 152, 219))
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Draw 'C' for ClipSuit
    $font = New-Object System.Drawing.Font('Arial', [Math]::Max(4, $size / 4))
    $graphics.DrawString('C', $font, [System.Drawing.Brushes]::White, 2, 2)
    
    # Save PNG
    $filePath = "$iconPath\icon-$size.png"
    $bmp.Save($filePath)
    
    Write-Host "Created: $filePath"
    
    $graphics.Dispose()
    $bmp.Dispose()
    $font.Dispose()
    $brush.Dispose()
}

Write-Host "All icons created successfully!"
Get-ChildItem $iconPath
