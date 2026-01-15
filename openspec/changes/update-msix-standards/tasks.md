# Tasks: Update to Modern MSIX Standards

## 1. Package Configuration
- [x] 1.1 Add `artifactName` to appx config to produce `.msix` extension
- [x] 1.2 Add appxManifestCreated hook to update MinVersion (10.0.17763.0)
- [x] 1.3 Update MaxVersionTested to 10.0.22621.0 (Windows 11 22H2)

## 2. Build Scripts
- [x] 2.1 Build scripts unchanged (npm run build:win:msix still works)
- [x] 2.2 Updated Sign-MSIX.ps1 to prioritize .msix extension

## 3. Documentation
- [x] 3.1 Update README.md references from .appx to .msix
- [x] 3.2 Installation instructions already use .msix

## 4. Testing
- [x] 4.1 Build unsigned MSIX and verify .msix extension (PrivateGPT-0.5.0-alpha.msix)
- [ ] 4.2 Build signed MSIX and verify signature
- [ ] 4.3 Test installation on Windows 10 1809+
- [ ] 4.4 Test installation on Windows 11
