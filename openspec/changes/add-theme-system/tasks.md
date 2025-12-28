# Tasks: Theme System Implementation

## 1. CSS Variable Refactoring
- [x] 1.1 Define CSS custom property tokens in `:root` selector
- [x] 1.2 Replace all hardcoded colors in existing CSS with variable references
- [x] 1.3 Add `.theme-cyberpunk` class with overridden color values
- [x] 1.4 Add `.theme-high-contrast` class with accessibility-focused values
- [x] 1.5 Ensure high contrast theme has 2px+ borders, no gradients/shadows

## 2. Theme Switcher UI
- [x] 2.1 Add theme selector dropdown in header (next to model selector)
- [x] 2.2 Style dropdown to match existing UI patterns
- [x] 2.3 Add theme icons or labels for each option
- [x] 2.4 Implement JavaScript to toggle body class on selection

## 3. Theme State Management
- [x] 3.1 Create `currentTheme` JavaScript variable (default: null for default theme)
- [x] 3.2 Add `setTheme(themeName)` function to apply theme class
- [x] 3.3 Ensure theme applies immediately without page reload

## 4. Accessibility Validation
- [x] 4.1 Verify high contrast theme meets WCAG 2.1 AA color contrast ratios
- [x] 4.2 Test all interactive elements are visible in high contrast mode
- [x] 4.3 Ensure focus indicators are clearly visible in all themes

## 5. Testing
- [ ] 5.1 Visual verification of default theme (unchanged from current)
- [ ] 5.2 Visual verification of cyberpunk theme
- [ ] 5.3 Visual verification of high contrast theme
- [ ] 5.4 Test theme switching between all three themes
- [ ] 5.5 Test theme resets to default on app restart
