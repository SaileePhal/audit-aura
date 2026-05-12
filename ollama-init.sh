#!/bin/bash
# Initialize Ollama with tinyllama model (smaller, ~600MB)

echo "Waiting for Ollama service to be ready..."
sleep 5

echo "Pulling tinyllama model (optimized for low memory)..."
docker exec aegis-ai-ollama-1 ollama pull tinyllama

echo "Ollama initialization complete!"