## ADDED Requirements

### Requirement: Status Bar Connection Flash
The system SHALL provide a visual flash effect on the status bar when the application successfully connects to a model.

#### Scenario: Double-flash on model connection
- **WHEN** the user selects a model and connection succeeds
- **THEN** the status bar SHALL invert its background and text colors for 500ms
- **AND** return to normal colors for 500ms
- **AND** invert again for 500ms
- **AND** return to normal colors permanently

#### Scenario: Flash respects current theme
- **WHEN** the flash effect triggers
- **THEN** the inverted colors SHALL be derived from the current theme's accent colors
- **AND** the effect SHALL work correctly in Default, Cyberpunk, and High Contrast themes
