# Design: MSIX Packaging with Foundry Local Auto-Start

## Context
PrivateGPT is an Electron app that requires Foundry Local to function. MSIX is the modern Windows packaging format but has strict dependency constraints—packages can only declare dependencies on packages from the same publisher or Microsoft framework packages.

The `foundry-local-sdk` provides service management methods:
- `isServiceRunning()` → `Promise<boolean>`
- `startService()` → `Promise<void>`
- `init(modelId)` → `Promise<void>`

**Stakeholders**: End users, IT administrators, Microsoft Store (potential future distribution)

**Constraints**:
- Foundry Local is published by Microsoft with a different certificate than PrivateGPT
- MSIX sandbox prevents installing other applications at runtime
- Enterprise deployments may require silent/automated installation

## Goals / Non-Goals

**Goals**:
- Package PrivateGPT as MSIX for modern Windows deployment
- Automatically start Foundry Local service if installed but not running
- Provide clear, actionable guidance when Foundry Local is not installed
- Support enterprise deployment scenarios with optional bootstrapper

**Non-Goals**:
- Bundle Foundry Local inside PrivateGPT package (not feasible due to size/licensing)
- Declare Foundry Local as a formal MSIX dependency (different publishers)
- Install Foundry Local from within MSIX (sandbox prevents this)
- Handle Foundry service crashes during runtime (only startup)

## Decisions

### Decision 1: Use electron-builder AppX target
**What**: Configure `package.json` build section to use `appx` target instead of `nsis`
**Why**: Native MSIX support in electron-builder, well-documented, handles signing and manifest generation

### Decision 2: Auto-start Foundry service on launch
**What**: Implement startup flow:
```
App Launch → isServiceRunning()?
               ├─ Yes → Load models, ready
               └─ No  → startService()
                          ├─ Success → Load models, ready
                          └─ Failure → Show install dialog
```
**Why**: Eliminates manual service management; `startService()` fails gracefully if not installed

### Decision 3: Loading state UI during startup
**What**: Show "Starting Foundry Local..." indicator during service startup
**Why**: Service startup may take 2-5 seconds; users need feedback

### Decision 4: Retry with timeout
**What**: Retry `isServiceRunning()` up to 3 times with 1-second delays after `startService()`
**Why**: Service may take a moment to fully initialize after start command

### Decision 5: Optional bootstrapper for enterprise
**What**: Provide `Install-PrivateGPT.ps1` that:
1. Checks for Foundry Local, installs if missing
2. Installs PrivateGPT MSIX
3. Supports silent mode for SCCM/Intune deployment

**Why**: Enterprise IT needs automated deployment. Script lives outside MSIX.

**Alternatives considered**:
- **MSIX Modification Package**: Rejected—requires same publisher certificate
- **Always call startService()**: Rejected—unnecessary if already running
- **Prompt user to start manually**: Rejected—poor UX when we can auto-start

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `startService()` may require elevated permissions | Test on standard user accounts; document if admin needed |
| Service startup adds latency to app launch | Show loading indicator; startup is one-time per session |
| MSIX requires Windows 10 1809+ | Document minimum requirements; NSIS fallback possible |
| Code signing certificate required | Document signing process; allow unsigned for dev builds |
| Enterprise may block GitHub downloads | Bootstrapper can accept local path to Foundry MSIX |

## Migration Plan

1. Update `package.json` build configuration for MSIX
2. Implement `ensureFoundryRunning()` with auto-start logic
3. Add loading overlay and error dialog UI
4. Create bootstrapper script
5. Update README with new installation instructions
6. Test on clean Windows 10/11 machines

**Rollback**: Keep NSIS configuration commented in `package.json` for fallback

## Open Questions

- [ ] Should we support both MSIX and NSIS outputs simultaneously?
- [ ] What code signing certificate will be used for production builds?
- [ ] Does `startService()` require admin privileges on Windows?
- [ ] What's the typical startup time for Foundry Local service?
