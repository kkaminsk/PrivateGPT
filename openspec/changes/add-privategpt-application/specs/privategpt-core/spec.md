## ADDED Requirements

### Requirement: Ephemeral Data Storage
The application SHALL store all user data (chat messages, file contents, extracted text) exclusively in memory using AES-256-GCM encryption. The encryption key SHALL be generated at application startup using cryptographically secure random bytes and SHALL never be persisted to disk.

#### Scenario: Session key generation on startup
- **WHEN** the application starts
- **THEN** a new 256-bit encryption key is generated using `crypto.randomBytes(32)`
- **AND** the key is stored only in process memory

#### Scenario: Message encryption
- **WHEN** a user sends or receives a chat message
- **THEN** the message content is encrypted with AES-256-GCM before storage in memory
- **AND** no plaintext message data is written to disk

### Requirement: Startup Data Purge
The application SHALL detect and immediately discard any residual user data when launched. This includes checking Electron's userData directory, system temp directories, and any application-specific cache locations.

#### Scenario: Clean launch after normal shutdown
- **WHEN** the application launches after a normal previous shutdown
- **THEN** no residual user data exists
- **AND** the purge completes without errors

#### Scenario: Clean launch after crash
- **WHEN** the application launches after an abnormal termination (crash)
- **THEN** any residual files in userData or temp directories with PrivateGPT signatures are deleted
- **AND** the application starts with a clean state

### Requirement: Shutdown Data Purge
The application SHALL securely clear all user data from memory when closing. This includes overwriting encrypted buffers, clearing chat history arrays, and disposing of any file content references.

#### Scenario: Normal application close
- **WHEN** the user closes the application window
- **THEN** all encrypted message buffers are overwritten with zeros
- **AND** all file content references are cleared
- **AND** the encryption key is discarded
- **AND** no user data persists after process termination

#### Scenario: Application quit via menu or system
- **WHEN** the application receives a quit signal
- **THEN** the shutdown purge executes before process exit

### Requirement: Text File Attachment
The application SHALL allow users to attach text-based files with extensions: `.md`, `.txt`, `.json`, `.xml`, `.yaml`, `.csv`. File contents SHALL be read as UTF-8 text, encrypted, and included in the chat context sent to the model.

#### Scenario: Attach markdown file
- **WHEN** the user attaches a file named `notes.md`
- **THEN** the file is read as UTF-8 text
- **AND** the content is encrypted and stored in the session
- **AND** the content is included in the next message context to the model

#### Scenario: Attach JSON configuration file
- **WHEN** the user attaches a file named `config.json`
- **THEN** the file is read as UTF-8 text
- **AND** the JSON content is included in the chat context

#### Scenario: Large text file handling
- **WHEN** the user attaches a text file exceeding 100KB
- **THEN** the content is truncated to 100KB
- **AND** the user is shown a warning that the file was truncated

### Requirement: Image File Attachment
The application SHALL allow users to attach image files with extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`. Images SHALL be converted to base64 and sent to the model's vision API for multimodal analysis.

#### Scenario: Attach photograph for analysis
- **WHEN** the user attaches a file named `photo.jpg`
- **THEN** the image is read as binary data
- **AND** the image is base64 encoded
- **AND** the encoded image is sent to the model's vision endpoint
- **AND** the model's visual analysis is returned in the chat response

#### Scenario: Attach PNG screenshot
- **WHEN** the user attaches a file named `screenshot.png`
- **THEN** the image is processed for vision API analysis

#### Scenario: Large image handling
- **WHEN** the user attaches an image file exceeding 10MB
- **THEN** the attachment is rejected
- **AND** the user is shown an error message indicating the file is too large

#### Scenario: Model without vision support
- **WHEN** the user attaches an image
- **AND** the selected model does not support vision
- **THEN** the user is shown a warning that image analysis is not available
- **AND** the image is not sent to the model

### Requirement: Local Models Only
The application SHALL only connect to local models via Foundry Local SDK. Cloud model support SHALL be removed to ensure all data processing remains on-device.

#### Scenario: Model selection shows only local models
- **WHEN** the user opens the model selector
- **THEN** only locally cached models from Foundry Local are displayed
- **AND** no cloud model option is available

#### Scenario: Application startup without Foundry Local
- **WHEN** the application starts
- **AND** Foundry Local service is not running
- **THEN** the user is shown an error message
- **AND** the application provides instructions to start Foundry Local

### Requirement: File Attachment UI
The application SHALL provide a user interface for attaching files, supporting both drag-and-drop and a file picker button. Attached files SHALL be displayed with their names before sending.

#### Scenario: Drag and drop file attachment
- **WHEN** the user drags a supported file onto the chat input area
- **THEN** the file is shown as attached with its filename
- **AND** the user can remove the attachment before sending

#### Scenario: File picker attachment
- **WHEN** the user clicks the attach button
- **THEN** a file picker dialog opens filtered to supported file types
- **AND** the selected file is shown as attached

#### Scenario: Unsupported file type
- **WHEN** the user attempts to attach an unsupported file type (e.g., `.exe`, `.pdf`)
- **THEN** the attachment is rejected
- **AND** the user is shown a message listing supported file types

### Requirement: Chat Context with Attachments
The application SHALL include attached file contents in the message sent to the model. Text files SHALL be included as text content, and images SHALL be included as base64-encoded image content for vision models.

#### Scenario: Send message with text attachment
- **WHEN** the user sends a message with an attached `.txt` file
- **THEN** the message sent to the model includes both the user's text and the file content
- **AND** the file content is clearly labeled in the context

#### Scenario: Send message with image attachment
- **WHEN** the user sends a message with an attached image
- **THEN** the message sent to the model uses the multimodal format
- **AND** the image is included as a base64 data URL

#### Scenario: Send message with multiple attachments
- **WHEN** the user attaches multiple files and sends a message
- **THEN** all file contents are included in the message context
- **AND** each file is labeled with its filename
