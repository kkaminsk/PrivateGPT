# Change: Add Model-Based Context Configuration

## Why

Users currently have no control over response length or context handling. Different local models have varying context window sizes (4K, 8K, 32K+), but PrivateGPT sends requests without specifying `max_tokens`, leaving the model to use its defaults. This prevents users from:
1. Getting longer responses when their model supports it
2. Understanding why responses may be truncated
3. Managing context window usage for multi-turn conversations

## What Changes

- Display model context information (where available) in the UI
- Add a configurable `max_tokens` slider/input in the chat interface
- Pass `max_tokens` parameter to chat completion requests
- Provide sensible defaults based on common model configurations
- Add visual indicator showing approximate context usage

## Impact

- Affected specs: New `model-context` capability
- Affected code:
  - `main.js` - Pass `max_tokens` to OpenAI client, potentially expose model context info
  - `chat.html` - Add settings UI for max tokens control
  - `preload.cjs` - Expose new IPC methods if needed

## Technical Notes

**Limitation**: Foundry Local SDK does not expose context window size in model metadata (`FoundryModelInfo`). Options:
1. Maintain a static mapping of known model context sizes
2. Allow user to manually set expected context size
3. Use conservative defaults with option to override

The REST API supports both `max_tokens` and `max_completion_tokens` parameters - we should use `max_tokens` for broader compatibility.

## References

- [Foundry Local SDK Reference](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-local/reference/reference-sdk)
- [Foundry Local REST API Reference](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-local/reference/reference-rest)
