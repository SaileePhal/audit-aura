# Helper Scripts

This directory contains utility and helper scripts for the AegisAI project.

## Available Scripts

### Development & Maintenance
- [`clear_data.sh`](clear_data.sh) - Clears application data and resets the database
- [`verify_implementation.sh`](verify_implementation.sh) - Verifies implementation and runs checks

### Demo & Documentation
- [`create-demo-video.js`](create-demo-video.js) - Creates demo video for the application

### Infrastructure
- [`ollama-init.sh`](ollama-init.sh) - Initializes Ollama with the phi4-mini model

## Usage

### Clear Data
```bash
# Run from project root
bash scripts/clear_data.sh
```

### Verify Implementation
```bash
# Run from project root
bash scripts/verify_implementation.sh
```

### Create Demo Video
```bash
# Run from project root
node scripts/create-demo-video.js
```

### Initialize Ollama
```bash
# Run from project root (usually called by start.sh)
bash scripts/ollama-init.sh
```

## Notes

- Most scripts should be run from the project root directory
- The `ollama-init.sh` script is automatically called by [`start.sh`](../start.sh) during application startup
- Make sure scripts have execute permissions: `chmod +x scripts/*.sh`

## Documentation

For more information about specific features:
- [Ollama Fallback](../docs/technical/OLLAMA_FALLBACK.md)
- [Demo Video Guide](../DEMO_VIDEO_README.md)