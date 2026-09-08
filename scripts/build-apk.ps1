# Waghamba Sports Health Hub - Automated APK Build Script
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Building Waghamba Sports Hub Android APK... " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Configure Java & Android Environment from Android Studio installation
$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "C:\Users\Lenovo\AppData\Local\Android\Sdk"

if (-not (Test-Path $javaHome)) {
    Write-Error "Java JDK not found at $javaHome. Please ensure Android Studio is installed."
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"
$env:ANDROID_HOME = $androidHome

Write-Host "Using Java: $env:JAVA_HOME" -ForegroundColor Green
Write-Host "Using Android SDK: $env:ANDROID_HOME" -ForegroundColor Green

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"

# Step 1: Run Gradle to build debug APK
Write-Host "`nRunning Gradle assembleDebug..." -ForegroundColor Yellow
Set-Location $androidDir

& .\gradlew.bat assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed with exit code $LASTEXITCODE"
}

# Step 2: Copy output APK to project root and public folder
$builtApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
$rootApk = Join-Path $projectRoot "Waghamba-Sports-Hub.apk"
$publicApk = Join-Path $projectRoot "public\app-debug.apk"

if (Test-Path $builtApk) {
    Copy-Item -Path $builtApk -Destination $rootApk -Force
    Copy-Item -Path $builtApk -Destination $publicApk -Force
    $sizeMb = [math]::Round((Get-Item $rootApk).Length / 1MB, 2)

    Write-Host "`n==============================================" -ForegroundColor Green
    Write-Host " APK BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host " Output File: $rootApk ($sizeMb MB)" -ForegroundColor Green
    Write-Host " Web Download: $publicApk" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
} else {
    Write-Error "Built APK not found at $builtApk"
}
