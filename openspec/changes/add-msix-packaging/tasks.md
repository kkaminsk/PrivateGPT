# Tasks: Add MSIX Packaging

## 1. Build Configuration
- [ ] 1.1 Update `package.json` build section to use `appx` target for Windows
- [ ] 1.2 Add MSIX-specific configuration (publisher, identity name, application ID)
- [ ] 1.3 Add build script for unsigned development builds
- [ ] 1.4 Document code signing requirements for production builds

## 2. Enhanced Foundry Detection
- [ ] 2.1 Create `foundry-check.js` module with comprehensive detection logic
- [ ] 2.2 Add check for Foundry Local installation (not just running state)
- [ ] 2.3 Implement retry mechanism after user installs Foundry

## 3. Improved Error UI
- [ ] 3.1 Create modal dialog component for Foundry missing state
- [ ] 3.2 Add Foundry Local GitHub releases link (https://github.com/microsoft/Foundry-Local/releases)
- [ ] 3.3 Add copyable PowerShell install command
- [ ] 3.4 Add "Retry" button to re-check Foundry status
- [ ] 3.5 Style modal to match existing PrivateGPT theme

## 4. Enterprise Bootstrapper
- [ ] 4.1 Create `Install-PrivateGPT.ps1` bootstrapper script
- [ ] 4.2 Implement Foundry Local detection and installation
- [ ] 4.3 Implement PrivateGPT MSIX installation
- [ ] 4.4 Add `-Silent` parameter for unattended deployment
- [ ] 4.5 Add `-FoundryPath` parameter for offline Foundry installation

## 5. Documentation
- [ ] 5.1 Update README.md with MSIX installation instructions
- [ ] 5.2 Document enterprise deployment with bootstrapper
- [ ] 5.3 Add troubleshooting section for Foundry detection issues

## 6. Validation
- [ ] 6.1 Test MSIX build on Windows 10 (1809+)
- [ ] 6.2 Test MSIX build on Windows 11
- [ ] 6.3 Test Foundry missing scenario and UI flow
- [ ] 6.4 Test bootstrapper in silent mode
- [ ] 6.5 Test clean uninstall leaves no residual data
