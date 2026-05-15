# IBM Cloud Integration Setup Guide

This guide explains how to integrate AuditAura with IBM Cloud services for real-time compliance monitoring.

## Overview

AuditAura can connect to your IBM Cloud account to monitor:
- **IBM Cloud Activity Tracker**: Configuration changes and security events
- **IBM Cloud Monitoring**: Performance metrics and alerts
- **IBM Cloud Logs**: Application and system logs

## Prerequisites

1. An active IBM Cloud account
2. Access to create service instances and API keys
3. Appropriate IAM permissions for the services you want to monitor

## Step 1: Create IBM Cloud Services

### 1.1 Create Activity Tracker Instance

1. Log in to [IBM Cloud Console](https://cloud.ibm.com)
2. Navigate to **Observability** → **Activity Tracker**
3. Click **Create instance**
4. Select your region (e.g., `us-south`)
5. Choose a plan (Lite for testing, paid for production)
6. Name your instance (e.g., `audit-aura-activity-tracker`)
7. Click **Create**
8. Note the **Instance ID** from the instance details page

### 1.2 Create Monitoring Instance (Optional)

1. Navigate to **Observability** → **Monitoring**
2. Click **Create instance**
3. Select your region
4. Choose a plan
5. Name your instance (e.g., `audit-aura-monitoring`)
6. Click **Create**
7. Note the **Instance ID**

### 1.3 Create Logs Instance (Optional)

1. Navigate to **Observability** → **Logs**
2. Click **Create instance**
3. Select your region
4. Choose a plan
5. Name your instance (e.g., `audit-aura-logs`)
6. Click **Create**
7. Note the **Instance ID**

## Step 2: Create IBM Cloud API Key

1. In IBM Cloud Console, click your profile icon (top right)
2. Select **Manage** → **Access (IAM)**
3. Click **API keys** in the left sidebar
4. Click **Create an IBM Cloud API key**
5. Enter a name (e.g., `audit-aura-api-key`)
6. Add a description (e.g., "API key for AuditAura compliance monitoring")
7. Click **Create**
8. **IMPORTANT**: Copy and save the API key immediately - you won't be able to see it again!

## Step 3: Configure IAM Permissions

Ensure your API key has the following permissions:

### Required Permissions:
- **Activity Tracker**: Reader role
- **Monitoring**: Reader role (if using)
- **Logs**: Reader role (if using)

To set permissions:
1. Go to **Manage** → **Access (IAM)**
2. Click **Service IDs** or **Users** (depending on your setup)
3. Select your service ID or user
4. Click **Access policies**
5. Click **Assign access**
6. Select the service (Activity Tracker, Monitoring, or Logs)
7. Choose **Reader** role
8. Click **Add** and **Assign**

## Step 4: Configure AuditAura

### 4.1 Update Environment Variables

Create or update your `.env` file in the project root:

```bash
# IBM Cloud Configuration
IBM_CLOUD_API_KEY=your_api_key_here
IBM_CLOUD_REGION=us-south
IBM_ACTIVITY_TRACKER_INSTANCE_ID=your_activity_tracker_instance_id
IBM_MONITORING_INSTANCE_ID=your_monitoring_instance_id
IBM_LOGS_INSTANCE_ID=your_logs_instance_id
IBM_CLOUD_ENABLED=true

# Disable mock mode to use real data
MOCK_MODE=false
```

### 4.2 Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `IBM_CLOUD_API_KEY` | Yes | Your IBM Cloud API key | `abc123...` |
| `IBM_CLOUD_REGION` | Yes | IBM Cloud region | `us-south`, `eu-de`, `jp-tok` |
| `IBM_ACTIVITY_TRACKER_INSTANCE_ID` | Yes | Activity Tracker instance ID | `crn:v1:bluemix:...` |
| `IBM_MONITORING_INSTANCE_ID` | No | Monitoring instance ID | `crn:v1:bluemix:...` |
| `IBM_LOGS_INSTANCE_ID` | No | Logs instance ID | `crn:v1:bluemix:...` |
| `IBM_CLOUD_ENABLED` | Yes | Enable IBM Cloud integration | `true` or `false` |
| `MOCK_MODE` | Yes | Use mock data or real data | `false` for real data |

## Step 5: Upload Compliance PDFs

Before monitoring can detect violations, you need to upload your compliance audit PDFs (SOC2, C5, etc.):

1. Start the application:
   ```bash
   ./start.sh
   ```

2. Access the web interface at `http://localhost:3000`

3. Upload your compliance PDFs:
   - Navigate to the Admin Dashboard
   - Click "Upload PDF" or use the `/upload` API endpoint
   - Upload your SOC2 and C5 audit PDFs
   - The system will extract compliance controls automatically

### API Upload Example:

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/SOC2_audit.pdf"

curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/C5_audit.pdf"
```

## Step 6: Verify Integration

### 6.1 Check Service Health

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "mock_mode": false,
  "services": {
    "extractor": true,
    "vector_store": true,
    "notifications": true,
    "event_aggregator": true,
    "orchestrator": true,
    "tracker": true
  }
}
```

### 6.2 Check Dashboard

Visit `http://localhost:3000` and verify:
- Cloud event trackers show "active" status
- IBM Cloud Activity Tracker appears in the list
- Events are being received (check recent events section)

### 6.3 Monitor Logs

Check backend logs for successful connection:
```bash
docker-compose logs -f backend
```

Look for:
```
IBM Cloud authenticated successfully for region us-south
Event aggregator initialized (Mock Mode: False, IBM Cloud: True)
```

## Step 7: Test Real-Time Monitoring

### 7.1 Trigger a Configuration Change

In your IBM Cloud account, make a configuration change:
- Update an S3 bucket policy
- Modify a security group
- Change IAM permissions
- Update database settings

### 7.2 Observe in AuditAura

Within 10-30 seconds, you should see:
1. New event appears in "Recent Events"
2. If it violates a control, a violation is created
3. Compliance score updates in real-time
4. WebSocket notification sent to connected clients

## Troubleshooting

### Issue: "Failed to get IBM Cloud IAM token"

**Solution:**
- Verify your API key is correct
- Check that the API key hasn't expired
- Ensure you have internet connectivity
- Verify IAM permissions are set correctly

### Issue: "Activity Tracker API returned 403"

**Solution:**
- Check IAM permissions for Activity Tracker
- Verify the instance ID is correct
- Ensure the API key has Reader role for Activity Tracker

### Issue: "No events being received"

**Solution:**
- Verify Activity Tracker is configured to capture events
- Check that resources are in the same region as Activity Tracker
- Make some configuration changes to generate events
- Review Activity Tracker logs in IBM Cloud Console

### Issue: "Mock data still showing"

**Solution:**
- Ensure `MOCK_MODE=false` in `.env`
- Ensure `IBM_CLOUD_ENABLED=true` in `.env`
- Restart the application: `docker-compose restart`
- Check logs for any authentication errors

## Event Types Monitored

AuditAura monitors these IBM Cloud event types:

### Storage Events
- `cos.bucket.update` - Bucket configuration changes
- `cos.bucket.create` - New bucket creation
- `cos.bucket.delete` - Bucket deletion

### IAM Events
- `iam.policy.update` - Policy modifications
- `iam.policy.create` - New policy creation
- `iam.role.update` - Role changes

### Network Events
- `vpc.security-group.update` - Security group changes
- `vpc.network-acl.update` - Network ACL modifications

### Database Events
- `databases.instance.update` - Database configuration changes
- `databases.backup.update` - Backup policy changes

### Encryption Events
- `kms.key.update` - Key management changes
- `kms.key.rotate` - Key rotation events

## Real-Time Features

Once configured, AuditAura provides:

1. **Live Event Stream**: See configuration changes as they happen
2. **Instant Violation Detection**: Violations detected within seconds
3. **Real-Time Score Updates**: Compliance score updates automatically
4. **WebSocket Notifications**: Push notifications to connected clients
5. **Audit Trail**: Complete history of all events and violations

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables or secrets management
   - Rotate API keys regularly (every 90 days)
   - Use separate API keys for dev/staging/production

2. **Least Privilege**:
   - Grant only Reader permissions
   - Use service IDs instead of user API keys
   - Regularly audit IAM permissions

3. **Network Security**:
   - Use HTTPS for all API calls
   - Consider using IBM Cloud Private Endpoints
   - Implement IP allowlisting if possible

4. **Monitoring**:
   - Monitor API key usage in IBM Cloud
   - Set up alerts for unusual activity
   - Review Activity Tracker logs regularly

## Cost Considerations

### Activity Tracker Pricing
- **Lite Plan**: Free, limited events
- **7-day Plan**: $0.50/GB ingested
- **14-day Plan**: $0.75/GB ingested
- **30-day Plan**: $1.00/GB ingested

### Monitoring Pricing
- **Lite Plan**: Free, limited metrics
- **Graduated Tier**: $0.08/host/hour

### Logs Pricing
- **Lite Plan**: Free, limited logs
- **Standard Plan**: $0.50/GB ingested

**Recommendation**: Start with Lite plans for testing, then upgrade based on your event volume.

## Support

For issues or questions:
- Check the [main README](../README.md)
- Review [troubleshooting docs](../docs/troubleshooting/TROUBLESHOOTING.md)
- Open an issue on GitHub
- Contact IBM Cloud Support for IBM-specific issues

## Next Steps

After successful integration:
1. Upload additional compliance PDFs (HIPAA, PCI-DSS, etc.)
2. Configure email/Slack notifications
3. Set up GitHub integration for auto-remediation
4. Customize compliance rules for your organization
5. Train your team on the dashboard features

---

**Last Updated**: 2026-05-11
**Version**: 1.0.0