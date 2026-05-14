"""
Remediation Plan Generation Skill
Generates actionable remediation plans for violations
"""
import logging
from typing import Dict, Any, List
from ..core.base import Skill, SkillResult, SkillCategory

logger = logging.getLogger(__name__)


class RemediationGenerationSkill(Skill):
    """Generates remediation plans for violations"""
    
    skill_id = "generate_remediation"
    name = "Remediation Plan Generation"
    description = "Generates actionable remediation plans for violations"
    category = SkillCategory.REMEDIATION
    required_capabilities = ['remediation_planning']
    provider = 'all'
    
    def is_applicable(self, context: Dict[str, Any]) -> bool:
        """Check if remediation is needed"""
        previous_result = context.get('previous_result', {})
        return previous_result.get('violation_detected', False)
    
    def execute(self, context: Dict[str, Any]) -> SkillResult:
        """Generate remediation plan"""
        previous_result = context.get('previous_result', {})
        violation_details = previous_result.get('details', {})
        
        remediation_text = violation_details.get('remediation', '')
        event = violation_details.get('event', {})
        
        # Generate structured remediation plan
        remediation_plan = {
            'control_id': violation_details.get('control_id'),
            'steps': self._parse_remediation_steps(remediation_text),
            'estimated_time': self._estimate_time(previous_result.get('severity')),
            'automation_available': self._check_automation(event),
            'manual_steps': self._generate_manual_steps(violation_details, event),
            'verification_steps': self._generate_verification_steps(violation_details)
        }
        
        logger.info(f"Remediation plan generated for {violation_details.get('control_id')}")
        
        return SkillResult(
            success=True,
            applicable=True,
            details={
                'skill_id': self.skill_id,
                'skill_name': self.name,
                'remediation_plan': remediation_plan,
                'requires_approval': True
            },
            requires_followup=True,
            followup_skills=['notify_dashboard']
        )
    
    def _parse_remediation_steps(self, remediation_text: str) -> List[str]:
        """Parse remediation text into steps"""
        if not remediation_text:
            return ['Review the violation', 'Apply necessary fixes', 'Verify compliance']
        
        # Split by periods or numbered lists
        steps = [step.strip() for step in remediation_text.split('.') if step.strip()]
        return steps if steps else [remediation_text]
    
    def _estimate_time(self, severity: str) -> str:
        """Estimate remediation time"""
        time_map = {
            'critical': '< 1 hour',
            'high': '< 4 hours',
            'medium': '< 1 day',
            'low': '< 1 week'
        }
        return time_map.get(severity, '< 1 day')
    
    def _check_automation(self, event: Dict[str, Any]) -> bool:
        """Check if automation is available"""
        # Simple heuristic - can be enhanced
        resource_type = event.get('resource_type', '').lower()
        return any(keyword in resource_type for keyword in ['bucket', 'storage', 'database', 'instance'])
    
    def _generate_manual_steps(self, violation_details: Dict[str, Any], event: Dict[str, Any]) -> List[str]:
        """Generate manual remediation steps"""
        resource_type = event.get('resource_type', 'resource')
        resource_name = event.get('resource_name', 'the resource')
        
        return [
            f"1. Navigate to cloud console",
            f"2. Locate {resource_type}: {resource_name}",
            f"3. Review current configuration",
            f"4. Apply recommended changes: {violation_details.get('remediation', 'See control description')}",
            f"5. Verify changes are applied",
            f"6. Document changes in change log"
        ]
    
    def _generate_verification_steps(self, violation_details: Dict[str, Any]) -> List[str]:
        """Generate verification steps"""
        return [
            "1. Re-run compliance check",
            "2. Verify control passes",
            "3. Check for any side effects",
            "4. Update compliance dashboard"
        ]


# Function moved to detection/control_based.py