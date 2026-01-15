# Change: Update to Modern MSIX Standards

## Why
The current MSIX package uses outdated Windows version targeting (MinVersion 10.0.14316.0 from 2016) and produces `.appx` files instead of the modern `.msix` extension. Updating to current standards ensures compatibility declarations match actual requirements and follows Microsoft's recommended practices.

## What Changes
- Update MinVersion to 10.0.17763.0 (Windows 10 1809 - actual minimum requirement)
- Update MaxVersionTested to 10.0.22621.0 (Windows 11 22H2)
- Configure electron-builder to produce `.msix` file extension
- Update build scripts and documentation to reflect `.msix` naming

## Impact
- Affected specs: packaging (if exists)
- Affected code:
  - `package.json` - electron-builder appx configuration
  - `scripts/Sign-MSIX.ps1` - file extension handling (already supports both)
  - `README.md` - documentation updates
