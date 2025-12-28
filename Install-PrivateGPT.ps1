<#
.SYNOPSIS
    Enterprise bootstrapper for PrivateGPT installation.

.DESCRIPTION
    This script handles the complete installation of PrivateGPT including:
    - Detecting and installing Foundry Local if not present
    - Installing the PrivateGPT MSIX package
    - Supporting silent/unattended deployment for SCCM/Intune

.PARAMETER Silent
    Run in silent mode without user prompts. Suitable for automated deployments.

.PARAMETER FoundryPath
    Path to local Foundry Local MSIX file. Use for offline/air-gapped deployments.

.PARAMETER PrivateGPTPath
    Path to PrivateGPT MSIX file. Defaults to PrivateGPT.msix in current directory.

.PARAMETER SkipFoundryCheck
    Skip Foundry Local installation check. Use if Foundry is deployed separately.

.EXAMPLE
    .\Install-PrivateGPT.ps1
    Interactive installation with prompts.

.EXAMPLE
    .\Install-PrivateGPT.ps1 -Silent
    Silent installation for automated deployment.

.EXAMPLE
    .\Install-PrivateGPT.ps1 -Silent -FoundryPath "C:\Packages\foundry-local.msix"
    Silent installation with offline Foundry Local package.

.NOTES
    Requires Windows 10 version 1809 or later.
    May require administrator privileges for MSIX installation.
#>

[CmdletBinding()]
param(
    [switch]$Silent,
    [string]$FoundryPath,
    [string]$PrivateGPTPath = ".\PrivateGPT.msix",
    [switch]$SkipFoundryCheck
)

$ErrorActionPreference = "Stop"

# Configuration
$FoundryReleasesUrl = "https://github.com/microsoft/Foundry-Local/releases"
$FoundryPackageName = "Microsoft.FoundryLocal"
$PrivateGPTPackageName = "PrivateGPT"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    if (-not $Silent) {
        switch ($Level) {
            "ERROR" { Write-Host $logMessage -ForegroundColor Red }
            "WARN"  { Write-Host $logMessage -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
            default { Write-Host $logMessage }
        }
    }

    # Also write to log file
    $logFile = Join-Path $env:TEMP "PrivateGPT-Install.log"
    Add-Content -Path $logFile -Value $logMessage
}

function Test-FoundryInstalled {
    try {
        $package = Get-AppxPackage -Name "*FoundryLocal*" -ErrorAction SilentlyContinue
        return $null -ne $package
    }
    catch {
        return $false
    }
}

function Test-PrivateGPTInstalled {
    try {
        $package = Get-AppxPackage -Name "*PrivateGPT*" -ErrorAction SilentlyContinue
        return $null -ne $package
    }
    catch {
        return $false
    }
}

function Install-FoundryLocal {
    param([string]$PackagePath)

    Write-Log "Installing Foundry Local..."

    if ([string]::IsNullOrEmpty($PackagePath)) {
        if (-not $Silent) {
            Write-Log "Foundry Local package path not provided." "WARN"
            Write-Log "Please download from: $FoundryReleasesUrl"

            $response = Read-Host "Enter path to Foundry Local MSIX (or press Enter to open download page)"
            if ([string]::IsNullOrEmpty($response)) {
                Start-Process $FoundryReleasesUrl
                Write-Log "Please download and run this script again with -FoundryPath parameter." "WARN"
                return $false
            }
            $PackagePath = $response
        }
        else {
            Write-Log "Foundry Local not installed and no package path provided. Use -FoundryPath parameter." "ERROR"
            return $false
        }
    }

    if (-not (Test-Path $PackagePath)) {
        Write-Log "Foundry Local package not found at: $PackagePath" "ERROR"
        return $false
    }

    try {
        Add-AppxPackage -Path $PackagePath
        Write-Log "Foundry Local installed successfully." "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Failed to install Foundry Local: $_" "ERROR"
        return $false
    }
}

function Install-PrivateGPT {
    param([string]$PackagePath)

    Write-Log "Installing PrivateGPT..."

    if (-not (Test-Path $PackagePath)) {
        Write-Log "PrivateGPT package not found at: $PackagePath" "ERROR"
        return $false
    }

    try {
        Add-AppxPackage -Path $PackagePath
        Write-Log "PrivateGPT installed successfully." "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Failed to install PrivateGPT: $_" "ERROR"
        return $false
    }
}

# Main installation flow
Write-Log "========================================="
Write-Log "PrivateGPT Enterprise Installer"
Write-Log "========================================="

# Check Windows version
$osVersion = [System.Environment]::OSVersion.Version
if ($osVersion.Build -lt 17763) {
    Write-Log "Windows 10 version 1809 or later is required." "ERROR"
    exit 1
}

Write-Log "Windows version: $($osVersion.ToString())"

# Check/Install Foundry Local
if (-not $SkipFoundryCheck) {
    if (Test-FoundryInstalled) {
        Write-Log "Foundry Local is already installed." "SUCCESS"
    }
    else {
        Write-Log "Foundry Local is not installed."
        $installed = Install-FoundryLocal -PackagePath $FoundryPath
        if (-not $installed) {
            Write-Log "Foundry Local installation failed or was cancelled." "ERROR"
            exit 1
        }
    }
}
else {
    Write-Log "Skipping Foundry Local check as requested."
}

# Check/Install PrivateGPT
if (Test-PrivateGPTInstalled) {
    Write-Log "PrivateGPT is already installed."

    if (-not $Silent) {
        $response = Read-Host "Do you want to reinstall? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Log "Installation cancelled by user."
            exit 0
        }
    }

    # Remove existing installation
    Write-Log "Removing existing PrivateGPT installation..."
    Get-AppxPackage -Name "*PrivateGPT*" | Remove-AppxPackage
}

$installed = Install-PrivateGPT -PackagePath $PrivateGPTPath
if (-not $installed) {
    Write-Log "PrivateGPT installation failed." "ERROR"
    exit 1
}

Write-Log "========================================="
Write-Log "Installation completed successfully!" "SUCCESS"
Write-Log "========================================="

if (-not $Silent) {
    Write-Log ""
    Write-Log "You can now launch PrivateGPT from the Start menu."
    Write-Log ""
    Read-Host "Press Enter to exit"
}

exit 0
