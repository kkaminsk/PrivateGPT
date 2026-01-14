# Change: Add file export capability

## Why
Users need to save chat content for later reference, documentation, or sharing. Currently, the only way to preserve content is manual copy-paste. This limits productivity and makes it difficult to archive conversations or extract code snippets.

## What Changes
- Add "Save" button on each assistant message to download that response as a text file
- Add "Export Chat" button in header to save full conversation history
- Add `save-file` IPC handler in main.js using `dialog.showSaveDialog` and `fs.writeFileSync`
- Expose save functionality via preload.cjs bridge

## Impact
- Affected specs: `chat-ui` (add export requirements)
- Affected code:
  - `main.js` - add `save-file` IPC handler
  - `preload.cjs` - expose `saveFile` method
  - `chat.html` - add save buttons and export UI
