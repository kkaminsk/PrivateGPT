# file-attachments Specification

## Purpose
Defines requirements for file attachment processing with token-aware validation to prevent context overflow errors.

## ADDED Requirements

### Requirement: Token Estimation
The system SHALL estimate the token count of text content before sending to the model.

#### Scenario: Estimate tokens for text content
- **WHEN** text content is prepared for sending
- **THEN** the system estimates token count using a character-based heuristic (~4 characters per token)
- **AND** the estimate is available before the API call is made

#### Scenario: Estimate includes all message components
- **WHEN** calculating total token usage
- **THEN** the estimate includes conversation history, current user message, and all attached file contents

### Requirement: Dynamic File Size Limits
The system SHALL adjust file size limits based on the selected model's context window.

#### Scenario: Small context model (4K tokens)
- **WHEN** a model with 4096 token context is selected (e.g., phi-3-mini-4k)
- **THEN** the effective text file limit is reduced proportionally (~16KB maximum)
- **AND** users are informed of the reduced limit

#### Scenario: Large context model (128K tokens)
- **WHEN** a model with 128K+ token context is selected
- **THEN** the default 100KB text file limit applies
- **AND** no additional restrictions are imposed

#### Scenario: Unknown model context size
- **WHEN** a model's context size is not in the known list
- **THEN** the system uses the default 100KB limit
- **AND** token validation still applies at send time

### Requirement: Pre-Send Token Validation
The system SHALL validate that the total message does not exceed the model's context limit before sending.

#### Scenario: Message within limits
- **WHEN** total estimated tokens are below the model's context limit
- **THEN** the message is sent normally
- **AND** no warning is displayed

#### Scenario: Message approaching limit (80%+)
- **WHEN** total estimated tokens exceed 80% of the model's context limit
- **THEN** the system displays a warning to the user
- **AND** the message can still be sent if the user proceeds

#### Scenario: Message exceeds limit
- **WHEN** total estimated tokens exceed the model's context limit
- **THEN** the system blocks the send operation
- **AND** displays an error with actionable suggestions (reduce file size, clear history, switch model)

### Requirement: Graceful Error Handling
The system SHALL detect and translate Foundry token limit errors into user-friendly messages.

#### Scenario: Foundry returns token limit error
- **WHEN** Foundry rejects a request with a token limit error message
- **THEN** the system displays a user-friendly error explaining the issue
- **AND** provides suggestions: "Try a smaller file", "Clear conversation history", or "Switch to a larger context model"

#### Scenario: Other Foundry errors pass through
- **WHEN** Foundry returns an error unrelated to token limits
- **THEN** the original error message is displayed to the user
- **AND** no token-specific suggestions are shown

### Requirement: Token Usage Display
The system SHALL display token usage information to help users understand context consumption.

#### Scenario: Token indicator in attachment area
- **WHEN** files are attached
- **THEN** the UI displays estimated token usage (e.g., "~2.5K / 4K tokens")
- **AND** the display updates as files are added or removed

#### Scenario: Attachment preview shows token estimate
- **WHEN** viewing an attached file preview
- **THEN** the preview includes the estimated token count for that file
