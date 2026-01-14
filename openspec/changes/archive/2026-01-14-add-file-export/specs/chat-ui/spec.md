## ADDED Requirements

### Requirement: Save Individual Message
The system SHALL provide a save button on assistant chat messages that allows users to download the message content as a text file.

#### Scenario: Save button display
- **WHEN** an assistant message is displayed in the chat
- **THEN** a save button appears on the message (visible on hover or always visible)
- **AND** user messages do NOT have a save button

#### Scenario: Save message to file
- **WHEN** user clicks the save button on an assistant message
- **THEN** a save dialog opens with a default filename (e.g., "response.txt")
- **AND** user can choose location and filename
- **AND** the message content is saved to the selected file

#### Scenario: Save cancelled
- **WHEN** user cancels the save dialog
- **THEN** no file is created
- **AND** no error is shown

### Requirement: Export Full Chat
The system SHALL provide an export button that allows users to download the entire conversation history as a text file.

#### Scenario: Export button display
- **WHEN** at least one message exists in the chat
- **THEN** an export button is visible in the header area

#### Scenario: Export chat to file
- **WHEN** user clicks the export button
- **THEN** a save dialog opens with a default filename (e.g., "chat-export.txt")
- **AND** user can choose location and filename
- **AND** all messages (user and assistant) are formatted and saved to the file

#### Scenario: Export format
- **WHEN** chat is exported
- **THEN** each message is prefixed with role (User/Assistant)
- **AND** messages are separated by blank lines for readability

#### Scenario: Theme compatibility
- **WHEN** save/export buttons are displayed under any theme (Default, Cyberpunk, High Contrast)
- **THEN** the button styling matches the active theme's design tokens
