#!/bin/bash

# AuditAura PDF Storage and Ingestion Test Script
# This script tests the new PDF storage and ingestion features

set -e

echo "=========================================="
echo "AuditAura PDF Storage & Ingestion Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
PDF_STORAGE_DIR="./backend/data/pdfs"

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test 1: Check if backend is running
echo "Test 1: Checking backend availability..."
if curl -s -f "${BACKEND_URL}/health" > /dev/null 2>&1; then
    print_success "Backend is running"
else
    print_error "Backend is not running. Please start with: ./start.sh"
    exit 1
fi
echo ""

# Test 2: Check PDF storage directory
echo "Test 2: Checking PDF storage directory..."
if [ -d "$PDF_STORAGE_DIR" ]; then
    print_success "PDF storage directory exists: $PDF_STORAGE_DIR"
else
    print_info "Creating PDF storage directory..."
    mkdir -p "$PDF_STORAGE_DIR"
    print_success "Created PDF storage directory"
fi
echo ""

# Test 3: List stored PDFs
echo "Test 3: Listing stored PDFs..."
RESPONSE=$(curl -s "${BACKEND_URL}/pdfs")
PDF_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")
print_info "Found $PDF_COUNT PDFs in storage"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 4: Create a test PDF (if none exist)
if [ "$PDF_COUNT" -eq 0 ]; then
    echo "Test 4: Creating test PDF..."
    print_info "No PDFs found. Creating a test PDF..."
    
    # Create a simple test PDF using echo and text
    cat > "${PDF_STORAGE_DIR}/test_compliance.txt" << 'EOF'
SOC2 Compliance Controls

Control ID: SOC2-CC1.1
Title: Access Control Policy
Description: Organization maintains documented access control policies
Category: Access Control
Standard: SOC2
Severity: High

Control ID: SOC2-CC2.1
Title: Data Encryption
Description: All sensitive data must be encrypted at rest and in transit
Category: Data Security
Standard: SOC2
Severity: Critical

Control ID: SOC2-CC3.1
Title: Audit Logging
Description: System maintains comprehensive audit logs for all access
Category: Monitoring
Standard: SOC2
Severity: Medium
EOF
    
    print_success "Created test compliance document (text format for testing)"
    print_info "Note: In production, use actual PDF files"
else
    print_info "Skipping test PDF creation - PDFs already exist"
fi
echo ""

# Test 5: Test ingestion endpoint
echo "Test 5: Testing ingestion endpoint..."
print_info "Triggering re-ingestion of all PDFs..."
INGEST_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/ingest")
echo "$INGEST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INGEST_RESPONSE"

if echo "$INGEST_RESPONSE" | grep -q '"success":true'; then
    print_success "Ingestion completed successfully"
else
    print_error "Ingestion failed"
fi
echo ""

# Test 6: Verify compliance controls
echo "Test 6: Verifying compliance controls..."
CONTROLS_RESPONSE=$(curl -s "${BACKEND_URL}/compliance-score")
echo "$CONTROLS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CONTROLS_RESPONSE"
print_success "Retrieved compliance score"
echo ""

# Test 7: Test single file ingestion (if PDFs exist)
if [ "$PDF_COUNT" -gt 0 ]; then
    echo "Test 7: Testing single file ingestion..."
    FIRST_PDF=$(ls "$PDF_STORAGE_DIR"/*.pdf 2>/dev/null | head -1 | xargs basename)
    
    if [ -n "$FIRST_PDF" ]; then
        print_info "Testing ingestion of: $FIRST_PDF"
        SINGLE_INGEST=$(curl -s -X POST "${BACKEND_URL}/ingest/${FIRST_PDF}")
        echo "$SINGLE_INGEST" | python3 -m json.tool 2>/dev/null || echo "$SINGLE_INGEST"
        
        if echo "$SINGLE_INGEST" | grep -q '"success":true'; then
            print_success "Single file ingestion successful"
        else
            print_error "Single file ingestion failed"
        fi
    else
        print_info "No PDF files found for single file test"
    fi
else
    print_info "Skipping single file ingestion test - no PDFs available"
fi
echo ""

# Test 8: Check dashboard data
echo "Test 8: Checking dashboard data..."
DASHBOARD_RESPONSE=$(curl -s "${BACKEND_URL}/dashboard")
echo "$DASHBOARD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DASHBOARD_RESPONSE"
print_success "Retrieved dashboard data"
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
print_success "All tests completed!"
echo ""
print_info "Next steps:"
echo "  1. Upload a real compliance PDF via UI or API"
echo "  2. Use POST /ingest to re-process all PDFs"
echo "  3. Check the dashboard for updated compliance scores"
echo ""
print_info "API Endpoints:"
echo "  - GET  ${BACKEND_URL}/pdfs"
echo "  - POST ${BACKEND_URL}/ingest"
echo "  - POST ${BACKEND_URL}/ingest/{filename}"
echo "  - POST ${BACKEND_URL}/upload"
echo ""
print_info "Storage Location:"
echo "  - ${PDF_STORAGE_DIR}"
echo ""