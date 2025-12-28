# Change: Add MSIX Packaging with Foundry Local Dependency Guidance

## Why
Users need a streamlined installation experience for PrivateGPT. MSIX packaging provides modern Windows app distribution with automatic updates, clean uninstall, and Microsoft Store compatibility. However, Foundry Local is a required runtime dependency that cannot be declared as a true MSIX dependency (different publisher certificates). The app must gracefully handle missing Foundry Local and guide users to install it.

## What Changes
- Configure electron-builder to produce MSIX (AppX) packages instead of NSIS installers
- Enhance the Foundry Local detection to provide actionable guidance when not installed
- Add a user-friendly dialog with download link to Foundry Local releases
- Create optional bootstrapper script (outside MSIX) for enterprise deployments that need automated Foundry installation

## Impact
- Affected specs: New `packaging` capability
- Affected code: `package.json` (build config), `main.js` (enhanced detection), `chat.html` (improved error UI)
- **BREAKING**: Windows installer format changes from NSIS (.exe) to MSIX
- Dependencies: electron-builder AppX target, Windows 10 1809+ required for MSIX
