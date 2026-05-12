# LM Studio Setup Guide for AegisAI

This guide will help you set up LM Studio with google/gemma-2-9b for PDF compliance extraction.

## Quick Start

### 1. Install LM Studio

Download and install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)

**Supported Platforms:**
- macOS (Apple Silicon & Intel)
- Windows
- Linux

### 2. Download the Model

1. Open LM Studio
2. Go to the "Search" tab
3. Search for `google/gemma-2-9b`
4. Click "Download" on the model
5. Wait for download to complete (model size: ~5-6 GB)

### 3. Start the Local Server

1. In LM Studio, go to the "Local Server" tab
2. Select `google/gemma-2-9b` from the model dropdown
3. Click "Start Server"
4. Verify the server is running on `http://localhost:1234`

### 4. Configure AegisAI

Create or update your `.env` file in the project root:

```bash
# LM Studio Configuration (primary local LLM)
LM_STUDIO_HOST=http://localhost:1234
LM_STUDIO_MODEL=google/gemma-2-9b
LM_STUDIO_ENABLED=true

# OpenAI Configuration (fallback - optional but recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Ollama Configuration (for local LLM fallback)
OLLAMA_HOST=http://ollama:11434
```

### 5. Test the Integration

Run the test script:

```bash
python test_lm_studio_integration.py
```

Expected output:
```
✓ LM Studio is available with 1 model(s)
  - google/gemma-2-9b
✓ PRIMARY: LM Studio will be used for extraction
✓ FALLBACK 1: OpenAI available as fallback
✓ FALLBACK 2: Ollama available as final fallback
✓ All tests passed!
```

### 6. Start AegisAI

```bash
# Using Docker
./start.sh

# Or manually
cd backend
uvicorn main:app --reload
```

## Verification

### Check LM Studio is Running

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
      "object": "model",
      "created": 1234567890,
      "owned_by": "lmstudio"
    }
  ]
}
```

### Test PDF Upload

1. Start AegisAI backend
2. Upload a compliance PDF via the UI or API:

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@path/to/compliance.pdf"
```

3. Check the logs for:
```
INFO - Using LM Studio (google/gemma-2-9b) for extraction
INFO - LM Studio extracted 15 controls
```

## Troubleshooting

### LM Studio Not Detected

**Problem:** `LM Studio not available at http://localhost:1234`

**Solutions:**
1. Verify LM Studio server is running (green indicator in LM Studio UI)
2. Check if port 1234 is in use by another application
3. Try restarting LM Studio
4. Check firewall settings

### Model Not Loaded

**Problem:** `No models available in LM Studio`

**Solutions:**
1. Ensure `google/gemma-2-9b` is downloaded in LM Studio
2. Select the model in the "Local Server" tab
3. Click "Load Model" if not already loaded
4. Wait for model to fully load (check LM Studio logs)

### Slow Extraction

**Problem:** Extraction takes too long

**Solutions:**
1. **Hardware Requirements:**
   - Minimum: 8GB RAM, 4-core CPU
   - Recommended: 16GB RAM, 8-core CPU, GPU
2. **Optimize Settings in LM Studio:**
   - Reduce context length
   - Enable GPU acceleration if available
   - Adjust thread count
3. **Alternative:** Use OpenAI fallback for faster processing

### Connection Refused

**Problem:** `Connection refused to localhost:1234`

**Solutions:**
1. Verify LM Studio is running: Check the app is open
2. Check server status in LM Studio UI (should show "Running")
3. Try stopping and restarting the server
4. Check if another application is using port 1234:
   ```bash
   # macOS/Linux
   lsof -i :1234
   
   # Windows
   netstat -ano | findstr :1234
   ```

## Performance Tips

### For Better Speed

1. **Use GPU Acceleration:**
   - Enable in LM Studio settings
   - Requires NVIDIA GPU with CUDA support (Windows/Linux)
   - Or Apple Silicon GPU (macOS)

2. **Adjust Model Settings:**
   - Lower temperature (0.1 recommended)
   - Reduce max tokens if not needed
   - Enable prompt caching

3. **Optimize Chunk Size:**
   - Current: 4000 characters
   - Reduce if experiencing timeouts
   - Increase for better context (if model supports)

### For Better Accuracy

1. **Use Larger Models:**
   - Try `google/gemma-2-27b` if you have resources
   - Or use OpenAI as primary (swap priority)

2. **Adjust Temperature:**
   - Lower = more deterministic (current: 0.1)
   - Higher = more creative (not recommended for compliance)

3. **Provide Better Prompts:**
   - Modify `extraction_prompt` in `extractor.py`
   - Add examples of expected output
   - Be more specific about control format

## Alternative: Use OpenAI as Primary

If LM Studio is too slow or unavailable, you can use OpenAI as primary:

```bash
# In .env
LM_STUDIO_ENABLED=false
OPENAI_API_KEY=your_actual_api_key
```

The system will automatically use OpenAI instead.

## Docker Considerations

If running AegisAI in Docker:

1. **LM Studio Host:** Use `host.docker.internal` instead of `localhost`
   ```bash
   LM_STUDIO_HOST=http://host.docker.internal:1234
   ```

2. **Network Mode:** Ensure Docker can access host network
   ```yaml
   # In docker-compose.yml
   services:
     backend:
       network_mode: "host"  # Or use host.docker.internal
   ```

## System Requirements

### Minimum Requirements
- **RAM:** 8GB
- **CPU:** 4 cores
- **Storage:** 10GB free space
- **OS:** macOS 10.15+, Windows 10+, or Linux

### Recommended Requirements
- **RAM:** 16GB+
- **CPU:** 8+ cores
- **GPU:** NVIDIA GPU with 8GB+ VRAM (optional but recommended)
- **Storage:** 20GB+ free space
- **OS:** Latest version

## Support

For issues or questions:
1. Check the [LM Studio Integration Documentation](docs/technical/LM_STUDIO_INTEGRATION.md)
2. Review logs in `backend/logs/` (if configured)
3. Check LM Studio logs in the app
4. Open an issue on GitHub

## Next Steps

After successful setup:
1. Upload compliance PDFs via the UI
2. Monitor extraction logs
3. Compare results with OpenAI extraction
4. Adjust settings as needed
5. Set up monitoring and alerts

## Additional Resources

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Google Gemma-2 Model Card](https://huggingface.co/google/gemma-2-9b)
- [AegisAI Documentation](docs/README.md)
- [API Reference](docs/API_REFERENCE.md)