# Issues to Fix - AegisAI Application

## Issue 1: Compliance Score Showing 10000% Instead of 100%

### Root Cause
The compliance score is being calculated correctly in the backend (as a value between 0-100), but it's being multiplied by 100 again in the frontend, resulting in 10000%.

### Location of Issue
- **Backend**: [`backend/services/compliance_tracker.py:118`](backend/services/compliance_tracker.py:118)
  - Returns `overall_score` as a value between 0-100 (e.g., 78.0)
- **Mock Data**: [`backend/data/mock_data.json:251`](backend/data/mock_data.json:251)
  - Stores score as 78 (already a percentage)
- **Frontend**: [`frontend/src/pages/admin/Dashboard.tsx:66`](frontend/src/pages/admin/Dashboard.tsx:66)
  - Multiplies by 100 again: `Math.round(overallScore * 100)`

### Fix Required
The backend returns `overall_score` as a decimal (0.0 to 1.0) from the compliance tracker, but the mock data stores it as a percentage (0-100). We need to ensure consistency.

**Option 1**: Backend should return decimal (0.0-1.0), frontend multiplies by 100
**Option 2**: Backend returns percentage (0-100), frontend uses directly

Currently, the system is inconsistent - mock data uses percentages but the code expects decimals.

### Files to Fix
1. [`backend/services/compliance_tracker.py:118`](backend/services/compliance_tracker.py:118) - Change to return decimal
2. [`backend/data/mock_data.json:251`](backend/data/mock_data.json:251) - Change to decimal (0.78 instead of 78)
3. OR keep backend as-is and fix frontend to not multiply by 100

---

## Issue 2: Missing Git PR Tracking & Root Cause Analysis Feature

### What's Missing
The user mentioned "Tracking & Root Cause Analysis feature with git PRs" which is NOT currently implemented in the application.

### What Currently Exists
✅ **Root Cause Analysis** - Implemented in violations
- Each violation in [`backend/data/mock_data.json`](backend/data/mock_data.json) has:
  - `root_cause`: Explanation of why the violation occurred
  - `fix_steps`: Step-by-step remediation guide
  - `remediation`: Quick fix description
  - `estimated_fix_time`: Time to fix

✅ **Security Incidents Page** - Shows violations with root cause
- [`frontend/src/pages/security/Incidents.tsx`](frontend/src/pages/security/Incidents.tsx)
- Displays violations with filtering and search
- Shows root cause and remediation steps

❌ **Git PR Tracking** - NOT IMPLEMENTED
- No integration with GitHub PRs
- No tracking of fixes via pull requests
- No linking violations to code changes
- No PR status monitoring

### What Needs to be Built

#### 1. GitHub PR Integration Service
Create a new service to:
- Track PRs related to compliance violations
- Link violations to specific PRs
- Monitor PR status (open, merged, closed)
- Verify if PR fixes address the violation

#### 2. Violation-to-PR Linking
- Add `related_prs` field to violations
- Track which PRs are attempting to fix which violations
- Show PR status in violation details

#### 3. PR-Based Compliance Verification
- When a PR is merged, automatically re-check the related violation
- Update violation status based on PR merge
- Generate compliance evidence from PR changes

#### 4. UI Components Needed
- PR list view showing compliance-related PRs
- PR status badges on violation cards
- PR timeline showing fix progress
- Link to create PR from violation

### Recommended Implementation

```python
# backend/services/github_pr_tracker.py
class GitHubPRTracker:
    def link_pr_to_violation(self, pr_url: str, violation_id: str)
    def get_prs_for_violation(self, violation_id: str)
    def check_pr_status(self, pr_url: str)
    def verify_fix_on_merge(self, pr_url: str, violation_id: str)
```

```typescript
// frontend/src/pages/security/PRTracking.tsx
export const PRTracking: React.FC = () => {
  // Show all PRs related to compliance
  // Filter by status, violation, standard
  // Create new PR from violation
}
```

### Integration Points
1. **GitHub Webhooks**: Listen for PR events (opened, merged, closed)
2. **GitHub API**: Fetch PR details, files changed, review status
3. **Violation Service**: Update violation status based on PR
4. **Evidence Generator**: Create audit evidence from PR

---

## Summary

### Immediate Fixes Needed
1. **Fix compliance score calculation** - Choose consistent approach (decimal vs percentage)
2. **Implement Git PR tracking** - Build complete feature from scratch

### Priority
1. **HIGH**: Fix compliance score (quick fix, 15 minutes)
2. **MEDIUM**: Implement Git PR tracking (new feature, 4-6 hours)

### Current Status
- ✅ Root cause analysis exists
- ✅ Fix steps documented
- ✅ Violation tracking works
- ❌ Git PR integration missing
- ❌ PR-based compliance verification missing
- ❌ Automated fix tracking missing