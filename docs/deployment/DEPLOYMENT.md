# AuditAura Deployment Guide

## Quick Start

### 1. Rebuild Containers (Apply Latest Changes)

```bash
# Stop current containers
docker-compose down

# Rebuild with latest code
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### 2. Verify Deployment

```bash
# Check if services are running
docker-compose ps

# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# List stored PDFs
curl http://localhost:8000/pdfs

# Fetch controls
curl http://localhost:8000/controls
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Latest Changes Applied

### Backend Enhancements
- ✅ Enhanced JSON parsing (5 strategies)
- ✅ Reduced log noise (ERROR → WARNING/DEBUG)
- ✅ Added `/controls` endpoint
- ✅ PDF storage and persistence
- ✅ Re-ingestion endpoints

### Frontend Updates
- ✅ Dynamic controls from API
- ✅ PDF upload UI
- ✅ Re-ingest button
- ✅ Real-time status messages
- ✅ Stored PDFs display

## Environment Variables

Create `.env` file in project root:

```env
# Required
OPENAI_API_KEY=your_key_here

# Optional
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=mistral
MOCK_MODE=true
COMPLIANCE_CHECK_INTERVAL=30

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Troubleshooting

### Issue: Containers won't start

```bash
# Check logs
docker-compose logs

# Remove old containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Backend errors

```bash
# View backend logs
docker-compose logs -f backend

# Restart backend only
docker-compose restart backend

# Check backend health
curl http://localhost:8000/health
```

### Issue: Frontend not loading

```bash
# View frontend logs
docker-compose logs -f frontend

# Restart frontend only
docker-compose restart frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Issue: PDF upload fails

```bash
# Check if directory exists
docker-compose exec backend ls -la /app/data/pdfs/

# Check permissions
docker-compose exec backend chmod -R 777 /app/data/

# Verify volume mount
docker-compose exec backend df -h /app/data
```

## Production Deployment

### 1. Security Hardening

```bash
# Use production environment
export MOCK_MODE=false

# Set secure secrets
export OPENAI_API_KEY=prod_key_here

# Enable HTTPS (use nginx reverse proxy)
# Configure firewall rules
# Set up monitoring and logging
```

### 2. Performance Optimization

```bash
# Increase worker processes
# Configure caching
# Set up load balancing
# Enable CDN for frontend assets
```

### 3. Monitoring

```bash
# View resource usage
docker stats

# Check disk space
df -h

# Monitor logs
tail -f backend/info.log
```

## Backup and Recovery

### Backup Data

```bash
# Backup PDFs
tar -czf pdfs_backup.tar.gz backend/data/pdfs/

# Backup vector store
tar -czf vector_store_backup.tar.gz backend/data/vector_store/

# Backup mock data
cp backend/data/mock_data.json mock_data_backup.json
```

### Restore Data

```bash
# Restore PDFs
tar -xzf pdfs_backup.tar.gz -C backend/data/

# Restore vector store
tar -xzf vector_store_backup.tar.gz -C backend/data/

# Restore mock data
cp mock_data_backup.json backend/data/mock_data.json

# Restart services
docker-compose restart
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing

```bash
# Use nginx or traefik for load balancing
# Configure health checks
# Set up session persistence
```

## Maintenance

### Update Dependencies

```bash
# Update Python packages
docker-compose exec backend pip install --upgrade -r requirements.txt

# Update Node packages
docker-compose exec frontend npm update

# Rebuild containers
docker-compose build
docker-compose up -d
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove stopped containers
docker container prune
```

## Testing

### Run Tests

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test

# Integration tests
./test_pdf_storage.sh
```

### Manual Testing

```bash
# Upload PDF
curl -X POST "http://localhost:8000/upload" \
  -F "file=@test.pdf"

# Re-ingest
curl -X POST "http://localhost:8000/ingest"

# Check controls
curl http://localhost:8000/controls

# Check violations
curl http://localhost:8000/violations
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review `TROUBLESHOOTING.md`
3. Check `API_REFERENCE.md`
4. Review `IMPLEMENTATION_SUMMARY.md`

## Quick Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose build

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Status
docker-compose ps

# Shell access
docker-compose exec backend bash
docker-compose exec frontend sh