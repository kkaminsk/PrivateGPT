## ADDED Requirements

### Requirement: Automatic Foundry Service Start
The application SHALL automatically attempt to start the Foundry Local service if it is installed but not running.

#### Scenario: Service not running but installed
- **WHEN** application launches and Foundry Local is installed but service is not running
- **THEN** the application calls `startService()` to start Foundry Local
- **AND** a loading indicator displays "Starting Foundry Local..."
- **AND** the application waits up to 10 seconds for the service to become available

#### Scenario: Service starts successfully
- **WHEN** `startService()` completes and service becomes available
- **THEN** the loading indicator is dismissed
- **AND** the model list is loaded normally
- **AND** the application is ready for use

#### Scenario: Service already running
- **WHEN** application launches and Foundry Local service is already running
- **THEN** no startup delay occurs
- **AND** the model list loads immediately

---

### Requirement: Foundry Not Installed Handling
The application SHALL display actionable guidance when Foundry Local is not installed.

#### Scenario: startService fails due to not installed
- **WHEN** `startService()` fails because Foundry Local is not installed
- **THEN** a dialog displays explaining Foundry Local is required
- **AND** the dialog includes a link to https://github.com/microsoft/Foundry-Local/releases
- **AND** the dialog includes a copyable PowerShell installation command
- **AND** the dialog includes a "Retry" button

#### Scenario: User retries after installing
- **WHEN** user clicks "Retry" after installing Foundry Local
- **THEN** the application re-attempts `startService()`
- **AND** if successful, proceeds to load model list

---

### Requirement: Startup Timeout Handling
The application SHALL handle cases where the Foundry service fails to start within a reasonable time.

#### Scenario: Service startup times out
- **WHEN** `startService()` is called but service does not become available within 10 seconds
- **THEN** the loading indicator is dismissed
- **AND** an error dialog displays with troubleshooting guidance
- **AND** the dialog includes a "Retry" button
