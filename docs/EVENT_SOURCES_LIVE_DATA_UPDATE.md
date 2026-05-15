# Event Sources Live Data Update

## Summary

Updated `event_sources.py` to remove mock_mode functionality and ensure all event sources track live data from cloud providers only.

## Changes Made

### 1. `backend/core/monitoring/event_sources.py`

**Removed:**
- `mock_mode` parameter from all event source classes
- All `_get_mock_events()` methods that generated synthetic data
- Mock event generation logic and random data

**Updated:**
- `CloudWatchEventSource.__init__()`: Now requires boto3, raises error if not installed
- `IBMCloudEventSource.__init__()`: Now requires valid API key, raises error if not provided
- `GenericLogEventSource.__init__()`: Now requires endpoint (file path or URL)
- All `get_events()` methods now only call `_get_real_events()`
- `_get_real_events()` methods now include polling loops for continuous monitoring
- `create_event_aggregator()`: Deprecated with warning to use `DynamicEventSourceManager`

**Key Improvements:**
- CloudWatch source now polls CloudTrail every 30 seconds
- IBM Cloud source polls Activity Tracker every 10 seconds
- Generic source can tail log files or poll HTTP endpoints
- All sources raise clear errors when dependencies or credentials are missing

### 2. `backend/core/monitoring/source_manager.py`

**Updated:**
- Removed `mock_mode=False` parameters from all source creation calls
- Removed `include_mock` parameter from `create_aggregator()`
- Added API key validation for IBM Cloud sources
- Updated logging messages to emphasize "live" data
- Added null check for aggregator in `start_monitoring()`

### 3. `backend/main.py`

**Updated:**
- Removed `include_mock=config.mock_mode` from `create_aggregator()` call
- Updated comments to clarify that `mock_mode` only affects dashboard fallback data
- Event sources always use live data regardless of `mock_mode` setting

### 4. `backend/config.py`

**Updated:**
- Added comment clarifying `mock_mode` only affects dashboard fallback, not event sources
- Updated log message to specify "Mock Mode for Dashboard"

## Architecture

### Event Source Flow (Production)

```
Cloud Provider → Event Source → Event Aggregator → Compliance Tracker
     ↓
  Live Data Only
```

### Mock Mode Usage (Dashboard Only)

The `MOCK_MODE` environment variable now only controls:
- Dashboard fallback data when no real connections are configured
- Demo data display for testing UI without cloud credentials

It does NOT affect:
- Event source data collection (always live)
- Compliance rule evaluation (always uses real events)
- Violation detection (always based on real data)

## Migration Guide

### For Developers

**Before:**
```python
# Old way - mock_mode parameter
source = CloudWatchEventSource(region='us-east-1', mock_mode=True)
```

**After:**
```python
# New way - always live, requires credentials
source = CloudWatchEventSource(region='us-east-1')
# Will raise ImportError if boto3 not installed
```

### For Deployment

**Required:**
1. Install cloud provider SDKs:
   - AWS: `pip install boto3`
   - IBM Cloud: `pip install ibm-cloud-sdk-core`

2. Configure cloud connections via Admin → Connections UI

3. Set environment variables:
   - `MOCK_MODE=false` for production (dashboard uses real data)
   - `MOCK_MODE=true` for demo (dashboard shows fallback data)

**Note:** Event sources will NOT generate any events until real cloud connections are configured, regardless of `MOCK_MODE` setting.

## Benefits

1. **Production Ready**: No accidental mock data in production
2. **Clear Errors**: Immediate feedback when credentials/dependencies missing
3. **Live Monitoring**: Continuous polling of cloud provider APIs
4. **Separation of Concerns**: Mock mode only affects UI fallback, not core functionality
5. **Type Safety**: Removed optional mock_mode parameters that could cause confusion

## Testing

To test without cloud credentials:
1. Set `MOCK_MODE=true` in `.env`
2. Dashboard will show demo data
3. Event sources will log warnings about no connections
4. No events will be generated (expected behavior)

To test with real data:
1. Configure cloud connections in Admin → Connections
2. Set `MOCK_MODE=false` in `.env`
3. Event sources will poll cloud providers
4. Dashboard will show real compliance data

## Related Files

- `backend/core/monitoring/event_sources.py` - Event source implementations
- `backend/core/monitoring/source_manager.py` - Dynamic source management
- `backend/main.py` - Application startup and endpoints
- `backend/config.py` - Configuration management
- `backend/services/mock_data_service.py` - Dashboard fallback data (unchanged)

## Breaking Changes

None for end users. The system now requires proper cloud connections to be configured, which aligns with production deployment expectations.

---

**Date:** 2026-05-15  
**Author:** Bob (AI Assistant)  
**Status:** Complete