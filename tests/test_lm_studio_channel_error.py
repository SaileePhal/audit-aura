#!/usr/bin/env python3
"""
Test script to diagnose LM Studio Channel Error
Run this to identify the root cause of the issue
"""
import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
LM_STUDIO_HOST = os.getenv('LM_STUDIO_HOST', 'http://localhost:1234')
LM_STUDIO_MODEL = os.getenv('LM_STUDIO_MODEL', 'mistralai/mistral-7b-instruct-v0.3')

def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    """Print success message"""
    print(f"✓ {text}")

def print_error(text):
    """Print error message"""
    print(f"✗ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ {text}")

def test_connection():
    """Test basic connection to LM Studio"""
    print_header("Test 1: Connection to LM Studio")
    
    try:
        response = requests.get(f"{LM_STUDIO_HOST}/v1/models", timeout=5)
        
        if response.status_code == 200:
            print_success(f"Connected to LM Studio at {LM_STUDIO_HOST}")
            
            data = response.json()
            models = data.get('data', [])
            
            if models:
                print_success(f"Found {len(models)} model(s):")
                for model in models:
                    model_id = model.get('id', 'unknown')
                    print(f"  - {model_id}")
                    
                    if model_id == LM_STUDIO_MODEL:
                        print_success(f"Target model '{LM_STUDIO_MODEL}' is available")
                        return True
                    
                print_error(f"Target model '{LM_STUDIO_MODEL}' not found in loaded models")
                print_info("Solution: Load the correct model in LM Studio")
                return False
            else:
                print_error("No models loaded in LM Studio")
                print_info("Solution: Load a model in LM Studio's 'Local Server' tab")
                return False
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to {LM_STUDIO_HOST}")
        print_info("Solutions:")
        print_info("  1. Start LM Studio application")
        print_info("  2. Go to 'Local Server' tab")
        print_info("  3. Click 'Start Server'")
        print_info("  4. Verify port is 1234 (or update LM_STUDIO_HOST in .env)")
        return False
    except Exception as e:
        print_error(f"Connection test failed: {e}")
        return False

def test_simple_completion():
    """Test a simple completion request"""
    print_header("Test 2: Simple Completion Request")
    
    payload = {
        "model": LM_STUDIO_MODEL,
        "messages": [
            {"role": "user", "content": "Say 'Hello' and nothing else."}
        ],
        "max_tokens": 10,
        "temperature": 0.1,
        "stream": False
    }
    
    try:
        print_info(f"Sending test request to {LM_STUDIO_HOST}/v1/chat/completions")
        print_info(f"Model: {LM_STUDIO_MODEL}")
        
        response = requests.post(
            f"{LM_STUDIO_HOST}/v1/chat/completions",
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check for error in response
            if "error" in result:
                error_msg = result['error']
                print_error(f"LM Studio returned error: {error_msg}")
                
                if "channel" in str(error_msg).lower():
                    print_error("CHANNEL ERROR DETECTED!")
                    print_info("Common causes:")
                    print_info("  1. Model not properly loaded - Try:")
                    print_info("     a. Unload model in LM Studio")
                    print_info("     b. Reload model")
                    print_info("     c. Restart LM Studio")
                    print_info("  2. Insufficient system resources")
                    print_info("  3. Model file corruption - Re-download model")
                return False
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if content:
                print_success("Received response from LM Studio")
                print(f"  Response: {content[:100]}")
                return True
            else:
                print_error("Empty response from LM Studio")
                return False
        else:
            print_error(f"HTTP {response.status_code}")
            print(f"  Response: {response.text[:500]}")
            
            if response.status_code == 404:
                print_info("404 Error - Model endpoint not found")
                print_info("  Check model name matches exactly")
            elif response.status_code == 500:
                print_info("500 Error - LM Studio internal error")
                print_info("  Try restarting LM Studio")
            
            return False
            
    except requests.exceptions.Timeout:
        print_error("Request timed out after 30 seconds")
        print_info("Model may be too slow or not responding")
        print_info("  Try a smaller/faster model")
        return False
    except Exception as e:
        print_error(f"Completion test failed: {e}")
        return False

def test_json_completion():
    """Test JSON-formatted completion (like actual extraction)"""
    print_header("Test 3: JSON Completion (Compliance Extraction Simulation)")
    
    system_prompt = "You are a compliance expert. Respond ONLY with valid JSON in this format: {\"controls\": [{\"control_id\": \"ID\", \"description\": \"desc\"}]}"
    user_prompt = "Extract controls from: S3 buckets must not be public."
    
    payload = {
        "model": LM_STUDIO_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 200,
        "temperature": 0.1,
        "stream": False
    }
    
    try:
        print_info("Testing JSON extraction (similar to PDF processing)")
        print_info(f"Payload size: {len(json.dumps(payload))} bytes")
        
        response = requests.post(
            f"{LM_STUDIO_HOST}/v1/chat/completions",
            json=payload,
            timeout=60,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if "error" in result:
                print_error(f"Error: {result['error']}")
                return False
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if content:
                print_success("Received JSON response")
                print(f"  Response length: {len(content)} chars")
                print(f"  Preview: {content[:200]}")
                
                # Try to parse as JSON
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and 'controls' in parsed:
                        print_success("Valid JSON with 'controls' key")
                        print(f"  Controls found: {len(parsed['controls'])}")
                        return True
                    else:
                        print_error("JSON valid but missing 'controls' key")
                        return False
                except json.JSONDecodeError:
                    print_error("Response is not valid JSON")
                    print_info("Model may need better prompting or different model")
                    return False
            else:
                print_error("Empty response")
                return False
        else:
            print_error(f"HTTP {response.status_code}: {response.text[:500]}")
            return False
            
    except Exception as e:
        print_error(f"JSON completion test failed: {e}")
        return False

def check_system_resources():
    """Check system resources"""
    print_header("Test 4: System Resources")
    
    try:
        import psutil
        
        # Memory
        mem = psutil.virtual_memory()
        mem_gb = mem.total / (1024**3)
        mem_available_gb = mem.available / (1024**3)
        mem_percent = mem.percent
        
        print(f"RAM: {mem_gb:.1f} GB total, {mem_available_gb:.1f} GB available ({mem_percent}% used)")
        
        if mem_available_gb < 4:
            print_error("Low memory! LM Studio needs at least 4GB free")
        else:
            print_success("Sufficient memory available")
        
        # CPU
        cpu_count = psutil.cpu_count()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        print(f"CPU: {cpu_count} cores, {cpu_percent}% usage")
        
        if cpu_count < 4:
            print_error("Low CPU count. Recommended: 4+ cores")
        else:
            print_success("Sufficient CPU cores")
        
        return True
        
    except ImportError:
        print_info("psutil not installed - skipping resource check")
        print_info("Install with: pip install psutil")
        return True

def main():
    """Run all diagnostic tests"""
    print("\n" + "="*60)
    print("  LM Studio Channel Error Diagnostic Tool")
    print("="*60)
    
    print(f"\nConfiguration:")
    print(f"  LM_STUDIO_HOST: {LM_STUDIO_HOST}")
    print(f"  LM_STUDIO_MODEL: {LM_STUDIO_MODEL}")
    
    # Run tests
    results = []
    
    results.append(("Connection", test_connection()))
    
    if results[0][1]:  # Only continue if connection works
        results.append(("Simple Completion", test_simple_completion()))
        results.append(("JSON Completion", test_json_completion()))
    
    results.append(("System Resources", check_system_resources()))
    
    # Summary
    print_header("Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTests passed: {passed}/{total}")
    
    if passed == total:
        print_success("\nAll tests passed! LM Studio is working correctly.")
        print_info("If you still see Channel Error, check:")
        print_info("  1. PDF file size (try smaller PDFs)")
        print_info("  2. Backend logs for detailed errors")
        print_info("  3. LM Studio logs in the application")
    else:
        print_error("\nSome tests failed. Follow the solutions above.")
        print_info("\nFor detailed troubleshooting, see:")
        print_info("  docs/technical/LM_STUDIO_CHANNEL_ERROR_FIX.md")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())