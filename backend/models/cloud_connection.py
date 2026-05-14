"""
Cloud Connection Models
Database models for managing cloud provider connections
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class CloudProvider(str, Enum):
    """Supported cloud providers"""
    AWS = "aws"
    IBM_CLOUD = "ibm_cloud"
    AZURE = "azure"
    GCP = "gcp"
    GENERIC = "generic"


class ConnectionStatus(str, Enum):
    """Connection status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    TESTING = "testing"


class CloudConnectionBase(BaseModel):
    """Base model for cloud connection"""
    name: str = Field(..., description="Connection name")
    provider: CloudProvider = Field(..., description="Cloud provider")
    description: Optional[str] = Field(None, description="Connection description")
    region: Optional[str] = Field(None, description="Cloud region")
    enabled: bool = Field(default=True, description="Whether connection is enabled")
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Connection name cannot be empty')
        if len(v) > 100:
            raise ValueError('Connection name must be less than 100 characters')
        return v.strip()


class AWSConnectionConfig(BaseModel):
    """AWS-specific connection configuration"""
    access_key_id: str = Field(..., description="AWS Access Key ID")
    secret_access_key: str = Field(..., description="AWS Secret Access Key")
    region: str = Field(default="us-east-1", description="AWS Region")
    session_token: Optional[str] = Field(None, description="AWS Session Token (for temporary credentials)")
    
    # Event source settings
    cloudtrail_enabled: bool = Field(default=True, description="Enable CloudTrail event ingestion")
    cloudwatch_enabled: bool = Field(default=False, description="Enable CloudWatch Logs ingestion")
    config_enabled: bool = Field(default=False, description="Enable AWS Config monitoring")
    
    # CloudTrail specific settings
    cloudtrail_log_group: Optional[str] = Field(None, description="CloudWatch Log Group for CloudTrail")
    cloudtrail_s3_bucket: Optional[str] = Field(None, description="S3 bucket for CloudTrail logs")


class IBMCloudConnectionConfig(BaseModel):
    """IBM Cloud-specific connection configuration"""
    api_key: str = Field(..., description="IBM Cloud API Key")
    region: str = Field(default="us-south", description="IBM Cloud Region")
    
    # Event source settings
    activity_tracker_enabled: bool = Field(default=True, description="Enable Activity Tracker event ingestion")
    platform_logs_enabled: bool = Field(default=False, description="Enable Platform Logs ingestion")
    monitoring_enabled: bool = Field(default=False, description="Enable Monitoring metrics ingestion")
    
    # Activity Tracker specific settings
    activity_tracker_instance_id: Optional[str] = Field(None, description="Activity Tracker Instance ID")
    activity_tracker_crn: Optional[str] = Field(None, description="Activity Tracker CRN")
    
    # Platform Logs specific settings
    logs_instance_id: Optional[str] = Field(None, description="Platform Logs Instance ID")
    logs_ingestion_key: Optional[str] = Field(None, description="Platform Logs Ingestion Key")
    
    # Monitoring specific settings
    monitoring_instance_id: Optional[str] = Field(None, description="Monitoring Instance ID")


class AzureConnectionConfig(BaseModel):
    """Azure-specific connection configuration"""
    tenant_id: str = Field(..., description="Azure Tenant ID")
    client_id: str = Field(..., description="Azure Client ID")
    client_secret: str = Field(..., description="Azure Client Secret")
    subscription_id: str = Field(..., description="Azure Subscription ID")
    
    # Service-specific settings
    activity_log_enabled: bool = Field(default=True, description="Enable Activity Log monitoring")
    security_center_enabled: bool = Field(default=True, description="Enable Security Center monitoring")


class GCPConnectionConfig(BaseModel):
    """GCP-specific connection configuration"""
    project_id: str = Field(..., description="GCP Project ID")
    credentials_json: str = Field(..., description="GCP Service Account JSON (as string)")
    
    # Service-specific settings
    cloud_logging_enabled: bool = Field(default=True, description="Enable Cloud Logging")
    cloud_audit_enabled: bool = Field(default=True, description="Enable Cloud Audit Logs")


class GenericConnectionConfig(BaseModel):
    """Generic connection configuration for custom integrations"""
    endpoint_url: str = Field(..., description="API Endpoint URL")
    auth_type: str = Field(default="api_key", description="Authentication type (api_key, bearer, basic)")
    api_key: Optional[str] = Field(None, description="API Key")
    bearer_token: Optional[str] = Field(None, description="Bearer Token")
    username: Optional[str] = Field(None, description="Username (for basic auth)")
    password: Optional[str] = Field(None, description="Password (for basic auth)")
    custom_headers: Optional[Dict[str, str]] = Field(None, description="Custom HTTP headers")


class CloudConnectionCreate(CloudConnectionBase):
    """Model for creating a new cloud connection"""
    config: Dict[str, Any] = Field(..., description="Provider-specific configuration (encrypted)")
    
    @validator('config')
    def validate_config(cls, v, values):
        provider = values.get('provider')
        if not provider:
            raise ValueError('Provider must be specified')
        
        # Validate config structure based on provider
        try:
            if provider == CloudProvider.AWS:
                AWSConnectionConfig(**v)
            elif provider == CloudProvider.IBM_CLOUD:
                IBMCloudConnectionConfig(**v)
            elif provider == CloudProvider.AZURE:
                AzureConnectionConfig(**v)
            elif provider == CloudProvider.GCP:
                GCPConnectionConfig(**v)
            elif provider == CloudProvider.GENERIC:
                GenericConnectionConfig(**v)
        except Exception as e:
            raise ValueError(f'Invalid configuration for {provider}: {str(e)}')
        
        return v


class CloudConnectionUpdate(BaseModel):
    """Model for updating a cloud connection"""
    name: Optional[str] = None
    description: Optional[str] = None
    region: Optional[str] = None
    enabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class CloudConnection(CloudConnectionBase):
    """Full cloud connection model with metadata"""
    id: str = Field(..., description="Unique connection ID")
    status: ConnectionStatus = Field(default=ConnectionStatus.INACTIVE, description="Connection status")
    config_encrypted: str = Field(..., description="Encrypted configuration")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    last_tested_at: Optional[datetime] = Field(None, description="Last connection test timestamp")
    last_test_result: Optional[str] = Field(None, description="Last connection test result")
    
    # Statistics
    events_processed: int = Field(default=0, description="Total events processed")
    last_event_at: Optional[datetime] = Field(None, description="Last event timestamp")
    error_count: int = Field(default=0, description="Error count")
    last_error: Optional[str] = Field(None, description="Last error message")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CloudConnectionResponse(CloudConnectionBase):
    """Response model for cloud connection (without sensitive data)"""
    id: str
    status: ConnectionStatus
    created_at: datetime
    updated_at: datetime
    last_tested_at: Optional[datetime] = None
    last_test_result: Optional[str] = None
    events_processed: int = 0
    last_event_at: Optional[datetime] = None
    error_count: int = 0
    
    # Config summary (non-sensitive fields only)
    config_summary: Dict[str, Any] = Field(default_factory=dict, description="Non-sensitive config summary")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ConnectionTestRequest(BaseModel):
    """Request model for testing a connection"""
    connection_id: Optional[str] = Field(None, description="Existing connection ID to test")
    config: Optional[Dict[str, Any]] = Field(None, description="New configuration to test")
    provider: Optional[CloudProvider] = Field(None, description="Provider (required if testing new config)")


class ConnectionTestResponse(BaseModel):
    """Response model for connection test"""
    success: bool = Field(..., description="Whether test was successful")
    message: str = Field(..., description="Test result message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional test details")
    tested_at: datetime = Field(default_factory=datetime.utcnow, description="Test timestamp")


class ConnectionListResponse(BaseModel):
    """Response model for listing connections"""
    connections: list[CloudConnectionResponse] = Field(default_factory=list, description="List of connections")
    total: int = Field(..., description="Total number of connections")


# Made with Bob