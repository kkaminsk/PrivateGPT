# PrivateGPT

A privacy-focused chat application with ephemeral data storage and local AI models. All conversations are encrypted in memory and completely erased when you close the app.

## Privacy Guarantees

- **AES-256-GCM Encryption**: All user data (messages, file contents) encrypted in memory
- **Ephemeral Storage**: No data ever written to disk
- **Startup Purge**: Detects and removes any residual data on launch
- **Shutdown Purge**: Securely clears all memory on exit
- **Local Models Only**: No cloud connectivity - all processing on-device

## Features

- Chat with local AI models via Foundry Local SDK
- File attachments with drag-and-drop support
- Vision API integration for image analysis (with compatible models)
- Modern, privacy-themed UI

## Supported File Types

### Text Files (max 100KB)
- Markdown: `.md`
- Plain text: `.txt`
- JSON: `.json`
- XML: `.xml`
- YAML: `.yaml`, `.yml`
- CSV: `.csv`

### Image Files (max 10MB)
- JPEG: `.jpg`, `.jpeg`
- PNG: `.png`
- GIF: `.gif`
- WebP: `.webp`

## Prerequisites

- Node.js v18 or higher
  ```powershell
  winget install OpenJS.NodeJS
  ```
- Foundry Local installed and running
  - Download from [Foundry Releases](https://github.com/microsoft/Foundry-Local/releases)
  - Install: `add-appxpackage <foundry>.msix`

## Setup

1. Install dependencies:
   ```powershell
   npm install
   ```

2. Ensure Foundry Local service is running

3. Start the application:
   ```powershell
   npm start
   ```

## Usage

1. Select a local model from the dropdown
2. Type a message or attach files:
   - Click the paperclip button to open file picker
   - Drag and drop files onto the chat window
3. Send your message - attachments are included in context
4. For images, use a vision-capable model (e.g., LLaVA) for analysis

## Installation

### MSIX Package (Recommended for Windows)

PrivateGPT is distributed as an MSIX package for modern Windows deployment.

**Requirements:**
- Windows 10 version 1809 or later
- Foundry Local installed

**Standard Installation:**
1. Download `PrivateGPT.msix` from releases
2. Double-click to install, or use PowerShell:
   ```powershell
   Add-AppxPackage PrivateGPT.msix
   ```

**Enterprise Deployment:**

Use the bootstrapper script for automated deployment:

```powershell
# Interactive installation
.\Install-PrivateGPT.ps1

# Silent installation (for SCCM/Intune)
.\Install-PrivateGPT.ps1 -Silent

# Offline installation with local Foundry package
.\Install-PrivateGPT.ps1 -Silent -FoundryPath "C:\Packages\foundry-local.msix"
```

### Foundry Local Auto-Start

PrivateGPT automatically starts Foundry Local if it's installed but not running. If Foundry Local is not installed, you'll see a dialog with installation instructions.

## Building

```powershell
# Windows MSIX (recommended)
npm run build:win:msix

# Windows NSIS installer (legacy)
npm run build:win:nsis

# Windows (default - MSIX)
npm run build:win

# macOS
npm run build:mac
```

Built application available in `dist/` directory.

### Code Signing (Production)

For production MSIX builds, use Azure Trusted Signing with the CodeSigning solution.

**Prerequisites:**
- CodeSigning solution installed (sibling directory or custom path)
- Azure Trusted Signing account with certificate profile
- PowerShell 7+ (`pwsh`)

**Setup:**

1. Install signing tools (one-time):
   ```powershell
   ..\CodeSigning\scripts\Install-SigningTools.ps1
   ```

2. Create metadata configuration (one-time per environment):
   ```powershell
   ..\CodeSigning\scripts\New-SigningMetadata.ps1 -ProfileName "production"
   ```

3. Update `package.json` publisher to match your certificate subject:
   ```json
   "appx": {
     "publisher": "CN=Your Company, O=Your Organization, L=City, S=State, C=US"
   }
   ```

**Building Signed MSIX:**

```powershell
# Authenticate to Azure (interactive, supports MFA)
Connect-AzAccount

# Build and sign in one step
$env:CODESIGNING_METADATA = "C:\path\to\metadata-production.json"
npm run build:win:msix:signed
```

**Environment Variables:**
| Variable | Description |
|----------|-------------|
| `CODESIGNING_METADATA` | Path to metadata.json (required for signed builds) |
| `CODESIGNING_PATH` | Path to CodeSigning solution (default: `../CodeSigning`) |

**Verify Signature:**
```powershell
Get-AuthenticodeSignature dist\*.msix
```

## Testing

```powershell
npm test
```

Runs 48 unit and integration tests covering:
- Encryption/decryption
- File processing
- Attachment handling
- Purge functionality

## Project Structure

```
PrivateGPT/
├── main.js              # Electron main process
├── preload.cjs          # Secure IPC bridge
├── chat.html            # UI and renderer logic
├── secure-session.js    # AES-256-GCM encryption
├── file-processor.js    # File handling and validation
├── purge.js             # Startup/shutdown data purge
└── test/                # Unit and integration tests
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PrivateGPT                           │
├─────────────────────────────────────────────────────────┤
│  SecureSessionManager                                   │
│  ├── Session key: crypto.randomBytes(32)               │
│  ├── Encryption: AES-256-GCM                           │
│  └── Storage: In-memory Map (encrypted values)         │
├─────────────────────────────────────────────────────────┤
│  Startup Purge                                          │
│  └── Scans temp dirs, deletes PrivateGPT artifacts     │
├─────────────────────────────────────────────────────────┤
│  Shutdown Purge                                         │
│  ├── Overwrites buffers with zeros                     │
│  ├── Clears all references                             │
│  └── Discards encryption key                           │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Foundry Local Required" dialog appears
- Foundry Local is not installed on your system
- Download from [Foundry Releases](https://github.com/microsoft/Foundry-Local/releases)
- Install using: `Add-AppxPackage foundry-local.msix`
- Click "Retry" after installation

### "Starting Foundry Local..." takes too long
- First launch may take 10-30 seconds for service initialization
- If it times out, check Windows Event Viewer for Foundry errors
- Ensure no antivirus is blocking Foundry Local

### "No local models found"
- Ensure Foundry Local is running
- Download models using Foundry Local CLI or UI

### Foundry auto-start fails
- Check if Foundry Local is properly installed
- Try starting Foundry Local manually first
- Check if another process is using the required ports

### Image analysis not working
- Check if your model supports vision (e.g., LLaVA variants)
- Non-vision models will show a warning when images are attached

### File attachment rejected
- Check file size limits (100KB text, 10MB images)
- Verify file extension is in the supported list

## License

ISC
