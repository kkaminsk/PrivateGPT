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
