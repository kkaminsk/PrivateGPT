## MODIFIED Requirements

### Requirement: Async file I/O (M3)
The FileProcessor SHALL use asynchronous file system APIs to avoid blocking the main process event loop.

#### Problem
`file-processor.js` uses synchronous `fs` methods (`existsSync`, `statSync`, `openSync`, `readSync`, `closeSync`, `readFileSync`) inside `async` functions. These block the event loop during file reads, causing UI freezes for large files (up to 10MB images).

#### Fix
Replace all sync calls with `fs.promises` equivalents:
- `fs.existsSync` → `fs.promises.access`
- `fs.statSync` → `fs.promises.stat`
- `fs.openSync`/`readSync`/`closeSync` → `fs.promises.readFile` with `length` option or `filehandle.read`
- `fs.readFileSync` → `fs.promises.readFile`

#### Scenario: Large image does not block event loop
- **GIVEN** a 9MB image file is being processed
- **WHEN** `processFile` is called
- **THEN** the main process event loop SHALL remain responsive during file reading

---

### Requirement: Send-message rate limiting (M4)
The `send-message` IPC handler SHALL reject concurrent requests while one is in-flight.

#### Fix
Add an `isProcessing` flag in `main.js` that is set before calling the AI API and cleared in the finally block.

#### Scenario: Concurrent send rejected
- **GIVEN** a message is currently being processed
- **WHEN** another `send-message` IPC call arrives
- **THEN** the handler SHALL return `{ success: false, error: 'A message is already being processed' }`
