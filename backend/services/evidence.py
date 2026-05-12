"""
Evidence Generation Service
Generates detailed evidence reports for compliance violations using AI
"""
import logging
from typing import Dict, Any, Optional
import os

logger = logging.getLogger(__name__)


def generate_evidence(event: Dict[str, Any], control: Dict[str, Any]) -> str:
    """
    Generate evidence report for a compliance violation
    
    Args:
        event: Event that triggered the violation
        control: Violated compliance control
        
    Returns:
        Evidence report as string
    """
    try:
        # Try using Ollama first (local LLM)
        evidence = _generate_with_ollama(event, control)
        if evidence:
            return evidence
    except Exception as e:
        logger.warning(f"Ollama generation failed, falling back to template: {e}")
    
    # Fallback to template-based generation
    return _generate_template_evidence(event, control)


def _generate_with_ollama(event: Dict[str, Any], control: Dict[str, Any]) -> Optional[str]:
    """Generate evidence using Ollama local LLM"""
    try:
        import ollama
        
        prompt = f"""You are a compliance auditor. A violation has been detected.

Event Details:
{_format_event(event)}

Violated Control:
- ID: {control.get('control_id', 'Unknown')}
- Standard: {control.get('standard', 'Unknown')}
- Description: {control.get('description', 'No description')}
- Severity: {control.get('severity', 'Unknown')}

Generate a concise evidence report (max 200 words) that includes:
1. What happened (the violation)
2. Why it's a problem (compliance impact)
3. How to fix it (remediation steps)

Keep it professional and actionable."""

        response = ollama.chat(
            model=os.getenv('OLLAMA_MODEL', 'mistral'),
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response["message"]["content"]
        
    except ImportError:
        logger.debug("Ollama not available")
        return None
    except Exception as e:
        logger.debug(f"Ollama unavailable (expected if not running): {e}")
        return None


def _generate_template_evidence(event: Dict[str, Any], control: Dict[str, Any]) -> str:
    """Generate evidence using template (fallback)"""
    
    control_id = control.get('control_id', 'Unknown')
    standard = control.get('standard', 'Unknown')
    description = control.get('description', 'No description available')
    severity = control.get('severity', 'Unknown')
    remediation = control.get('remediation', 'No remediation steps available')
    category = control.get('category', 'Unknown')
    
    # Format event details
    event_summary = _format_event(event)
    
    # Determine impact based on severity
    impact_map = {
        'critical': 'CRITICAL - Immediate action required. This violation poses a severe risk to compliance and could result in audit failure.',
        'high': 'HIGH - Urgent action required. This violation significantly impacts compliance posture.',
        'medium': 'MEDIUM - Action required soon. This violation should be addressed to maintain compliance.',
        'low': 'LOW - Action recommended. This violation should be addressed during regular maintenance.'
    }
    impact = impact_map.get(severity.lower(), 'Impact assessment unavailable')
    
    evidence = f"""
COMPLIANCE VIOLATION DETECTED

Control Information:
- Control ID: {control_id}
- Audit Standard: {standard}
- Category: {category}
- Severity: {severity.upper()}

Violation Description:
{description}

Event Details:
{event_summary}

Impact Assessment:
{impact}

Remediation Steps:
{remediation}

Recommended Actions:
1. Review the event details and confirm the violation
2. Follow the remediation steps provided above
3. Verify compliance after implementing fixes
4. Document the resolution for audit trail

This violation was detected by AegisAI's continuous compliance monitoring system.
Timestamp: {event.get('event_time', 'Unknown')}
"""
    
    return evidence.strip()


def _format_event(event: Dict[str, Any]) -> str:
    """Format event details for display"""
    lines = []
    
    # Key fields to display
    important_fields = [
        'event_name', 'event_time', 'source', 'resource_type', 
        'resource_name', 'username', 'public', 'encryption_enabled',
        'backup_enabled', 'allows_all_traffic', 'port'
    ]
    
    for field in important_fields:
        if field in event:
            value = event[field]
            # Format field name
            field_name = field.replace('_', ' ').title()
            lines.append(f"- {field_name}: {value}")
    
    # Add any other fields not in the important list
    for key, value in event.items():
        if key not in important_fields and not key.startswith('_'):
            field_name = key.replace('_', ' ').title()
            lines.append(f"- {field_name}: {value}")
    
    return '\n'.join(lines) if lines else 'No event details available'


def generate_evidence_with_openai(
    event: Dict[str, Any],
    control: Dict[str, Any],
    api_key: str
) -> str:
    """
    Generate evidence using OpenAI (for critical violations)
    
    Args:
        event: Event that triggered the violation
        control: Violated compliance control
        api_key: OpenAI API key
        
    Returns:
        Evidence report as string
    """
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        prompt = f"""You are a senior compliance auditor with expertise in {control.get('standard', 'compliance')} standards.

A compliance violation has been detected:

Control: {control.get('control_id')} - {control.get('description')}
Standard: {control.get('standard')}
Severity: {control.get('severity')}
Category: {control.get('category')}

Event that triggered the violation:
{_format_event(event)}

Generate a professional audit evidence report that includes:

1. Executive Summary (2-3 sentences)
2. Violation Details (what happened and when)
3. Compliance Impact (why this matters for {control.get('standard')} compliance)
4. Risk Assessment (potential consequences)
5. Remediation Plan (specific, actionable steps)
6. Verification Steps (how to confirm the fix)

Keep the report concise (max 300 words) but comprehensive. Use professional audit language."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error generating evidence with OpenAI: {e}")
        return _generate_template_evidence(event, control)

# Made with Bob
