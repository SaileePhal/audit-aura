"""
Detection Skills
Skills for detecting compliance violations
"""
from .control_based import ControlBasedDetectionSkill, create_detection_skills_from_controls

__all__ = [
    'ControlBasedDetectionSkill',
    'create_detection_skills_from_controls',
]