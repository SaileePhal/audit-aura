# Test Scripts

This directory contains all test and utility scripts for the AegisAI project.

## Test Scripts

### LM Studio Integration Tests
- [`test_lm_studio_integration.py`](test_lm_studio_integration.py) - Tests LM Studio integration
- [`test_lm_studio_channel_error.py`](test_lm_studio_channel_error.py) - Diagnoses LM Studio channel errors
- [`test_lm_studio_parsing.py`](test_lm_studio_parsing.py) - Tests LM Studio response parsing

### Feature Tests
- [`test_cos_policy_drift.py`](test_cos_policy_drift.py) - Tests COS policy drift detection
- [`test_detection_agent.py`](test_detection_agent.py) - Tests detection agent functionality
- [`test_skill_acquisition.py`](test_skill_acquisition.py) - Tests skill acquisition feature
- [`test_skill_animation.py`](test_skill_animation.py) - Tests skill animation in UI

### Storage Tests
- [`test_pdf_storage.sh`](test_pdf_storage.sh) - Tests PDF storage functionality

## Utility Scripts

- [`fix_encryption_key.py`](fix_encryption_key.py) - Generates and fixes encryption key issues
- [`capture_screenshots.py`](capture_screenshots.py) - Captures screenshots for documentation
- [`save_screenshot.py`](save_screenshot.py) - Saves individual screenshots

## Running Tests

### Python Tests
```bash
# Run from project root
python tests/test_name.py
```

### Shell Tests
```bash
# Run from project root
bash tests/test_pdf_storage.sh
```

## Documentation

For detailed information about specific tests and fixes, see:
- [LM Studio Integration](../docs/technical/LM_STUDIO_INTEGRATION.md)
- [Encryption Key Fix](../docs/troubleshooting/ENCRYPTION_KEY_FIX.md)
- [Skill Animation Fix](../docs/SKILL_ANIMATION_FIX.md)