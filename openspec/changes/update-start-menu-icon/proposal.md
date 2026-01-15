# Change: Update Start Menu Icon to Use Custom ICO File

## Why
The project has a custom icon file at `dist/.icon-ico/icon.ico` that should be used for the Windows application icon, which appears in the Start Menu, taskbar, and window title bar.

## What Changes
- Update `electron-builder.cjs` to use `dist/.icon-ico/icon.ico` for the Windows executable icon
- The `win.icon` property will reference the ICO file instead of the PNG

## Impact
- Affected specs: `packaging`
- Affected code: `electron-builder.cjs`
- The Windows application will display the custom ICO icon in the Start Menu and taskbar
