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

## Building

```powershell
# Windows
npm run build:win

# macOS
npm run build:mac
```

Built application available in `dist/` directory.

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

### "No local models found"
- Ensure Foundry Local is running
- Download models using Foundry Local CLI or UI

### "Foundry Local service is not running"
- Start the Foundry Local service
- Restart PrivateGPT

### Image analysis not working
- Check if your model supports vision (e.g., LLaVA variants)
- Non-vision models will show a warning when images are attached

### File attachment rejected
- Check file size limits (100KB text, 10MB images)
- Verify file extension is in the supported list

## License

ISC
