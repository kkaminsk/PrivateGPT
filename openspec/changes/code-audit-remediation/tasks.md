## 1. Electron Security Hardening (High Severity)

- [ ] 1.1 Add CSP via `session.defaultSession.webRequest.onHeadersReceived` in `main.js` — **15 min**
- [ ] 1.2 Enable `sandbox: true` in BrowserWindow webPreferences — **10 min**
- [ ] 1.3 Fix IPC listener leak: use `once()` for one-time Foundry events in preload — **10 min**

## 2. XSS Hardening (High Severity)

- [ ] 2.1 Replace `innerHTML` in attachment chip rendering with DOM API — **10 min**
- [ ] 2.2 Replace `innerHTML` in welcome screen update with DOM API — **10 min**
- [ ] 2.3 Replace `innerHTML` in setup step status with DOM API — **5 min**
- [ ] 2.4 Replace `innerHTML` in step circle checkmark updates with DOM API — **5 min**
- [ ] 2.5 Add security comment documenting `textContent` for message content — **2 min**

## 3. File Processing & Rate Limiting (Medium Severity)

- [ ] 3.1 Convert `fs.existsSync`/`fs.statSync` to `fs.promises.access`/`fs.promises.stat` — **10 min**
- [ ] 3.2 Convert `fs.openSync`/`fs.readSync`/`fs.closeSync` to `fs.promises.readFile` with length limit — **10 min**
- [ ] 3.3 Convert `fs.readFileSync` in image processing to `fs.promises.readFile` — **5 min**
- [ ] 3.4 Add in-flight guard to `send-message` IPC handler — **10 min**

## 4. Repo Hygiene (Low Severity)

- [ ] 4.1 Create `.gitignore` with Node.js/Electron entries — **2 min**
- [ ] 4.2 Add author field to `package.json` — **1 min**
- [ ] 4.3 Fix "Min:" label to "Max:" on tokens slider in `chat.html` — **1 min**
- [ ] 4.4 Add per-chunk try/catch in stream processing loop in `main.js` — **5 min**

## 5. Validation

- [ ] 5.1 Run `npm test` to confirm all 48 tests pass — **2 min**
- [ ] 5.2 Manual smoke test: launch app, verify CSP headers present — **5 min**
