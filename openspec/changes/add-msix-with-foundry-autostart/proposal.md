# Change: Add MSIX Packaging with Foundry Local Auto-Start

## Why
Users need a streamlined installation and launch experience for PrivateGPT. MSIX packaging provides modern Windows app distribution with automatic updates, clean uninstall, and Microsoft Store compatibility. Additionally, the app should automatically start the Foundry Local service when installed but not running, eliminating manual service management. When Foundry is not installed, the app must provide actionable guidance.

## What Changes
- Configure electron-builder to produce MSIX (AppX) packages instead of NSIS installers
- Add automatic Foundry Local service startup using `foundryManager.startService()` when installed but not running
- Implement three-state detection: Not Installed → Installed but Stopped (auto-start) → Running
- Show loading indicator during service startup ("Starting Foundry Local...")
- Display actionable error dialog with download link only when Foundry is not installed
- Create optional bootstrapper script (outside MSIX) for enterprise deployments

## Impact
- Affected specs: New `packaging` and `foundry-lifecycle` capabilities
- Affected code: `package.json` (build config), `main.js` (startup logic), `chat.html` (loading states, error UI)
- **BREAKING**: Windows installer format changes from NSIS (.exe) to MSIX
- Dependencies: electron-builder AppX target, Windows 10 1809+ required for MSIX
