## 1. Backend Changes

- [x] 1.1 Add `maxTokens` parameter to `send-message` IPC handler in `main.js`
- [x] 1.2 Pass `max_tokens` option to OpenAI chat.completions.create() call
- [x] 1.3 Create known models context size mapping (can be in main.js or separate file)
- [x] 1.4 Add IPC handler to return model context info if available

## 2. Frontend UI

- [x] 2.1 Add max tokens slider/input control in header area of `chat.html`
- [x] 2.2 Add CSS styling for the new control (matching existing theme system)
- [x] 2.3 Store max tokens value in renderer state
- [x] 2.4 Pass max tokens value when calling sendMessage

## 3. Context Indicator (Optional Enhancement)

- [x] 3.1 Add context usage indicator below header (shows ~tokens used / limit)
- [x] 3.2 Implement character-to-token estimation for current conversation
- [x] 3.3 Update indicator as messages are added

## 4. Preload Bridge

- [x] 4.1 Update `preload.cjs` to expose new IPC methods if needed
- [x] 4.2 Add method to get model context info

## 5. Testing & Validation

- [x] 5.1 Test max_tokens parameter with different values (128, 1024, 4096)
- [x] 5.2 Verify slider/input persists value during session
- [x] 5.3 Test with known and unknown models
- [x] 5.4 Ensure existing functionality not broken
