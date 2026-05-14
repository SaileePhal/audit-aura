"""
Security Impact Analysis Skill
Analyzes security impact and blast radius of violations
"""
import logging
from typing import Dict, Any, List
from ..core.base import Skill, SkillResult, SkillCategory

logger = logging.getLogger(__name__)


class SecurityImpactAnalysisSkill(Skill):
    """Analyzes security impact of detected violations"""
    
    skill_id = "analyze_security_impact"
    name = "Security Impact Analysis"
    description = "Analyzes the security impact and blast radius of violations"
    category = SkillCategory.ANALYSIS
    required_capabilities = ['impact_analysis']
    provider = 'all'
    
    def is_applicable(self, context: Dict[str, Any]) -> bool:
        """Check if analysis is needed"""
        previous_result = context.get('previous_result', {})
        return previous_result.get('violation_detected', False)
    
    def execute(self, context: Dict[str, Any]) -> SkillResult:
        """Analyze security impact"""
        previous_result = context.get('previous_result', {})
        violation_details = previous_result.get('details', {})
        event = violation_details.get('event', {})
        severity = previous_result.get('severity', 'medium')
        
        # Assess impact based on severity and resource type
        impact_assessment = self._assess_impact(severity, event)
        blast_radius = self._calculate_blast_radius(event)
        risk_score = self._calculate_risk_score(severity, blast_radius)
        
        logger.info(f"Security impact analysis complete: Risk Score {risk_score}")
        
        return SkillResult(
            success=True,
            applicable=True,
            details={
                'skill_id': self.skill_id,
                'skill_name': self.name,
                'impact_assessment': impact_assessment,
                'blast_radius': blast_radius,
                'risk_score': risk_score,
                'affected_resources': self._identify_affected_resources(event),
                'compliance_frameworks_affected': violation_details.get('standard', []),
                'recommended_priority': self._get_priority(risk_score)
            },
            requires_followup=True,
            followup_skills=['notify_security_team'] if risk_score >= 7 else []
        )
    
    def _assess_impact(self, severity: str, event: Dict[str, Any]) -> str:
        """Assess business impact"""
        impact_map = {
            'critical': 'High business impact - immediate action required. Potential data breach or compliance violation.',
            'high': 'Significant impact - action required within 24 hours. Security posture compromised.',
            'medium': 'Moderate impact - action required within 1 week. Increased risk exposure.',
            'low': 'Low impact - action required within 1 month. Minor security gap.'
        }
        return impact_map.get(severity, 'Unknown impact')
    
    def _calculate_blast_radius(self, event: Dict[str, Any]) -> str:
        """Calculate blast radius"""
        resource_type = event.get('resource_type', '').lower()
        is_public = event.get('public', False)
        
        if is_public:
            return 'High - Resource is publicly accessible'
        elif 'database' in resource_type or 'storage' in resource_type:
            return 'Medium - Data storage resource affected'
        else:
            return 'Low - Limited scope'
    
    def _calculate_risk_score(self, severity: str, blast_radius: str) -> int:
        """Calculate risk score (1-10)"""
        severity_scores = {'critical': 10, 'high': 7, 'medium': 5, 'low': 3}
        blast_scores = {'High': 3, 'Medium': 2, 'Low': 1}
        
        severity_score = severity_scores.get(severity, 5)
        blast_score = blast_scores.get(blast_radius.split('-')[0].strip(), 1)
        
        return min(10, severity_score + blast_score - 3)
    
    def _identify_affected_resources(self, event: Dict[str, Any]) -> List[str]:
        """Identify affected resources"""
        resources = []
        if 'resource_name' in event:
            resources.append(event['resource_name'])
        if 'resource_type' in event:
            resources.append(f"Type: {event['resource_type']}")
        return resources
    
    def _get_priority(self, risk_score: int) -> str:
        """Get priority level"""
        if risk_score >= 8:
            return 'P0 - Critical'
        elif risk_score >= 6:
            return 'P1 - High'
        elif risk_score >= 4:
            return 'P2 - Medium'
        else:
            return 'P3 - Low'


class RemediationGenerationSkill(Skill):
    """Generates remediation plans for violations"""
    
    skill_id = "generate_remediation"
    name = "Remediation Plan Generation"
    description = "Generates actionable remediation plans for violations"
    category = SkillCategory.REMEDIATION
