# Code Audit Report: PrivateGPT

**Date:** 2026-02-15  
**Auditor:** BHG-Bot (automated engineering review)  
**Scope:** Full codebase at `C:\Temp\GitHub\PrivateGPT\`

---

## Summary

PrivateGPT is a well-architected Electron desktop app for privacy-focused local AI chat. The security model (AES-256-GCM encryption, ephemeral storage, startup/shutdown purge) is thoughtfully designed. The codebase is clean and modular. Several issues were identified, primarily around Electron security hardening, frontend XSS vectors, and missing CSP.

| Severity | Count |
|----------|-------|
| 🔴 High | 3 |
| 🟡 Medium | 5 |
| 🟢 Low | 4 |

---

## 🔴 High Severity

### H1: No Content Security Policy (CSP)

**File:** `main.js` / `chat.html`  
**Issue:** The application loads `chat.html` without any Content Security Policy. There is no `<meta>` CSP tag and no CSP header set via `session.defaultSession.webRequest`. While the app loads local files only, the lack of CSP means any injected script (e.g., via a malicious model response rendered as HTML) would execute without restriction.  
**Impact:** XSS attacks could exfiltrate data or execute arbitrary code in the renderer process.  
**Recommendation:** Add a strict CSP via `session.defaultSession.webRequest.onHeadersReceived` in `main.js`:
```js
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'"]
    }
  })
})
```

### H2: XSS via innerHTML in renderer

**File:** `chat.html` (multiple locations)  
**Issue:** The renderer uses `innerHTML` in several places:
- Attachment chip rendering: `chip.innerHTML = \`<span>${att.name}</span>...\``
- Welcome screen update after model load: `welcomeScreen.innerHTML = ...`
- Setup step status: `statusEl.innerHTML = ...`
- Step circle checkmark updates: `step*Indicator.querySelector('.step-circle').innerHTML = ...`

While `att.name` comes from the file system (lower risk), the pattern is dangerous. If any model name or file name contains HTML, it will be rendered.  
**Impact:** Potential XSS if malicious filenames or model names are processed.  
**Recommendation:** Replace `innerHTML` with `textContent` where possible, or use DOM API (`createElement`/`appendChild`). For SVG icons, create helper functions that return DOM elements.

### H3: Sandbox disabled in BrowserWindow

**File:** `main.js` (line: `sandbox: false`)  
**Issue:** The BrowserWindow is created with `sandbox: false`. While this is needed for the preload script to use `require()` (CommonJS), Electron recommends enabling sandbox for security. The preload script uses CommonJS (`preload.cjs`) specifically to work without sandbox — but it doesn't actually need Node.js APIs beyond `contextBridge` and `ipcRenderer`, which work in sandboxed mode.  
**Impact:** Renderer process has broader access to Node.js internals than necessary.  
**Recommendation:** Enable `sandbox: true` in webPreferences. The preload script only uses `contextBridge` and `ipcRenderer` from Electron, which are available in sandboxed preload scripts. Test to confirm compatibility.

---

## 🟡 Medium Severity

### M1: Listener leak potential in preload IPC bridge

**File:** `preload.cjs`  
**Issue:** The `onChatChunk`, `onFoundryReady`, etc. functions call `ipcRenderer.on()` which adds a new listener each time. While `removeAllChatListeners` exists and is called before each `sendMessage`, the Foundry lifecycle listeners (`onFoundryStarting`, `onFoundryReady`, etc.) are registered in `DOMContentLoaded` and never cleaned up. If the renderer re-initializes, listeners accumulate.  
**Impact:** Memory leak and duplicate event handling in edge cases.  
**Recommendation:** Ensure all `on*` registration functions check for existing listeners or use `ipcRenderer.once()` for events that fire only once (like `foundry-ready`).

### M2: No input sanitization on model responses

**File:** `chat.html` (sendMessage flow)  
**Issue:** Model responses are streamed via `chat-chunk` and set via `messageContent.textContent = fullResponse`. While `textContent` is safe from XSS, the copy button SVG is inserted via `innerHTML` in `addMessage()`. If the code is ever refactored to use `innerHTML` for message content (e.g., for markdown rendering), it would be vulnerable.  
**Impact:** Low risk currently, but fragile against future changes.  
**Recommendation:** Add a comment documenting that `textContent` is intentionally used for security, and add a lint rule or test to prevent `innerHTML` for user/model content.

### M3: Synchronous file I/O in file-processor.js

**File:** `file-processor.js`  
**Issue:** `processFile` is declared `async` but uses synchronous `fs` methods: `fs.existsSync`, `fs.statSync`, `fs.openSync`, `fs.readSync`, `fs.closeSync`, `fs.readFileSync`. These block the main process event loop during file reads.  
**Impact:** UI freeze when processing large files (up to 10MB images).  
**Recommendation:** Replace with async equivalents: `fs.promises.stat`, `fs.promises.readFile`, `fs.promises.access`.

### M4: No rate limiting on IPC calls

**File:** `main.js`  
**Issue:** There is no rate limiting on IPC handlers. A compromised renderer could spam `send-message`, `attach-file`, or other handlers. While the app is local-only, defense-in-depth is appropriate for a security-focused application.  
**Impact:** Resource exhaustion if renderer is compromised.  
**Recommendation:** Add basic rate limiting or request queuing to the `send-message` handler (e.g., reject if a request is already in-flight).

### M5: Max tokens slider label says "Min" instead of "Max"

**File:** `chat.html`  
**Issue:** The label for the max tokens slider reads `<span class="max-tokens-label">Min:</span>` but the slider controls `max_tokens` (the maximum tokens for AI response). This is misleading.  
**Impact:** User confusion about the control's purpose.  
**Recommendation:** Change label to `Max:` or `Tokens:`.

---

## 🟢 Low Severity

### L1: No `.gitignore` file

**Issue:** No `.gitignore` exists. `node_modules/`, `dist/`, and any build artifacts could be accidentally committed.  
**Recommendation:** Add `.gitignore` with standard Node.js/Electron entries.

### L2: `package.json` missing `author` field

**File:** `package.json`  
**Issue:** The `author` field is empty. For an enterprise-deployed application, this should identify the maintainer.  
**Recommendation:** Add author information.

### L3: Hardcoded system prompt

**File:** `chat.html`  
**Issue:** The system prompt `'You are a helpful AI assistant. Be concise and helpful.'` is hardcoded in the renderer. This should be configurable or at least defined as a constant in the main process.  
**Impact:** Users cannot customize AI behavior without editing source.  
**Recommendation:** Move system prompt to a configuration constant or make it editable in the UI.

### L4: No error boundary for stream processing

**File:** `main.js` (`sendMessage`)  
**Issue:** The `for await` loop over the stream has no per-chunk error handling. If a single chunk fails to parse, the entire stream is lost. The outer try/catch handles this, but the user gets no partial response.  
**Impact:** Lost responses on transient stream errors.  
**Recommendation:** Wrap the chunk processing in a try/catch within the loop, logging errors but continuing to process remaining chunks.

---

## Security Assessment

| Area | Rating | Notes |
|------|--------|-------|
| Encryption | ✅ Strong | AES-256-GCM with random IVs, secure key generation |
| Memory management | ✅ Strong | Buffer zeroing, purge on shutdown |
| IPC security | ⚠️ Needs work | Context isolation ✅, but sandbox disabled, no CSP |
| XSS prevention | ⚠️ Needs work | `textContent` used for messages (good), but `innerHTML` used elsewhere |
| Dependency security | ✅ Good | Minimal dependencies (3 runtime + 2 dev) |
| File handling | ✅ Good | Extension whitelist, size limits, no path traversal |
| API key handling | ✅ Good | API key from Foundry SDK, not user-supplied, not persisted |

---

## Testing Assessment

| Area | Coverage | Notes |
|------|----------|-------|
| Encryption | ✅ Thorough | 14 tests covering encrypt/decrypt/purge |
| File processing | ✅ Thorough | 15 tests covering all file types and edge cases |
| Integration | ✅ Good | 9 tests covering end-to-end flows |
| Main process | ❌ None | IPC handlers, Foundry lifecycle untested |
| Renderer | ❌ None | No UI/DOM tests |
| Purge module | ⚠️ Partial | Only signature matching tested, not actual purge |

---

## Recommendations Summary

| # | Action | Severity | Effort |
|---|--------|----------|--------|
| H1 | Add Content Security Policy | High | 15 min |
| H2 | Replace innerHTML with safe DOM APIs | High | 30 min |
| H3 | Enable sandbox in BrowserWindow | High | 10 min |
| M1 | Fix listener leak in preload | Medium | 10 min |
| M2 | Document textContent security decision | Medium | 5 min |
| M3 | Convert sync file I/O to async | Medium | 20 min |
| M4 | Add send-message rate limiting | Medium | 10 min |
| M5 | Fix "Min" label to "Max" | Medium | 1 min |
| L1 | Add .gitignore | Low | 2 min |
| L2 | Add author to package.json | Low | 1 min |
| L3 | Make system prompt configurable | Low | 10 min |
| L4 | Add per-chunk error handling in stream | Low | 5 min |
