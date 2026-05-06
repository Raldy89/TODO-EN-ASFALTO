# Servidor web para TODO EN ASFALTO DE LEON
$PORT = 3000
$URL = "http://localhost:$PORT"

Write-Host "Iniciando servidor web..." -ForegroundColor Green
Write-Host "Aplicacion: TODO EN ASFALTO DE LEON" -ForegroundColor Cyan
Write-Host "URL local: $URL" -ForegroundColor Yellow
Write-Host "Directorio: $PWD" -ForegroundColor Gray
Write-Host "La aplicacion esta lista para usarse" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray

try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($URL + "/")
    $listener.Start()
    
    Write-Host "Servidor iniciado exitosamente en $URL" -ForegroundColor Green
    
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $path = $request.Url.LocalPath
            if ($path -eq "/") {
                $path = "/index.html"
            }
            
            $filePath = Join-Path $PWD ($path.TrimStart('/'))
            
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                
                # Headers de seguridad
                $response.Headers.Add("X-Content-Type-Options", "nosniff")
                $response.Headers.Add("X-Frame-Options", "DENY")
                $response.Headers.Add("X-XSS-Protection", "1; mode=block")
                $response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin")
                $response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formsubmit.co;")
                
                $response.OutputStream.Write($content, 0, $content.Length)
                Write-Host "Sirviendo: $path" -ForegroundColor Green
            } else {
                $indexPath = Join-Path $PWD "index.html"
                if (Test-Path $indexPath) {
                    $content = [System.IO.File]::ReadAllBytes($indexPath)
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $content.Length
                    
                    # Headers de seguridad
                    $response.Headers.Add("X-Content-Type-Options", "nosniff")
                    $response.Headers.Add("X-Frame-Options", "DENY")
                    $response.Headers.Add("X-XSS-Protection", "1; mode=block")
                    $response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin")
                    $response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formsubmit.co;")
                    
                    $response.OutputStream.Write($content, 0, $content.Length)
                    Write-Host "Sirviendo index.html para: $path" -ForegroundColor Yellow
                } else {
                    $response.StatusCode = 404
                    $errorText = "404 - Pagina no encontrada"
                    $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorText)
                    $response.ContentType = "text/plain; charset=utf-8"
                    $response.ContentLength64 = $errorBytes.Length
                    $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
                    Write-Host "No encontrado: $path" -ForegroundColor Red
                }
            }
            
            $response.Close()
        } catch {
            Write-Host "Error procesando peticion: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Error iniciando el servidor: $_" -ForegroundColor Red
} finally {
    if ($listener) {
        $listener.Stop()
        Write-Host "Servidor detenido" -ForegroundColor Yellow
    }
}
