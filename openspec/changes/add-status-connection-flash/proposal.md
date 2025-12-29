# Change: Add visual flash effect on model connection

## Why
Provide clear visual feedback when the application successfully connects to a model. A double inversion flash on the status bar draws user attention to the connection confirmation without being disruptive.

## What Changes
- Add CSS for inverted status bar styling (swapped background and text colors)
- Add JavaScript function to trigger double-flash animation sequence
- Modify model connection success handler to trigger the flash effect

## Impact
- Affected specs: `ui-feedback` (new capability)
- Affected code: `chat.html` (CSS styles and JavaScript)
