---
name: Sign MSIX
description: Sign the MSIX package with Azure Trusted Signing
category: Build
tags: [msix, signing, build, windows]
---

# Sign MSIX Package

Sign the built MSIX package using Azure Trusted Signing.

## Prerequisites
- MSIX package built in `dist/` directory (run `npm run build:win:msix` first if needed)
- Azure authentication active (`Connect-AzAccount`)
- CodeSigning solution available at `../CodeSigning`

## Steps

1. **Check for MSIX file** - Verify a `.msix` or `.appx` file exists in `dist/`
2. **Sign the package** - Run the signing script:
   ```powershell
   pwsh -Command "& './scripts/Sign-MSIX.ps1' -MetadataPath 'C:\Temp\tsscat\CodeSigning\metadata-privategpt.json'"
   ```
3. **Verify signature** - Confirm the signature is valid and report the signer details

## Troubleshooting

If signing fails:
- **403 Forbidden**: Run `Connect-AzAccount` to authenticate
- **Publisher mismatch**: Ensure `package.json` appx.publisher matches the certificate subject
- **Missing dlib**: Run `../CodeSigning/scripts/Install-SigningTools.ps1`

## Environment Variables (optional)
- `CODESIGNING_METADATA`: Path to metadata.json (alternative to -MetadataPath)
- `CODESIGNING_PATH`: Path to CodeSigning solution (default: `../CodeSigning`)
