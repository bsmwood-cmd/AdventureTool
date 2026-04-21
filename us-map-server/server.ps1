Add-Type -AssemblyName System.Net

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8081/")
$listener.Start()

Write-Host "Server running on http://localhost:8080"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }

        $filePath = Join-Path "public" $path.TrimStart("/")
        $filePath = Resolve-Path $filePath 2>$null

        if ($filePath -and (Test-Path $filePath -PathType Leaf)) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $mime = switch ([IO.Path]::GetExtension($filePath)) {
                ".html" { "text/html; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                default { "text/plain; charset=utf-8" }
            }
            $response.ContentType = $mime
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $notFound = "<h1>404 Not Found</h1>"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped"
}