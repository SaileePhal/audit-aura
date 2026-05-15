# LM Studio Response Parsing Fix

## Issue

LM Studio (using `google/gemma-4-e2b` model) was returning JSON responses wrapped in markdown code blocks, which the extraction code couldn't parse:

```json
{
  "choices": [
    {
      "message": {
        "content": "```json\n{\"controls\": [...]}\n```"
      }
    }
  ]
}
```

The response also included a `reasoning_content` field with additional text that wasn't part of the JSON structure.

## Root Cause

The original `_extract_with_lm_studio()` method only attempted direct JSON parsing, which failed when the content was wrapped in markdown code blocks (` ```json ... ``` `).

## Solution

Enhanced the parsing logic in [`backend/core/extraction/extractor.py`](../../backend/core/extraction/extractor.py) with multiple fallback strategies:

### Parsing Strategies (in order)

1. **Direct JSON Parse**: Try parsing the content as-is
   - Works for clean JSON responses
   
2. **Remove Markdown Code Blocks**: Strip ` ```json ` and ` ``` ` markers, then parse
   - **This strategy successfully handles the LM Studio response format**
   - Uses regex: `r'```(?:json)?\s*|\s*```'`
   
3. **Regex Extract (Specific)**: Find JSON object with "controls" key
   - Pattern: `r'\{[^{}]*"controls"[^{}]*\[.*?\]\s*\}'`
   
4. **Regex Extract (Broad)**: Find any JSON object
   - Pattern: `r'\{.*\}'`

## Test Results

Created [`test_lm_studio_parsing.py`](../../tests/test_lm_studio_parsing.py) to verify the fix:

```
Strategy 1: Direct JSON parse - ✗ FAILED
Strategy 2: Remove markdown code blocks - ✓ SUCCESS (2 controls extracted)
```

The fix successfully extracts controls from LM Studio responses that include:
- Markdown code block wrappers
- Additional fields like `reasoning_content`
- Nested JSON structures

## Implementation Details

### Code Changes

Modified `_extract_with_lm_studio()` method in [`backend/core/extraction/extractor.py`](../../backend/core/extraction/extractor.py:131-230):

```python
# Strategy 2: Remove markdown code blocks and retry
if not controls:
    try:
        # Remove markdown code blocks (```json ... ``` or ``` ... ```)
        cleaned = re.sub(r'```(?:json)?\s*|\s*```', '', content)
        cleaned = cleaned.strip()
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict) and 'controls' in parsed:
            controls = parsed['controls']
            logger.debug(f"Strategy 2 success: Found {len(controls)} controls")
        elif isinstance(parsed, list):
            controls = parsed
            logger.debug(f"Strategy 2 success: Direct array with {len(controls)} controls")
    except json.JSONDecodeError as e:
        logger.debug(f"Strategy 2 failed: {e}")
```

### Benefits

1. **Robust Parsing**: Handles multiple response formats from different LLM providers
2. **Detailed Logging**: Each strategy logs success/failure for debugging
3. **Graceful Fallback**: Tries multiple strategies before failing
4. **Backward Compatible**: Still works with clean JSON responses

## Configuration

LM Studio extraction is controlled by environment variables in [`.env`](../../.env):

```bash
LM_STUDIO_ENABLED=true
LM_STUDIO_HOST=http://localhost:1234
LM_STUDIO_MODEL=google/gemma-4-e2b
```

## Related Files

- [`backend/core/extraction/extractor.py`](../../backend/core/extraction/extractor.py) - Main extraction logic
- [`test_lm_studio_parsing.py`](../../tests/test_lm_studio_parsing.py) - Test script
- [`docs/technical/LM_STUDIO_INTEGRATION.md`](./LM_STUDIO_INTEGRATION.md) - LM Studio setup guide

## Testing

To test the parsing with your own LM Studio response:

```bash
python3 tests/test_lm_studio_parsing.py
```

To test full PDF extraction with LM Studio:

```bash
python3 tests/test_lm_studio_integration.py
```

## Status

✅ **FIXED** - LM Studio responses with markdown code blocks are now parsed correctly.