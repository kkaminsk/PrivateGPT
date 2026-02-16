## NEW Requirements

### Requirement: .gitignore (L1)
The repository SHALL include a `.gitignore` file that excludes Node.js and Electron build artifacts.

#### Scenario: node_modules not committed
- **GIVEN** a developer runs `npm install`
- **WHEN** they run `git status`
- **THEN** `node_modules/` SHALL be listed as ignored

---

## MODIFIED Requirements

### Requirement: Fix tokens slider label (M5)
The max tokens slider label SHALL correctly read "Max:" instead of "Min:".

#### Scenario: Label matches control purpose
- **GIVEN** the user views the header controls
- **WHEN** they look at the tokens slider
- **THEN** the label SHALL read "Max:" indicating it controls maximum response tokens

---

### Requirement: Per-chunk error handling in stream (L4)
The stream processing loop SHALL handle individual chunk errors without losing the entire response.

#### Fix
Wrap chunk processing in try/catch within the `for await` loop.

#### Scenario: Partial response preserved on chunk error
- **GIVEN** a streaming response is in progress with content already received
- **WHEN** a single chunk fails to parse
- **THEN** previously received content SHALL be preserved and displayed
