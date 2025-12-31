## ADDED Requirements

### Requirement: Copy Message Button
The system SHALL provide a copy button on assistant chat messages that allows users to copy the message content to the system clipboard.

#### Scenario: Copy button display
- **WHEN** an assistant message is displayed in the chat
- **THEN** a copy button appears on the message (visible on hover or always visible)
- **AND** user messages do NOT have a copy button

#### Scenario: Copy message to clipboard
- **WHEN** user clicks the copy button on an assistant message
- **THEN** the full text content of that message is copied to the system clipboard
- **AND** visual feedback confirms the copy succeeded (e.g., icon changes to checkmark, or "Copied!" appears)

#### Scenario: Copy feedback resets
- **WHEN** the copy success feedback is displayed
- **THEN** the feedback resets to the default state after a brief delay (1-2 seconds)

#### Scenario: Theme compatibility
- **WHEN** copy button is displayed under any theme (Default, Cyberpunk, High Contrast)
- **THEN** the button styling matches the active theme's design tokens
