# Change: Add Theme System with Cyberpunk and High Contrast Themes

## Why
Users have different visual preferences and accessibility needs. The current dark green theme is fixed and may not suit all users. Adding theme support improves:
- **Accessibility**: High contrast theme for users with visual impairments
- **Personalization**: Cyberpunk theme for users who prefer a more vibrant aesthetic
- **User experience**: Ability to switch themes without restarting the app

## What Changes
- Refactor existing CSS to use CSS custom properties (variables) for colors
- Add theme switcher UI in the header
- Implement three themes:
  1. **Default (Privacy Green)**: Current dark theme with green accents
  2. **Cyberpunk**: Dark theme with neon pink/purple/cyan accents
  3. **High Contrast**: White background with black text, maximum contrast for accessibility
- Persist theme preference in localStorage (memory-only, cleared on app close per privacy model)

## Impact
- Affected specs: New `theming` capability
- Affected code: `chat.html` (CSS refactoring, theme switcher UI, JavaScript)
- No breaking changes - default theme matches current appearance
- No new dependencies required
