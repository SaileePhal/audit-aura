# AuditAura Multi-Agent System

## Quick Start

The AuditAura application now includes a sophisticated multi-agent system for automated compliance workflows. This system was successfully integrated from the [audit-aura-agents](https://github.com/imdurgadas/audit-aura-agents) repository.

## What's New

### 🤖 Multi-Agent Workflow
- **6 Specialized Agents** working together for end-to-end compliance automation
- **LangGraph-powered** stateful workflows with checkpointing
- **Human-in-the-Loop** approval for critical violations
- **Automatic Retry Logic** with escalation to manual fixes
- **Forensic Evidence Reports** generated for every incident

### 🔧 Key Features

1. **Automated Detection** - Sensor agent ingests and normalizes logs from multiple cloud platforms
2. **AI-Powered Auditing** - Auditor agent uses LLM reasoning to evaluate compliance violations
3. **Smart Remediation** - Remediator agent executes appropriate fix scripts automatically
4. **Validation** - Validator agent confirms remediation success
5. **Documentation** - Narrator agent generates comprehensive evidence reports

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies include:
- `langgraph` - Workflow orchestration
- `langchain-google-genai` - Google Gemini integration
- `chromadb` - Vector store for compliance controls
- `rich` - Beautiful console output
- `aiosqlite` - Async SQLite support

### 2. Configure Environment

Add to your `.env` file:

```bash
# Recommended: Google Gemini
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_ENABLED=true

# Alternative: OpenCode.ai Zen
OPENCODE_API_KEY=your_opencode_api_key_here
OPENCODE_MODEL=zen-1.0
OPENCODE_BASE_URL=https://api.opencode.ai/v1
OPENCODE_ENABLED=false

# Alternative: LM Studio (Local)
LM_STUDIO_HOST=http://localhost:1234
LM_STUDIO_MODEL=google/gemma-2-9b
LM_STUDIO_ENABLED=false
```

### 3. Start the Application

```bash
# From project root
./start.sh

# Or manually
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Usage

### API Endpoints

#### Ingest Logs
```bash
curl -X POST http://localhost:8000/api/agents/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [{
      "event_source": "aws.s3",
      "event_type": "DeletePublicAccessBlock",
      "resource_id": "my-bucket",
      "user_identity": "admin",
      "timestamp": "2024-01-15T10:30:00Z"
    }]
  }'
```

#### List Incidents
```bash
curl http://localhost:8000/api/agents/incidents
```

#### Get Statistics
```bash
curl http://localhost:8000/api/agents/stats
```

#### Resume Workflow (After Approval)
```bash
curl -X POST http://localhost:8000/api/agents/resume/GIT-INC-1234 \
  -H "Content-Type: application/json" \
  -d '{"approve": true}'
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Agent Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  START → Sensor → Auditor → [Violation?]                    │
│                                ↓                              │
│                          Incident Ticket                      │
│                                ↓                              │
│                    [Critical? → Approval Gate]               │
│                                ↓                              │
│                          Remediator                           │
│                                ↓                              │
│                         Change Ticket                         │
│                                ↓                              │
│                          Validator                            │
│                                ↓                              │
│                    [Success? → Resolve]                      │
│                    [Failed? → Retry/Manual]                  │
│                                ↓                              │
│                          Narrator → END                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/
├── core/
│   └── agents/              # Multi-agent system
│       ├── sensor.py        # Log ingestion
│       ├── auditor.py       # Compliance evaluation
│       ├── remediator.py    # Automated fixes
│       ├── validator.py     # Verification
│       ├── narrator.py      # Evidence reports
│       ├── ticketer.py      # Ticket management
│       ├── graph.py         # Workflow orchestration
│       ├── state.py         # Graph state
│       ├── registry.py      # Incident database
│       ├── llm_config.py    # LLM configuration
│       └── logger.py        # Rich logging
├── routers/
│   └── agents.py            # API endpoints
└── data/
    ├── incidents.db         # Incident registry
    ├── checkpoints.sqlite   # Workflow state
    ├── chroma_db/           # Compliance controls
    └── evidence/            # Forensic reports
```

## Evidence Reports

Every incident generates a forensic evidence report saved to `./data/evidence/{incident_id}.md`:

```markdown
# Incident Report: GIT-INC-1234

**Status:** Resolved
**Severity:** Medium
**Framework:** SOC2
**Controls:** CC6.1, CC6.6

## Executive Summary
...

## Technical Details
...

## Remediation Steps
...
```

## Remediation Scripts

Place your remediation scripts in `./scripts/`:

```python
# scripts/close_s3_bucket.py
import boto3

def remediate():
    s3 = boto3.client('s3')
    s3.put_public_access_block(
        Bucket='my-bucket',
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': True,
            'IgnorePublicAcls': True,
            'BlockPublicPolicy': True,
            'RestrictPublicBuckets': True
        }
    )
    print("S3 bucket public access blocked")

if __name__ == "__main__":
    remediate()
```

## Monitoring

The agent system provides rich console output with color-coded logs:

- 🔵 **Sensor** (Cyan) - Log ingestion
- 🟣 **Auditor** (Magenta) - Compliance checks
- 🟡 **Ticketer** (Yellow) - Ticket management
- 🔴 **Remediator** (Red) - Fix execution
- 🟢 **Validator** (Green) - Verification
- 🔵 **Narrator** (Blue) - Report generation

## Integration with Existing Features

The agent system works seamlessly with:

- ✅ **Event Sources** - Trigger workflows from cloud events
- ✅ **Skills System** - Leverage existing detection skills
- ✅ **Notifications** - Send alerts via Slack/email
- ✅ **WebSocket** - Real-time status updates
- ✅ **Vector Store** - Shared compliance knowledge

## Troubleshooting

### Issue: LLM Connection Failed
**Solution:** Check your API key and network:
```bash
echo $GOOGLE_API_KEY
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

### Issue: ChromaDB Error
**Solution:** Reset the vector store:
```bash
rm -rf ./data/chroma_db
# Restart application
```

### Issue: Workflow Stuck
**Solution:** Clear checkpoints:
```bash
rm ./data/checkpoints.sqlite
# Restart application
```

## Documentation

For detailed documentation, see:
- [`docs/AGENT_SYSTEM_INTEGRATION.md`](docs/AGENT_SYSTEM_INTEGRATION.md) - Complete integration guide
- [Original Repository](https://github.com/imdurgadas/audit-aura-agents) - Source repository

## Next Steps

1. **Configure LLM Provider** - Set up Google Gemini or alternative
2. **Add Remediation Scripts** - Create scripts for your use cases
3. **Test Workflows** - Ingest sample logs and verify agent behavior
4. **Monitor Incidents** - Check the incident registry and evidence reports
5. **Customize Agents** - Modify agent behavior for your requirements

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the detailed documentation in `docs/AGENT_SYSTEM_INTEGRATION.md`
3. Examine agent logs in the console output
4. Check the incident database: `sqlite3 ./data/incidents.db`

---

**Integration Status:** ✅ Complete  
**Integration Date:** 2026-05-15  
**Source:** https://github.com/imdurgadas/audit-aura-agents