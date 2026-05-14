"""
Control-Based Detection Skill
Dynamically creates detection skills from compliance controls
"""
import logging
from typing import Dict, Any, List
from ..core.base import Skill, SkillResult, SkillCategory
from core.compliance.evaluator import SafeRuleEvaluator

logger = logging.getLogger(__name__)


class ControlBasedDetectionSkill(Skill):
    """Detection skill dynamically created from a compliance control"""
    
    def __init__(self, control: Dict[str, Any]):
        """
        Initialize detection skill from control
        
        Args:
            control: Compliance control dictionary with fields:
                - control_id: Unique identifier
                - description: Control description
                - condition: Boolean condition to evaluate
                - severity: Violation severity
                - remediation: Remediation steps
                - category: Control category
                - standard: Audit standard
                - provider: Cloud provider (optional)
        """
        self.control = control
        self.skill_id = f"detect_{control.get('control_id', 'unknown').replace('.', '_').replace('-', '_').lower()}"
        self.name = f"Detect: {control.get('description', 'Unknown')[:50]}"
        self.description = control.get('description', '')
        self.category = SkillCategory.DETECTION
        self.required_capabilities = ['event_evaluation']
        self.provider = control.get('provider', 'all')
        self.evaluator = SafeRuleEvaluator()
        
        logger.debug(f"Created detection skill: {self.skill_id}")
    
    def is_applicable(self, context: Dict[str, Any]) -> bool:
        """Check if this skill applies to the event"""
        event = context.get('event', {})
        
        # Check if event source matches provider
        if self.provider and self.provider != 'all':
            event_source = event.get('source', '').lower()
            if self.provider.lower() not in event_source and event_source not in self.provider.lower():
                return False
        
        # Always applicable if we have an event
        return bool(event)
    
    def execute(self, context: Dict[str, Any]) -> SkillResult:
        """Execute detection by evaluating control condition"""
        event = context.get('event', {})
        condition = self.control.get('condition', '')
        
        try:
            # Evaluate the control condition
            is_compliant = self.evaluator.evaluate_condition(condition, event)
            
            # If not compliant, we have a violation
            violation_detected = not is_compliant
            
            if violation_detected:
                logger.info(f"Violation detected: {self.control.get('control_id')} - {self.description}")
                
                return SkillResult(
                    success=True,
                    applicable=True,
                    violation_detected=True,
                    severity=self.control.get('severity', 'medium'),
                    details={
                        'control_id': self.control.get('control_id'),
                        'control_description': self.description,
                        'standard': self.control.get('standard'),
                        'category': self.control.get('category'),
                        'condition': condition,
                        'event': event,
                        'remediation': self.control.get('remediation'),
                        'skill_id': self.skill_id,
                        'skill_name': self.name
                    },
                    requires_followup=True,
                    followup_skills=['analyze_security_impact', 'generate_remediation']
                )
            else:
                # Compliant - no violation
                return SkillResult(
                    success=True,
                    applicable=True,
                    violation_detected=False,
                    details={
                        'control_id': self.control.get('control_id'),
                        'status': 'compliant',
                        'skill_id': self.skill_id
                    }
                )
        
        except Exception as e:
            logger.error(f"Error executing detection skill {self.skill_id}: {e}", exc_info=True)
            return SkillResult(
                success=False,
                applicable=True,
                details={
                    'error': str(e),
                    'control_id': self.control.get('control_id'),
                    'skill_id': self.skill_id
                }
            )


def create_detection_skills_from_controls(controls: List[Dict[str, Any]]) -> List[Skill]:
    """
    Create detection skills from compliance controls
    
    Args:
        controls: List of compliance controls
        
    Returns:
        List of detection skills
    """
    skills = []
    
    for control in controls:
        try:
            skill = ControlBasedDetectionSkill(control)
            skills.append(skill)
        except Exception as e:
            logger.error(f"Failed to create skill from control {control.get('control_id')}: {e}")
    
    logger.info(f"Created {len(skills)} detection skills from {len(controls)} controls")
    return skills