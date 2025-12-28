## ADDED Requirements

### Requirement: MSIX Package Format
The application SHALL be packaged as an MSIX installer for Windows distribution.

#### Scenario: Build produces MSIX output
- **WHEN** running `npm run build:win`
- **THEN** an MSIX package is created in the `dist` directory
- **AND** the package contains valid AppxManifest.xml

#### Scenario: MSIX installs on supported Windows
- **WHEN** user double-clicks the MSIX file on Windows 10 1809+
- **THEN** Windows App Installer prompts for installation
- **AND** application is installed to user's app directory

#### Scenario: Clean uninstall
- **WHEN** user uninstalls PrivateGPT via Windows Settings
- **THEN** all application files are removed
- **AND** no user data persists (consistent with ephemeral design)

---

### Requirement: Foundry Local Dependency Guidance
The application SHALL provide actionable guidance when Foundry Local is not available.

#### Scenario: Foundry Local not installed
- **WHEN** application starts and Foundry Local is not detected
- **THEN** a modal dialog is displayed explaining the dependency
- **AND** the dialog includes a link to Foundry Local releases
- **AND** the dialog includes a copyable PowerShell installation command

#### Scenario: Foundry Local installed but not running
- **WHEN** application starts and Foundry Local is installed but service is not running
- **THEN** a modal dialog is displayed with instructions to start the service
- **AND** a "Retry" button allows re-checking without restarting the app

#### Scenario: User installs Foundry and retries
- **WHEN** user clicks "Retry" after installing Foundry Local
- **THEN** application re-checks for Foundry Local availability
- **AND** if detected, the modal closes and model list loads

---

### Requirement: Enterprise Deployment Support
The application SHALL provide a bootstrapper script for enterprise deployment scenarios.

#### Scenario: Silent installation with bootstrapper
- **WHEN** IT administrator runs `Install-PrivateGPT.ps1 -Silent`
- **THEN** Foundry Local is installed if not present
- **AND** PrivateGPT MSIX is installed
- **AND** no user interaction is required

#### Scenario: Offline Foundry installation
- **WHEN** IT administrator runs `Install-PrivateGPT.ps1 -FoundryPath "C:\path\to\foundry.msix"`
- **THEN** Foundry Local is installed from the specified local path
- **AND** no internet connection is required for Foundry installation

#### Scenario: Bootstrapper reports success/failure
- **WHEN** bootstrapper completes
- **THEN** exit code 0 indicates success
- **AND** exit code non-zero indicates failure with error message
