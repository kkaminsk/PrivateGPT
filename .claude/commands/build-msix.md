---
name: Build MSIX
description: Build the Windows MSIX package
category: Build
tags: [msix, build, windows, packaging]
---

# Build MSIX Package

Build the Windows MSIX package for PrivateGPT.

## Steps

1. **Build the package** - Run the build command:
   ```bash
   npm run build:win:msix
   ```
2. **Report results** - Show the output file location and size
3. **Offer to sign** - Ask if the user wants to sign the package with `/sign-msix`

## Output

The MSIX package will be created at:
- `dist/PrivateGPT-{version}.msix`

## Notes

- The package will be unsigned by default (Windows Store only build)
- Use `/sign-msix` after building to sign with Azure Trusted Signing
- Build requires electron-builder (installed via npm install)
