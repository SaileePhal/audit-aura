# LM Studio Integration for PDF Compliance Extraction

## Overview

This document describes the integration of LM Studio (running google/gemma-2-9b) as the primary PDF extraction method for compliance controls, with OpenAI as a fallback.

## Architecture

### Extraction Priority Chain

1. **LM Studio (Primary)** - Local model via LM Studio API
   - Model: `google/gemma-2-9b`
   - Endpoint: `http://localhost:1234/v1/chat/completions`
   - Context window: 4000 characters per chunk
   - Timeout: 120 seconds

2. **OpenAI (Secondary Fallback)** - Cloud API
   - Model: `gpt-4o-mini`
   - Used when LM Studio fails or is unavailable
   - Timeout: Default

3. **Ollama (Tertiary Fallback)** - Local LLM
   - Model: `tinyllama`
   - Used when both LM Studio and OpenAI fail
   - Context window: 2000 characters per chunk

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# LM Studio Configuration (primary local LLM)
LM_STUDIO_HOST=http://localhost:1234
LM_STUDIO_MODEL=google/gemma-2-9b
LM_STUDIO_ENABLED=true

# OpenAI Configuration (fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Ollama Configuration (for local LLM fallback)
OLLAMA_HOST=http://ollama:11434
```

### Configuration Fields

The following fields were added to [`backend/config.py`](../../backend/config.py):

- `lm_studio_host`: LM Studio API endpoint (default: `http://localhost:1234`)
- `lm_studio_model`: Model name (default: `google/gemma-2-9b`)
- `lm_studio_enabled`: Enable/disable LM Studio (default: `true`)

## Implementation Details

### Modified Files

1. **[`backend/config.py`](../../backend/config.py)**
   - Added LM Studio configuration fields
   - Added environment variable loading for LM Studio settings

2. **[`backend/services/extractor.py`](../../backend/services/extractor.py)**
   - Added `_check_lm_studio()` method to verify LM Studio availability
   - Added `_extract_with_lm_studio()` method for extraction using LM Studio
   - Modified `__init__()` to accept LM Studio configuration
   - Updated `_extract_controls_with_ai()` to prioritize LM Studio

3. **[`backend/main.py`](../../backend/main.py)**
   - Updated `ComplianceExtractor` initialization to pass LM Studio config

4. **[`.env.example`](.env.example)**
   - Added LM Studio configuration examples

### Extraction Flow

```
PDF Upload
    ↓
Extract Text (PyPDF2/pdfplumber)
    ↓
Split into Chunks (4000 chars for LM Studio)
    ↓
For each chunk:
    ├─→ Try LM Studio
    │   ├─→ Success? → Use controls
    │   └─→ Failed? → Try OpenAI
    │       ├─→ Success? → Use controls
    │       └─→ Failed? → Try Ollama
    │           ├─→ Success? → Use controls
    │           └─→ Failed? → Error
    ↓
Deduplicate controls by control_id
    ↓
Return unique controls
```

## LM Studio Setup

### Prerequisites

1. Install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
2. Download the `google/gemma-2-9b` model in LM Studio
3. Start the local server in LM Studio (default port: 1234)

### Verification

Check if LM Studio is running:

```bash
curl http://localhost:1234/v1/models
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "google/gemma-2-9b",
      ...
    }
  ]
}
```

## API Compatibility

LM Studio uses an OpenAI-compatible API, so the integration uses the same request format:

```python
POST http://localhost:1234/v1/chat/completions
{
  "model": "google/gemma-2-9b",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.1,
  "max_tokens": 2000,
  "response_format": {"type": "json_object"}
}
```

## Error Handling

### LM Studio Unavailable
- Logs warning: `"LM Studio not available at {host}"`
- Falls back to OpenAI automatically

### LM Studio Extraction Failed
- Logs error: `"LM Studio extraction failed: {error}"`
- Falls back to OpenAI automatically

### All Methods Failed
- Raises `RuntimeError`: `"Failed to extract controls from PDF"`
- Returns empty list to prevent system crash

## Testing

### Test LM Studio Connection

```python
import requests

response = requests.get("http://localhost:1234/v1/models", timeout=2)
print(f"LM Studio available: {response.status_code == 200}")
```

### Test PDF Extraction

```bash
# Upload a compliance PDF
curl -X POST http://localhost:8000/upload \
  -F "file=@path/to/compliance.pdf"
```

Check logs for:
- `"Using LM Studio (google/gemma-2-9b) for extraction"`
- `"LM Studio extracted X controls"`

### Disable LM Studio (Test Fallback)

Set in `.env`:
```bash
LM_STUDIO_ENABLED=false
```

Or stop LM Studio server. The system should automatically fall back to OpenAI.

## Performance Considerations

### LM Studio (google/gemma-2-9b)
- **Pros**: 
  - No API costs
  - No rate limits
  - Privacy (local processing)
  - Larger context window (4000 chars vs 2000 for tinyllama)
- **Cons**: 
  - Requires local GPU/CPU resources
  - Slower than cloud APIs
  - Requires LM Studio to be running

### OpenAI (gpt-4o-mini)
- **Pros**: 
  - Fast response times
  - High accuracy
  - No local resources needed
- **Cons**: 
  - API costs
  - Rate limits
  - Requires internet connection
  - Privacy concerns (data sent to cloud)

### Ollama (tinyllama)
- **Pros**: 
  - No API costs
  - Runs in Docker container
  - Always available
- **Cons**: 
  - Smaller model (lower accuracy)
  - Limited context window (2000 chars)
  - Slower than cloud APIs

## Monitoring

### Log Messages

**LM Studio Success:**
```
INFO - Using LM Studio (google/gemma-2-9b) for extraction
INFO - LM Studio extracted 15 controls
INFO - LM Studio successfully extracted 15 controls from chunk 1
```

**LM Studio Failure (Fallback to OpenAI):**
```
WARNING - LM Studio not available at http://localhost:1234: Connection refused
INFO - LM Studio not enabled or not available, skipping to OpenAI
INFO - OpenAI extracted 15 controls from chunk 1
```

**All Methods Failed:**
```
ERROR - LM Studio extraction failed: Connection refused
ERROR - OpenAI error for chunk 1: Rate limit exceeded
ERROR - Ollama fallback also failed for chunk 1
ERROR - No controls extracted from chunk 1 (all extraction methods failed: LM Studio, OpenAI, and Ollama)
```

## Troubleshooting

### LM Studio Not Detected

**Problem:** `"LM Studio not available at http://localhost:1234"`

**Solutions:**
1. Verify LM Studio is running: `curl http://localhost:1234/v1/models`
2. Check if port 1234 is in use: `lsof -i :1234` (macOS/Linux)
3. Verify `LM_STUDIO_HOST` in `.env` matches your LM Studio port
4. Check firewall settings

### LM Studio Returns No Controls

**Problem:** `"LM Studio returned no controls for chunk 1"`

**Solutions:**
1. Check LM Studio logs for errors
2. Verify model is loaded in LM Studio
3. Try with a smaller PDF (test with 1-2 pages)
4. Increase timeout in `_extract_with_lm_studio()` if needed

### JSON Parsing Errors

**Problem:** `"Failed to parse LM Studio response as JSON"`

**Solutions:**
1. Check if model supports JSON mode
2. Verify `response_format: {"type": "json_object"}` is supported
3. Review LM Studio response in debug logs
4. Try different temperature settings (currently 0.1)

## Future Enhancements

1. **Model Selection**: Allow dynamic model selection via API
2. **Batch Processing**: Process multiple chunks in parallel
3. **Caching**: Cache extraction results to avoid re-processing
4. **Metrics**: Track extraction success rates and performance
5. **A/B Testing**: Compare extraction quality across models
6. **Streaming**: Support streaming responses for large PDFs

## References

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Google Gemma-2 Model Card](https://huggingface.co/google/gemma-2-9b)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Ollama Documentation](https://ollama.ai/docs)