## 1. Backend (main.js)
- [x] 1.1 Add `save-file` IPC handler using `dialog.showSaveDialog` and `fs.writeFileSync`
- [x] 1.2 Support text file format (.txt, .md) with appropriate filters

## 2. Preload Bridge (preload.cjs)
- [x] 2.1 Expose `saveFile(content, defaultFilename)` method to renderer

## 3. UI - Individual Message Save (chat.html)
- [x] 3.1 Add CSS styles for save button (similar to copy button)
- [x] 3.2 Add save button to assistant messages in `addMessage()` function
- [x] 3.3 Implement save handler that calls `mainAPI.saveFile` with message content

## 4. UI - Full Chat Export (chat.html)
- [x] 4.1 Add "Export Chat" button to header area
- [x] 4.2 Implement `exportFullChat()` function to format all messages
- [x] 4.3 Call `mainAPI.saveFile` with formatted chat history

## 5. Testing
- [x] 5.1 Test saving individual assistant message
- [x] 5.2 Test exporting full chat history
- [x] 5.3 Verify save dialog shows correct filters and default filename
- [x] 5.4 Test cancel behavior (no file saved)
- [x] 5.5 Test across all three themes
