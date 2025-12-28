# PrivateGPT

A privacy-focused desktop chat application for local AI models with ephemeral data storage.

## Project Overview

PrivateGPT enables users to interact with AI models running locally via Foundry Local SDK while maintaining complete data privacy. All conversations are encrypted in memory and completely erased when the app closes.

**Key Features:**
- Ephemeral storage with AES-256-GCM encryption
- File attachments (text up to 100KB, images up to 10MB)
- Vision/multimodal model support
- No cloud connectivity - all processing happens locally
- Enterprise deployment ready (MSIX packaging)

## Tech Stack

- **Electron 28.1.0** - Desktop application framework
- **Foundry Local SDK 0.3.0** - Local model management
- **OpenAI SDK 4.98.0** - LLM API client
- **Node.js crypto** - AES-256-GCM encryption
- **electron-builder** - Application packaging
- Native HTML/CSS/JavaScript (no frameworks)

## Project Structure

```
├── main.js              # Electron main process, IPC handlers, Foundry management
├── preload.cjs          # Security bridge with contextIsolation
├── chat.html            # UI with theming (Default, Cyberpunk, High Contrast)
├── secure-session.js    # AES-256-GCM encryption manager
├── file-processor.js    # File validation and processing
├── purge.js             # Startup/shutdown data purge
├── Install-PrivateGPT.ps1  # Enterprise deployment bootstrapper
├── icon/                # App icons (44px to 512px)
├── test/                # Unit and integration tests
└── openspec/            # Design specs and change tracking
```

## Commands

```bash
npm install          # Install dependencies
npm start            # Run development app
npm test             # Run unit/integration tests (48 tests)
npm run build:win:msix   # Build Windows MSIX package
npm run build:win:nsis   # Build Windows NSIS installer
npm run build:mac        # Build macOS DMG
```

## Architecture Notes

### Security Model
- **Memory-only storage** - No disk persistence for sensitive data
- **Encryption by default** - All attachments encrypted with unique IVs
- **Key isolation** - 32-byte session keys via crypto.randomBytes()
- **Buffer overwrites** - Explicit fill(0) before deletion
- **Startup/shutdown purge** - Removes residual data from temp directories

### IPC Architecture
- Context isolation enabled, nodeIntegration disabled
- Renderer accesses main process via `window.mainAPI` (preload bridge)
- Stream-based responses via `chat-chunk` events

### Foundry Integration
- Auto-detects and starts Foundry Local service
- Graceful degradation with setup wizard if missing
- Vision model detection via name heuristics ('vision', 'llava', 'multimodal', etc.)
- Clear attachments when switching models

## Testing

Tests use Node.js built-in test runner:
- `test/secure-session.test.js` - Encryption/decryption, key generation
- `test/file-processor.test.js` - File validation, MIME types, size limits
- `test/integration.test.js` - End-to-end attachment and message flows

## Deployment

- **MSIX** (recommended) - Modern Windows package with auto-updates
- **PowerShell installer** - Enterprise bootstrapper for SCCM/Intune
- Supports `-Silent` flag and `-FoundryPath` for offline environments

---

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->