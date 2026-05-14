# Event Source Configuration Feature

## Overview

This feature allows users to configure specific event sources for their cloud connections, providing granular control over which data streams are ingested from each cloud provider.

## Supported Event Sources

### IBM Cloud
1. **IBM Cloud Activity Tracker** (Default: Enabled)
   - Tracks all API calls and configuration changes
   - Provides audit trail for compliance
   - Configuration options:
     - Instance ID
     - CRN (Cloud Resource Name)

2. **IBM Cloud Platform Logs** (Default: Disabled)
   - Ingests application and platform logs
   - Configuration options:
     - Logs Instance ID
     - Ingestion Key

3. **IBM Cloud Monitoring** (Default: Disabled)
   - Collects metrics and monitoring data
   - Configuration options:
     - Monitoring Instance ID

### AWS
1. **AWS CloudTrail Events** (Default: Enabled)
   - Tracks AWS API calls and account activity
   - Configuration options:
     - CloudWatch Log Group (optional)
     - S3 Bucket (optional)

2. **AWS CloudWatch Logs** (Default: Disabled)
   - Ingests application logs from CloudWatch

3. **AWS Config** (Default: Disabled)
   - Monitors AWS resource configurations

## Implementation Details

### Backend Changes

#### 1. Models (`backend/models/cloud_connection.py`)

**AWSConnectionConfig:**
```python
class AWSConnectionConfig(BaseModel):
    # Credentials
    access_key_id: str
    secret_access_key: str
    region: str = "us-east-1"
    session_token: Optional[str] = None
    
    # Event source settings
    cloudtrail_enabled: bool = True
    cloudwatch_enabled: bool = False
    config_enabled: bool = False
    
    # CloudTrail specific settings
    cloudtrail_log_group: Optional[str] = None
    cloudtrail_s3_bucket: Optional[str] = None
```

**IBMCloudConnectionConfig:**
```python
class IBMCloudConnectionConfig(BaseModel):
    # Credentials
    api_key: str
    region: str = "us-south"
    
    # Event source settings
    activity_tracker_enabled: bool = True
    platform_logs_enabled: bool = False
    monitoring_enabled: bool = False
    
    # Activity Tracker specific settings
    activity_tracker_instance_id: Optional[str] = None
    activity_tracker_crn: Optional[str] = None
    
    # Platform Logs specific settings
    logs_instance_id: Optional[str] = None
    logs_ingestion_key: Optional[str] = None
    
    # Monitoring specific settings
    monitoring_instance_id: Optional[str] = None
```

#### 2. Dynamic Event Sources (`backend/services/dynamic_event_sources.py`)

The `DynamicEventSourceManager` now respects event source configuration:

- **AWS Sources**: Only creates CloudTrail source if `cloudtrail_enabled` is true
- **IBM Cloud Sources**: Creates sources based on individual enable flags
- **Logging**: Provides detailed information about which sources are enabled

### Frontend Changes

#### Connection Form (`frontend/src/pages/admin/Connections.tsx`)

Added "Event Sources" section for each provider with:
- Checkboxes to enable/disable each source
- Collapsible configuration fields for each enabled source
- Clear labeling and help text
- Validation for required fields

## Usage Guide

### Creating a Connection with Event Sources

1. **Navigate to Connections Page**
   - Go to Admin → Connections
   - Click "Add Connection"

2. **Configure Basic Information**
   - Enter connection name
   - Select cloud provider (AWS or IBM Cloud)
   - Enter credentials

3. **Configure Event Sources**
   - Scroll to "Event Sources" section
   - Enable desired event sources using checkboxes
   - Fill in required configuration for enabled sources

4. **Save and Test**
   - Click "Create Connection"
   - Use "Test Connection" button to verify

### Example: IBM Cloud with Activity Tracker Only

```json
{
  "name": "Production IBM Cloud",
  "provider": "ibm_cloud",
  "config": {
    "api_key": "your-api-key",
    "region": "us-south",
    "activity_tracker_enabled": true,
    "platform_logs_enabled": false,
    "monitoring_enabled": false,
    "activity_tracker_instance_id": "crn:v1:bluemix:public:logdnaat:us-south:a/..."
  }
}
```

### Example: AWS with CloudTrail and CloudWatch

```json
{
  "name": "Production AWS",
  "provider": "aws",
  "config": {
    "access_key_id": "AKIAIOSFODNN7EXAMPLE",
    "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "cloudtrail_enabled": true,
    "cloudwatch_enabled": true,
    "config_enabled": false,
    "cloudtrail_log_group": "/aws/cloudtrail/logs"
  }
}
```

## Benefits

1. **Cost Optimization**: Only ingest data from sources you need
2. **Performance**: Reduce processing overhead by disabling unused sources
3. **Compliance**: Enable only audit-relevant sources for compliance monitoring
4. **Flexibility**: Different configurations for different environments (dev/staging/prod)

## API Endpoints

All existing connection endpoints support the new event source configuration:

- `POST /api/connections` - Create connection with event sources
- `PATCH /api/connections/{id}` - Update event source configuration
- `GET /api/connections/{id}` - View current configuration (non-sensitive)
- `POST /api/connections/{id}/test` - Test connection with current sources

## Migration Notes

### Existing Connections

Existing connections will continue to work with default behavior:
- **IBM Cloud**: Activity Tracker enabled by default
- **AWS**: CloudTrail enabled by default
- Other sources disabled by default

### Updating Existing Connections

To update event source configuration for existing connections:
1. Edit the connection
2. Configure event sources as needed
3. Re-enter credentials (security requirement)
4. Save changes

## Future Enhancements

Potential future improvements:
1. Azure Activity Log and Security Center configuration
2. GCP Cloud Logging and Audit Logs configuration
3. Per-source filtering rules
4. Event source health monitoring
5. Source-specific rate limiting

## Troubleshooting

### Event Source Not Receiving Data

1. **Check Connection Status**: Ensure connection is "Active"
2. **Verify Event Source Enabled**: Check that the source checkbox is enabled
3. **Validate Configuration**: Ensure instance IDs and other settings are correct
4. **Test Connection**: Use the test button to verify credentials
5. **Check Logs**: Review backend logs for error messages

### Common Issues

**Issue**: "No events from Activity Tracker"
- **Solution**: Verify `activity_tracker_instance_id` is correct
- **Solution**: Ensure Activity Tracker is enabled in IBM Cloud

**Issue**: "CloudTrail events not appearing"
- **Solution**: Check that CloudTrail is configured in AWS
- **Solution**: Verify IAM permissions include CloudTrail read access

## Security Considerations

1. **Credential Storage**: All credentials are encrypted at rest
2. **API Keys**: Never logged or exposed in responses
3. **Instance IDs**: Non-sensitive, included in config summary
4. **Re-authentication**: Credentials must be re-entered when editing

## Made with Bob