## Context
PrivateGPT requires Foundry Local to be installed and have at least one model cached before it can function. Currently, when Foundry is not installed, users see a modal dialog with installation instructions. However, users also need guidance on downloading their first model, and the current flow doesn't address the "no models" state.

## Goals / Non-Goals
- Goals:
  - Provide clear, step-by-step setup guidance for new users
  - Guide users through both Foundry installation AND model download
  - Allow users to verify each step before proceeding
  - Maintain theme consistency with existing UI
- Non-Goals:
  - Automatic installation (users must run commands manually)
  - Model selection during setup (uses recommended phi-3-mini-4k)
  - Progress tracking for model download (handled by Foundry CLI)

## Decisions

### Splash Screen vs Modal
- Decision: Full-screen splash instead of modal dialog
- Rationale: Setup is a blocking prerequisite; splash screen provides clearer focus and better UX for multi-step process

### Recommended Model
- Decision: Recommend `phi-3-mini-4k` as the default first model
- Rationale: Small download size, fast inference, good for getting started; users can download other models later via model selector

### Installation Method
- Decision: Use `winget install Microsoft.FoundryLocal` instead of MSIX manual download
- Rationale: Winget is simpler, handles dependencies, and is the standard Windows package manager

### Step Verification
- Decision: Manual "Check" buttons rather than automatic polling
- Rationale: Respects user control, reduces resource usage, clearer feedback loop

## Risks / Trade-offs
- Risk: Users may not have winget installed
  - Mitigation: Include fallback link to manual download page
- Risk: Model download can take several minutes
  - Mitigation: Clear messaging that download happens in Foundry CLI terminal, not in PrivateGPT

## UI Layout

```
+--------------------------------------------------+
|                   PrivateGPT                      |
|                  Setup Required                   |
+--------------------------------------------------+
|                                                  |
|  [ Step 1 ] -----> [ Step 2 ] -----> [ Step 3 ]  |
|   Install          Download           Ready       |
|   Foundry          a Model                        |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  Step 1: Install Foundry Local                   |
|                                                  |
|  Run this command in PowerShell or Terminal:     |
|  +--------------------------------------------+  |
|  | winget install Microsoft.FoundryLocal      |  |
|  +--------------------------------------------+  |
|                          [Copy] [Check Install]  |
|                                                  |
+--------------------------------------------------+
```

## Open Questions
- None currently
