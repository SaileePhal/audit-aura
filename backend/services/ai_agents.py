"""
AI Agent System
Implements rule-based AI agents for compliance monitoring and remediation
"""
import logging
from typing import Dict, Any, List, Optional
from enum import Enum
import json

logger = logging.getLogger(__name__)


class AgentRole(Enum):
    """Agent roles in the system"""
    MONITOR = "monitor"  # Monitors events and detects violations
    ANALYZER = "analyzer"  # Analyzes violations and generates evidence
    REMEDIATOR = "remediator"  # Suggests and implements fixes
    REPORTER = "reporter"  # Generates compliance reports


class AgentRule:
    """Base class for agent rules"""
    
    def __init__(self, rule_id: str, priority: int = 0):
        self.rule_id = rule_id
        self.priority = priority
    
    def should_execute(self, context: Dict[str, Any]) -> bool:
        """Check if rule should execute given context"""
        raise NotImplementedError
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the rule"""
        raise NotImplementedError


class MonitorRule(AgentRule):
    """Rule for monitoring events"""
    
    def __init__(
        self,
        rule_id: str,
        event_types: List[str],
        severity_threshold: str = "low",
        priority: int = 0
    ):
        super().__init__(rule_id, priority)
        self.event_types = event_types
        self.severity_threshold = severity_threshold
        self.severity_levels = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    
    def should_execute(self, context: Dict[str, Any]) -> bool:
        """Check if event should be monitored"""
        event = context.get('event', {})
        event_type = event.get('event_name', '')
        
        # Check if event type matches
        if self.event_types and event_type not in self.event_types:
            return False
        
        # Check severity threshold
        violation = context.get('violation', {})
        severity = violation.get('severity', 'low')
        
        return self.severity_levels.get(severity, 0) >= self.severity_levels.get(self.severity_threshold, 0)
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Monitor and log the event"""
        event = context.get('event', {})
        violation = context.get('violation', {})
        
        logger.info(f"Monitor Rule {self.rule_id}: Event {event.get('event_name')} triggered violation {violation.get('control_id')}")
        
        return {
            'action': 'monitored',
            'rule_id': self.rule_id,
            'timestamp': event.get('event_time'),
            'requires_notification': True
        }


class AnalyzerRule(AgentRule):
    """Rule for analyzing violations"""
    
    def __init__(
        self,
        rule_id: str,
        analysis_type: str = "impact",
        priority: int = 0
    ):
        super().__init__(rule_id, priority)
        self.analysis_type = analysis_type
    
    def should_execute(self, context: Dict[str, Any]) -> bool:
        """Check if analysis is needed"""
        return context.get('violation') is not None
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the violation"""
        violation = context.get('violation', {})
        event = context.get('event', {})
        
        analysis = {
            'rule_id': self.rule_id,
            'analysis_type': self.analysis_type,
            'control_id': violation.get('control_id'),
            'severity': violation.get('severity'),
            'impact': self._assess_impact(violation, event),
            'root_cause': self._identify_root_cause(violation, event),
            'affected_resources': self._identify_affected_resources(event)
        }
        
        logger.info(f"Analyzer Rule {self.rule_id}: Analyzed violation {violation.get('control_id')}")
        
        return analysis
    
    def _assess_impact(self, violation: Dict[str, Any], event: Dict[str, Any]) -> str:
        """Assess impact of violation"""
        severity = violation.get('severity', 'low')
        
        impact_map = {
            'critical': 'High business impact - immediate action required',
            'high': 'Significant impact - action required within 24 hours',
            'medium': 'Moderate impact - action required within 1 week',
            'low': 'Low impact - action required within 1 month'
        }
        
        return impact_map.get(severity, 'Unknown impact')
    
    def _identify_root_cause(self, violation: Dict[str, Any], event: Dict[str, Any]) -> str:
        """Identify root cause of violation"""
        event_name = event.get('event_name', '')
        resource_type = event.get('resource_type', '')
        
        return f"Configuration change via {event_name} on {resource_type}"
    
    def _identify_affected_resources(self, event: Dict[str, Any]) -> List[str]:
        """Identify affected resources"""
        resources = []
        
        if 'resource_name' in event:
            resources.append(event['resource_name'])
        elif 'resource_type' in event:
            resources.append(event['resource_type'])
        
        return resources


class RemediatorRule(AgentRule):
    """Rule for suggesting remediation"""
    
    def __init__(
        self,
        rule_id: str,
        auto_remediate: bool = False,
        priority: int = 0
    ):
        super().__init__(rule_id, priority)
        self.auto_remediate = auto_remediate
    
    def should_execute(self, context: Dict[str, Any]) -> bool:
        """Check if remediation is needed"""
        violation = context.get('violation', {})
        return violation.get('remediation') is not None
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate remediation plan"""
        violation = context.get('violation', {})
        event = context.get('event', {})
        
        remediation_plan = {
            'rule_id': self.rule_id,
            'control_id': violation.get('control_id'),
            'steps': self._generate_remediation_steps(violation, event),
            'auto_remediate': self.auto_remediate,
            'estimated_time': self._estimate_remediation_time(violation),
            'requires_approval': not self.auto_remediate
        }
        
        logger.info(f"Remediator Rule {self.rule_id}: Generated remediation for {violation.get('control_id')}")
        
        return remediation_plan
    
    def _generate_remediation_steps(self, violation: Dict[str, Any], event: Dict[str, Any]) -> List[str]:
        """Generate remediation steps"""
        remediation = violation.get('remediation', '')
        
        # Parse remediation into steps
        steps = [step.strip() for step in remediation.split('.') if step.strip()]
        
        if not steps:
            steps = ['Review the violation', 'Apply necessary fixes', 'Verify compliance']
        
        return steps
    
    def _estimate_remediation_time(self, violation: Dict[str, Any]) -> str:
        """Estimate time to remediate"""
        severity = violation.get('severity', 'low')
        
        time_map = {
            'critical': '< 1 hour',
            'high': '< 4 hours',
            'medium': '< 1 day',
            'low': '< 1 week'
        }
        
        return time_map.get(severity, 'Unknown')


class ComplianceAgent:
    """AI Agent for compliance monitoring"""
    
    def __init__(self, role: AgentRole, rules: List[AgentRule]):
        self.role = role
        self.rules = sorted(rules, key=lambda r: r.priority, reverse=True)
        self.execution_count = 0
    
    def process(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process context through agent rules"""
        results = []
        
        for rule in self.rules:
            try:
                if rule.should_execute(context):
                    result = rule.execute(context)
                    results.append(result)
                    self.execution_count += 1
            except Exception as e:
                logger.error(f"Error executing rule {rule.rule_id}: {e}")
        
        return results


class AgentOrchestrator:
    """Orchestrates multiple agents"""
    
    def __init__(self):
        self.agents: Dict[AgentRole, ComplianceAgent] = {}
        self._initialize_default_agents()
    
    def _initialize_default_agents(self):
        """Initialize default agents with rules"""
        
        # Monitor Agent
        monitor_rules = [
            MonitorRule(
                rule_id="monitor_critical",
                event_types=[],
                severity_threshold="critical",
                priority=10
            ),
            MonitorRule(
                rule_id="monitor_high",
                event_types=[],
                severity_threshold="high",
                priority=5
            ),
            MonitorRule(
                rule_id="monitor_all",
                event_types=[],
                severity_threshold="low",
                priority=0
            )
        ]
        self.agents[AgentRole.MONITOR] = ComplianceAgent(AgentRole.MONITOR, monitor_rules)
        
        # Analyzer Agent
        analyzer_rules = [
            AnalyzerRule(
                rule_id="analyze_impact",
                analysis_type="impact",
                priority=10
            ),
            AnalyzerRule(
                rule_id="analyze_root_cause",
                analysis_type="root_cause",
                priority=5
            )
        ]
        self.agents[AgentRole.ANALYZER] = ComplianceAgent(AgentRole.ANALYZER, analyzer_rules)
        
        # Remediator Agent
        remediator_rules = [
            RemediatorRule(
                rule_id="auto_remediate_critical",
                auto_remediate=False,  # Require approval for now
                priority=10
            ),
            RemediatorRule(
                rule_id="suggest_remediation",
                auto_remediate=False,
                priority=0
            )
        ]
        self.agents[AgentRole.REMEDIATOR] = ComplianceAgent(AgentRole.REMEDIATOR, remediator_rules)
    
    def process_violation(
        self,
        violation: Dict[str, Any],
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a violation through all agents"""
        
        context = {
            'violation': violation,
            'event': event
        }
        
        results = {
            'violation': violation,
            'event': event,
            'monitoring': [],
            'analysis': [],
            'remediation': []
        }
        
        # Monitor
        if AgentRole.MONITOR in self.agents:
            monitor_results = self.agents[AgentRole.MONITOR].process(context)
            results['monitoring'] = monitor_results
        
        # Analyze
        if AgentRole.ANALYZER in self.agents:
            analyzer_results = self.agents[AgentRole.ANALYZER].process(context)
            results['analysis'] = analyzer_results
        
        # Remediate
        if AgentRole.REMEDIATOR in self.agents:
            remediator_results = self.agents[AgentRole.REMEDIATOR].process(context)
            results['remediation'] = remediator_results
        
        return results
    
    def add_rule(self, role: AgentRole, rule: AgentRule):
        """Add a rule to an agent"""
        if role not in self.agents:
            self.agents[role] = ComplianceAgent(role, [])
        
        self.agents[role].rules.append(rule)
        self.agents[role].rules.sort(key=lambda r: r.priority, reverse=True)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get orchestrator statistics"""
        return {
            'agents': {
                role.value: {
                    'rule_count': len(agent.rules),
                    'execution_count': agent.execution_count
                }
                for role, agent in self.agents.items()
            }
        }


# Global orchestrator instance
_orchestrator: Optional[AgentOrchestrator] = None


def get_orchestrator() -> AgentOrchestrator:
    """Get or create global orchestrator instance"""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator

# Made with Bob
