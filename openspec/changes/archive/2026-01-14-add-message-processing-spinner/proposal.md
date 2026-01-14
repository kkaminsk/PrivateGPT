# Change: Add message processing spinner

## Why
Users currently have no visual feedback when a message is being processed by the AI model. The only indication is that the send button is disabled. A spinner provides clear visual feedback that the system is working on their request.

## What Changes
- Add an animated spinner/typing indicator to the assistant message area while the AI is generating a response
- Show the spinner immediately after user sends a message
- Hide the spinner when the response completes or an error occurs

## Impact
- Affected specs: user-interface (new)
- Affected code: chat.html (CSS styles, JavaScript for spinner management)
