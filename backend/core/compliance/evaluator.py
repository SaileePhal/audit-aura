"""
Compliance Control Evaluator
Evaluates events against compliance controls using safe rule evaluation
"""
import logging
import re
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


class SafeRuleEvaluator:
    """
    Safe rule evaluator that avoids using eval()
    Supports common compliance rule patterns
    """
    
    def __init__(self):
        self.operators = {
            '==': lambda a, b: a == b,
            '!=': lambda a, b: a != b,
            '>': lambda a, b: a > b,
            '<': lambda a, b: a < b,
            '>=': lambda a, b: a >= b,
            '<=': lambda a, b: a <= b,
            'in': lambda a, b: a in b,
            'not in': lambda a, b: a not in b,
            'contains': lambda a, b: b in a,
            'startswith': lambda a, b: str(a).startswith(str(b)),
            'endswith': lambda a, b: str(a).endswith(str(b)),
            'matches': lambda a, b: bool(re.match(str(b), str(a))),
        }
    
    def evaluate_condition(self, condition: str, event: Dict[str, Any]) -> bool:
        """
        Safely evaluate a condition against an event
        
        Supported formats:
        - event.field == value
        - event.field != value
        - event.field > value
        - event.field in [value1, value2]
        - event.field contains value
        - event.field matches pattern
        """
        try:
            # Remove whitespace
            condition = condition.strip()
            
            # Handle boolean conditions
            if condition.lower() == 'true':
                return True
            if condition.lower() == 'false':
                return False
            
            # Parse condition
            for op_str, op_func in self.operators.items():
                if op_str in condition:
                    parts = condition.split(op_str, 1)
                    if len(parts) != 2:
                        continue
                    
                    left = parts[0].strip()
                    right = parts[1].strip()
                    
                    # Extract field value from event
                    left_value = self._extract_value(left, event)
                    right_value = self._parse_literal(right)
                    
                    # Evaluate
                    return op_func(left_value, right_value)
            
            # If no operator found, try to extract boolean field
            value = self._extract_value(condition, event)
            return bool(value)
            
        except Exception as e:
            logger.warning(f"Failed to evaluate condition '{condition}': {e}")
            return False
    
    def _extract_value(self, path: str, event: Dict[str, Any]) -> Any:
        """Extract value from event using dot notation"""
        path = path.strip()
        
        # Remove 'event.' prefix if present
        if path.startswith('event.'):
            path = path[6:]
        
        # Navigate nested structure
        parts = path.split('.')
        value = event
        
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                return None
        
        return value
    
    def _parse_literal(self, value_str: str) -> Any:
        """Parse a literal value from string"""
        value_str = value_str.strip()
        
        # Remove quotes
        if (value_str.startswith('"') and value_str.endswith('"')) or \
           (value_str.startswith("'") and value_str.endswith("'")):
            return value_str[1:-1]
        
        # Parse boolean
        if value_str.lower() == 'true':
            return True
        if value_str.lower() == 'false':
            return False
        
        # Parse None/null
        if value_str.lower() in ('none', 'null'):
            return None
        
        # Parse number
        try:
            if '.' in value_str:
                return float(value_str)
            return int(value_str)
        except ValueError:
            pass
        
        # Parse list
        if value_str.startswith('[') and value_str.endswith(']'):
            items = value_str[1:-1].split(',')
            return [self._parse_literal(item.strip()) for item in items if item.strip()]
        
        # Return as string
        return value_str


# Global evaluator instance
_evaluator = SafeRuleEvaluator()


def evaluate_controls(controls: List[Dict[str, Any]], event: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluate event against compliance controls
    
    Args:
        controls: List of compliance controls with conditions
        event: Event data to evaluate
        
    Returns:
        List of violated controls
    """
    violations = []
    
    for control in controls:
        try:
            condition = control.get('condition', 'False')
            
            # Skip if no condition
            if not condition or condition == 'False':
                continue
            
            # Evaluate condition - if condition is False, it's a violation
            is_compliant = _evaluator.evaluate_condition(condition, event)
            
            if not is_compliant:
                violations.append(control)
                logger.info(f"Violation detected: {control.get('control_id', 'Unknown')} - {control.get('description', '')}")
        
        except Exception as e:
            logger.error(f"Error evaluating control {control.get('control_id', 'Unknown')}: {e}")
            continue
    
    return violations


def evaluate_control_single(control: Dict[str, Any], event: Dict[str, Any]) -> bool:
    """
    Evaluate a single control against an event
    
    Args:
        control: Compliance control with condition
        event: Event data to evaluate
        
    Returns:
        True if compliant, False if violation
    """
    try:
        condition = control.get('condition', 'False')
        return _evaluator.evaluate_condition(condition, event)
    except Exception as e:
        logger.error(f"Error evaluating control: {e}")
        return False

# Made with Bob
