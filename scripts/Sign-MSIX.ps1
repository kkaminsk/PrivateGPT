<#
.SYNOPSIS
    Signs the built MSIX package using Azure Trusted Signing.

.DESCRIPTION
    This script invokes the CodeSigning solution to sign MSIX packages produced
    by electron-builder. It locates the MSIX in the dist/ directory and calls
    Invoke-CodeSigning.ps1 from the CodeSigning solution.

.PARAMETER MetadataPath
    Path to the Azure Trusted Signing metadata.json file.
    Can also be set via CODESIGNING_METADATA environment variable.

.PARAMETER CodeSigningPath
    Path to the CodeSigning solution directory.
    Defaults to ../CodeSigning relative to the project root.
    Can also be set via CODESIGNING_PATH environment variable.

.EXAMPLE
    .\Sign-MSIX.ps1 -MetadataPath "C:\signing\metadata-prod.json"

.EXAMPLE
    $env:CODESIGNING_METADATA = "C:\signing\metadata.json"
    .\Sign-MSIX.ps1
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$MetadataPath,

    [Parameter()]
    [string]$CodeSigningPath
)

$ErrorActionPreference = 'Stop'

# Resolve project root (parent of scripts directory)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $ProjectRoot 'dist'

Write-Host "PrivateGPT MSIX Signing" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Resolve CodeSigning path
if (-not $CodeSigningPath) {
    $CodeSigningPath = $env:CODESIGNING_PATH
}
if (-not $CodeSigningPath) {
    # Default to sibling directory
    $CodeSigningPath = Join-Path (Split-Path -Parent $ProjectRoot) 'CodeSigning'
}

# Resolve metadata path
if (-not $MetadataPath) {
    $MetadataPath = $env:CODESIGNING_METADATA
}

# Validate CodeSigning solution exists
$InvokeScript = Join-Path $CodeSigningPath 'scripts\Invoke-CodeSigning.ps1'
if (-not (Test-Path $InvokeScript)) {
    Write-Error "CodeSigning solution not found at: $CodeSigningPath`nExpected script: $InvokeScript`n`nSet CODESIGNING_PATH environment variable or use -CodeSigningPath parameter."
    exit 1
}

Write-Host "CodeSigning path: $CodeSigningPath" -ForegroundColor Gray

# Validate metadata file
if (-not $MetadataPath) {
    Write-Error "Metadata path not specified.`n`nProvide -MetadataPath parameter or set CODESIGNING_METADATA environment variable."
    exit 1
}

if (-not (Test-Path $MetadataPath)) {
    Write-Error "Metadata file not found: $MetadataPath`n`nCreate metadata using: $CodeSigningPath\scripts\New-SigningMetadata.ps1"
    exit 1
}

Write-Host "Metadata file: $MetadataPath" -ForegroundColor Gray

# Find MSIX file in dist directory
if (-not (Test-Path $DistDir)) {
    Write-Error "Distribution directory not found: $DistDir`n`nRun 'npm run build:win:msix' first."
    exit 1
}

# Look for .msix first (modern), then .appx (legacy)
$MsixFiles = Get-ChildItem -Path $DistDir -Filter '*.msix' -File
if ($MsixFiles.Count -eq 0) {
    $MsixFiles = Get-ChildItem -Path $DistDir -Filter '*.appx' -File
}

if ($MsixFiles.Count -eq 0) {
    Write-Error "No MSIX/APPX files found in: $DistDir`n`nRun 'npm run build:win:msix' first."
    exit 1
}

if ($MsixFiles.Count -gt 1) {
    Write-Warning "Multiple MSIX files found. Signing first one: $($MsixFiles[0].Name)"
}

$MsixPath = $MsixFiles[0].FullName
Write-Host "MSIX file: $MsixPath" -ForegroundColor Green

# Invoke CodeSigning
Write-Host "`nInvoking code signing..." -ForegroundColor Cyan

try {
    & $InvokeScript -FilePath $MsixPath -MetadataPath $MetadataPath -StopOnError:$true -VerifyAfterSign 'Fail'

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Signing failed with exit code: $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    Write-Host "`nSigning completed successfully!" -ForegroundColor Green

    # Verify signature
    $Signature = Get-AuthenticodeSignature -FilePath $MsixPath
    Write-Host "`nSignature Details:" -ForegroundColor Cyan
    Write-Host "  Status: $($Signature.Status)" -ForegroundColor $(if ($Signature.Status -eq 'Valid') { 'Green' } else { 'Yellow' })
    Write-Host "  Signer: $($Signature.SignerCertificate.Subject)" -ForegroundColor Gray
    Write-Host "  Thumbprint: $($Signature.SignerCertificate.Thumbprint)" -ForegroundColor Gray

} catch {
    Write-Error "Signing failed: $_"
    exit 1
}
