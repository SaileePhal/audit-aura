"""
Skill Registry - Global registry singleton
"""
import logging
from typing import Optional
from .base import SkillRegistry

logger = logging.getLogger(__name__)

# Global skill registry instance
_skill_registry: Optional[SkillRegistry] = None


def get_skill_registry() -> SkillRegistry:
    """Get or create global skill registry instance"""
    global _skill_registry
    if _skill_registry is None:
        _skill_registry = SkillRegistry()
    return _skill_registry