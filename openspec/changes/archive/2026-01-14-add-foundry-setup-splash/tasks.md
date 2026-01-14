## 1. Splash Screen UI
- [x] 1.1 Create full-screen splash screen component in `chat.html`
- [x] 1.2 Design step indicator showing 3 setup steps (Install, Download Model, Ready)
- [x] 1.3 Style splash screen to match existing theme system (default, cyberpunk, high-contrast)
- [x] 1.4 Add copyable command boxes for winget and foundry commands

## 2. Step 1: Foundry Installation
- [x] 2.1 Display winget install command: `winget install Microsoft.FoundryLocal`
- [x] 2.2 Add "Copy Command" button for clipboard functionality
- [x] 2.3 Add "Check Installation" button to verify Foundry is installed
- [x] 2.4 Show success indicator when Foundry service is detected

## 3. Step 2: Model Download
- [x] 3.1 Display foundry model run command: `foundry model run phi-3-mini-4k`
- [x] 3.2 Add "Copy Command" button for clipboard functionality
- [x] 3.3 Add "Check Models" button to verify models are available
- [x] 3.4 Show success indicator when at least one model is cached

## 4. Backend Logic
- [x] 4.1 Add IPC handler to check Foundry installation status separately from service running
- [x] 4.2 Add IPC handler to check if any models are cached
- [x] 4.3 Modify startup flow to show splash when Foundry not installed OR no models cached
- [x] 4.4 Emit events for installation status and model availability

## 5. Integration
- [x] 5.1 Hide splash screen and show main UI when all steps complete
- [x] 5.2 Persist setup completion state (localStorage) to skip splash on subsequent launches
- [x] 5.3 Add "Setup Guide" option in UI to re-show splash screen if needed
