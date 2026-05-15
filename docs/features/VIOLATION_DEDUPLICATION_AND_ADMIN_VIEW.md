# Violation Deduplication and Admin View

## Overview
This document describes the implementation of violation deduplication in the compliance tracker and the new admin violations management page.

## Problem Statement

### Issue 1: Duplicate Violations
The system was recording the same violation multiple times when the same control was violated repeatedly for the same resource. This caused:
- Inflated violation counts
- Inaccurate compliance scores
- Difficulty tracking actual unique violations
- Confusion about the true state of compliance

### Issue 2: No Admin Violations View
Administrators had no dedicated page to:
- View all violations across the system
- Filter and search violations
- Track violation history and occurrences
- Monitor resolution status

## Solution

### 1. Violation Deduplication in Tracker

#### Implementation
Modified [`ComplianceTracker.record_violation()`](backend/core/compliance/tracker.py:39) to implement intelligent deduplication:

**Key Features:**
- **Resource Identification**: Generates unique identifiers for resources based on event data
- **Duplicate Detection**: Checks for existing active violations with same control_id, standard, and resource
- **Occurrence Tracking**: Updates existing violations instead of creating duplicates
- **Metadata Preservation**: Tracks first seen, last seen, and occurrence count

**Resource Identifier Logic:**
```python
def _get_resource_identifier(self, event: Dict[str, Any]) -> str:
    """Generate unique identifier for the resource"""
    # For bucket-related events
    if 'bucket' in resource_type.lower():
        return f"bucket:{bucket_name}"
    
    # For other resources
    if resource_id:
        return f"{resource_type}:{resource_id}"
    
    # Fallback
    return f"{source}:{event_name}"
```

**Violation Record Structure:**
```python
{
    'control_id': 'SOC2-AUD-001',
    'standard': 'SOC2',
    'category': 'Access Control',
    'severity': 'critical',
    'timestamp': '2026-05-15T04:38:28.132Z',  # First seen
    'last_seen': '2026-05-15T04:45:30.000Z',  # Last occurrence
    'occurrence_count': 5,                     # Number of times seen
    'event': {...},                            # Latest event data
    'resolved': False,
    'resource_identifier': 'bucket:my-bucket'
}
```

**Benefits:**
- ✅ Accurate violation counts
- ✅ Correct compliance scores
- ✅ Violation history tracking
- ✅ Resource-level granularity
- ✅ Occurrence frequency monitoring

### 2. Enhanced API Endpoint

#### Updated `/violations/details` Endpoint
Modified [`get_violation_details()`](backend/main.py:766) to use the compliance tracker instead of mock data:

**Features:**
- Fetches real violations from tracker
- Supports filtering by severity and status
- Optional inclusion of resolved violations
- Comprehensive statistics
- Sorted by timestamp (most recent first)

**Query Parameters:**
- `severity`: Filter by severity (critical, high, medium, low)
- `status`: Filter by status (resolved, unresolved)
- `include_resolved`: Include resolved violations (default: false)

**Response Structure:**
```json
{
  "violations": [
    {
      "control_id": "SOC2-AUD-001",
      "standard": "SOC2",
      "severity": "critical",
      "timestamp": "2026-05-15T04:38:28.132Z",
      "last_seen": "2026-05-15T04:45:30.000Z",
      "occurrence_count": 5,
      "resolved": false,
      "resource_identifier": "bucket:my-bucket",
      "event": {...}
    }
  ],
  "total": 42,
  "stats": {
    "total": 42,
    "resolved": 10,
    "unresolved": 32,
    "by_severity": {
      "critical": 5,
      "high": 12,
      "medium": 15,
      "low": 10
    },
    "by_standard": {
      "SOC2": 20,
      "GDPR": 15,
      "HIPAA": 7
    },
    "by_category": {
      "Access Control": 15,
      "Data Protection": 12,
      "Audit Logging": 15
    }
  }
}
```

### 3. Admin Violations Page

#### New Page: `/admin/violations`
Created [`AdminViolations`](frontend/src/pages/admin/Violations.tsx:1) component with comprehensive violation management features.

**Features:**

1. **Statistics Dashboard**
   - Total violations count
   - Unresolved violations (highlighted)
   - Resolved violations
   - Critical violations count

2. **Advanced Filtering**
   - Search by control ID, category, or resource
   - Filter by severity (critical, high, medium, low)
   - Filter by standard (SOC2, GDPR, HIPAA, etc.)
   - Toggle to show/hide resolved violations

3. **Violations Table**
   - Control ID
   - Standard
   - Severity badge with color coding
   - Resource identifier
   - Occurrence count
   - First seen timestamp
   - Status (Active/Resolved)
   - View details action

4. **Violation Detail Modal**
   - Full violation information
   - Event details (JSON formatted)
   - Timeline (first seen, last seen)
   - Occurrence count
   - Resolution status and timestamp

5. **Real-time Updates**
   - Auto-refresh every 30 seconds
   - Manual refresh button
   - Loading states

**UI Design:**
- Modern, clean interface
- Color-coded severity badges
- Responsive layout
- Accessible components
- Professional styling

#### Navigation Integration
Added "Violations" link to admin navigation in [`Layout`](frontend/src/components/Layout.tsx:19):
```typescript
{ name: 'Violations', href: '/admin/violations', icon: AlertTriangle }
```

#### Route Configuration
Added route in [`App.tsx`](frontend/src/App.tsx:125):
```typescript
<Route path="/admin/violations" element={<AdminViolations />} />
```

## Usage

### For Administrators

1. **Access Violations Page**
   - Navigate to Admin Portal
   - Click "Violations" in sidebar
   - View comprehensive violations dashboard

2. **Filter Violations**
   - Use search box for quick lookup
   - Select severity filter
   - Choose specific standard
   - Toggle resolved violations visibility

3. **View Details**
   - Click eye icon on any violation
   - Review full violation information
   - Check occurrence history
   - Examine event details

4. **Monitor Trends**
   - Check statistics cards
   - Track unresolved count
   - Monitor critical violations
   - Review resolution progress

### API Usage

**Get All Unresolved Violations:**
```bash
GET /violations/details
```

**Get Critical Violations:**
```bash
GET /violations/details?severity=critical
```

**Get All Violations (Including Resolved):**
```bash
GET /violations/details?include_resolved=true
```

**Get Resolved Violations:**
```bash
GET /violations/details?status=resolved&include_resolved=true
```

## Technical Details

### Deduplication Algorithm

1. **Extract Resource Identifier**
   - Parse event data
   - Identify resource type and name/ID
   - Generate unique identifier

2. **Check for Existing Violation**
   - Search active violations for same standard
   - Match control_id and resource_identifier
   - Return existing violation if found

3. **Update or Create**
   - If exists: Update last_seen, increment occurrence_count
   - If new: Create new violation record
   - Recalculate compliance scores

### Performance Considerations

- **In-Memory Storage**: Violations stored in memory for fast access
- **History Limit**: Maintains last 1000 violations in history
- **Efficient Lookups**: O(n) search within standard's violations
- **Auto-refresh**: 30-second interval prevents excessive API calls

### Future Enhancements

1. **Bulk Actions**
   - Mark multiple violations as resolved
   - Export violations to CSV
   - Bulk assignment to teams

2. **Advanced Analytics**
   - Violation trends over time
   - Mean time to resolution (MTTR)
   - Recurring violation patterns
   - Resource risk scoring

3. **Notifications**
   - Alert on new critical violations
   - Escalation for unresolved violations
   - Resolution confirmations

4. **Integration**
   - Link to remediation workflows
   - Connect to ticketing systems
   - Automated PR creation

## Files Modified

### Backend
- [`backend/core/compliance/tracker.py`](backend/core/compliance/tracker.py:39) - Added deduplication logic
- [`backend/main.py`](backend/main.py:766) - Enhanced violations API endpoint

### Frontend
- [`frontend/src/pages/admin/Violations.tsx`](frontend/src/pages/admin/Violations.tsx:1) - New violations page
- [`frontend/src/App.tsx`](frontend/src/App.tsx:11) - Added route
- [`frontend/src/components/Layout.tsx`](frontend/src/components/Layout.tsx:19) - Added navigation link

## Testing

### Manual Testing Steps

1. **Test Deduplication**
   - Trigger same violation multiple times
   - Verify occurrence_count increments
   - Check last_seen updates
   - Confirm no duplicate entries

2. **Test Admin Page**
   - Navigate to /admin/violations
   - Verify statistics display correctly
   - Test all filters
   - Check detail modal
   - Verify auto-refresh

3. **Test API**
   - Call /violations/details with various filters
   - Verify response structure
   - Check statistics accuracy
   - Test error handling

## Related Documentation

- [Approval Remediation Type Fix](docs/technical/APPROVAL_REMEDIATION_TYPE_FIX.md)
- [Agent Skills Architecture](docs/AGENT_SKILLS_ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)