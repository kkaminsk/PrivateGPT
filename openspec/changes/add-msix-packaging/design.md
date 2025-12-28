# Design: MSIX Packaging with Foundry Local Dependency

## Context
PrivateGPT is an Electron app that requires Foundry Local to function. MSIX is the modern Windows packaging format but has strict dependency constraints—packages can only declare dependencies on packages from the same publisher or Microsoft framework packages.

**Stakeholders**: End users, IT administrators, Microsoft Store (potential future distribution)

**Constraints**:
- Foundry Local is published by Microsoft with a different certificate than PrivateGPT
- MSIX sandbox prevents installing other applications at runtime
- Enterprise deployments may require silent/automated installation

## Goals / Non-Goals

**Goals**:
- Package PrivateGPT as MSIX for modern Windows deployment
- Provide clear, actionable guidance when Foundry Local is missing
- Support enterprise deployment scenarios with optional bootstrapper

**Non-Goals**:
- Bundle Foundry Local inside PrivateGPT package (not feasible due to size/licensing)
- Declare Foundry Local as a formal MSIX dependency (different publishers)
- Automatic Foundry Local installation from within MSIX (sandbox prevents this)

## Decisions

### Decision 1: Use electron-builder AppX target
**What**: Configure `package.json` build section to use `appx` target instead of `nsis`
**Why**: Native MSIX support in electron-builder, well-documented, handles signing and manifest generation

### Decision 2: Enhanced runtime detection with actionable UI
**What**: When Foundry Local is not detected, show a modal dialog with:
- Clear explanation of the dependency
- Direct link to Foundry Local GitHub releases
- PowerShell command to install (copyable)
- Option to retry detection after installation

**Why**: Current implementation shows a simple error message. Users need actionable steps, not just an error.

### Decision 3: Optional bootstrapper for enterprise
**What**: Provide a separate PowerShell script (`Install-PrivateGPT.ps1`) that:
1. Checks for Foundry Local, installs if missing
2. Installs PrivateGPT MSIX
3. Supports silent mode for SCCM/Intune deployment

**Why**: Enterprise IT needs automated deployment. This script lives outside the MSIX and can perform privileged operations.

**Alternatives considered**:
- **MSIX Modification Package**: Rejected—requires same publisher certificate
- **Bundle as optional package**: Rejected—same publisher requirement
- **Electron auto-updater for Foundry**: Rejected—Foundry is a system-wide service, not app-scoped

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users may not install Foundry Local | Clear UI with one-click copy of install command |
| MSIX requires Windows 10 1809+ | Document minimum requirements; NSIS fallback possible |
| Code signing certificate required | Document signing process; allow unsigned for dev builds |
| Enterprise may block GitHub downloads | Bootstrapper can accept local path to Foundry MSIX |

## Migration Plan

1. Update `package.json` build configuration
2. Implement enhanced Foundry detection UI
3. Create bootstrapper script
4. Update README with new installation instructions
5. Test on clean Windows 10/11 machines

**Rollback**: Keep NSIS configuration commented in `package.json` for fallback

## Open Questions

- [ ] Should we support both MSIX and NSIS outputs simultaneously?
- [ ] What code signing certificate will be used for production builds?
- [ ] Should the bootstrapper be signed separately?
