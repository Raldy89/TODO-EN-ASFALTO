# Servidor web para TODO EN ASFALTO DE LEÓN
$PORT = 3000
$URL = "http://localhost:$PORT"

Write-Host "`n🚀 Iniciando servidor web..." -ForegroundColor Green
Write-Host "📱 Aplicación: TODO EN ASFALTO DE LEÓN" -ForegroundColor Cyan
Write-Host "🌐 URL local: $URL" -ForegroundColor Yellow
Write-Host "📂 Directorio: $PWD" -ForegroundColor Gray
Write-Host "`n✨ La aplicación está lista para usarse" -ForegroundColor Green
Write-Host "💡 Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Gray

try {
    # Crear el listener HTTP
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($URL + "/")
    $listener.Start()
    
    Write-Host "🎯 Servidor iniciado exitosamente en $URL" -ForegroundColor Green
    
    # Bucle infinito para manejar peticiones
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Obtener la ruta solicitada
            $path = $request.Url.LocalPath
            if ($path -eq "/") {
                $path = "/index.html"
            }
            
            # Construir la ruta completa del archivo
            $filePath = Join-Path $PWD ($path.TrimStart('/'))
            
            # Determinar el tipo MIME
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
            
            # Servir el archivo si existe
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
                Write-Host "✅ Sirviendo: $path" -ForegroundColor Green
            } else {
                # Si no existe, servir index.html (SPA)
                $indexPath = Join-Path $PWD "index.html"
                if (Test-Path $indexPath) {
                    $content = [System.IO.File]::ReadAllBytes($indexPath)
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $content.Length
                    $response.OutputStream.Write($content, 0, $content.Length)
                    Write-Host "📄 Sirviendo index.html para: $path" -ForegroundColor Yellow
                } else {
                    $response.StatusCode = 404
                    $errorText = "404 - Página no encontrada"
                    $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorText)
                    $response.ContentType = "text/plain; charset=utf-8"
                    $response.ContentLength64 = $errorBytes.Length
                    $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
                    Write-Host "❌ No encontrado: $path" -ForegroundColor Red
                }
            }
            
            $response.Close()
        } catch {
            Write-Host "⚠️ Error procesando petición: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error iniciando el servidor: $_" -ForegroundColor Red
} finally {
    if ($listener) {
        $listener.Stop()
        Write-Host "`nServidor detenido" -ForegroundColor Yellow
    }
}
