## MODIFIED Requirements

### Requirement: No innerHTML for dynamic content (H2)
The renderer SHALL NOT use `innerHTML` to render any content derived from external sources (filenames, model names, user input, API responses).

#### Problem
Multiple locations in `chat.html` use `innerHTML` to render attachment chips, welcome screen updates, step status indicators, and SVG icons. Malicious filenames or model names could inject HTML/scripts.

#### Fix
Replace all `innerHTML` assignments with safe DOM construction:

1. **Attachment chips**: Use `createElement`/`textContent` for the filename span, and create SVG elements programmatically or use a reusable helper.
2. **Welcome screen update**: Use `textContent` and `createElement`.
3. **Step status**: Use `textContent` for messages, `createElement` for spinners.
4. **Step circle checkmarks**: Pre-create SVG elements and replace via `replaceChildren()`.
5. **Copy button**: Pre-create SVG elements in `addMessage`.

#### Scenario: Malicious filename is safely rendered
- **GIVEN** a file named `<img src=x onerror=alert(1)>.txt` is attached
- **WHEN** the attachment chip is rendered
- **THEN** the filename SHALL be displayed as literal text, not executed as HTML

#### Scenario: Model name with HTML is safely displayed
- **GIVEN** a model returns with name containing `<script>alert(1)</script>`
- **WHEN** the welcome screen updates to show the model name
- **THEN** the script tag SHALL be displayed as text, not executed

---

### Requirement: Document textContent security decision (M2)
The codebase SHALL include comments explaining that `textContent` is used intentionally for message rendering to prevent XSS.

#### Scenario: Security intent is documented
- **GIVEN** a developer reviews the chat message rendering code
- **WHEN** they see `messageContent.textContent = fullResponse`
- **THEN** a comment SHALL explain this is a security decision to prevent XSS from model output
