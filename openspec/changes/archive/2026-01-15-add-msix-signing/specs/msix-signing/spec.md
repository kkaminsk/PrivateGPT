# MSIX Signing Capability

## ADDED Requirements

### Requirement: Signed MSIX Build
The system SHALL provide a build command that produces a signed MSIX package using Azure Trusted Signing.

#### Scenario: Successful signed build
- **GIVEN** the CodeSigning solution is available at a known path
- **AND** a valid `metadata.json` file exists for Azure Trusted Signing
- **AND** the user is authenticated via `Connect-AzAccount`
- **WHEN** the user runs `npm run build:win:msix:signed`
- **THEN** an unsigned MSIX is built by electron-builder
- **AND** the MSIX is signed using Azure Trusted Signing
- **AND** the signed MSIX is available in the `dist/` directory

#### Scenario: Missing CodeSigning solution
- **GIVEN** the CodeSigning solution path does not exist
- **WHEN** the user runs `npm run build:win:msix:signed`
- **THEN** the build fails with a clear error message indicating the CodeSigning path is invalid
- **AND** the unsigned MSIX remains in the `dist/` directory

#### Scenario: Missing metadata file
- **GIVEN** the metadata.json file path is invalid or missing
- **WHEN** the user runs `npm run build:win:msix:signed`
- **THEN** the build fails with a clear error message about the missing metadata file

### Requirement: Unsigned Build Preservation
The system SHALL preserve the existing unsigned MSIX build capability for development use.

#### Scenario: Development build unchanged
- **WHEN** the user runs `npm run build:win:msix`
- **THEN** an unsigned MSIX is produced
- **AND** no signing is attempted
- **AND** the build completes without requiring CodeSigning prerequisites

### Requirement: Configurable Signing Paths
The system SHALL support configuration of CodeSigning solution and metadata paths via environment variables.

#### Scenario: Environment variable configuration
- **GIVEN** the environment variable `CODESIGNING_PATH` is set to a valid CodeSigning solution directory
- **AND** the environment variable `CODESIGNING_METADATA` is set to a valid metadata.json path
- **WHEN** the user runs `npm run build:win:msix:signed`
- **THEN** the signing script uses the paths from environment variables

#### Scenario: Default path fallback
- **GIVEN** no environment variables are set for CodeSigning paths
- **WHEN** the user runs `npm run build:win:msix:signed`
- **THEN** the signing script uses default sibling directory paths
