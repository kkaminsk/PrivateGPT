# Change: Add MSIX Code Signing with Azure Trusted Signing

## Why
The current MSIX build produces unsigned packages that trigger Windows SmartScreen warnings and cannot be distributed via Windows Store or enterprise deployment without trust issues. The CodeSigning solution at `C:\Temp\tsscat\CodeSigning` provides a complete Azure Trusted Signing integration that can sign MSIX packages.

## What Changes
- Add npm script to build and sign MSIX in one step
- Create PowerShell wrapper script to invoke CodeSigning after electron-builder completes
- Update `package.json` publisher field to support configurable certificate subject
- Add documentation for Azure Trusted Signing setup and authentication

## Impact
- Affected specs: None existing (new capability)
- Affected code:
  - `package.json` - new build scripts, updated publisher config
  - New `scripts/Sign-MSIX.ps1` - signing wrapper script
  - `README.md` - signing documentation

## Design Notes
The integration uses a post-build signing approach:
1. `npm run build:win:msix` produces unsigned MSIX (unchanged)
2. New `npm run build:win:msix:signed` builds then invokes signing
3. Signing uses existing CodeSigning solution (`Invoke-CodeSigning.ps1`)

This keeps the unsigned development build fast and simple while adding an opt-in signed build for production.
