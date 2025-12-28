# Change: Add PrivateGPT Standalone Application

## Why
Users need a privacy-focused chat application that allows interaction with local AI models while attaching files (documents and images) for analysis. All user data must be ephemeral—encrypted in memory during the session and completely discarded on application close. This addresses use cases where sensitive documents must never persist to disk or survive application restarts.

## What Changes
- Create a new standalone Electron application called "PrivateGPT" derived from the existing `samples/electron/foundry-chat` sample
- Add file attachment support for: `.md`, `.txt`, `.json`, `.xml`, `.yaml`, `.csv`, and image files (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)
- Implement AES-256-GCM encryption for any temporary user data held in memory
- Send images to multimodal vision API for analysis
- Extract and include text content from document attachments in chat context
- Implement startup data purge: detect and immediately discard any residual user data on launch
- Implement shutdown data purge: securely clear all user data when application closes
- Remove cloud model support—local models only (privacy-first design)
- Store encryption keys only in memory (never persisted)

## Impact
- Affected specs: New `privategpt-core` capability (no existing specs modified)
- Affected code: New standalone repository suggested (outside Foundry-Local)
- Dependencies: foundry-local-sdk, Electron, crypto (Node.js built-in)
- No breaking changes to existing Foundry-Local samples or SDK
