# LM Studio Channel Error - Troubleshooting Guide

## Problem

When using LM Studio with AegisAI, you may encounter this error:

```
[ERROR] [mistralai/mistral-7b-instruct-v0.3] Error: Channel Error
```

## Root Causes

The "Channel Error" in LM Studio typically occurs due to one of these issues:

### 1. Model Not Loaded
**Most Common Cause**

The model is downloaded but not actively loaded in LM Studio's server.

**Solution:**
1. Open LM Studio
2. Go to "Local Server" tab
3. Select your model (`mistralai/mistral-7b-instruct-v0.3`) from dropdown
4. Click "Load Model" button
5. Wait for model to fully load (status shows "Loaded")
6. Click "Start Server" if not already running
7. Verify server shows "Running" status

### 2. Context Length Exceeded

The request text is too large for the model's context window.

**Solution:**
- Mistral-7B supports ~8k tokens context
- Current fix: Text is limited to 1500 characters per chunk
- If still failing, reduce further in [`extractor.py:201`](../backend/core/extraction/extractor.py:201)

```python
# Reduce from 1500 to 1000 if needed
prompt = self.extraction_prompt.format(text=text[:1000])
```

### 3. LM Studio Server Not Running

The server is stopped or crashed.

**Solution:**
1. Check LM Studio UI - server status should be green "Running"
2. If stopped, click "Start Server"
3. If crashed, restart LM Studio application
4. Verify endpoint: `http://localhost:1234/v1/models`

```bash
curl http://localhost:1234/v1/models
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "mistralai/mistral-7b-instruct-v0.3",
      "object": "model"
    }
  ]
}
```

### 4. Docker Network Issues

If running AegisAI in Docker, the container can't reach LM Studio on host.

**Solution:**

Update `.env`:
```bash
# For Docker on Mac/Windows
LM_STUDIO_HOST=http://host.docker.internal:1234

# For Docker on Linux
LM_STUDIO_HOST=http://172.17.0.1:1234
```

Test connection from container:
```bash
docker exec -it aegis-backend curl http://host.docker.internal:1234/v1/models
```

### 5. Port Conflict

Another application is using port 1234.

**Solution:**

Check port usage:
```bash
# macOS/Linux
lsof -i :1234

# Windows
netstat -ano | findstr :1234
```

If port is in use:
1. Stop the conflicting application, OR
2. Change LM Studio port in settings, OR
3. Update `.env` with new port:
```bash
LM_STUDIO_HOST=http://localhost:5678
```

## Quick Diagnostic Steps

### Step 1: Verify LM Studio Status

```bash
# Check if LM Studio is accessible
curl http://localhost:1234/v1/models

# Expected: JSON response with model list
# If fails: LM Studio not running or wrong port
```

### Step 2: Check Model Loading

In LM Studio UI:
- ✅ Model should show "Loaded" status
- ✅ Server should show "Running" (green indicator)
- ❌ If "Not Loaded" - click "Load Model"
- ❌ If "Stopped" - click "Start Server"

### Step 3: Test Simple Request

```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistralai/mistral-7b-instruct-v0.3",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

Expected: JSON response with completion
If fails: Model not properly loaded or server issue

### Step 4: Check AegisAI Configuration

Verify `.env` settings:
```bash
cat .env | grep LM_STUDIO
```

Should show:
```
LM_STUDIO_HOST=http://localhost:1234  # or host.docker.internal for Docker
LM_STUDIO_MODEL=mistralai/mistral-7b-instruct-v0.3
LM_STUDIO_ENABLED=true
```

### Step 5: Review Logs

Check AegisAI backend logs for detailed error messages:
```bash
# If running with Docker
docker logs aegis-backend

# Look for lines like:
# [ERROR] LM Studio returned error: ...
# [ERROR] Channel Error detected - This usually means:
```

## Enhanced Error Messages

The updated [`extractor.py`](../backend/core/extraction/extractor.py) now provides detailed diagnostics:

```python
# When Channel Error occurs, you'll see:
[ERROR] LM Studio returned error: Channel Error
[ERROR] Channel Error detected - This usually means:
[ERROR]   1. Model is not loaded in LM Studio
[ERROR]   2. Context length exceeded (try smaller text chunks)
[ERROR]   3. LM Studio server needs restart
[ERROR]   Current model: mistralai/mistral-7b-instruct-v0.3
[ERROR]   Text length: 1500 chars
```

## Recommended Solutions (In Order)

### Solution 1: Reload Model (Most Effective)

1. Open LM Studio
2. Go to "Local Server" tab
3. If model shows "Loaded", click "Unload"
4. Wait for unload to complete
5. Click "Load Model" again
6. Wait for "Loaded" status
7. Ensure "Start Server" is clicked
8. Retry PDF upload in AegisAI

### Solution 2: Restart LM Studio

1. Quit LM Studio completely
2. Reopen LM Studio
3. Go to "Local Server" tab
4. Load your model
5. Start server
6. Retry PDF upload

### Solution 3: Use Alternative Model

If Mistral-7B continues to fail, try a different model:

```bash
# In .env, change to:
LM_STUDIO_MODEL=google/gemma-2-9b
# or
LM_STUDIO_MODEL=meta-llama/llama-3.2-3b-instruct
```

Then in LM Studio:
1. Download the new model
2. Load it in Local Server
3. Restart AegisAI backend

### Solution 4: Enable OpenAI Fallback

For immediate workaround while troubleshooting:

```bash
# In .env
OPENAI_ENABLED=true
OPENAI_API_KEY=your_actual_api_key
LM_STUDIO_ENABLED=false  # Temporarily disable
```

Restart backend - it will use OpenAI instead.

### Solution 5: Reduce Text Chunk Size

Edit [`extractor.py:201`](../backend/core/extraction/extractor.py:201):

```python
# Reduce from 1500 to 1000 or 800
prompt = self.extraction_prompt.format(text=text[:800])
```

Restart backend and retry.

## Prevention Tips

### 1. Keep Model Loaded

Don't unload the model between uses. Keep LM Studio running with model loaded.

### 2. Monitor Resource Usage

Mistral-7B requires:
- **RAM:** 8GB minimum (16GB recommended)
- **CPU:** 4+ cores
- **GPU:** Optional but recommended for speed

If system is low on resources, model may fail to respond.

### 3. Use Appropriate Models

For compliance extraction:
- ✅ **Recommended:** `google/gemma-2-9b` (better accuracy)
- ✅ **Fast:** `meta-llama/llama-3.2-3b-instruct` (lower resource)
- ⚠️ **Current:** `mistralai/mistral-7b-instruct-v0.3` (moderate)

### 4. Regular Restarts

Restart LM Studio daily if running continuously to prevent memory leaks.

## Testing After Fix

### Test 1: Basic Connectivity

```bash
python test_lm_studio_integration.py
```

Expected output:
```
✓ LM Studio is available with 1 model(s)
  - mistralai/mistral-7b-instruct-v0.3
✓ PRIMARY: LM Studio will be used for extraction
```

### Test 2: PDF Upload

1. Start AegisAI: `./start.sh`
2. Upload a small PDF via UI
3. Check logs for:
```
INFO - Using LM Studio (mistralai/mistral-7b-instruct-v0.3) for extraction
INFO - LM Studio extracted X controls
```

### Test 3: Direct API Call

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@backend/data/pdfs/SOC2_Compliance_-Checklist.pdf"
```

Should return JSON with extracted controls.

## Still Having Issues?

### Check LM Studio Logs

In LM Studio:
1. Go to "Settings" → "Logs"
2. Look for errors related to model loading or inference
3. Common issues:
   - Out of memory
   - Model file corruption
   - GPU driver issues

### Verify Model Files

1. In LM Studio, go to "My Models"
2. Find `mistralai/mistral-7b-instruct-v0.3`
3. Check file size (should be ~4-5 GB)
4. If corrupted, delete and re-download

### System Requirements

Ensure your system meets minimum requirements:
- **OS:** macOS 10.15+, Windows 10+, or Linux
- **RAM:** 8GB minimum (16GB recommended)
- **Storage:** 10GB free space
- **CPU:** 4+ cores

### Get Help

If none of the above works:
1. Check [LM Studio Discord](https://discord.gg/lmstudio)
2. Review [LM Studio Documentation](https://lmstudio.ai/docs)
3. Open issue on AegisAI GitHub with:
   - LM Studio version
   - Model name and version
   - Full error logs
   - System specs

## Summary Checklist

Before reporting an issue, verify:

- [ ] LM Studio is running
- [ ] Model is loaded (shows "Loaded" status)
- [ ] Server is started (green "Running" indicator)
- [ ] Port 1234 is accessible
- [ ] `.env` has correct `LM_STUDIO_HOST`
- [ ] Model name in `.env` matches loaded model
- [ ] System has sufficient RAM/CPU
- [ ] Tested with `curl` command
- [ ] Checked LM Studio logs
- [ ] Tried restarting LM Studio
- [ ] Tried reloading model

## Related Documentation

- [LM Studio Setup Guide](../../SETUP_LM_STUDIO.md)
- [LM Studio Integration](LM_STUDIO_INTEGRATION.md)
- [Extractor Implementation](../backend/core/extraction/extractor.py)
- [Configuration Guide](../backend/config.py)