"""
Policy Drift Impact Analysis Skill
Analyzes the security and compliance impact of COS policy drift
"""
import logging
from typing import Dict, Any, List
from ..core.base import Skill, SkillResult, SkillCategory

logger = logging.getLogger(__name__)


class PolicyDriftImpactAnalysisSkill(Skill):
    """Analyzes security and compliance impact of policy drift"""
    
    skill_id = "analyze_policy_drift_impact"
    name = "Policy Drift Impact Analysis"
    description = "Analyzes security, compliance, and business impact of COS policy drift"
    category = SkillCategory.ANALYSIS
    required_capabilities = ['impact_analysis', 'risk_assessment']
    provider = 'all'
    
    def is_applicable(self, context: Dict[str, Any]) -> bool:
        """Check if analysis is needed"""
        previous_result = context.get('previous_result', {})
        details = previous_result.get('details', {})
        
        # Applicable for COS policy drift violations
        return (
            previous_result.get('violation_detected', False) and
            details.get('control_id') == 'COS-POLICY-001'
        )
    
    def execute(self, context: Dict[str, Any]) -> SkillResult:
        """Analyze policy drift impact"""
        previous_result = context.get('previous_result', {})
        violation_details = previous_result.get('details', {})
        
        bucket_name = violation_details.get('bucket_name', 'unknown')
        drift_type = violation_details.get('drift_type', 'unknown')
        changes = violation_details.get('changes_detected', [])
        current_policy = violation_details.get('current_policy', {})
        
        # Perform comprehensive impact analysis
        security_impact = self._assess_security_impact(drift_type, changes, current_policy)
        compliance_impact = self._assess_compliance_impact(drift_type, changes)
        business_impact = self._assess_business_impact(drift_type, changes, bucket_name)
        data_exposure_risk = self._assess_data_exposure_risk(current_policy, changes)
        blast_radius = self._calculate_blast_radius(current_policy, bucket_name)
        risk_score = self._calculate_risk_score(security_impact, compliance_impact, data_exposure_risk)
        
        logger.info(
            f"Policy drift impact analysis complete for {bucket_name}: "
            f"Risk Score {risk_score}/10"
        )
        
        return SkillResult(
            success=True,
            applicable=True,
            details={
                'skill_id': self.skill_id,
                'skill_name': self.name,
                'bucket_name': bucket_name,
                'drift_type': drift_type,
                'security_impact': security_impact,
                'compliance_impact': compliance_impact,
                'business_impact': business_impact,
                'data_exposure_risk': data_exposure_risk,
                'blast_radius': blast_radius,
                'risk_score': risk_score,
                'recommended_priority': self._get_priority(risk_score),
                'affected_stakeholders': self._identify_stakeholders(drift_type),
                'regulatory_implications': self._assess_regulatory_implications(drift_type),
                'incident_classification': self._classify_incident(risk_score, drift_type)
            },
            requires_followup=True,
            followup_skills=['generate_remediation_with_approval']
        )
    
    def _assess_security_impact(
        self, 
        drift_type: str, 
        changes: List[Dict[str, Any]],
        current_policy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Assess security impact of policy drift"""
        impact = {
            'level': 'low',
            'description': '',
            'attack_vectors': [],
            'vulnerabilities_introduced': []
        }
        
        if drift_type == 'public_access_enabled':
            impact['level'] = 'critical'
            impact['description'] = (
                'CRITICAL: Bucket is now publicly accessible. All objects can be '
                'read by anyone on the internet without authentication.'
            )
            impact['attack_vectors'] = [
                'Unauthorized data access',
                'Data exfiltration',
                'Malware distribution via bucket',
                'Phishing attacks using bucket URLs',
                'Resource abuse (bandwidth theft)'
            ]
            impact['vulnerabilities_introduced'] = [
                'CVE-equivalent: Public data exposure',
                'OWASP A01:2021 - Broken Access Control',
                'CWE-284: Improper Access Control'
            ]
        
        elif drift_type == 'encryption_disabled':
            impact['level'] = 'high'
            impact['description'] = (
                'HIGH: Encryption disabled. Data at rest is no longer protected. '
                'Vulnerable to physical storage compromise.'
            )
            impact['attack_vectors'] = [
                'Data theft from storage layer',
                'Insider threats',
                'Physical media compromise'
            ]
            impact['vulnerabilities_introduced'] = [
                'CWE-311: Missing Encryption of Sensitive Data',
                'Unencrypted sensitive data storage'
            ]
        
        elif drift_type == 'versioning_disabled':
            impact['level'] = 'medium'
            impact['description'] = (
                'MEDIUM: Versioning disabled. Cannot recover from accidental '
                'deletions or malicious modifications.'
            )
            impact['attack_vectors'] = [
                'Ransomware attacks (no recovery)',
                'Data tampering without audit trail',
                'Accidental data loss'
            ]
            impact['vulnerabilities_introduced'] = [
                'Loss of data integrity controls',
                'No rollback capability'
            ]
        
        elif drift_type == 'new_public_bucket':
            impact['level'] = 'critical'
            impact['description'] = (
                'CRITICAL: New bucket created with public access. Immediate '
                'exposure of any uploaded data.'
            )
            impact['attack_vectors'] = [
                'Immediate data exposure',
                'Unauthorized access to new data',
                'Potential compliance violation from inception'
            ]
            impact['vulnerabilities_introduced'] = [
                'Insecure default configuration',
                'OWASP A05:2021 - Security Misconfiguration'
            ]
        
        # Add encryption status to impact
        if not current_policy.get('encryption_enabled'):
            impact['additional_concerns'] = impact.get('additional_concerns', [])
            impact['additional_concerns'].append('Data not encrypted at rest')
        
        return impact
    
    def _assess_compliance_impact(
        self, 
        drift_type: str, 
        changes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Assess compliance impact"""
        impact = {
            'frameworks_affected': [],
            'violations': [],
            'audit_implications': '',
            'potential_fines': ''
        }
        
        if drift_type in ['public_access_enabled', 'new_public_bucket']:
            impact['frameworks_affected'] = [
                'SOC 2 Type II - CC6.1 (Logical Access)',
                'ISO 27001 - A.9.1.2 (Access to networks and network services)',
                'GDPR - Article 32 (Security of processing)',
                'HIPAA - 164.312(a)(1) (Access Control)',
                'PCI DSS - Requirement 7 (Restrict access to cardholder data)',
                'NIST CSF - PR.AC-4 (Access permissions managed)'
            ]
            impact['violations'] = [
                'Unauthorized public data exposure',
                'Failure to implement least privilege access',
                'Inadequate access controls'
            ]
            impact['audit_implications'] = (
                'SEVERE: Will result in audit findings. May cause certification '
                'suspension or revocation. Requires immediate remediation and '
                'incident reporting.'
            )
            impact['potential_fines'] = (
                'GDPR: Up to €20M or 4% of annual revenue. '
                'HIPAA: $100-$50,000 per violation. '
                'PCI DSS: $5,000-$100,000 per month of non-compliance.'
            )
        
        elif drift_type == 'encryption_disabled':
            impact['frameworks_affected'] = [
                'SOC 2 Type II - CC6.7 (Encryption)',
                'ISO 27001 - A.10.1.1 (Cryptographic controls)',
                'GDPR - Article 32 (Encryption of personal data)',
                'HIPAA - 164.312(a)(2)(iv) (Encryption)',
                'PCI DSS - Requirement 3.4 (Encryption of cardholder data)'
            ]
            impact['violations'] = [
                'Failure to encrypt sensitive data at rest',
                'Non-compliance with encryption requirements'
            ]
            impact['audit_implications'] = (
                'HIGH: Significant audit finding. Requires remediation plan '
                'and timeline for compliance restoration.'
            )
            impact['potential_fines'] = (
                'GDPR: Up to €10M or 2% of annual revenue. '
                'HIPAA: $1,000-$50,000 per violation.'
            )
        
        elif drift_type == 'versioning_disabled':
            impact['frameworks_affected'] = [
                'SOC 2 Type II - CC7.2 (System monitoring)',
                'ISO 27001 - A.12.3.1 (Information backup)',
                'NIST CSF - PR.IP-4 (Backups maintained)'
            ]
            impact['violations'] = [
                'Inadequate data backup and recovery controls'
            ]
            impact['audit_implications'] = (
                'MEDIUM: May result in audit observation. Requires documentation '
                'of alternative backup mechanisms.'
            )
            impact['potential_fines'] = 'Low to moderate depending on data criticality'
        
        return impact
    
    def _assess_business_impact(
        self, 
        drift_type: str, 
        changes: List[Dict[str, Any]],
        bucket_name: str
    ) -> Dict[str, Any]:
        """Assess business impact"""
        impact = {
            'severity': 'low',
            'description': '',
            'financial_impact': '',
            'reputational_impact': '',
            'operational_impact': ''
        }
        
        if drift_type in ['public_access_enabled', 'new_public_bucket']:
            impact['severity'] = 'critical'
            impact['description'] = (
                f'Bucket {bucket_name} is publicly accessible. Any sensitive data '
                'stored is now exposed to the internet.'
            )
            impact['financial_impact'] = (
                'HIGH: Potential data breach costs ($4.35M average), regulatory '
                'fines, legal fees, customer compensation, incident response costs.'
            )
            impact['reputational_impact'] = (
                'SEVERE: Loss of customer trust, negative media coverage, '
                'competitive disadvantage, potential loss of business partnerships.'
            )
            impact['operational_impact'] = (
                'HIGH: Immediate incident response required, potential service '
                'disruption during remediation, resource diversion from planned work.'
            )
        
        elif drift_type == 'encryption_disabled':
            impact['severity'] = 'high'
            impact['description'] = (
                f'Encryption disabled on bucket {bucket_name}. Data at rest is '
                'vulnerable to unauthorized access.'
            )
            impact['financial_impact'] = (
                'MEDIUM-HIGH: Increased insurance premiums, potential breach costs '
                'if exploited, compliance remediation costs.'
            )
            impact['reputational_impact'] = (
                'MODERATE: Security posture weakened, may affect customer confidence '
                'if disclosed.'
            )
            impact['operational_impact'] = (
                'MEDIUM: Requires re-encryption of existing data, policy updates, '
                'security review.'
            )
        
        elif drift_type == 'versioning_disabled':
            impact['severity'] = 'medium'
            impact['description'] = (
                f'Versioning disabled on bucket {bucket_name}. Cannot recover '
                'from accidental deletions or modifications.'
            )
            impact['financial_impact'] = (
                'LOW-MEDIUM: Potential data loss costs, recovery effort costs.'
            )
            impact['reputational_impact'] = (
                'LOW: Minimal unless data loss occurs.'
            )
            impact['operational_impact'] = (
                'MEDIUM: Increased risk of permanent data loss, no rollback capability.'
            )
        
        return impact
    
    def _assess_data_exposure_risk(
        self, 
        current_policy: Dict[str, Any],
        changes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Assess data exposure risk"""
        risk = {
            'level': 'low',
            'exposed_data_types': [],
            'exposure_scope': '',
            'time_to_exploit': '',
            'likelihood_of_exploitation': ''
        }
        
        if current_policy.get('public'):
            risk['level'] = 'critical'
            risk['exposed_data_types'] = [
                'All objects in bucket',
                'Potentially: PII, PHI, financial data, credentials, source code',
                'Metadata and object listings'
            ]
            risk['exposure_scope'] = 'Global - accessible from anywhere on internet'
            risk['time_to_exploit'] = 'Immediate - already exploitable'
            risk['likelihood_of_exploitation'] = (
                'VERY HIGH: Automated scanners actively search for public buckets. '
                'Exploitation likely within hours to days.'
            )
        elif not current_policy.get('encryption_enabled'):
            risk['level'] = 'high'
            risk['exposed_data_types'] = [
                'Data at rest (if storage layer compromised)',
                'Backup copies',
                'Snapshots'
            ]
            risk['exposure_scope'] = 'Internal - requires storage layer access'
            risk['time_to_exploit'] = 'Days to weeks (requires insider or breach)'
            risk['likelihood_of_exploitation'] = (
                'MEDIUM: Requires privileged access or storage compromise'
            )
        else:
            risk['level'] = 'low'
            risk['exposure_scope'] = 'Minimal'
            risk['likelihood_of_exploitation'] = 'LOW'
        
        return risk
    
    def _calculate_blast_radius(
        self, 
        current_policy: Dict[str, Any],
        bucket_name: str
    ) -> Dict[str, Any]:
        """Calculate blast radius of the drift"""
        blast_radius = {
            'scope': 'low',
            'description': '',
            'affected_systems': [],
            'affected_users': 'Unknown',
            'data_volume_at_risk': 'Unknown'
        }
        
        if current_policy.get('public'):
            blast_radius['scope'] = 'high'
            blast_radius['description'] = (
                f'HIGH: Bucket {bucket_name} is publicly accessible. All objects '
                'and data within are exposed to the internet.'
            )
            blast_radius['affected_systems'] = [
                'All applications using this bucket',
                'Downstream data consumers',
                'Backup and DR systems',
                'Analytics pipelines'
            ]
            blast_radius['affected_users'] = 'All users + public internet'
            blast_radius['data_volume_at_risk'] = 'All objects in bucket'
        elif not current_policy.get('encryption_enabled'):
            blast_radius['scope'] = 'medium'
            blast_radius['description'] = (
                f'MEDIUM: Bucket {bucket_name} data is unencrypted. Vulnerable '
                'to storage layer compromise.'
            )
            blast_radius['affected_systems'] = [
                'Storage infrastructure',
                'Backup systems'
            ]
            blast_radius['affected_users'] = 'Internal users with storage access'
            blast_radius['data_volume_at_risk'] = 'All objects in bucket'
        else:
            blast_radius['scope'] = 'low'
            blast_radius['description'] = 'Limited scope - specific bucket only'
            blast_radius['affected_systems'] = [f'Bucket: {bucket_name}']
        
        return blast_radius
    
    def _calculate_risk_score(
        self, 
        security_impact: Dict[str, Any],
        compliance_impact: Dict[str, Any],
        data_exposure_risk: Dict[str, Any]
    ) -> int:
        """Calculate overall risk score (1-10)"""
        # Map levels to scores
        level_scores = {
            'critical': 10,
            'high': 7,
            'medium': 5,
            'low': 3,
            'very high': 9,
            'moderate': 4,
            'severe': 10
        }
        
        security_score = level_scores.get(security_impact.get('level', 'low').lower(), 3)
        exposure_score = level_scores.get(data_exposure_risk.get('level', 'low').lower(), 3)
        
        # Compliance adds weight
        compliance_weight = len(compliance_impact.get('frameworks_affected', []))
        compliance_score = min(3, compliance_weight // 2)
        
        # Calculate weighted average
        total_score = (security_score * 0.4) + (exposure_score * 0.4) + (compliance_score * 0.2)
        
        return min(10, int(round(total_score)))
    
    def _get_priority(self, risk_score: int) -> str:
        """Get priority level based on risk score"""
        if risk_score >= 9:
            return 'P0 - Critical (Immediate action required)'
        elif risk_score >= 7:
            return 'P1 - High (Action required within 4 hours)'
        elif risk_score >= 5:
            return 'P2 - Medium (Action required within 24 hours)'
        else:
            return 'P3 - Low (Action required within 1 week)'
    
    def _identify_stakeholders(self, drift_type: str) -> List[str]:
        """Identify affected stakeholders"""
        stakeholders = [
            'Security Team',
            'Cloud Infrastructure Team',
            'Compliance Team'
        ]
        
        if drift_type in ['public_access_enabled', 'new_public_bucket']:
            stakeholders.extend([
                'CISO',
                'Legal Team',
                'Privacy Officer',
                'Executive Leadership',
                'Public Relations',
                'Customer Support'
            ])
        elif drift_type == 'encryption_disabled':
            stakeholders.extend([
                'Data Protection Officer',
                'Risk Management'
            ])
        
        return stakeholders
    
    def _assess_regulatory_implications(self, drift_type: str) -> Dict[str, Any]:
        """Assess regulatory implications"""
        implications = {
            'breach_notification_required': False,
            'notification_timeline': '',
            'regulatory_bodies_to_notify': [],
            'documentation_required': []
        }
        
        if drift_type in ['public_access_enabled', 'new_public_bucket']:
            implications['breach_notification_required'] = True
            implications['notification_timeline'] = (
                'GDPR: 72 hours, HIPAA: 60 days, State laws: varies (typically 30-60 days)'
            )
            implications['regulatory_bodies_to_notify'] = [
                'Data Protection Authority (GDPR)',
                'HHS Office for Civil Rights (HIPAA)',
                'State Attorneys General (US state laws)',
                'Affected individuals'
            ]
            implications['documentation_required'] = [
                'Incident timeline and root cause analysis',
                'Data types and volume exposed',
                'Number of affected individuals',
                'Remediation actions taken',
                'Measures to prevent recurrence'
            ]
        
        return implications
    
    def _classify_incident(self, risk_score: int, drift_type: str) -> str:
        """Classify the incident"""
        if risk_score >= 8:
            return 'Security Incident - Major'
        elif risk_score >= 6:
            return 'Security Incident - Moderate'
        elif risk_score >= 4:
            return 'Security Event - Elevated'
        else:
            return 'Security Event - Low'