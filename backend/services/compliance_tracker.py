"""
Compliance Tracker Service
Tracks and calculates compliance percentages per audit standard
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)


class ComplianceTracker:
    """Tracks compliance status across audit standards"""
    
    def __init__(self):
        self.controls: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.violations: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.violation_history: List[Dict[str, Any]] = []
        self.compliance_scores: Dict[str, float] = {}
        self.last_update = datetime.utcnow()
    
    def register_controls(self, controls: List[Dict[str, Any]]):
        """
        Register compliance controls
        
        Args:
            controls: List of compliance controls
        """
        self.controls.clear()
        
        for control in controls:
            standard = control.get('standard', 'Unknown')
            self.controls[standard].append(control)
        
        logger.info(f"Registered {len(controls)} controls across {len(self.controls)} standards")
        self._recalculate_scores()
    
    def record_violation(
        self,
        violation: Dict[str, Any],
        event: Dict[str, Any]
    ):
        """
        Record a compliance violation
        
        Args:
            violation: Violated control
            event: Event that triggered the violation
        """
        standard = violation.get('standard', 'Unknown')
        
        violation_record = {
            'control_id': violation.get('control_id'),
            'standard': standard,
            'category': violation.get('category'),
            'severity': violation.get('severity'),
            'timestamp': datetime.utcnow().isoformat(),
            'event': event,
            'resolved': False
        }
        
        self.violations[standard].append(violation_record)
        self.violation_history.append(violation_record)
        
        # Keep only last 1000 violations in history
        if len(self.violation_history) > 1000:
            self.violation_history = self.violation_history[-1000:]
        
        self._recalculate_scores()
        logger.info(f"Recorded violation for {standard}: {violation.get('control_id')}")
    
    def resolve_violation(self, control_id: str, standard: str):
        """
        Mark a violation as resolved
        
        Args:
            control_id: Control ID
            standard: Audit standard
        """
        for violation in self.violations[standard]:
            if violation['control_id'] == control_id and not violation['resolved']:
                violation['resolved'] = True
                violation['resolved_at'] = datetime.utcnow().isoformat()
                logger.info(f"Resolved violation: {control_id}")
                break
        
        self._recalculate_scores()
    
    def get_compliance_score(self, standard: Optional[str] = None) -> Dict[str, Any]:
        """
        Get compliance score
        
        Args:
            standard: Specific standard (None for all)
            
        Returns:
            Compliance score information
        """
        if standard:
            return {
                'standard': standard,
                'score': self.compliance_scores.get(standard, 100.0),
                'total_controls': len(self.controls.get(standard, [])),
                'active_violations': len([v for v in self.violations.get(standard, []) if not v['resolved']]),
                'resolved_violations': len([v for v in self.violations.get(standard, []) if v['resolved']])
            }
        
        # Overall compliance
        total_controls = sum(len(controls) for controls in self.controls.values())
        total_violations = sum(
            len([v for v in violations if not v['resolved']])
            for violations in self.violations.values()
        )
        
        overall_score = 100.0
        if total_controls > 0:
            overall_score = max(0, 100.0 - (total_violations / total_controls * 100))
        
        return {
            'overall_score': round(overall_score, 2),
            'standards': {
                std: self.compliance_scores.get(std, 100.0)
                for std in self.controls.keys()
            },
            'total_controls': total_controls,
            'total_violations': total_violations,
            'last_update': self.last_update.isoformat()
        }
    
    def get_violations_by_severity(self, standard: Optional[str] = None) -> Dict[str, int]:
        """
        Get violation counts by severity
        
        Args:
            standard: Specific standard (None for all)
            
        Returns:
            Dictionary of severity -> count
        """
        violations_to_check = []
        
        if standard:
            violations_to_check = self.violations.get(standard, [])
        else:
            for violations in self.violations.values():
                violations_to_check.extend(violations)
        
        # Count active violations by severity
        severity_counts = defaultdict(int)
        for violation in violations_to_check:
            if not violation['resolved']:
                severity = violation.get('severity', 'unknown')
                severity_counts[severity] += 1
        
        return dict(severity_counts)
    
    def get_violations_by_category(self, standard: Optional[str] = None) -> Dict[str, int]:
        """
        Get violation counts by category
        
        Args:
            standard: Specific standard (None for all)
            
        Returns:
            Dictionary of category -> count
        """
        violations_to_check = []
        
        if standard:
            violations_to_check = self.violations.get(standard, [])
        else:
            for violations in self.violations.values():
                violations_to_check.extend(violations)
        
        # Count active violations by category
        category_counts = defaultdict(int)
        for violation in violations_to_check:
            if not violation['resolved']:
                category = violation.get('category', 'Unknown')
                category_counts[category] += 1
        
        return dict(category_counts)
    
    def get_trend_data(self, days: int = 7) -> Dict[str, Any]:
        """
        Get compliance trend data
        
        Args:
            days: Number of days to include
            
        Returns:
            Trend data
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Filter violations within time range
        recent_violations = [
            v for v in self.violation_history
            if datetime.fromisoformat(v['timestamp']) >= cutoff_date
        ]
        
        # Group by day
        daily_counts = defaultdict(int)
        for violation in recent_violations:
            date = datetime.fromisoformat(violation['timestamp']).date()
            daily_counts[date.isoformat()] += 1
        
        return {
            'period_days': days,
            'total_violations': len(recent_violations),
            'daily_counts': dict(daily_counts),
            'average_per_day': len(recent_violations) / days if days > 0 else 0
        }
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data
        
        Returns:
            Dashboard data
        """
        overall_score = self.get_compliance_score()
        
        return {
            'compliance_score': overall_score,
            'violations_by_severity': self.get_violations_by_severity(),
            'violations_by_category': self.get_violations_by_category(),
            'trend_data': self.get_trend_data(7),
            'standards': {
                standard: {
                    'score': self.compliance_scores.get(standard, 100.0),
                    'controls': len(controls),
                    'violations': len([v for v in self.violations.get(standard, []) if not v['resolved']])
                }
                for standard, controls in self.controls.items()
            }
        }
    
    def _recalculate_scores(self):
        """Recalculate compliance scores for all standards"""
        self.compliance_scores.clear()
        
        for standard, controls in self.controls.items():
            total_controls = len(controls)
            if total_controls == 0:
                self.compliance_scores[standard] = 100.0
                continue
            
            # Count active violations
            active_violations = len([
                v for v in self.violations.get(standard, [])
                if not v['resolved']
            ])
            
            # Calculate score with severity weighting
            violation_impact = 0
            for violation in self.violations.get(standard, []):
                if not violation['resolved']:
                    severity = violation.get('severity', 'low')
                    weight = {
                        'critical': 4.0,
                        'high': 2.0,
                        'medium': 1.0,
                        'low': 0.5
                    }.get(severity, 1.0)
                    violation_impact += weight
            
            # Score calculation: 100 - (weighted violations / total controls * 100)
            score = max(0, 100.0 - (violation_impact / total_controls * 100))
            self.compliance_scores[standard] = round(score, 2)
        
        self.last_update = datetime.utcnow()


# Global tracker instance
_tracker: Optional[ComplianceTracker] = None


def get_tracker() -> ComplianceTracker:
    """Get or create global tracker instance"""
    global _tracker
    if _tracker is None:
        _tracker = ComplianceTracker()
    return _tracker

# Made with Bob
