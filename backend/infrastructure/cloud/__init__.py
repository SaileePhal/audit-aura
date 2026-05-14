"""
Cloud Integration Layer
Cloud connection management and external services
"""

from .connection_manager import ConnectionManager, get_connection_manager
from .github import GitHubRemediationService

__all__ = [
    "ConnectionManager",
    "get_connection_manager",
    "GitHubRemediationService",
]