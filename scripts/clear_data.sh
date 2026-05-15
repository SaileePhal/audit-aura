#!/bin/bash

echo "=========================================="
echo "Clearing All System Data"
echo "=========================================="
echo ""
echo "This will clear:"
echo "  - Skills and controls"
echo "  - Cloud connections"
echo "  - Violations and mock data"
echo "  - PR tracking data"
echo "  - PDF files"
echo "  - Vector store data"
echo "  - Reports"
echo "  - MOCK_MODE setting (disable mock data)"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

# Backup existing data first
echo ""
echo "Creating backups..."
mkdir -p backend/data/backups
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backend/data/backups/backup_${timestamp}"
mkdir -p "$backup_dir"

# Backup all JSON files
for file in backend/data/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        cp "$file" "$backup_dir/$filename"
        echo "✓ Backed up $filename"
    fi
done

# Backup PDFs if they exist
if [ -d "backend/data/pdfs" ] && [ "$(ls -A backend/data/pdfs 2>/dev/null)" ]; then
    mkdir -p "$backup_dir/pdfs"
    cp backend/data/pdfs/*.pdf "$backup_dir/pdfs/" 2>/dev/null
    echo "✓ Backed up PDF files"
fi

# Backup reports if they exist
if [ -d "backend/data/reports" ] && [ "$(ls -A backend/data/reports 2>/dev/null)" ]; then
    mkdir -p "$backup_dir/reports"
    cp backend/data/reports/*.json "$backup_dir/reports/" 2>/dev/null
    echo "✓ Backed up reports"
fi

echo ""
echo "=========================================="
echo "Clearing Data Files"
echo "=========================================="

# Clear skills.json
echo ""
echo "Clearing skills data..."
cat > backend/data/skills.json << 'EOF'
{}
EOF
echo "✓ Cleared backend/data/skills.json"

# Clear connections.json
echo ""
echo "Clearing cloud connections..."
cat > backend/data/connections.json << 'EOF'
{
  "connections": [],
  "updated_at": null
}
EOF
echo "✓ Cleared backend/data/connections.json"

# Clear mock_data.json
echo ""
echo "Clearing violations and mock data..."
cat > backend/data/mock_data.json << 'EOF'
{
  "violations": [],
  "compliance_scores": {
    "overall": 1.0,
    "by_standard": {
      "SOC2": 1.0,
      "ISO27001": 1.0,
      "HIPAA": 1.0,
      "PCI-DSS": 1.0
    }
  },
  "standards": [],
  "recent_events": [],
  "security_metrics": {
    "total_violations": 0,
    "critical_violations": 0,
    "high_violations": 0,
    "medium_violations": 0,
    "low_violations": 0,
    "open_violations": 0,
    "resolved_violations": 0,
    "average_resolution_time": "0 hours",
    "compliance_trend": "stable"
  },
  "live_score_simulation": {
    "enabled": true,
    "update_interval_seconds": 30,
    "score_variations": [-0.02, -0.01, 0, 0, 0, 0.01, 0.02],
    "min_score": 0.7,
    "max_score": 0.95
  }
}
EOF
echo "✓ Cleared backend/data/mock_data.json"

# Clear pr_tracking.json
echo ""
echo "Clearing PR tracking data..."
cat > backend/data/pr_tracking.json << 'EOF'
{
  "prs": [],
  "violation_pr_links": {}
}
EOF
echo "✓ Cleared backend/data/pr_tracking.json"

# Clear vector store data
if [ -d "backend/data/vector_store" ]; then
    echo ""
    echo "Clearing vector store..."
    rm -rf backend/data/vector_store/*
    echo "✓ Cleared vector store data"
fi

# Clear PDFs
if [ -d "backend/data/pdfs" ]; then
    echo ""
    echo "Clearing PDF files..."
    rm -f backend/data/pdfs/*.pdf
    echo "✓ Cleared PDF files"
fi

# Clear reports
if [ -d "backend/data/reports" ]; then
    echo ""
    echo "Clearing reports..."
    rm -f backend/data/reports/*.json
    echo "✓ Cleared report files"
fi

# Disable MOCK_MODE in .env if it exists
if [ -f ".env" ]; then
    echo ""
    echo "Disabling MOCK_MODE in .env..."
    if grep -q "^MOCK_MODE=" .env; then
        # Replace existing MOCK_MODE setting
        sed -i.bak 's/^MOCK_MODE=.*/MOCK_MODE=false/' .env
        rm -f .env.bak
        echo "✓ Set MOCK_MODE=false in .env"
    else
        # Add MOCK_MODE=false if not present
        echo "MOCK_MODE=false" >> .env
        echo "✓ Added MOCK_MODE=false to .env"
    fi
else
    echo ""
    echo "⚠ No .env file found - create one from .env.example if needed"
fi

echo ""
echo "=========================================="
echo "Data cleared successfully!"
echo "=========================================="
echo ""
echo "Backups saved to: $backup_dir"
echo ""
echo "System reset to fresh state:"
echo "  ✓ No skills or controls"
echo "  ✓ No cloud connections"
echo "  ✓ No violations"
echo "  ✓ No PDF files"
echo "  ✓ No vector store data"
echo "  ✓ No reports"
echo "  ✓ No PR tracking data"
echo "  ✓ MOCK_MODE disabled"
echo ""
echo "Next steps:"
echo "1. Restart the backend server (docker-compose restart or ./start.sh)"
echo "2. Refresh the frontend in your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)"
echo "3. Configure cloud connections in the UI"
echo "4. Upload compliance PDFs to trigger skill acquisition"
echo "5. Monitor for new events and violations"
echo ""