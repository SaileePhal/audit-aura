# LM Studio with Docker Setup Guide

## Problem

When running the backend in Docker, `localhost` refers to the container itself, not your host machine. This means the backend cannot connect to LM Studio running on your computer.

## Solution

Use `host.docker.internal` to access services running on the host machine from inside Docker containers.

## Configuration

### 1. Update Environment Variables

Create a `.env` file (or update existing one) with:

```bash
# LM Studio Configuration
LM_STUDIO_HOST=http://host.docker.internal:1234
LM_STUDIO_MODEL=google/gemma-2-9b
LM_STUDIO_ENABLED=true

# Disable Ollama if you want to use LM Studio exclusively
OLLAMA_ENABLED=false
```

### 2. Restart Backend

```bash
docker-compose restart backend
```

### 3. Verify Connection

Check the logs to confirm LM Studio is being used:

```bash
docker-compose logs backend | grep "LM Studio"
```

You should see:
```
Using LM Studio for extraction (google/gemma-2-9b)
```

## Troubleshooting

### LM Studio Not Detected

**Symptom**: Logs show "Using Ollama" instead of "Using LM Studio"

**Solutions**:

1. **Verify LM Studio is Running**:
   - Open LM Studio
   - Load a model (recommended: gemma-2-9b or llama-3)
   - Ensure the server is started (check status bar)
   - Verify it's accessible at http://127.0.0.1:1234

2. **Check Docker Network**:
   ```bash
   # From inside the backend container
   docker-compose exec backend curl http://host.docker.internal:1234/v1/models
   ```
   
   Should return a list of models. If it fails, `host.docker.internal` might not be configured.

3. **Alternative: Use Host Network** (Linux only):
   In `docker-compose.yml`, add to backend service:
   ```yaml
   network_mode: "host"
   ```
   Then use `http://localhost:1234` in `.env`

4. **macOS/Windows Specific**:
   `host.docker.internal` should work by default. If not, try:
   - Docker Desktop → Settings → Resources → Network
   - Ensure "Use kernel networking for UDP" is enabled

### Extraction Still Using Ollama

**Symptom**: Even with correct config, Ollama is used

**Cause**: The `.env` file might not be loaded, or old environment variables are cached.

**Solution**:
```bash
# Stop all containers
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache backend

# Start fresh
docker-compose up -d
```

### Error: "LM Studio is enabled but not available"

**Good!** This means the validation is working correctly.

**Solutions**:
1. Start LM Studio and load a model
2. Or disable LM Studio in `.env`: `LM_STUDIO_ENABLED=false`
3. Or enable Ollama as fallback: `OLLAMA_ENABLED=true`

## Recommended Models for LM Studio

For best extraction quality:

1. **gemma-2-9b** (Recommended)
   - Good balance of speed and quality
   - ~5GB RAM required
   - Excellent for compliance extraction

2. **llama-3-8b**
   - Fast and accurate
   - ~4.5GB RAM required

3. **mistral-7b**
   - Very fast
   - ~4GB RAM required
   - Good for simpler documents

## Performance Comparison

| Model | Speed | Quality | RAM | Best For |
|-------|-------|---------|-----|----------|
| phi4-mini (Ollama) | Very Fast | Low | 637MB | Testing only |
| gemma-2-9b (LM Studio) | Medium | High | 5GB | Production |
| llama-3-8b (LM Studio) | Fast | High | 4.5GB | Production |
| gpt-4o-mini (OpenAI) | Fast | Highest | N/A | Best quality |

## Testing the Setup

1. **Upload a test PDF**:
   ```bash
   curl -X POST http://localhost:8000/upload \
     -F "file=@path/to/test.pdf"
   ```

2. **Watch the logs**:
   ```bash
   docker-compose logs -f backend
   ```

3. **Look for**:
   ```
   Using LM Studio for chunk 1
   LM Studio extracted X controls from chunk 1
   ```

4. **Check extraction quality**:
   ```bash
   curl http://localhost:8000/controls | jq '.controls[] | {control_id, standard, severity}'
   ```

   Good extraction should have:
   - Proper `standard` field (not "Unknown")
   - Correct `severity` levels
   - No typos in field names

## Made with Bob