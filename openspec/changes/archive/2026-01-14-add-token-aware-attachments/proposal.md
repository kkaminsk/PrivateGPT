# Change: Add Token-Aware File Attachments

## Why

Users attaching files that are within byte-size limits (100KB) can still exceed the model's token context window, causing Foundry to reject the request with cryptic errors like "Your input message is too large. This model supports at most 4096 completion tokens." This creates a poor user experience, especially for models with smaller context windows like `phi-3-mini-4k`.

## What Changes

1. **Token Estimation Before Send** - Estimate token count of the full message (prompt + attachments + conversation history) before sending to Foundry. Warn users when approaching limits, truncate or block when exceeding.

2. **Dynamic File Limits Based on Model** - Adjust the effective file size limit based on the selected model's context size. A 4K context model should not accept a 100KB text file that could be ~25,000 tokens.

3. **Graceful Error Handling** - Catch Foundry token limit errors specifically and display user-friendly messages with actionable suggestions (e.g., "Try a smaller file", "Switch to a larger context model", "Reduce conversation history").

## Impact

- Affected specs: `file-attachments` (new capability)
- Affected code:
  - `file-processor.js` - Add token estimation, dynamic limits
  - `main.js` - Pre-send validation, error handling in `sendMessage()`
  - `chat.html` - Display token warnings, improved error messages
  - `preload.cjs` - Expose new IPC methods if needed
