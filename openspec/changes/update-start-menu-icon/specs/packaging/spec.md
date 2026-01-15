## MODIFIED Requirements
### Requirement: Modern MSIX Package Format
The system SHALL produce MSIX packages with modern Windows version targeting, `.msix` file extension, and custom application icon.

#### Scenario: Build produces .msix file
- **GIVEN** the build configuration targets modern MSIX standards
- **WHEN** the user runs `npm run build:win:msix`
- **THEN** the output file has `.msix` extension
- **AND** the package MinVersion is 10.0.17763.0 (Windows 10 1809)
- **AND** the package MaxVersionTested is 10.0.22621.0 or higher

#### Scenario: Package installs on Windows 10 1809
- **GIVEN** a signed MSIX package with MinVersion 10.0.17763.0
- **WHEN** a user installs the package on Windows 10 version 1809 or later
- **THEN** the installation succeeds
- **AND** the application runs correctly

#### Scenario: Package installs on Windows 11
- **GIVEN** a signed MSIX package with MaxVersionTested 10.0.22621.0
- **WHEN** a user installs the package on Windows 11
- **THEN** the installation succeeds without compatibility warnings

#### Scenario: Application uses custom ICO icon
- **GIVEN** the build configuration specifies `dist/.icon-ico/icon.ico` as the Windows icon
- **WHEN** the user builds and installs the application
- **THEN** the application displays the custom icon in the Windows Start Menu
- **AND** the application displays the custom icon in the taskbar
- **AND** the application displays the custom icon in the window title bar
