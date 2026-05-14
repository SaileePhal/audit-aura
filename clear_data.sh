#!/bin/bash

echo "=========================================="
echo "Clearing Skills and Control Data"
echo "=========================================="
echo ""

# Backup existing data first
echo "Creating backups..."
mkdir -p backend/data/backups
timestamp=$(date +%Y%m%d_%H%M%S)

if [ -f "backend/data/skills.json" ]; then
    cp backend/data/skills.json "backend/data/backups/skills_${timestamp}.json"
    echo "✓ Backed up skills.json"
fi

# Clear skills.json
echo ""
echo "Clearing skills data..."
cat > backend/data/skills.json << 'EOF'
{}
EOF
echo "✓ Cleared backend/data/skills.json"

# Clear vector store data (if exists)
if [ -d "backend/data/vector_store" ]; then
    echo ""
    echo "Clearing vector store..."
    rm -rf backend/data/vector_store/*
    echo "✓ Cleared vector store data"
fi

# Clear PDFs (optional - uncomment if you want to clear PDFs too)
# if [ -d "backend/data/pdfs" ]; then
#     echo ""
#     echo "Clearing PDFs..."
#     rm -f backend/data/pdfs/*.pdf
#     echo "✓ Cleared PDF files"
# fi

echo ""
echo "=========================================="
echo "Data cleared successfully!"
echo "=========================================="
echo ""
echo "Backups saved to: backend/data/backups/"
echo ""
echo "Next steps:"
echo "1. Restart the backend server"
echo "2. Upload a new PDF to trigger skill acquisition"
echo "3. Watch for the skill acquisition animation"
echo ""