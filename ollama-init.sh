#!/bin/bash

echo "Waiting for Ollama service..."
sleep 5

MODEL="phi4-mini"

echo "Checking if model exists..."

if docker exec aegis-ai-ollama-1 ollama list | grep -q "$MODEL"; then
    echo "Model already cached: $MODEL"
else
    echo "Pulling model: $MODEL"
    docker exec aegis-ai-ollama-1 ollama pull $MODEL
fi

echo "Ollama initialization complete!"