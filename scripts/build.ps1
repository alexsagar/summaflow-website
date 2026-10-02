<#
    build.ps1 — reproducible package build for the website_summaflow module.

    This repository builds exactly ONE deployable module: website_summaflow.
    There is no -Module parameter; nothing else can be packaged by accident.

    Flow:
      1. validate source prerequisites
      2. stage a clean copy (exclude junk + dev-only dirs)
      3. build into a TEMP zip
      4. swap it into release/ (previous artifact backed up first)
      5. validate the newly generated artifact
      6. keep the new zip only if validation passes; otherwise restore the old one

    Output: release\website_summaflow.zip   (git-ignored)

    Usage (from repo root):
        powershell -ExecutionPolicy Bypass -File scripts\build.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$Module  = 'website_summaflow'
$root    = Split-Path -Parent $PSScriptRoot
$modDir  = Join-Path $root $Module
$relDir  = Join-Path $root 'release'
$zipPath = Join-Path $relDir "$Module.zip"
$bakPath = "$zipPath.bak"
$validate = Join-Path $PSScriptRoot 'validate.ps1'

if (-not (Test-Path $modDir)) { throw "Module directory not found: $modDir" }

# 1. Validate source prerequisites first (does not touch the existing artifact).
Write-Host "Validating source prerequisites...`n" -ForegroundColor Cyan
& $validate
if ($LASTEXITCODE -ne 0) { throw "Source validation failed; build aborted (existing artifact untouched)." }

# 2. Stage a clean copy. Exclude junk and dev-only directories that must never
#    ship even if they somehow appear inside the module.
$stage    = Join-Path ([System.IO.Path]::GetTempPath()) ("sf_build_" + [guid]::NewGuid().ToString('N'))
$stageMod = Join-Path $stage $Module
New-Item -ItemType Directory -Path $stageMod -Force | Out-Null

$excludeDirs  = @('.git', '.agents', '.claude', 'docs', 'node_modules', '__pycache__', '.idea', '.vscode', 'release', 'dist', 'build')
$excludeFiles = @('*.pyc', '*.pyo', '.DS_Store', 'Thumbs.db', '*.log', '.env', '.env.*', '.gitkeep')

Get-ChildItem $modDir -Recurse -Force | Where-Object {
    $rel   = $_.FullName.Substring($modDir.Length + 1)
    $parts = $rel -split '[\\/]'
    -not ($parts | Where-Object { $excludeDirs -contains $_ })
} | ForEach-Object {
    $rel  = $_.FullName.Substring($modDir.Length + 1)
    $dest = Join-Path $stageMod $rel
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    } else {
        $skip = $false
        foreach ($pat in $excludeFiles) { if ($_.Name -like $pat) { $skip = $true; break } }
        if (-not $skip) {
            New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
            Copy-Item $_.FullName -Destination $dest -Force
        }
    }
}

# 3. Build into a TEMP zip (forward-slash entries; NOT Compress-Archive, which
#    writes backslash separators on Windows PowerShell 5.1 and breaks Odoo import).
New-Item -ItemType Directory -Path $relDir -Force | Out-Null
$tmpZip = Join-Path $stage "$Module.zip"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($tmpZip, 'Create')
try {
    Get-ChildItem $stageMod -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($stage.Length + 1) -replace '\\', '/'
        [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel)
    }
} finally { $zip.Dispose() }

# 4. Swap into release/, backing up any previous good artifact first.
if (Test-Path $bakPath) { Remove-Item $bakPath -Force }
if (Test-Path $zipPath) { Move-Item $zipPath $bakPath -Force }
Move-Item $tmpZip $zipPath -Force
Remove-Item $stage -Recurse -Force

# 5. Validate the newly generated artifact.
Write-Host "`nValidating generated artifact...`n" -ForegroundColor Cyan
& $validate
$ok = ($LASTEXITCODE -eq 0)

# 6. Keep new zip only on success; otherwise restore the previous artifact.
if ($ok) {
    if (Test-Path $bakPath) { Remove-Item $bakPath -Force }
    Write-Host "`nBuilt and validated: $zipPath" -ForegroundColor Green
    exit 0
} else {
    Remove-Item $zipPath -Force
    if (Test-Path $bakPath) {
        Move-Item $bakPath $zipPath -Force
        Write-Host "`nArtifact validation FAILED. Previous artifact restored: $zipPath" -ForegroundColor Red
    } else {
        Write-Host "`nArtifact validation FAILED. No previous artifact to restore; release/ left empty." -ForegroundColor Red
    }
    exit 1
}
