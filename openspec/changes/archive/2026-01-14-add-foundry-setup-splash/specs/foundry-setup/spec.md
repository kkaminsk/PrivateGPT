## ADDED Requirements

### Requirement: Setup Splash Screen Display
The application SHALL display a full-screen setup splash screen when Foundry Local is not installed or no models are available.

#### Scenario: Foundry not installed on first launch
- **WHEN** the application launches
- **AND** Foundry Local is not installed (service check fails)
- **THEN** a full-screen setup splash screen is displayed
- **AND** the main chat interface is hidden
- **AND** Step 1 (Install Foundry) is highlighted as the current step

#### Scenario: Foundry installed but no models cached
- **WHEN** the application launches
- **AND** Foundry Local is installed and service is running
- **AND** no models are cached locally
- **THEN** a full-screen setup splash screen is displayed
- **AND** Step 1 shows as completed
- **AND** Step 2 (Download Model) is highlighted as the current step

#### Scenario: Setup complete on subsequent launch
- **WHEN** the application launches
- **AND** Foundry Local is installed and service is running
- **AND** at least one model is cached locally
- **THEN** the setup splash screen is NOT displayed
- **AND** the main chat interface loads normally

---

### Requirement: Step 1 - Foundry Installation Instructions
The application SHALL provide clear instructions for installing Foundry Local via winget.

#### Scenario: Display winget install command
- **WHEN** the setup splash screen is displayed
- **AND** user is on Step 1
- **THEN** the command `winget install Microsoft.FoundryLocal` is displayed
- **AND** a "Copy" button is available to copy the command to clipboard
- **AND** instructional text explains to run this in PowerShell or Terminal

#### Scenario: Copy command to clipboard
- **WHEN** user clicks the "Copy" button for the install command
- **THEN** the command text is copied to the system clipboard
- **AND** visual feedback confirms the copy action

#### Scenario: Verify Foundry installation
- **WHEN** user clicks "Check Installation" button
- **AND** Foundry Local is now installed and service is available
- **THEN** Step 1 shows a success indicator (checkmark)
- **AND** the splash screen advances to Step 2

#### Scenario: Installation not detected
- **WHEN** user clicks "Check Installation" button
- **AND** Foundry Local is still not installed
- **THEN** an inline message indicates Foundry was not detected
- **AND** user remains on Step 1

---

### Requirement: Step 2 - Model Download Instructions
The application SHALL provide instructions for downloading a model using Foundry CLI.

#### Scenario: Display foundry model command
- **WHEN** the setup splash screen is displayed
- **AND** user is on Step 2
- **THEN** the command `foundry model run phi-3-mini-4k` is displayed
- **AND** a "Copy" button is available to copy the command to clipboard
- **AND** instructional text explains this will download and cache the model

#### Scenario: Verify model availability
- **WHEN** user clicks "Check Models" button
- **AND** at least one model is cached locally
- **THEN** Step 2 shows a success indicator (checkmark)
- **AND** the splash screen advances to Step 3 (Ready)

#### Scenario: No models detected
- **WHEN** user clicks "Check Models" button
- **AND** no models are cached locally
- **THEN** an inline message indicates no models were found
- **AND** user remains on Step 2

---

### Requirement: Step 3 - Setup Complete
The application SHALL transition to the main interface when setup is complete.

#### Scenario: All steps complete
- **WHEN** Step 1 and Step 2 are both complete (success indicators shown)
- **THEN** Step 3 displays "Ready to use!" message
- **AND** a "Start PrivateGPT" button is available

#### Scenario: Launch main interface
- **WHEN** user clicks "Start PrivateGPT" button
- **THEN** the setup splash screen is hidden
- **AND** the main chat interface is displayed
- **AND** the model selector is populated with available models

---

### Requirement: Theme Compatibility
The setup splash screen SHALL respect the application's theme system.

#### Scenario: Default theme
- **WHEN** the setup splash screen is displayed
- **AND** default theme is active
- **THEN** splash screen uses default theme colors and styling

#### Scenario: Cyberpunk theme
- **WHEN** the setup splash screen is displayed
- **AND** cyberpunk theme is active
- **THEN** splash screen uses cyberpunk theme colors (magenta/cyan accents)

#### Scenario: High contrast theme
- **WHEN** the setup splash screen is displayed
- **AND** high contrast theme is active
- **THEN** splash screen uses high contrast colors (black/white, thick borders)
