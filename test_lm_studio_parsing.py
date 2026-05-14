#!/usr/bin/env python3
"""
Test script to verify LM Studio response parsing
"""
import json
import re

# Sample LM Studio response (from the user's example)
lm_studio_response = {
    "id": "chatcmpl-6pgrskve1t82mv5cjaj8gh",
    "object": "chat.completion",
    "created": 1778755399,
    "model": "google/gemma-4-e2b",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": '```json\n{\n  "controls": [\n    {\n      "control_id": "SOC2-SCOPE-01",\n      "title": "Define Scope of Audit",\n      "description": "Determine precisely which systems, processes, and data are subject to the SOC 2 evaluation.",\n      "condition": "event.scope_defined == True",\n      "severity": "high",\n      "remediation": "Document and formally define the boundaries (systems, processes, data) included in the SOC 2 scope.",\n      "category": "Scope Management",\n      "standard": "SOC2"\n    },\n    {\n      "control_id": "SOC2-ASSESS-02",\n      "title": "Assess Current Security Posture",\n      "description": "Compare existing security measures and controls against the requirements of the SOC 2 Trust Service Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy).",\n      "condition": "event.security_posture_compared == True",\n      "severity": "critical",\n      "remediation": "Conduct a gap analysis to identify deficiencies between current controls and required SOC 2 criteria, and implement necessary remediation plans.",\n      "category": "Security Assessment",\n      "standard": "SOC2"\n    }\n  ]\n}\n```',
                "reasoning_content": "...",
                "tool_calls": []
            },
            "logprobs": None,
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 803,
        "completion_tokens": 1476,
        "total_tokens": 2279
    }
}

def test_parsing_strategies():
    """Test all parsing strategies"""
    content = lm_studio_response["choices"][0]["message"]["content"]
    
    print("=" * 80)
    print("Testing LM Studio Response Parsing")
    print("=" * 80)
    print(f"\nOriginal content length: {len(content)} chars")
    print(f"Content preview:\n{content[:200]}...\n")
    
    controls = None
    
    # Strategy 1: Direct JSON parse
    print("\n--- Strategy 1: Direct JSON parse ---")
    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict) and 'controls' in parsed:
            controls = parsed['controls']
            print(f"✓ SUCCESS: Found {len(controls)} controls")
        elif isinstance(parsed, list):
            controls = parsed
            print(f"✓ SUCCESS: Direct array with {len(controls)} controls")
    except json.JSONDecodeError as e:
        print(f"✗ FAILED: {e}")
    
    # Strategy 2: Remove markdown code blocks
    if not controls:
        print("\n--- Strategy 2: Remove markdown code blocks ---")
        try:
            cleaned = re.sub(r'```(?:json)?\s*|\s*```', '', content)
            cleaned = cleaned.strip()
            print(f"Cleaned content preview:\n{cleaned[:200]}...")
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and 'controls' in parsed:
                controls = parsed['controls']
                print(f"✓ SUCCESS: Found {len(controls)} controls")
            elif isinstance(parsed, list):
                controls = parsed
                print(f"✓ SUCCESS: Direct array with {len(controls)} controls")
        except json.JSONDecodeError as e:
            print(f"✗ FAILED: {e}")
    
    # Strategy 3: Extract JSON with regex (specific)
    if not controls:
        print("\n--- Strategy 3: Extract JSON with regex (specific) ---")
        try:
            json_match = re.search(r'\{[^{}]*"controls"[^{}]*\[.*?\]\s*\}', content, re.DOTALL)
            if json_match:
                print(f"Found JSON match: {json_match.group()[:200]}...")
                parsed = json.loads(json_match.group())
                if isinstance(parsed, dict) and 'controls' in parsed:
                    controls = parsed['controls']
                    print(f"✓ SUCCESS: Found {len(controls)} controls")
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"✗ FAILED: {e}")
    
    # Strategy 4: Extract any JSON object
    if not controls:
        print("\n--- Strategy 4: Extract any JSON object ---")
        try:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                if isinstance(parsed, dict) and 'controls' in parsed:
                    controls = parsed['controls']
                    print(f"✓ SUCCESS: Found {len(controls)} controls")
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"✗ FAILED: {e}")
    
    # Final result
    print("\n" + "=" * 80)
    if controls:
        print(f"✓ PARSING SUCCESSFUL: Extracted {len(controls)} controls")
        print("\nExtracted controls:")
        for i, control in enumerate(controls, 1):
            print(f"\n{i}. {control.get('control_id', 'N/A')}: {control.get('title', 'N/A')}")
            print(f"   Category: {control.get('category', 'N/A')}")
            print(f"   Severity: {control.get('severity', 'N/A')}")
    else:
        print("✗ PARSING FAILED: Could not extract controls")
    print("=" * 80)

if __name__ == "__main__":
    test_parsing_strategies()