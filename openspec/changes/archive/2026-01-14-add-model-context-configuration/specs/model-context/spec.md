## ADDED Requirements

### Requirement: Configurable Max Response Tokens
The application SHALL provide a user interface control to configure the maximum number of tokens for AI model responses. The control SHALL allow values between 128 and 4096 tokens with a default value of 2048 tokens.

#### Scenario: User adjusts max tokens
- **WHEN** the user adjusts the max tokens slider or input
- **THEN** the new value is stored in application state
- **AND** subsequent chat requests use the configured max_tokens value

#### Scenario: Default max tokens applied
- **WHEN** a model is selected and no max tokens value has been set
- **THEN** the default value of 2048 tokens is used for chat requests

#### Scenario: Max tokens passed to model
- **WHEN** the user sends a message
- **THEN** the chat completion request includes the configured max_tokens parameter
- **AND** the model respects this limit for response generation

### Requirement: Known Model Context Display
The application SHOULD display context window information for models that exist in the known models mapping. For models not in the mapping, the context indicator SHALL be hidden.

#### Scenario: Known model selected
- **WHEN** the user selects a model that exists in the known models context mapping
- **THEN** the UI displays the model's context window size
- **AND** an approximate context usage indicator is shown

#### Scenario: Unknown model selected
- **WHEN** the user selects a model not in the known models mapping
- **THEN** the context indicator is hidden
- **AND** the max tokens control remains available

### Requirement: Context Usage Estimation
The application SHOULD provide an approximate estimate of tokens used in the current conversation based on character count. The estimate SHALL be clearly labeled as approximate.

#### Scenario: Conversation context estimated
- **WHEN** messages are added to the conversation
- **THEN** the context indicator updates to show approximate tokens used
- **AND** the display format shows "~X / Y tokens" or similar

#### Scenario: Long conversation warning
- **WHEN** estimated context usage exceeds 80% of known model context
- **THEN** the context indicator displays in a warning state
- **AND** the user is visually informed they are approaching the limit
