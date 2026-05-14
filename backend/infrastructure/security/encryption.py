"""
Encryption Service
Handles secure encryption and decryption of sensitive credentials
"""
import base64
import json
import logging
import os
from typing import Any, Dict, Optional

from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)


class EncryptionService:
    """Service for encrypting and decrypting sensitive data"""
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize encryption service
        
        Args:
            encryption_key: Base64-encoded encryption key. If not provided, generates a new one.
        """
        if encryption_key:
            self.key = encryption_key.encode()
        else:
            # Generate a new key from environment or create one
            self.key = self._get_or_create_key()
        
        self.fernet = Fernet(self.key)
        logger.info("Encryption service initialized")
    
    def _get_or_create_key(self) -> bytes:
        """Get encryption key from environment or generate a new one"""
        # Try to get key from environment
        env_key = os.getenv('ENCRYPTION_KEY')
        if env_key:
            return env_key.encode()
        
        # Generate a new key
        key = Fernet.generate_key()
        logger.warning(
            "No ENCRYPTION_KEY found in environment. Generated a new key. "
            "Set ENCRYPTION_KEY in .env to persist encrypted data across restarts."
        )
        return key
    
    def encrypt(self, data: Dict[str, Any]) -> str:
        """
        Encrypt a dictionary of data
        
        Args:
            data: Dictionary to encrypt
            
        Returns:
            Base64-encoded encrypted string
        """
        try:
            # Convert dict to JSON string
            json_str = json.dumps(data)
            
            # Encrypt
            encrypted_bytes = self.fernet.encrypt(json_str.encode())
            
            # Return as base64 string
            return base64.b64encode(encrypted_bytes).decode()
            
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise ValueError(f"Failed to encrypt data: {str(e)}")
    
    def decrypt(self, encrypted_data: str) -> Dict[str, Any]:
        """
        Decrypt an encrypted string back to dictionary
        
        Args:
            encrypted_data: Base64-encoded encrypted string
            
        Returns:
            Decrypted dictionary
        """
        try:
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_data.encode())
            
            # Decrypt
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            
            # Parse JSON
            json_str = decrypted_bytes.decode()
            return json.loads(json_str)
            
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError(f"Failed to decrypt data: {str(e)}")
    
    def encrypt_field(self, value: str) -> str:
        """
        Encrypt a single field value
        
        Args:
            value: String value to encrypt
            
        Returns:
            Base64-encoded encrypted string
        """
        try:
            encrypted_bytes = self.fernet.encrypt(value.encode())
            return base64.b64encode(encrypted_bytes).decode()
        except Exception as e:
            logger.error(f"Field encryption failed: {e}")
            raise ValueError(f"Failed to encrypt field: {str(e)}")
    
    def decrypt_field(self, encrypted_value: str) -> str:
        """
        Decrypt a single field value
        
        Args:
            encrypted_value: Base64-encoded encrypted string
            
        Returns:
            Decrypted string value
        """
        try:
            encrypted_bytes = base64.b64decode(encrypted_value.encode())
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode()
        except Exception as e:
            logger.error(f"Field decryption failed: {e}")
            raise ValueError(f"Failed to decrypt field: {str(e)}")
    
    def mask_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mask sensitive fields in a dictionary for logging/display
        
        Args:
            data: Dictionary with potentially sensitive data
            
        Returns:
            Dictionary with sensitive fields masked
        """
        sensitive_keys = {
            'api_key', 'secret', 'password', 'token', 'credentials',
            'access_key', 'secret_key', 'client_secret', 'bearer_token',
            'access_key_id', 'secret_access_key', 'session_token'
        }
        
        masked_data = {}
        for key, value in data.items():
            key_lower = key.lower()
            
            # Check if key contains sensitive terms
            is_sensitive = any(term in key_lower for term in sensitive_keys)
            
            if is_sensitive and isinstance(value, str) and len(value) > 0:
                # Show first 4 and last 4 characters
                if len(value) > 8:
                    masked_data[key] = f"{value[:4]}...{value[-4:]}"
                else:
                    masked_data[key] = "***"
            elif isinstance(value, dict):
                # Recursively mask nested dictionaries
                masked_data[key] = self.mask_sensitive_data(value)
            else:
                masked_data[key] = value
        
        return masked_data
    
    def get_config_summary(self, config: Dict[str, Any], provider: str) -> Dict[str, Any]:
        """
        Get a non-sensitive summary of configuration for display
        
        Args:
            config: Full configuration dictionary
            provider: Cloud provider type
            
        Returns:
            Dictionary with non-sensitive configuration details
        """
        summary = {}
        
        # Provider-specific non-sensitive fields
        non_sensitive_fields = {
            'aws': ['region', 'cloudwatch_enabled', 'cloudtrail_enabled', 'config_enabled'],
            'ibm_cloud': ['region', 'activity_tracker_enabled', 'monitoring_enabled', 'logs_enabled'],
            'azure': ['tenant_id', 'subscription_id', 'activity_log_enabled', 'security_center_enabled'],
            'gcp': ['project_id', 'cloud_logging_enabled', 'cloud_audit_enabled'],
            'generic': ['endpoint_url', 'auth_type']
        }
        
        allowed_fields = non_sensitive_fields.get(provider, [])
        
        for field in allowed_fields:
            if field in config:
                summary[field] = config[field]
        
        return summary


# Global encryption service instance
_encryption_service: Optional[EncryptionService] = None


def get_encryption_service() -> EncryptionService:
    """Get the global encryption service instance"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service


# Made with Bob