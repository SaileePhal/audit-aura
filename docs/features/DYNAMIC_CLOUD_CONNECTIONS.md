# Dynamic Cloud Provider Connection Management

## Overview

This feature enables dynamic management of cloud provider connections without requiring environment variables or application restarts. Administrators can add, configure, test, and manage multiple cloud provider connections through a web UI, with credentials securely encrypted at rest.

## Architecture

### Components

1. **Backend Models** (`backend/models/cloud_connection.py`)
   - Pydantic models for connection data validation
   - Support for AWS, IBM Cloud, Azure, GCP, and generic providers
   - Provider-specific configuration schemas

2. **Encryption Service** (`backend/services/encryption.py`)
   - Secure credential encryption using Fernet (symmetric encryption)
   - Automatic key generation or environment-based key
   - Sensitive data masking for logs and display

3. **Connection Manager** (`backend/services/connection_manager.py`)
   - CRUD operations for cloud connections
   - Encrypted credential storage in JSON file
   - Connection testing and validation
   - Statistics tracking (events processed, errors, etc.)

4. **Dynamic Event Sources** (`backend/services/dynamic_event_sources.py`)
   - Creates event sources dynamically from stored connections
   - Manages event aggregation from multiple providers
   - Real-time connection status updates

5. **API Endpoints** (`backend/routers/connections.py`)
   - RESTful API for connection management
   - Connection testing endpoints
   - Statistics and monitoring endpoints

6. **Frontend UI** (`frontend/src/pages/admin/Connections.tsx`)
   - Connection management interface
   - Real-time status monitoring
   - Connection testing and validation

## Supported Cloud Providers

### AWS
- **Authentication**: Access Key ID + Secret Access Key (+ optional Session Token)
- **Services**: CloudWatch, CloudTrail, AWS Config
- **Configuration**:
  ```json
  {
    "access_key_id": "AKIA...",
    "secret_access_key": "...",
    "region": "us-east-1",
    "session_token": "optional",
    "cloudwatch_enabled": true,
    "cloudtrail_enabled": true,
    "config_enabled": true
  }
  ```

### IBM Cloud
- **Authentication**: API Key
- **Services**: Activity Tracker, Monitoring, Logs
- **Configuration**:
  ```json
  {
    "api_key": "...",
    "region": "us-south",
    "activity_tracker_instance_id": "...",
    "monitoring_instance_id": "...",
    "logs_instance_id": "...",
    "activity_tracker_enabled": true,
    "monitoring_enabled": false,
    "logs_enabled": false
  }
  ```

### Azure
- **Authentication**: Service Principal (Tenant ID + Client ID + Client Secret)
- **Services**: Activity Log, Security Center
- **Configuration**:
  ```json
  {
    "tenant_id": "...",
    "client_id": "...",
    "client_secret": "...",
    "subscription_id": "...",
    "activity_log_enabled": true,
    "security_center_enabled": true
  }
  ```

### Google Cloud Platform
- **Authentication**: Service Account JSON
- **Services**: Cloud Logging, Cloud Audit Logs
- **Configuration**:
  ```json
  {
    "project_id": "my-project",
    "credentials_json": "{...service account JSON...}",
    "cloud_logging_enabled": true,
    "cloud_audit_enabled": true
  }
  ```

### Generic
- **Authentication**: API Key, Bearer Token, or Basic Auth
- **Use Case**: Custom integrations and third-party services
- **Configuration**:
  ```json
  {
    "endpoint_url": "https://api.example.com",
    "auth_type": "api_key",
    "api_key": "...",
    "custom_headers": {
      "X-Custom-Header": "value"
    }
  }
  ```

## Security

### Encryption

- **Algorithm**: Fernet (symmetric encryption based on AES-128-CBC)
- **Key Management**: 
  - Set `ENCRYPTION_KEY` in `.env` for production
  - Auto-generated if not provided (not persistent across restarts)
  - Generate key: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

### Data Protection

- Credentials encrypted at rest in `./data/connections.json`
- Sensitive fields masked in logs and API responses
- No credentials in environment variables
- Secure credential transmission over HTTPS (in production)

### Access Control

- Connection management restricted to admin role
- API endpoints require authentication (implement in production)
- Audit logging for all connection operations

## API Reference

### Create Connection
```http
POST /api/connections
Content-Type: application/json

{
  "name": "Production AWS",
  "provider": "aws",
  "description": "Production AWS account monitoring",
  "region": "us-east-1",
  "enabled": true,
  "config": {
    "access_key_id": "AKIA...",
    "secret_access_key": "...",
    "region": "us-east-1"
  }
}
```

### List Connections
```http
GET /api/connections?provider=aws&enabled_only=true
```

### Get Connection
```http
GET /api/connections/{connection_id}
```

### Update Connection
```http
PATCH /api/connections/{connection_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "enabled": false
}
```

### Delete Connection
```http
DELETE /api/connections/{connection_id}
```

### Test Connection
```http
POST /api/connections/{connection_id}/test
```

### Enable/Disable Connection
```http
POST /api/connections/{connection_id}/enable
POST /api/connections/{connection_id}/disable
```

### Get Statistics
```http
GET /api/connections/stats/summary
```

## Usage Guide

### Adding a New Connection

1. Navigate to **Admin > Connections**
2. Click **Add Connection**
3. Fill in connection details:
   - Name: Descriptive name for the connection
   - Provider: Select cloud provider
   - Description: Optional description
   - Region: Cloud region (if applicable)
   - Configuration: Provider-specific credentials
4. Click **Test Connection** to validate
5. Click **Save** to store the connection

### Testing Connections

- Click the refresh icon next to any connection
- View test results in real-time
- Connection status updates automatically:
  - **Active**: Connection tested successfully
  - **Error**: Connection test failed
  - **Inactive**: Connection not yet tested
  - **Testing**: Test in progress

### Monitoring Connections

The Connections page displays:
- Total connections count
- Active connections count
- Error connections count
- Total events processed across all connections

Each connection shows:
- Current status
- Events processed
- Last tested timestamp
- Error count
- Provider and region

### Managing Connections

- **Enable/Disable**: Toggle switch to enable/disable event monitoring
- **Edit**: Modify connection details and credentials
- **Delete**: Remove connection permanently
- **Test**: Validate connection credentials

## Migration from Environment Variables

### Before (Environment Variables)
```bash
# .env
IBM_CLOUD_API_KEY=your_api_key
IBM_CLOUD_REGION=us-south
IBM_ACTIVITY_TRACKER_INSTANCE_ID=instance_id
```

### After (Dynamic Connections)
1. Remove environment variables from `.env`
2. Add connection via UI or API
3. Connection stored encrypted in `./data/connections.json`
4. No application restart required

## Troubleshooting

### Connection Test Failures

**AWS**:
- Verify Access Key ID and Secret Access Key
- Check IAM permissions (CloudTrail, CloudWatch, STS)
- Ensure correct region

**IBM Cloud**:
- Verify API Key is valid
- Check IAM permissions for Activity Tracker
- Ensure instance IDs are correct

**Azure**:
- Verify Service Principal credentials
- Check subscription access
- Ensure correct tenant ID

**GCP**:
- Verify Service Account JSON is valid
- Check project permissions
- Ensure APIs are enabled

### Encryption Key Issues

If you see "Failed to decrypt configuration":
1. Check `ENCRYPTION_KEY` in `.env`
2. Ensure key hasn't changed since connections were created
3. If key is lost, connections must be recreated

### No Events Received

1. Verify connection is **enabled**
2. Test connection to ensure it's **active**
3. Check connection error count
4. Review application logs for errors
5. Verify cloud provider has events to send

## Best Practices

1. **Use Descriptive Names**: Name connections clearly (e.g., "Production AWS US-East", "Dev IBM Cloud")
2. **Test Before Enabling**: Always test connections before enabling
3. **Monitor Error Counts**: Regularly check for connection errors
4. **Rotate Credentials**: Update credentials periodically
5. **Backup Encryption Key**: Store `ENCRYPTION_KEY` securely
6. **Use Least Privilege**: Grant minimum required permissions to cloud credentials
7. **Enable Only Active Connections**: Disable unused connections to reduce overhead

## Performance Considerations

- Each enabled connection creates an active event source
- Event aggregation handles multiple sources efficiently
- Connection statistics updated in real-time
- Recommended: Monitor 5-10 connections simultaneously
- For large deployments: Consider connection pooling and rate limiting

## Future Enhancements

- [ ] Connection health monitoring and alerts
- [ ] Automatic credential rotation
- [ ] Connection templates for common configurations
- [ ] Bulk connection import/export
- [ ] Connection groups and tagging
- [ ] Advanced filtering and search
- [ ] Connection usage analytics
- [ ] Webhook notifications for connection events
- [ ] Multi-region connection management
- [ ] Connection dependency mapping

## Made with Bob