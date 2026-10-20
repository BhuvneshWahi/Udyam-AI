# ==============================================================================
# UDYAM AI — Master Setup & Environment Verification Entry Point
# ==============================================================================

$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     UDYAM AI — ONE-COMMAND MASTER SETUP" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Run Ollama Setup & Verification
$ollamaScript = Join-Path $PSScriptRoot "setup_ollama.ps1"
if (Test-Path $ollamaScript) {
    & powershell.exe -ExecutionPolicy Bypass -File $ollamaScript
} else {
    Write-Host "ERROR: Could not find $ollamaScript" -ForegroundColor Red
    exit 1
}

# 2. Verify Frontend Build
Write-Host "`n[STEP 12/12] Verifying Frontend Build & Types..." -ForegroundColor Yellow
Set-Location $projectRoot
& npm.cmd run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nFrontend Build & TypeScript: PASS" -ForegroundColor Green
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host "UDYAM AI IS 100% READY FOR LOCAL MSME DEMO!" -ForegroundColor Green
    Write-Host "To start backend:  python -m uvicorn backend.main:app --port 8000"
    Write-Host "To start frontend: npm run dev"
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Host "`nFrontend Build: FAILED" -ForegroundColor Red
}
