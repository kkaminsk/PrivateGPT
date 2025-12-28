# Tasks: MSIX Packaging with Foundry Auto-Start

## 1. Build Configuration
- [x] 1.1 Update `package.json` build section to use `appx` target for Windows
- [x] 1.2 Add MSIX-specific configuration (publisher, identity name, application ID)
- [x] 1.3 Add build script for unsigned development builds
- [x] 1.4 Document code signing requirements for production builds

## 2. Foundry Auto-Start Logic
- [x] 2.1 Add `ensureFoundryRunning()` function in `main.js`
- [x] 2.2 Call `isServiceRunning()` on app ready
- [x] 2.3 If not running, call `startService()` and wait for initialization
- [x] 2.4 Implement retry logic (3 attempts, 1-second intervals, 10-second timeout)
- [x] 2.5 Send IPC events for startup states: `foundry-starting`, `foundry-ready`, `foundry-failed`

## 3. UI Feedback
- [x] 3.1 Add loading overlay component to `chat.html`
- [x] 3.2 Show "Starting Foundry Local..." during startup
- [x] 3.3 Transition to normal UI on `foundry-ready`
- [x] 3.4 Create modal dialog for Foundry not installed state
- [x] 3.5 Add Foundry Local GitHub releases link (https://github.com/microsoft/Foundry-Local/releases)
- [x] 3.6 Add copyable PowerShell install command
- [x] 3.7 Add "Retry" button to re-attempt startup
- [x] 3.8 Style components to match existing PrivateGPT theme

## 4. Enterprise Bootstrapper
- [x] 4.1 Create `Install-PrivateGPT.ps1` bootstrapper script
- [x] 4.2 Implement Foundry Local detection and installation
- [x] 4.3 Implement PrivateGPT MSIX installation
- [x] 4.4 Add `-Silent` parameter for unattended deployment
- [x] 4.5 Add `-FoundryPath` parameter for offline Foundry installation

## 5. Documentation
- [x] 5.1 Update README.md with MSIX installation instructions
- [x] 5.2 Document enterprise deployment with bootstrapper
- [x] 5.3 Add troubleshooting section for Foundry startup issues

## 6. Validation
- [ ] 6.1 Test MSIX build on Windows 10 (1809+)
- [ ] 6.2 Test MSIX build on Windows 11
- [ ] 6.3 Test with Foundry installed and running (no change in behavior)
- [ ] 6.4 Test with Foundry installed but stopped (should auto-start)
- [ ] 6.5 Test with Foundry not installed (should show install dialog)
- [ ] 6.6 Test startup timeout scenario
- [ ] 6.7 Test bootstrapper in silent mode
- [ ] 6.8 Test clean uninstall leaves no residual data
