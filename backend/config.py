"""
Configuration management for AuditAura
Handles environment variables and application settings
"""
import os
from typing import Optional
from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)


class Config(BaseModel):
    """Application configuration"""
    
    # Encryption Configuration
    encryption_key: Optional[str] = Field(default=None, env='ENCRYPTION_KEY')
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = Field(default=None, env='OPENAI_API_KEY')
    openai_enabled: bool = Field(default=False, env='OPENAI_ENABLED')
    
    # Ollama Configuration
    ollama_host: str = Field(default='http://ollama:11434', env='OLLAMA_HOST')
    ollama_model: str = Field(default='phi4-mini', env='OLLAMA_MODEL')
    ollama_enabled: bool = Field(default=False, env='OLLAMA_ENABLED')
    
    # LM Studio Configuration
    lm_studio_host: str = Field(default='http://localhost:1234', env='LM_STUDIO_HOST')
    lm_studio_model: str = Field(default='google/gemma-2-9b', env='LM_STUDIO_MODEL')
    lm_studio_enabled: bool = Field(default=True, env='LM_STUDIO_ENABLED')
    
    # Google Gemini Configuration
    google_api_key: Optional[str] = Field(default=None, env='GOOGLE_API_KEY')
    gemini_model: str = Field(default='gemini-1.5-flash', env='GEMINI_MODEL')
    gemini_enabled: bool = Field(default=False, env='GEMINI_ENABLED')
    
    # OpenCode.ai Zen Configuration
    opencode_api_key: Optional[str] = Field(default=None, env='OPENCODE_API_KEY')
    opencode_model: str = Field(default='zen-1.0', env='OPENCODE_MODEL')
    opencode_base_url: str = Field(default='https://api.opencode.ai/v1', env='OPENCODE_BASE_URL')
    opencode_enabled: bool = Field(default=False, env='OPENCODE_ENABLED')
    
    # Email Configuration
    smtp_host: Optional[str] = Field(default=None, env='SMTP_HOST')
    smtp_port: int = Field(default=587, env='SMTP_PORT')
    smtp_user: Optional[str] = Field(default=None, env='SMTP_USER')
    smtp_password: Optional[str] = Field(default=None, env='SMTP_PASSWORD')
    smtp_from: str = Field(default='noreply@auditaura.com', env='SMTP_FROM')
    
    # Slack Configuration
    slack_webhook_url: Optional[str] = Field(default=None, env='SLACK_WEBHOOK_URL')
    
    # GitHub Configuration
    github_token: Optional[str] = Field(default=None, env='GITHUB_TOKEN')
    github_repo_owner: Optional[str] = Field(default=None, env='GITHUB_REPO_OWNER')
    github_repo_name: Optional[str] = Field(default=None, env='GITHUB_REPO_NAME')
    
    # IBM Cloud Configuration
    ibm_cloud_api_key: Optional[str] = Field(default=None, env='IBM_CLOUD_API_KEY')
    ibm_cloud_region: str = Field(default='us-south', env='IBM_CLOUD_REGION')
    ibm_activity_tracker_instance_id: Optional[str] = Field(default=None, env='IBM_ACTIVITY_TRACKER_INSTANCE_ID')
    ibm_monitoring_instance_id: Optional[str] = Field(default=None, env='IBM_MONITORING_INSTANCE_ID')
    ibm_logs_instance_id: Optional[str] = Field(default=None, env='IBM_LOGS_INSTANCE_ID')
    ibm_cloud_enabled: bool = Field(default=False, env='IBM_CLOUD_ENABLED')
    
    # Application Configuration
    log_level: str = Field(default='INFO', env='LOG_LEVEL')
    mock_mode: bool = Field(default=True, env='MOCK_MODE')  # Only affects dashboard fallback data, not event sources
    compliance_check_interval: int = Field(default=30, env='COMPLIANCE_CHECK_INTERVAL')
    
    # Database Configuration
    database_url: Optional[str] = Field(default=None, env='DATABASE_URL')
    
    # Vector Store Configuration
    vector_store_path: str = Field(default='./data/vector_store', env='VECTOR_STORE_PATH')
    
    # API Configuration
    api_host: str = Field(default='0.0.0.0', env='API_HOST')
    api_port: int = Field(default=8000, env='API_PORT')
    
    @validator('encryption_key')
    def validate_encryption_key(cls, v):
        # Warn if encryption key is not set or is a placeholder
        if not v or v == 'your_encryption_key_here':
            logger.warning(
                'ENCRYPTION_KEY is not set or is a placeholder. '
                'A temporary key will be generated, but encrypted data will not persist across restarts. '
                'Generate a key with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
            )
        return v
    
    @validator('openai_api_key')
    def validate_openai_key(cls, v, values):
        # Only validate if OpenAI is enabled
        if values.get('openai_enabled', False):
            if not v or v == 'your_openai_api_key_here':
                raise ValueError('OPENAI_API_KEY must be set to a valid API key when OPENAI_ENABLED=true')
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'LOG_LEVEL must be one of {valid_levels}')
        return v.upper()
    
    @validator('compliance_check_interval')
    def validate_interval(cls, v):
        if v < 1:
            raise ValueError('COMPLIANCE_CHECK_INTERVAL must be at least 1 second')
        return v
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        case_sensitive = False


def load_config() -> Config:
    """Load and validate configuration from environment"""
    try:
        config = Config(
            encryption_key=os.getenv('ENCRYPTION_KEY'),
            openai_api_key=os.getenv('OPENAI_API_KEY'),
            openai_enabled=os.getenv('OPENAI_ENABLED', 'false').lower() == 'true',
            ollama_host=os.getenv('OLLAMA_HOST', 'http://ollama:11434'),
            ollama_model=os.getenv('OLLAMA_MODEL', 'phi4-mini'),
            ollama_enabled=os.getenv('OLLAMA_ENABLED', 'false').lower() == 'true',
            lm_studio_host=os.getenv('LM_STUDIO_HOST', 'http://localhost:1234'),
            lm_studio_model=os.getenv('LM_STUDIO_MODEL', 'google/gemma-2-9b'),
            lm_studio_enabled=os.getenv('LM_STUDIO_ENABLED', 'true').lower() == 'true',
            google_api_key=os.getenv('GOOGLE_API_KEY'),
            gemini_model=os.getenv('GEMINI_MODEL', 'gemini-1.5-flash'),
            gemini_enabled=os.getenv('GEMINI_ENABLED', 'false').lower() == 'true',
            opencode_api_key=os.getenv('OPENCODE_API_KEY'),
            opencode_model=os.getenv('OPENCODE_MODEL', 'zen-1.0'),
            opencode_base_url=os.getenv('OPENCODE_BASE_URL', 'https://api.opencode.ai/v1'),
            opencode_enabled=os.getenv('OPENCODE_ENABLED', 'false').lower() == 'true',
            smtp_host=os.getenv('SMTP_HOST'),
            smtp_port=int(os.getenv('SMTP_PORT', '587')),
            smtp_user=os.getenv('SMTP_USER'),
            smtp_password=os.getenv('SMTP_PASSWORD'),
            smtp_from=os.getenv('SMTP_FROM', 'noreply@auditaura.com'),
            slack_webhook_url=os.getenv('SLACK_WEBHOOK_URL'),
            github_token=os.getenv('GITHUB_TOKEN'),
            github_repo_owner=os.getenv('GITHUB_REPO_OWNER'),
            github_repo_name=os.getenv('GITHUB_REPO_NAME'),
            ibm_cloud_api_key=os.getenv('IBM_CLOUD_API_KEY'),
            ibm_cloud_region=os.getenv('IBM_CLOUD_REGION', 'us-south'),
            ibm_activity_tracker_instance_id=os.getenv('IBM_ACTIVITY_TRACKER_INSTANCE_ID'),
            ibm_monitoring_instance_id=os.getenv('IBM_MONITORING_INSTANCE_ID'),
            ibm_logs_instance_id=os.getenv('IBM_LOGS_INSTANCE_ID'),
            ibm_cloud_enabled=os.getenv('IBM_CLOUD_ENABLED', 'false').lower() == 'true',
            log_level=os.getenv('LOG_LEVEL', 'INFO'),
            mock_mode=os.getenv('MOCK_MODE', 'true').lower() == 'true',
            compliance_check_interval=int(os.getenv('COMPLIANCE_CHECK_INTERVAL', '30')),
            database_url=os.getenv('DATABASE_URL'),
            vector_store_path=os.getenv('VECTOR_STORE_PATH', './data/vector_store'),
            api_host=os.getenv('API_HOST', '0.0.0.0'),
            api_port=int(os.getenv('API_PORT', '8000'))
        )
        
        # Setup logging
        logging.basicConfig(
            level=getattr(logging, config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        logger.info(f"Configuration loaded successfully (Mock Mode for Dashboard: {config.mock_mode})")
        return config
        
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        raise


# Global config instance
config: Optional[Config] = None


def get_config() -> Config:
    """Get the global configuration instance"""
    global config
    if config is None:
        config = load_config()
    return config

# Made with Bob
