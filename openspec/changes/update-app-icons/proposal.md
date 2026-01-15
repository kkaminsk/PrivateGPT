# Change: Update All Application Icons from Custom ICO

## Why
The project has a new custom icon at `dist/.icon-ico/icon.ico` that should be used consistently across all platforms. Currently only the Windows build uses this icon; the PNG files in `icon/` still contain the old graphics.

## What Changes
- Extract PNG images from `dist/.icon-ico/icon.ico` at required sizes (44, 50, 150, 256, 310, 512px)
- Replace all PNG files in `icon/` directory with the new graphics
- Ensures consistent branding across Windows, macOS, and Linux builds

## Impact
- Affected specs: `packaging`
- Affected files:
  - `icon/icon.png` - Base icon
  - `icon/icon44.png` - 44px tile
  - `icon/icon50.png` - 50px tile
  - `icon/icon150.png` - 150px tile
  - `icon/icon256.png` - 256px (used by main.js BrowserWindow)
  - `icon/icon310.png` - 310px tile
  - `icon/icon512.png` - 512px (used by electron-builder)
- No code changes required - file references remain the same
