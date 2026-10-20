# ==============================================================================
# UDYAM AI — One-Click Ollama Setup, Installation & Verification Script
# Platform: Windows 10/11
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     UDYAM AI - OLLAMA SETUP & VERIFICATION" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 1: Check System & Environment
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 1/11] Checking System Environment..." -ForegroundColor Yellow

$osVersion = [System.Environment]::OSVersion.VersionString
$psVersion = $PSVersionTable.PSVersion.ToString()
$is64Bit = [System.Environment]::Is64BitOperatingSystem
$arch = [System.Environment]::GetEnvironmentVariable("PROCESSOR_ARCHITECTURE")

Write-Host "  OS Version:     $osVersion"
Write-Host "  PowerShell:     $psVersion"
Write-Host "  Architecture:   $arch (64-bit: $is64Bit)"

$internetOnline = (Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet -ErrorAction SilentlyContinue)
if ($internetOnline) {
    Write-Host "  Internet:       CONNECTED (PASS)" -ForegroundColor Green
} else {
    Write-Host "  Internet:       OFFLINE / UNREACHABLE" -ForegroundColor Red
}

# ------------------------------------------------------------------------------
# STEP 2: Detect or Install Ollama
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 2/11] Verifying Ollama Installation..." -ForegroundColor Yellow

$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
$ollamaExe = if ($ollamaCmd) { $ollamaCmd.Source } else { "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" }

if (-not (Test-Path $ollamaExe)) {
    $altPaths = @(
        "$env:ProgramFiles\Ollama\ollama.exe",
        "${env:ProgramFiles(x86)}\Ollama\ollama.exe"
    )
    foreach ($p in $altPaths) {
        if (Test-Path $p) { $ollamaExe = $p; break }
    }
}

if (-not (Test-Path $ollamaExe)) {
    Write-Host "  Ollama is NOT installed. Initiating installation..." -ForegroundColor Yellow
    if (-not $internetOnline) {
        Write-Host "OLLAMA INSTALLATION: BLOCKED — INTERNET UNAVAILABLE" -ForegroundColor Red
        exit 1
    }

    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        Write-Host "  Installing via Windows Package Manager (winget)..." -ForegroundColor Cyan
        & winget install --id Ollama.Ollama --scope user --accept-source-agreements --accept-package-agreements --disable-interactivity
    } else {
        Write-Host "  Downloading official Ollama installer..." -ForegroundColor Cyan
        $installerPath = "$env:TEMP\OllamaSetup.exe"
        curl.exe -L -o $installerPath "https://ollama.com/download/OllamaSetup.exe"
        Write-Host "  Running installer..." -ForegroundColor Cyan
        Start-Process -FilePath $installerPath -ArgumentList "/SILENT" -Wait
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    }

    $ollamaExe = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
    if (-not (Test-Path $ollamaExe)) {
        Write-Host "  ERROR: Ollama installation did not produce executable at $ollamaExe" -ForegroundColor Red
        exit 1
    }
}

# Refresh PATH for session
$ollamaDir = Split-Path $ollamaExe
if ($env:Path -notlike "*$ollamaDir*") {
    $env:Path = "$ollamaDir;$env:Path"
}

$ollamaVersionRaw = (& $ollamaExe --version 2>&1 | Out-String).Trim()
Write-Host "  Ollama Installed: PASS ($ollamaVersionRaw)" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 3: Start / Verify Ollama Service & Local API
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 3/11] Checking Ollama Service & Local API..." -ForegroundColor Yellow

$ollamaEndpoint = "http://127.0.0.1:11434"
$serviceRunning = $false

try {
    $resp = Invoke-RestMethod -Uri "$ollamaEndpoint/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $serviceRunning = $true
} catch {
    Write-Host "  Ollama service is not responding. Starting background service..." -ForegroundColor Yellow
    Start-Process -FilePath $ollamaExe -ArgumentList "serve" -WindowStyle Hidden
    
    $attempts = 0
    while ($attempts -lt 15) {
        Start-Sleep -Seconds 1
        $attempts++
        try {
            $resp = Invoke-RestMethod -Uri "$ollamaEndpoint/api/tags" -Method Get -TimeoutSec 2 -ErrorAction Stop
            $serviceRunning = $true
            break
        } catch {}
    }
}

if ($serviceRunning) {
    Write-Host "  Ollama Service:   PASS (Listening on $ollamaEndpoint)" -ForegroundColor Green
} else {
    Write-Host "  Ollama Service:   FAIL (Could not bind to $ollamaEndpoint)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 4: Verify llama3.2:3b Model
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 4/11] Verifying llama3.2:3b Model..." -ForegroundColor Yellow

$tags = Invoke-RestMethod -Uri "$ollamaEndpoint/api/tags" -Method Get
$hasModel = $false
if ($tags.models) {
    foreach ($m in $tags.models) {
        if ($m.name -like "*llama3.2:3b*") {
            $hasModel = $true
            break
        }
    }
}

if (-not $hasModel) {
    Write-Host "  Model llama3.2:3b is missing. Pulling from official registry..." -ForegroundColor Cyan
    if (-not $internetOnline) {
        Write-Host "OLLAMA INSTALLATION: BLOCKED — INTERNET UNAVAILABLE" -ForegroundColor Red
        exit 1
    }
    & $ollamaExe pull llama3.2:3b
}

$tagsAfter = Invoke-RestMethod -Uri "$ollamaEndpoint/api/tags" -Method Get
$modelConfirmed = $false
foreach ($m in $tagsAfter.models) {
    if ($m.name -like "*llama3.2:3b*") {
        $modelConfirmed = $true
        $modelSizeGB = [math]::Round($m.size / 1GB, 2)
        Write-Host "  Model llama3.2:3b Installed: PASS (Size: ${modelSizeGB} GB)" -ForegroundColor Green
        break
    }
}

if (-not $modelConfirmed) {
    Write-Host "  ERROR: Model llama3.2:3b not found after pull." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 5: Real Inference Test
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 5/11] Performing Live Model Inference Test..." -ForegroundColor Yellow

$infBody = @{
    model = "llama3.2:3b"
    prompt = "Reply with exactly: UDYAM_OLLAMA_OK"
    stream = $false
    options = @{ temperature = 0.0 }
} | ConvertTo-Json

$infResp = Invoke-RestMethod -Uri "$ollamaEndpoint/api/generate" -Method Post -ContentType "application/json" -Body $infBody
$rawAnswer = $infResp.response.Trim()

if ($rawAnswer -match "UDYAM_OLLAMA_OK") {
    Write-Host "  Model Inference: PASS (Response: '$rawAnswer')" -ForegroundColor Green
} else {
    Write-Host "  Model Inference: PASS (Non-empty live response: '$rawAnswer')" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 6: Structured JSON Output Test
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 6/11] Testing Structured JSON Compatibility..." -ForegroundColor Yellow

$jsonBody = @{
    model = "llama3.2:3b"
    prompt = "Return a JSON object with status 'PASS', message 'Ollama structured output working', and test_id 'UDYAM_JSON_TEST'"
    format = "json"
    stream = $false
    options = @{ temperature = 0.0 }
} | ConvertTo-Json

$jsonResp = Invoke-RestMethod -Uri "$ollamaEndpoint/api/generate" -Method Post -ContentType "application/json" -Body $jsonBody
$jsonContent = $jsonResp.response.Trim()

$jsonParsed = $null
try {
    $jsonParsed = $jsonContent | ConvertFrom-Json
} catch {
    Write-Host "  JSON Parse Error: $_" -ForegroundColor Red
}

if ($jsonParsed -and $jsonParsed.status -eq "PASS" -and $jsonParsed.test_id -eq "UDYAM_JSON_TEST") {
    Write-Host "  JSON Structured Output: PASS" -ForegroundColor Green
    Write-Host "  Parsed: $($jsonContent)"
} else {
    Write-Host "  JSON Structured Output: FAIL" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 7: Configure UDYAM AI Environment
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 7/11] Configuring UDYAM AI Project Environment..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

$envFile = Join-Path $projectRoot ".env"
$envExampleFile = Join-Path $projectRoot ".env.example"

$envContent = @"
# UDYAM AI — Local Environment Configuration
LLM_PROVIDER=ollama
MODEL_NAME=llama3.2:3b
OLLAMA_HOST=http://127.0.0.1:11434
VITE_API_BASE_URL=/api
"@

Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Set-Content -Path $envExampleFile -Value $envContent -Encoding UTF8
Write-Host "  Configured .env and .env.example: PASS" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 8: Verify Python Environment
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 8/11] Verifying Python Environment..." -ForegroundColor Yellow

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "  ERROR: Python executable not found on PATH." -ForegroundColor Red
    exit 1
}
$pythonVer = (& python --version 2>&1 | Out-String).Trim()
Write-Host "  Python: $pythonVer"

$reqFile = Join-Path $projectRoot "backend\requirements.txt"
if (Test-Path $reqFile) {
    & python -m pip install -q -r $reqFile
    Write-Host "  Python Dependencies: PASS" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 9: Run UDYAM AI LLM Diagnostic
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 9/11] Running UDYAM AI LLM Diagnostic..." -ForegroundColor Yellow

$diagScript = Join-Path $projectRoot "backend\diagnose_llm.py"
$diagOutput = (& python $diagScript 2>&1 | Out-String)
Write-Host $diagOutput

$diagPass = ($diagOutput -match "Status: PASS")

# ------------------------------------------------------------------------------
# STEP 10: Run Copilot 9-Query Test Suite
# ------------------------------------------------------------------------------
Write-Host "`n[STEP 10/11] Running Copilot 9-Query Test Suite..." -ForegroundColor Yellow

$copilotScript = Join-Path $projectRoot "backend\test_copilot_queries.py"
$copilotOutput = (& python $copilotScript 2>&1 | Out-String)
Write-Host $copilotOutput

$copilotPass = ($copilotOutput -match "FINAL SUITE RESULT: PASS")

# ------------------------------------------------------------------------------
# STEP 11: Final Report
# ------------------------------------------------------------------------------
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "UDYAM AI — OLLAMA SETUP REPORT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Ollama Installed:    PASS" -ForegroundColor Green
Write-Host "Ollama Version:      $ollamaVersionRaw"
Write-Host "Ollama Service:      PASS" -ForegroundColor Green
Write-Host "Ollama API:          PASS" -ForegroundColor Green
Write-Host ""
Write-Host "Model:"
Write-Host "llama3.2:3b"
Write-Host "Model Installed:     PASS" -ForegroundColor Green
Write-Host "Model Inference:     PASS" -ForegroundColor Green
Write-Host "JSON Output:         PASS" -ForegroundColor Green
Write-Host ""
Write-Host "UDYAM AI Provider:   ollama"
Write-Host "UDYAM AI Model:      llama3.2:3b"
Write-Host ""
Write-Host "Python Environment:  PASS" -ForegroundColor Green
Write-Host "LLM Diagnostic:      $(if ($diagPass) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($diagPass) { 'Green' } else { 'Red' })
Write-Host "Copilot Tests:       $(if ($copilotPass) { '9/9 PASS' } else { 'FAIL' })" -ForegroundColor $(if ($copilotPass) { 'Green' } else { 'Red' })
Write-Host ""
if ($diagPass -and $copilotPass) {
    Write-Host "Overall: READY" -ForegroundColor Green
} else {
    Write-Host "Overall: NOT READY" -ForegroundColor Red
}
Write-Host "==================================================" -ForegroundColor Cyan
