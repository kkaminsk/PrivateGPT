# Tasks: Add Token-Aware File Attachments

## 1. Token Estimation Module
- [x] 1.1 Add `estimateTokens(text)` function to `file-processor.js` using character/word heuristic (~4 chars per token average)
- [x] 1.2 Add `getEffectiveContextLimit(modelId)` to return available context for attachments (total context minus response reserve)
- [x] 1.3 Export token estimation utilities for use in main process

## 2. Dynamic File Limits
- [x] 2.1 Add `getMaxTextSizeForModel(modelId)` function that calculates byte limit based on model context
- [x] 2.2 Modify `processTextFile()` to accept optional `maxBytes` parameter
- [x] 2.3 Update `attach-file` IPC handler to pass model-specific limits

## 3. Pre-Send Validation
- [x] 3.1 Add `validateMessageTokens(messages, attachments, modelId)` function in `main.js`
- [x] 3.2 Calculate total token estimate: conversation history + current message + all attachments
- [x] 3.3 Emit warning event when approaching 80% of context limit
- [x] 3.4 Return validation error (not throw) when exceeding limit, with actionable message

## 4. Graceful Error Handling
- [x] 4.1 Add `isTokenLimitError(error)` helper to detect Foundry token errors
- [x] 4.2 Wrap `sendMessage()` catch block to detect and translate token errors
- [x] 4.3 Add `token-limit-exceeded` IPC event with user-friendly details

## 5. Frontend Integration
- [x] 5.1 Add token usage indicator near attachment area (e.g., "~2.5K / 4K tokens")
- [x] 5.2 Display pre-send warnings in UI before message is sent
- [x] 5.3 Show improved error dialog for token limit errors with suggestions
- [x] 5.4 Update attachment preview to show estimated token count

## 6. Testing
- [x] 6.1 Add unit tests for `estimateTokens()` function
- [x] 6.2 Add unit tests for `getMaxTextSizeForModel()`
- [x] 6.3 Add integration test for token validation flow
- [x] 6.4 Test error handling with mocked Foundry token error response
