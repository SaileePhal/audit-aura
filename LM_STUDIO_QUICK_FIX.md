# LM Studio Channel Error - Quick Fix Guide

## The Error

```
[ERROR] [mistralai/mistral-7b-instruct-v0.3] Error: Channel Error
```

## Immediate Solution (90% Success Rate)

### Step 1: Reload the Model in LM Studio

1. **Open LM Studio**
2. **Go to "Local Server" tab**
3. **If model shows "Loaded":**
   - Click "Unload Model"
   - Wait 5 seconds
4. **Click "Load Model"**
5. **Wait for "Loaded" status** (green indicator)
6. **Ensure "Start Server" is active** (green "Running")

### Step 2: Verify Model is Loaded

```bash
curl http://localhost:1234/v1/models
```

You should see:
```json
{
  "data": [
    {
      "id": "mistralai/mistral-7b-instruct-v0.3"
    }
  ]
}
```

### Step 3: Test Simple Request

```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistralai/mistral-7b-instruct-v0.3",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

Should return a completion (not an error).

### Step 4: Retry PDF Upload

Upload your PDF again through AegisAI.

---

## If Still Failing: Run Diagnostic

```bash
python test_lm_studio_channel_error.py
```

This will identify the exact issue.

---

## Alternative: Use OpenAI Temporarily

While troubleshooting, enable OpenAI:

```bash
# In .env file
OPENAI_ENABLED=true
OPENAI_API_KEY=your_actual_key
LM_STUDIO_ENABLED=false
```

Restart backend:
```bash
docker-compose restart backend
```

---

## Common Causes & Quick Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Model shows "Not Loaded" | Model not loaded | Click "Load Model" in LM Studio |
| Server shows "Stopped" | Server not running | Click "Start Server" in LM Studio |
| Connection refused | LM Studio not running | Start LM Studio application |
| 404 Error | Wrong model name | Check model name matches in .env |
| Timeout | Model too slow | Use smaller model or increase timeout |

---

## System Requirements Check

Mistral-7B needs:
- ✅ **8GB+ RAM** (16GB recommended)
- ✅ **4+ CPU cores**
- ✅ **5GB free disk space**

Check your system:
```bash
# macOS
sysctl hw.memsize hw.ncpu

# Linux
free -h && nproc
```

---

## Docker Users

If running in Docker, use:

```bash
# In .env
LM_STUDIO_HOST=http://host.docker.internal:1234
```

Test from container:
```bash
docker exec -it aegis-backend curl http://host.docker.internal:1234/v1/models
```

---

## Still Not Working?

1. **Restart LM Studio completely**
   - Quit application
   - Reopen
   - Load model
   - Start server

2. **Try different model**
   ```bash
   # In .env
   LM_STUDIO_MODEL=google/gemma-2-9b
   ```
   Download and load in LM Studio

3. **Check detailed guide**
   - See: `docs/technical/LM_STUDIO_CHANNEL_ERROR_FIX.md`

4. **Check LM Studio logs**
   - In LM Studio: Settings → Logs
   - Look for errors

---

## Success Indicators

After fix, you should see in backend logs:

```
INFO - Using LM Studio (mistralai/mistral-7b-instruct-v0.3) for extraction
INFO - LM Studio extracted 15 controls
```

---

## Need Help?

Run diagnostic tool:
```bash
python test_lm_studio_channel_error.py
```

Check full guide:
```bash
cat docs/technical/LM_STUDIO_CHANNEL_ERROR_FIX.md
```

---

**Most Common Fix:** Just reload the model in LM Studio! 🎯