## Why

An automated engineering audit ([CodeAudit.md](../../../CodeAudit.md)) of the PrivateGPT application identified 12 issues across high, medium, and low severity. Three high-severity issues — missing CSP, innerHTML XSS vectors, and disabled sandbox — represent significant security gaps for a privacy-focused application. This change proposal remediates all actionable findings.

## What Changes

- **Fix**: Add Content Security Policy via Electron session headers (H1)
- **Fix**: Replace all `innerHTML` usage with safe DOM APIs (H2)
- **Fix**: Enable sandbox mode in BrowserWindow webPreferences (H3)
- **Fix**: Address listener leak potential in preload IPC bridge (M1)
- **Fix**: Convert synchronous file I/O to async in file-processor.js (M3)
- **Fix**: Add send-message rate limiting (M4)
- **Fix**: Correct "Min" label to "Max" on tokens slider (M5)
- **New**: Add `.gitignore` for Node.js/Electron project (L1)
- **Fix**: Add author field to package.json (L2)
- **Fix**: Add per-chunk error handling in stream processing (L4)
- **Docs**: Document textContent security decision (M2)

## Capabilities

### Modified Capabilities
- `electron-security`: CSP, sandbox, IPC listener management (H1, H3, M1)
- `xss-hardening`: Replace innerHTML with safe DOM APIs across renderer (H2, M2)
- `file-processing`: Async I/O and rate limiting (M3, M4)
- `repo-hygiene`: gitignore, package.json metadata, label fix (L1, L2, M5, L4)

## Impact

- **Risk reduction**: Eliminates three high-severity security vulnerabilities
- **Breaking changes**: None — all changes are internal security hardening
- **Effort**: ~2 hours total across all remediations
- **Dependencies**: No new dependencies
