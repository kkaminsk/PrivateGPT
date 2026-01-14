# Tasks: Add MSIX Code Signing

## 1. Signing Script
- [x] 1.1 Create `scripts/Sign-MSIX.ps1` wrapper script
- [x] 1.2 Accept parameters: `-MetadataPath` (required), `-CodeSigningPath` (defaults to sibling directory)
- [x] 1.3 Locate built MSIX file in `dist/` directory
- [x] 1.4 Invoke `Invoke-CodeSigning.ps1` from CodeSigning solution
- [x] 1.5 Report signing result (success/failure with details)

## 2. Build Script Integration
- [x] 2.1 Add `build:win:msix:signed` npm script to package.json
- [x] 2.2 Script should run electron-builder then invoke Sign-MSIX.ps1
- [x] 2.3 Support `CODESIGNING_METADATA` environment variable for metadata path

## 3. Publisher Configuration
- [x] 3.1 Document that `appx.publisher` must match Azure Trusted Signing certificate subject
- [x] 3.2 Add example publisher values in README for common certificate formats

## 4. Documentation
- [x] 4.1 Add "Code Signing Setup" section to README.md
- [x] 4.2 Document prerequisites (CodeSigning solution, Azure Trusted Signing account)
- [x] 4.3 Document `metadata.json` creation using `New-SigningMetadata.ps1`
- [x] 4.4 Document authentication flow (`Connect-AzAccount` before signing)
- [x] 4.5 Add troubleshooting section for common signing errors

## 5. Testing
- [ ] 5.1 Test unsigned build still works (`npm run build:win:msix`)
- [ ] 5.2 Test signed build with valid metadata and authentication
- [ ] 5.3 Verify signed MSIX installs without SmartScreen warning
- [ ] 5.4 Test error handling when CodeSigning path not found
- [ ] 5.5 Test error handling when metadata file missing
