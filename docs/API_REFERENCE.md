# AegisAI API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
Currently, the API does not require authentication. In production, implement proper authentication mechanisms.

---

## PDF Management Endpoints

### Upload PDF File
Upload a compliance PDF document for processing.

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): PDF file to upload

**Response:**
```json
{
  "success": true,
  "message": "Successfully extracted 25 controls from SOC2_Controls.pdf",
  "controls_count": 25,
  "standards": ["SOC2", "ISO27001"],
  "filename": "SOC2_Controls.pdf",
  "saved_path": "./data/pdfs/SOC2_Controls.pdf"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@SOC2_Controls.pdf"
```

---

### Upload PDF from URL
Upload a compliance PDF from a URL.

**Endpoint:** `POST /upload-url`

**Parameters:**
- `url` (required): URL to the PDF document

**Response:**
```json
{
  "success": true,
  "message": "Successfully extracted 25 controls",
  "controls_count": 25,
  "standards": ["SOC2"]
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/upload-url?url=https://example.com/compliance.pdf"
```

---

### List Stored PDFs
Get a list of all PDFs stored in the system.

**Endpoint:** `GET /pdfs`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "files": [
    {
      "filename": "SOC2_Controls.pdf",
      "size_bytes": 245678,
      "modified_time": "2024-01-15T10:30:00",
      "path": "./data/pdfs/SOC2_Controls.pdf"
    },
    {
      "filename": "HIPAA_Compliance.pdf",
      "size_bytes": 189234,
      "modified_time": "2024-01-14T15:45:00",
      "path": "./data/pdfs/HIPAA_Compliance.pdf"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/pdfs"
```

---

### Re-ingest All PDFs
Re-process all PDFs from the storage directory and rebuild the vector store.

**Endpoint:** `POST /ingest`

**Use Cases:**
- Refresh controls after PDF updates
- Process manually copied PDFs
- Recover from vector store corruption
- Update compliance rules

**Response:**
```json
{
  "success": true,
  "message": "Successfully re-ingested 3 PDFs",
  "files_processed": 3,
  "total_controls": 75,
  "processed_files": [
    "SOC2_Controls.pdf",
    "HIPAA_Compliance.pdf",
    "ISO27001_Standards.pdf"
  ]
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/ingest"
```

---

### Re-ingest Single PDF
Re-process a specific PDF from the storage directory.

**Endpoint:** `POST /ingest/{filename}`

**Parameters:**
- `filename` (required): Name of the PDF file to re-ingest

**Response:**
```json
{
  "success": true,
  "message": "Successfully re-ingested SOC2_Controls.pdf",
  "controls_count": 25,
  "standards": ["SOC2"],
  "filename": "SOC2_Controls.pdf"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/ingest/SOC2_Controls.pdf"
```

**Error Response (404):**
```json
{
  "detail": "PDF file 'nonexistent.pdf' not found in storage"
}
```

---

## Compliance Monitoring Endpoints

### Get Compliance Score
Retrieve overall or standard-specific compliance score.

**Endpoint:** `GET /compliance-score`

**Parameters:**
- `standard` (optional): Filter by specific standard (e.g., "SOC2", "HIPAA")

**Response:**
```json
{
  "overall_score": 87.5,
  "by_standard": {
    "SOC2": 92.0,
    "HIPAA": 85.0,
    "ISO27001": 86.0
  },
  "total_controls": 100,
  "compliant_controls": 87,
  "violated_controls": 13
}
```

**Example:**
```bash
# Get overall score
curl -X GET "http://localhost:8000/compliance-score"

# Get SOC2 score
curl -X GET "http://localhost:8000/compliance-score?standard=SOC2"
```

---

### Get Dashboard Data
Retrieve comprehensive dashboard data including violations, scores, and trends.

**Endpoint:** `GET /dashboard`

**Response:**
```json
{
  "compliance_score": 87.5,
  "total_violations": 13,
  "critical_violations": 2,
  "recent_violations": [...],
  "compliance_by_standard": {...},
  "trends": {...}
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/dashboard"
```

---

### Get Violations
Retrieve violations with optional filtering.

**Endpoint:** `GET /violations`

**Parameters:**
- `standard` (optional): Filter by standard
- `severity` (optional): Filter by severity (Critical, High, Medium, Low)

**Response:**
```json
{
  "total": 13,
  "violations": [
    {
      "id": "v-001",
      "control_id": "SOC2-CC1.1",
      "title": "Public S3 Bucket Detected",
      "severity": "Critical",
      "standard": "SOC2",
      "category": "Access Control",
      "timestamp": "2024-01-15T10:30:00Z",
      "event": {...},
      "remediation": "Update bucket policy to restrict public access"
    }
  ],
  "by_severity": {
    "Critical": 2,
    "High": 5,
    "Medium": 4,
    "Low": 2
  },
  "by_category": {
    "Access Control": 5,
    "Data Security": 4,
    "Monitoring": 4
  }
}
```

**Example:**
```bash
# Get all violations
curl -X GET "http://localhost:8000/violations"

# Get critical SOC2 violations
curl -X GET "http://localhost:8000/violations?standard=SOC2&severity=Critical"
```

---

## WebSocket Endpoints

### Real-time Alerts
Connect to receive real-time violation alerts.

**Endpoint:** `WS /ws`

**Message Format:**
```json
{
  "type": "violation",
  "data": {
    "control_id": "SOC2-CC1.1",
    "title": "Public S3 Bucket Detected",
    "severity": "Critical",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Example (JavaScript):**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('New violation:', alert);
};
```

---

## Health Check

### Health Status
Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/health"
```

---

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid input or parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting
Currently, no rate limiting is implemented. In production, implement appropriate rate limiting based on your requirements.

---

## Data Persistence

### PDF Storage
- **Location:** `./backend/data/pdfs/`
- **Persistence:** Via Docker volume mount
- **Format:** Original PDF files

### Vector Store
- **Location:** `./backend/data/vector_store/`
- **Technology:** FAISS
- **Rebuild:** Automatic on ingestion

### Mock Data
- **Location:** `./backend/data/mock_data.json`
- **Purpose:** Demo and fallback data
- **Format:** Structured JSON

---

## Best Practices

### PDF Upload
1. Use descriptive filenames (e.g., `SOC2_2024_Controls.pdf`)
2. Ensure PDFs contain structured compliance controls
3. Verify upload success before proceeding
4. Use `/pdfs` endpoint to confirm storage

### Ingestion
1. Use `/ingest` after manual PDF placement
2. Monitor ingestion response for errors
3. Verify control counts match expectations
4. Re-ingest if vector store becomes corrupted

### Monitoring
1. Connect WebSocket for real-time alerts
2. Poll `/dashboard` for periodic updates
3. Use `/compliance-score` for trend analysis
4. Filter violations by severity for prioritization

---

## Integration Examples

### Python
```python
import requests

# Upload PDF
with open('SOC2_Controls.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/upload',
        files={'file': f}
    )
    print(response.json())

# List PDFs
response = requests.get('http://localhost:8000/pdfs')
print(response.json())

# Re-ingest all
response = requests.post('http://localhost:8000/ingest')
print(response.json())
```

### JavaScript/Node.js
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Upload PDF
const form = new FormData();
form.append('file', fs.createReadStream('SOC2_Controls.pdf'));

axios.post('http://localhost:8000/upload', form, {
  headers: form.getHeaders()
})
.then(response => console.log(response.data))
.catch(error => console.error(error));

// List PDFs
axios.get('http://localhost:8000/pdfs')
  .then(response => console.log(response.data));

// Re-ingest all
axios.post('http://localhost:8000/ingest')
  .then(response => console.log(response.data));
```

### cURL
```bash
# Upload PDF
curl -X POST "http://localhost:8000/upload" \
  -F "file=@SOC2_Controls.pdf"

# List PDFs
curl -X GET "http://localhost:8000/pdfs"

# Re-ingest all
curl -X POST "http://localhost:8000/ingest"

# Re-ingest specific file
curl -X POST "http://localhost:8000/ingest/SOC2_Controls.pdf"

# Get compliance score
curl -X GET "http://localhost:8000/compliance-score"

# Get dashboard data
curl -X GET "http://localhost:8000/dashboard"
```

---

## Support

For issues or questions:
1. Check the logs: `docker-compose logs backend`
2. Verify storage: `ls -la backend/data/pdfs/`
3. Test endpoints: Use the provided test script `./test_pdf_storage.sh`
4. Review documentation: `README.md` and `IMPLEMENTATION_SUMMARY.md`

---

## Version History

### v1.0.0 (Current)
- PDF storage and persistence
- On-demand ingestion endpoints
- Mock data decoupling
- Dynamic compliance controls
- Enhanced error handling