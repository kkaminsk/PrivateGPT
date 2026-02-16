## MODIFIED Requirements

### Requirement: Content Security Policy (H1)
The application SHALL enforce a Content Security Policy that restricts script execution, style sources, and network connections.

#### Problem
No CSP is configured. The renderer can execute arbitrary scripts from any source.

#### Fix
Add CSP via Electron session API in `main.js` before window creation:

```js
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'self'"]
    }
  })
})
```

#### Scenario: CSP blocks external scripts
- **GIVEN** the application is running with CSP enabled
- **WHEN** a script tag referencing an external URL is injected into the page
- **THEN** the browser SHALL block the script execution

---

### Requirement: Sandbox enabled (H3)
The BrowserWindow SHALL be created with `sandbox: true` in webPreferences.

#### Problem
`sandbox: false` gives the renderer broader Node.js access than necessary.

#### Fix
Change `sandbox: false` to `sandbox: true` in `main.js` BrowserWindow creation.

#### Scenario: Preload works with sandbox
- **GIVEN** sandbox is enabled in webPreferences
- **WHEN** the preload script runs
- **THEN** `contextBridge` and `ipcRenderer` SHALL be available and functional

---

### Requirement: IPC listener cleanup (M1)
Foundry lifecycle event listeners SHALL not accumulate across re-registrations.

#### Fix
In `chat.html`, call `window.mainAPI.removeAllFoundryListeners()` before registering new ones, or register only once.

#### Scenario: No duplicate listeners
- **GIVEN** the renderer has registered Foundry lifecycle listeners
- **WHEN** the page is not reloaded
- **THEN** each event SHALL have exactly one listener registered
