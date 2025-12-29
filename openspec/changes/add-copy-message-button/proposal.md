# Change: Add copy button to chat messages

## Why
Users need an easy way to copy AI assistant responses to use in other applications. Currently, copying requires manual text selection, which is cumbersome especially for long responses or code snippets.

## What Changes
- Add a copy button to assistant messages in the chat window
- Clicking the button copies the message content to the system clipboard
- Provide visual feedback when copy succeeds (e.g., icon change or "Copied!" indicator)

## Impact
- Affected specs: `chat-ui` (new capability)
- Affected code: `chat.html` (CSS for button styling, JS for copy functionality)
