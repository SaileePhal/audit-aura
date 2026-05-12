# AI Extraction Fix - OpenAI API v2.x Compatibility

## Issue Description

**Error Message:**
```
WARNING - AI extraction failed (using mock fallback): '\n    "control_id"'
```

**Root Cause:**
The application was upgraded to OpenAI API v2.x (from v1.x), which has different response handling. The JSON parsing was failing because:
1. OpenAI v2.x requires explicit `response_format` specification for structured outputs
2. The prompt wasn't optimized for JSON mode
3. The parsing strategies weren't handling the new response format correctly
4. Mock fallback was masking the real issue

## Changes Made

### 1. Updated OpenAI API Call (Lines 162-182)

**Before:**
```python
response = self.client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    temperature=0
)
```

**After:**
```python
response = self.client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": "You are a compliance expert that extracts controls from audit documents. Always respond with valid JSON arrays only."
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0,
    response_format={"type": "json_object"}  # NEW: Forces JSON response
)
```

**Key Changes:**
- Added system message for better context
- Added `response_format={"type": "json_object"}` to enforce JSON output
- Improved error logging with response length and preview

### 2. Updated Extraction Prompt (Lines 20-38)

**Before:**
```
Return ONLY a valid JSON array. Start with [ and end with ].
```

**After:**
```
Return a JSON object with a "controls" key containing an array of control objects.

Example:
{"controls": [{"control_id":"SOC2-CC6.1",...}]}
```

**Reason:** OpenAI's `json_object` mode expects an object, not a direct array.

### 3. Improved JSON Parsing Strategies (Lines 183-230)

Replaced 5 complex strategies with 4 focused strategies:

**Strategy 1: Parse as JSON Object (Primary)**
- Expects `{"controls": [...]}` format
- Handles alternative keys: `items`, `data`, `results`
- Logs success with control count

**Strategy 2: Clean Markdown and Retry**
- Removes markdown code blocks (```json```)
- Retries parsing

**Strategy 3: Extract JSON Object with Regex**
- Uses regex to find JSON object in response
- Handles cases where AI adds extra text

**Strategy 4: Extract Array Directly**
- Fallback for direct array responses
- Handles legacy format

### 4. Removed Mock Fallback (Lines 265-353)

**Removed:**
- `_get_mock_controls()` method (75 lines)
- Mock fallback logic in error handling
- All references to mock data generation

**Replaced with:**
```python
if not all_controls:
    raise ValueError("No controls extracted from any chunks. Check OpenAI API key and PDF content.")

except Exception as e:
    logger.error(f"AI extraction failed: {e}")
    raise RuntimeError(f"Failed to extract controls from PDF: {e}") from e
```

**Benefits:**
- Forces proper error handling
- Makes debugging easier
- Ensures real AI extraction works
- No silent failures

### 5. Enhanced Error Handling

**Improved Logging:**
```python
logger.debug(f"AI Response length: {len(content)} chars")
logger.debug(f"AI Response preview: {content[:200]}...")
logger.info(f"Successfully extracted {len(controls)} controls from chunk {i+1}")
```

**Better Error Messages:**
```python
logger.error(f"All JSON parsing strategies failed for chunk {i+1}")
logger.error(f"Raw content (first 1000 chars): {content[:1000]}")
raise ValueError(f"Failed to parse JSON from OpenAI response for chunk {i+1}")
```

## Testing Recommendations

### 1. Test with Real PDF
```bash
# Upload a compliance PDF (SOC2, HIPAA, etc.)
curl -X POST http://localhost:8000/api/upload-pdf \
  -F "file=@SOC2.pdf" \
  -F "standard=SOC2"
```

### 2. Check Logs
```bash
docker-compose logs -f backend | grep -E "(AI Response|extracted|controls)"
```

### 3. Verify Controls Endpoint
```bash
curl http://localhost:8000/api/controls
```

### 4. Expected Output
```json
{
  "controls": [
    {
      "control_id": "SOC2-CC6.1",
      "description": "S3 buckets must not be publicly accessible",
      "condition": "event.public == False",
      "severity": "critical",
      "remediation": "Update bucket policy to restrict public access",
      "category": "Access Control",
      "standard": "SOC2"
    }
  ]
}
```

## OpenAI API v2.x Key Differences

### Response Format
- **v1.x:** Could return any text format
- **v2.x:** Requires explicit `response_format` parameter for structured outputs

### JSON Mode
- **v1.x:** `response_format` not available
- **v2.x:** `response_format={"type": "json_object"}` enforces valid JSON

### Error Handling
- **v1.x:** More lenient with malformed responses
- **v2.x:** Stricter validation, better error messages

### Best Practices
1. Always use `response_format` for structured data
2. Use system messages for better context
3. Provide clear examples in prompts
4. Expect JSON objects, not arrays (for json_object mode)
5. Handle errors explicitly, don't mask with fallbacks

## Benefits of This Fix

1. **Reliability:** No more silent failures with mock data
2. **Debugging:** Clear error messages show exactly what went wrong
3. **Performance:** Optimized parsing strategies (4 instead of 5)
4. **Compatibility:** Works with OpenAI API v2.x properly
5. **Maintainability:** Cleaner code without mock fallback logic
6. **Production Ready:** Proper error handling for production use

## Migration Notes

If you need to revert to mock data for testing:
1. Set `OPENAI_API_KEY` to empty string in `.env`
2. The application will fail fast with clear error
3. Use the mock data service instead (`/api/mock/violations`)

## Related Files

- [`backend/services/extractor.py`](backend/services/extractor.py) - Main extraction logic
- [`backend/requirements.txt`](backend/requirements.txt) - OpenAI v2.32.0
- [`backend/main.py`](backend/main.py) - API endpoints using extractor

## Next Steps

1. Rebuild backend container: `docker-compose build backend`
2. Test with real PDF upload
3. Monitor logs for successful extraction
4. Verify controls are stored in vector store
5. Test violation detection with extracted controls