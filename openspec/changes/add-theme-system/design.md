# Design: Theme System Architecture

## Context
PrivateGPT currently has hardcoded colors throughout the CSS. To support multiple themes, we need to refactor to use CSS custom properties and implement a theme switching mechanism.

**Constraints**:
- Must maintain privacy model (no persistent storage across sessions)
- Must be accessible (WCAG 2.1 AA compliance for high contrast theme)
- Must not require page reload to switch themes
- Single HTML file architecture (no separate CSS files)

## Goals / Non-Goals

**Goals**:
- Implement CSS custom property-based theming
- Create three distinct themes with clear visual identity
- Add unobtrusive theme switcher in header
- Ensure high contrast theme meets accessibility standards

**Non-Goals**:
- Custom theme editor
- Theme import/export
- Persist theme preference across sessions (violates privacy model)
- Dark mode system preference detection (explicit user choice preferred)

## Decisions

### Decision 1: CSS Custom Properties for Theming
**What**: Define all colors as CSS custom properties on `:root`, override in theme classes
**Why**: Native browser support, no JavaScript needed for color changes, easy to maintain

```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --accent-primary: #4ade80;
  --text-primary: #f0f0f0;
  /* ... */
}

.theme-cyberpunk {
  --accent-primary: #ff00ff;
  /* ... */
}

.theme-high-contrast {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* ... */
}
```

### Decision 2: Theme Switcher Location
**What**: Add dropdown/button group next to model selector in header
**Why**: Visible but not intrusive, consistent with existing UI patterns

### Decision 3: Theme Persistence
**What**: Store in JavaScript variable only (not localStorage)
**Why**: Respects privacy model - theme resets on app close. Users expect to customize on each launch.

**Alternative considered**: localStorage persistence
- Rejected: Would persist data across sessions, violating ephemeral storage principle

### Decision 4: Color Palette Definitions

**Default (Privacy Green)**:
- Background: Dark blue-gray (#1a1a2e, #16213e)
- Accent: Green (#4ade80)
- Text: Light gray (#f0f0f0)

**Cyberpunk**:
- Background: Deep black/purple (#0a0a0f, #1a0a2e)
- Accent: Neon magenta/cyan (#ff00ff, #00ffff)
- Text: White with subtle glow effect

**High Contrast**:
- Background: Pure white (#ffffff)
- Accent: Black (#000000)
- Text: Black (#000000)
- Borders: Thick black (2px+)
- No gradients, no transparency, no shadows

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| CSS variable support | All modern browsers support; Electron uses Chromium |
| Increased CSS size | Minimal overhead (~2KB for theme definitions) |
| High contrast may look harsh | Designed specifically for accessibility, not aesthetics |
| Theme choice not persisted | Document in UI that theme resets on close |

## Color Token Map

| Token | Default | Cyberpunk | High Contrast |
|-------|---------|-----------|---------------|
| --bg-primary | #1a1a2e | #0a0a0f | #ffffff |
| --bg-secondary | #16213e | #1a0a2e | #ffffff |
| --bg-surface | rgba(20,20,35,0.95) | rgba(10,10,20,0.95) | #ffffff |
| --accent-primary | #4ade80 | #ff00ff | #000000 |
| --accent-secondary | #86efac | #00ffff | #333333 |
| --text-primary | #f0f0f0 | #ffffff | #000000 |
| --text-secondary | #a0a0a0 | #c0c0ff | #333333 |
| --border-color | #4ade8060 | #ff00ff60 | #000000 |
| --error | #f87171 | #ff4444 | #cc0000 |
| --warning | #fbbf24 | #ffaa00 | #996600 |
