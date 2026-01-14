## Context

PrivateGPT uses Foundry Local to run AI models locally. Currently, the application doesn't configure `max_tokens` in chat completion requests, leaving response length entirely to model defaults. Users have no visibility into or control over context window usage.

### Constraints
- Foundry Local SDK does not expose context window size in `FoundryModelInfo`
- Context limits vary significantly by model (4K to 128K+ tokens)
- Must work with any model users have downloaded
- Should not break existing functionality

### Stakeholders
- End users wanting longer/shorter responses
- Users with limited VRAM who need to manage context

## Goals / Non-Goals

### Goals
- Allow users to configure max response tokens
- Provide reasonable defaults for common scenarios
- Give users visibility into context usage (best effort)

### Non-Goals
- Automatic context window detection (not supported by SDK)
- Per-model configuration persistence (can be added later)
- Token-level precision for context tracking

## Decisions

### Decision 1: Use a configurable max_tokens slider
**What**: Add a slider/input in the UI header area to set max response tokens (128-4096, default 1024)

**Why**: Simple, direct control that maps 1:1 to the API parameter

**Alternatives considered**:
- Preset buttons (Short/Medium/Long) - Less flexible, arbitrary categories
- Auto-detect from model - Not possible with current SDK

### Decision 2: Static model context mapping
**What**: Maintain a known-models map with context sizes for popular Foundry models

**Why**: Enables showing "context remaining" estimate for common models

**Alternatives considered**:
- Query model config files - Complex, requires file system access
- User-configured context size - Added friction
- No context display - Less useful but simpler

**Hybrid approach**: Show context info when model is in known list, otherwise hide the indicator.

### Decision 3: Token estimation for context usage
**What**: Use character-based estimate (~4 chars per token) for context display

**Why**: Foundry Local has a tokenizer endpoint but calling it on every keystroke adds latency

**Trade-off**: Estimates may be off by 20-30% but provide useful guidance

## Implementation Approach

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  [Model Selector ▼] [Max Tokens: ──●── 1024] [Theme ▼]     │
│                     [Context: ~2.1K / 4K tokens]            │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│  Chat Messages                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Known Model Context Sizes
```javascript
const MODEL_CONTEXT_SIZES = {
  'phi-3-mini-4k': 4096,
  'phi-3-mini-128k': 131072,
  'phi-4-mini': 131072,
  'llama-3.2-1b': 131072,
  'llama-3.2-3b': 131072,
  'qwen2.5-0.5b': 32768,
  'qwen2.5-1.5b': 32768,
  'qwen2.5-3b': 32768,
  // Add more as needed
};
```

### Data Flow
1. User adjusts max_tokens slider → stored in renderer state
2. On send: pass `max_tokens` to `sendMessage` IPC call
3. main.js includes `max_tokens` in chat completions request
4. Response tokens counted in usage, displayed to user

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Unknown model context sizes | Hide context indicator for unknown models |
| Token estimation inaccurate | Label as "~approximate" in UI |
| Very long responses may timeout | Document typical limits, allow user to reduce |
| User sets max_tokens higher than model supports | Model will still respect its own limit |

## Migration Plan

1. Add max_tokens parameter (backward compatible - currently unused)
2. Add UI controls with sensible defaults
3. Existing users see new controls on next launch
4. No data migration needed

## Resolved Questions

1. **Should max_tokens persist across sessions?** No - resets to default on app restart (privacy focus)
2. **Should we show token usage after each response?** Yes - include context indicator
3. **Default value:** 2048 tokens
