## 1. Implementation
- [x] 1.1 Add CSS class `.status-bar.inverted` that swaps background and text colors
- [x] 1.2 Add CSS transition for smooth color change (optional, enhances effect) - Skipped: instant swap better suits "flash" effect
- [x] 1.3 Create `flashStatusBar()` JavaScript function implementing double-flash sequence
- [x] 1.4 Call `flashStatusBar()` after successful model connection in `modelSelector` change handler

## 2. Testing
- [ ] 2.1 Manual test: Connect to model and verify double-flash occurs
- [ ] 2.2 Manual test: Verify flash works correctly with all three themes (Default, Cyberpunk, High Contrast)
- [ ] 2.3 Manual test: Verify timing (500ms invert, 500ms normal, 500ms invert, then normal)
