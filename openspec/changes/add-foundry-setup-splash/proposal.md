# Change: Add Foundry Setup Splash Screen

## Why
Users need clear, step-by-step guidance when PrivateGPT detects that Foundry Local is not installed or no models are available. The current modal dialog only shows installation instructions but doesn't guide users through the complete setup process including downloading their first model.

## What Changes
- Replace the current "Foundry Not Installed" modal with a full-screen splash screen
- Display step-by-step setup instructions with visual progress indicators
- Show the winget install command: `winget install Microsoft.FoundryLocal`
- Guide users to load a model using: `foundry model run phi-3-mini-4k`
- Add a "Check Status" button to verify each step's completion
- Transition to the main chat UI once Foundry is running and models are available

## Impact
- Affected specs: `foundry-setup` (new capability)
- Affected code: `chat.html` (splash screen UI), `main.js` (detection logic)
- Modifies existing: `foundry-lifecycle` capability (adds model availability check)
