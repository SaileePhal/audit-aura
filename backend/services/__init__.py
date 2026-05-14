"""
Services Module - Backward Compatibility Layer

This module provides backward-compatible imports for code that still uses
the old services.* import paths. All functionality has been moved to:
- core/ - Business logic
- infrastructure/ - External systems
- utils/ - Utility functions

New code should import directly from the new locations.

Note: Imports are done lazily to avoid circular dependencies.
"""

def __getattr__(name):
    """Lazy import to avoid circular dependencies"""
    
    # Core - Compliance
    if name == "ComplianceTracker":
        from core.compliance.tracker import ComplianceTracker
        return ComplianceTracker
    elif name == "get_tracker":
        from core.compliance.tracker import get_tracker
        return get_tracker
    elif name == "SafeRuleEvaluator":
        from core.compliance.evaluator import SafeRuleEvaluator
        return SafeRuleEvaluator
    elif name == "evaluate_controls":
        from core.compliance.evaluator import evaluate_controls
        return evaluate_controls
    
    # Core - Detection
    elif name == "SkillBasedDetectionSystem":
        from core.detection.agent import SkillBasedDetectionSystem
        return SkillBasedDetectionSystem
    elif name == "get_detection_system":
        from core.detection.agent import get_detection_system
        return get_detection_system
    elif name == "initialize_detection_system_from_vector_store":
        from core.detection.agent import initialize_detection_system_from_vector_store
        return initialize_detection_system_from_vector_store
    elif name == "Skill":
        from core.detection.skills.core.base import Skill
        return Skill
    elif name == "SkillResult":
        from core.detection.skills.core.base import SkillResult
        return SkillResult
    elif name == "SkillCategory":
        from core.detection.skills.core.base import SkillCategory
        return SkillCategory
    elif name == "SkillRegistry":
        from core.detection.skills.core.registry import SkillRegistry
        return SkillRegistry
    elif name == "get_skill_registry":
        from core.detection.skills.core.registry import get_skill_registry
        return get_skill_registry
    
    # Core - Extraction
    elif name == "ComplianceExtractor":
        from core.extraction.extractor import ComplianceExtractor
        return ComplianceExtractor
    
    # Core - Monitoring
    elif name == "EventSource":
        from core.monitoring.event_sources import EventSource
        return EventSource
    elif name == "create_event_aggregator":
        from core.monitoring.event_sources import create_event_aggregator
        return create_event_aggregator
    elif name == "DynamicEventSourceManager":
        from core.monitoring.source_manager import DynamicEventSourceManager
        return DynamicEventSourceManager
    elif name == "get_dynamic_source_manager":
        from core.monitoring.source_manager import get_dynamic_source_manager
        return get_dynamic_source_manager
    
    # Infrastructure - Database
    elif name == "VectorStore":
        from infrastructure.database.vector_store import VectorStore
        return VectorStore
    elif name == "get_vector_store":
        from infrastructure.database.vector_store import get_vector_store
        return get_vector_store
    
    # Infrastructure - Security
    elif name == "EncryptionService":
        from infrastructure.security.encryption import EncryptionService
        return EncryptionService
    elif name == "get_encryption_service":
        from infrastructure.security.encryption import get_encryption_service
        return get_encryption_service
    
    # Infrastructure - Cloud
    elif name == "ConnectionManager":
        from infrastructure.cloud.connection_manager import ConnectionManager
        return ConnectionManager
    elif name == "get_connection_manager":
        from infrastructure.cloud.connection_manager import get_connection_manager
        return get_connection_manager
    elif name == "GitHubRemediationService":
        from infrastructure.cloud.github import GitHubRemediationService
        return GitHubRemediationService
    
    # Infrastructure - Messaging
    elif name == "WebSocketManager":
        from infrastructure.messaging.websocket import WebSocketManager
        return WebSocketManager
    elif name == "ws_manager":
        from infrastructure.messaging.websocket import ws_manager
        return ws_manager
    elif name == "start_heartbeat_task":
        from infrastructure.messaging.websocket import start_heartbeat_task
        return start_heartbeat_task
    elif name == "NotificationService":
        from infrastructure.messaging.notifications import NotificationService
        return NotificationService
    elif name == "SlackNotifier":
        from infrastructure.messaging.slack import SlackNotifier
        return SlackNotifier
    
    # Utils
    elif name == "ReportGenerator":
        from utils.report_generator import ReportGenerator
        return ReportGenerator
    elif name == "get_report_generator":
        from utils.report_generator import get_report_generator
        return get_report_generator
    elif name == "EvidenceManager":
        from utils.evidence_manager import EvidenceManager
        return EvidenceManager
    elif name == "get_evidence_manager":
        from utils.evidence_manager import get_evidence_manager
        return get_evidence_manager
    elif name == "generate_evidence":
        from utils.evidence import generate_evidence
        return generate_evidence
    elif name == "MockDataService":
        from utils.mock_data import MockDataService
        return MockDataService
    elif name == "get_mock_data_service":
        from utils.mock_data import get_mock_data_service
        return get_mock_data_service
    elif name == "PRTracker":
        from utils.pr_tracker import PRTracker
        return PRTracker
    elif name == "get_pr_tracker":
        from utils.pr_tracker import get_pr_tracker
        return get_pr_tracker
    
    raise AttributeError(f"module 'services' has no attribute '{name}'")