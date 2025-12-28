## 1. Project Setup

- [x] 1.1 Create new standalone repository `PrivateGPT`
- [x] 1.2 Initialize npm project with package.json (derive from foundry-chat)
- [x] 1.3 Add dependencies: electron, foundry-local-sdk, openai
- [x] 1.4 Configure electron-builder for Windows/macOS builds
- [x] 1.5 Create base directory structure (main.js, preload.cjs, chat.html)

## 2. Core Security Implementation

- [x] 2.1 Implement SecureSessionManager class
  - [x] 2.1.1 Session key generation with crypto.randomBytes(32)
  - [x] 2.1.2 AES-256-GCM encrypt function
  - [x] 2.1.3 AES-256-GCM decrypt function
  - [x] 2.1.4 Encrypted message storage (Map with encrypted values)
- [x] 2.2 Implement startup purge
  - [x] 2.2.1 Scan Electron userData directory
  - [x] 2.2.2 Scan system temp directories
  - [x] 2.2.3 Delete any files with PrivateGPT signatures
- [x] 2.3 Implement shutdown purge
  - [x] 2.3.1 Overwrite encrypted buffers with zeros
  - [x] 2.3.2 Clear all arrays and references
  - [x] 2.3.3 Hook into app 'before-quit' and 'window-all-closed' events

## 3. File Processing Implementation

- [x] 3.1 Implement FileProcessor class
  - [x] 3.1.1 Text file reader (UTF-8 for .md, .txt, .json, .xml, .yaml, .csv)
  - [x] 3.1.2 Image file reader (binary to base64)
  - [x] 3.1.3 File size validation (100KB text limit, 10MB image limit)
  - [x] 3.1.4 MIME type detection for images
- [x] 3.2 Implement file type validation
  - [x] 3.2.1 Whitelist of allowed extensions
  - [x] 3.2.2 Extension checking on file attachment
  - [x] 3.2.3 User-friendly error messages for unsupported types

## 4. Vision API Integration

- [x] 4.1 Implement multimodal message formatting
  - [x] 4.1.1 Build image_url content type with base64 data URL
  - [x] 4.1.2 Combine text and image content in message array
- [x] 4.2 Implement model capability detection
  - [x] 4.2.1 Query Foundry model metadata for vision support
  - [x] 4.2.2 Fallback behavior when vision not available
  - [x] 4.2.3 User warning for non-vision models with image attachments

## 5. Main Process Updates (main.js)

- [x] 5.1 Remove cloud model support
  - [x] 5.1.1 Remove cloud API key, endpoint, model name variables
  - [x] 5.1.2 Remove 'cloud' option from switch-model handler
- [x] 5.2 Add IPC handlers for file operations
  - [x] 5.2.1 'attach-file' handler for file reading
  - [x] 5.2.2 'remove-attachment' handler
  - [x] 5.2.3 'get-attachments' handler
- [x] 5.3 Update sendMessage to include file contents
  - [x] 5.3.1 Append text file contents to message
  - [x] 5.3.2 Format images for vision API
- [x] 5.4 Integrate SecureSessionManager
  - [x] 5.4.1 Initialize on app ready
  - [x] 5.4.2 Encrypt messages before storing
  - [x] 5.4.3 Decrypt messages before sending to model
- [x] 5.5 Integrate startup/shutdown purge
  - [x] 5.5.1 Call startup purge before createWindow
  - [x] 5.5.2 Call shutdown purge on app quit events

## 6. Preload Script Updates (preload.cjs)

- [x] 6.1 Add file attachment IPC bridge methods
  - [x] 6.1.1 attachFile(filePath)
  - [x] 6.1.2 removeAttachment(index)
  - [x] 6.1.3 getAttachments()
- [x] 6.2 Add file drag-drop handlers
  - [x] 6.2.1 onFileDrop callback registration
  - [x] 6.2.2 Validate dropped files before passing to main

## 7. UI Updates (chat.html)

- [x] 7.1 Add file attachment UI
  - [x] 7.1.1 Attach button next to send button
  - [x] 7.1.2 Drag-drop zone overlay on chat input
  - [x] 7.1.3 Attachment preview chips with remove button
- [x] 7.2 Update model selector
  - [x] 7.2.1 Remove cloud option
  - [x] 7.2.2 Show only local models
- [x] 7.3 Add error/warning display for file operations
  - [x] 7.3.1 File too large warning
  - [x] 7.3.2 Unsupported file type error
  - [x] 7.3.3 Vision not available warning
- [x] 7.4 Update styling for PrivateGPT branding
  - [x] 7.4.1 Update title and header
  - [x] 7.4.2 Add privacy indicator icon

## 8. Testing

- [ ] 8.1 Unit tests for SecureSessionManager
  - [ ] 8.1.1 Test key generation
  - [ ] 8.1.2 Test encrypt/decrypt round-trip
  - [ ] 8.1.3 Test buffer overwrite on purge
- [ ] 8.2 Unit tests for FileProcessor
  - [ ] 8.2.1 Test text file reading
  - [ ] 8.2.2 Test image base64 encoding
  - [ ] 8.2.3 Test size limit enforcement
- [ ] 8.3 Integration tests
  - [ ] 8.3.1 Test full message flow with attachment
  - [ ] 8.3.2 Test startup purge clears residual files
  - [ ] 8.3.3 Test shutdown purge clears memory
- [ ] 8.4 Manual testing
  - [ ] 8.4.1 Test all supported file types
  - [ ] 8.4.2 Test drag-drop functionality
  - [ ] 8.4.3 Test with vision-capable model
  - [ ] 8.4.4 Test with non-vision model

## 9. Documentation

- [ ] 9.1 Create README.md with setup instructions
- [ ] 9.2 Document privacy guarantees
- [ ] 9.3 Document supported file types and limits
- [ ] 9.4 Add troubleshooting section
