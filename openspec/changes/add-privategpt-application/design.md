## Context

PrivateGPT is a privacy-focused Electron application derived from the Foundry-Local `foundry-chat` sample. It enables users to chat with local AI models while attaching documents and images. The core privacy guarantee: all user data is encrypted in memory, never persisted to disk, and completely discarded when the application closes.

**Stakeholders:**
- End users requiring document/image analysis with strict privacy
- Developers building on Foundry-Local SDK

**Constraints:**
- Must work offline (local models only)
- Cannot persist any user data to disk
- Must support multimodal vision for image analysis

## Goals / Non-Goals

**Goals:**
- Provide secure, ephemeral chat with file attachments
- Support text documents (.md, .txt, .json, .xml, .yaml, .csv)
- Support image analysis via vision API (.jpg, .jpeg, .png, .gif, .webp)
- Encrypt all in-memory user data with AES-256-GCM
- Guarantee data destruction on app close
- Detect and purge any residual data on app launch

**Non-Goals:**
- Cloud model support (removed for privacy)
- Persistent chat history
- File editing or modification
- Multi-user/collaborative features
- PDF or Office document support (future consideration)

## Decisions

### Decision 1: Memory-only data storage with AES-256-GCM encryption

**What:** All user data (chat messages, file contents, extracted text) stored in encrypted in-memory buffers. A session key is generated using `crypto.randomBytes(32)` at app startup and held only in memory.

**Why:** Balances security with performance. AES-256-GCM provides authenticated encryption, preventing both data exposure and tampering. Memory-only storage ensures no disk forensics can recover data.

**Alternatives considered:**
- Electron safeStorage: Rejected because it still writes to disk (encrypted)
- Pure RAM without encryption: Rejected because memory dumps could expose data

### Decision 2: Vision API for image processing

**What:** Images attached by users are sent to the local model's vision/multimodal endpoint for analysis.

**Why:** Provides the most useful analysis capability for images. Local models with vision support (e.g., LLaVA variants) can describe, analyze, and answer questions about images.

**Alternatives considered:**
- OCR-only: Rejected as too limited (only extracts text, misses visual context)
- Metadata-only: Rejected as provides minimal value to users

### Decision 3: Standalone repository (outside Foundry-Local)

**What:** Create PrivateGPT as a separate repository rather than a sample within Foundry-Local.

**Why:**
- PrivateGPT has different privacy requirements and update cadence
- Avoids bloating the SDK repo with application-specific code
- Allows independent versioning and release cycles
- Can reference Foundry-Local SDK as an npm dependency

**Alternatives considered:**
- New sample in samples/electron/: Rejected per user preference for standalone repo

### Decision 4: Startup purge behavior

**What:** On application launch, scan for and immediately delete any data that could be residual user data (temp files, cached data, etc.).

**Why:** Defensive measure against crashes or abnormal termination that might leave data behind. Ensures clean-slate guarantee.

**Implementation:** Check common temp locations, Electron's userData path, and clear any files with PrivateGPT signatures.

### Decision 5: File content extraction strategy

**What:**
- Text files (.txt, .md, .json, .xml, .yaml, .csv): Read as UTF-8 text
- Images: Convert to base64, send to vision API with chat context
- Large files: Truncate with warning to user (max ~100KB text, ~10MB images)

**Why:** Keeps context window manageable for local models while providing useful file content analysis.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PrivateGPT Electron App                  │
├─────────────────────────────────────────────────────────────┤
│  Renderer Process (chat.html)                               │
│  ├── Chat UI                                                │
│  ├── File Attachment UI (drag-drop + button)                │
│  └── Model Selector (local models only)                     │
├─────────────────────────────────────────────────────────────┤
│  Preload Script (preload.cjs)                               │
│  └── Secure IPC bridge (mainAPI)                            │
├─────────────────────────────────────────────────────────────┤
│  Main Process (main.js)                                     │
│  ├── SecureSessionManager                                   │
│  │   ├── AES-256-GCM encryption/decryption                  │
│  │   ├── Session key (memory-only)                          │
│  │   └── Encrypted message/file store                       │
│  ├── FileProcessor                                          │
│  │   ├── Text file reader                                   │
│  │   └── Image base64 encoder                               │
│  ├── StartupPurge                                           │
│  │   └── Residual data detection & deletion                 │
│  ├── ShutdownPurge                                          │
│  │   └── Memory clearing & temp file cleanup                │
│  └── FoundryLocalManager (SDK integration)                  │
└─────────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Memory exhaustion with large files | Implement file size limits (100KB text, 10MB images) with user warnings |
| Crash leaves encrypted data in memory | OS handles memory cleanup on process termination; encryption prevents exposure |
| Vision API not available on all models | Check model capabilities, fall back to "image attached" placeholder if no vision support |
| Base64 encoding doubles image size | Accept trade-off for multimodal API compatibility; enforce size limits |

## Migration Plan

Not applicable—this is a new standalone application with no existing data to migrate.

## Open Questions

1. **Model capability detection:** How to reliably detect if a local model supports vision? May need to query model metadata from Foundry catalog.
2. **File size limits:** Are 100KB text / 10MB image limits appropriate? May need user research.
3. **Error handling:** What should happen if file reading fails? Show error in chat vs. silent skip.
