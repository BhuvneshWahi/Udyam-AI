$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

# Avoid starting a second app beside an older instance. Vite normally picks a
# different port automatically, while this script opens localhost:3000; strict
# checks make the selected URL deterministic and prevent testing the wrong copy.
$PortsToCheck = @(
    @{ Port = 8001; Name = "FastAPI backend" },
    @{ Port = 3000; Name = "Vite frontend" }
)
foreach ($Item in $PortsToCheck) {
    $Listener = Get-NetTCPConnection -LocalPort $Item.Port -State Listen -ErrorAction SilentlyContinue
    if ($Listener) {
        throw "$($Item.Name) port $($Item.Port) is already in use. Stop the old server (Ctrl+C in its terminal), then run this script again."
    }
}

$Python = Get-Command py -ErrorAction SilentlyContinue
if ($Python) {
    $PythonCmd = "py"
    $PythonArgs = "-3"
} else {
    $PythonCmd = "python"
    $PythonArgs = ""
}

Write-Host "Starting UDYAM AI backend on 8001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root'; if ('$PythonCmd' -eq 'py') { py -3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload } else { python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload }"
)

Start-Sleep -Seconds 2

Write-Host "Starting UDYAM AI frontend on 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root'; npm run dev -- --host 127.0.0.1 --port 3000 --strictPort"
)

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Write-Host "UDYAM AI demo: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend docs: http://127.0.0.1:8001/docs" -ForegroundColor Yellow
