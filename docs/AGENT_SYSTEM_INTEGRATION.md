# Agent System Integration

## Overview

The AuditAura application now includes a sophisticated multi-agent system powered by LangGraph, enabling automated compliance workflows from detection to remediation. This system was integrated from the [audit-aura-agents](https://github.com/imdurgadas/audit-aura-agents) repository.

## Architecture

### Multi-Agent Workflow

The system implements a stateful workflow with the following agents:

1. **Sensor Agent** - Ingests and normalizes raw platform logs
2. **Auditor Agent** - Evaluates logs against compliance controls using LLM reasoning
3. **Ticketer Agent** - Creates incident and change tickets
4. **Remediator Agent** - Executes automated remediation scripts
5. **Validator Agent** - Verifies remediation success
6. **Narrator Agent** - Generates forensic evidence reports

### Workflow Graph

```
START → Sensor → Auditor → [Decision]
                              ↓
                         Incident Creation
                              ↓
                    [Critical? → Approval]
                              ↓
                         Remediator
                              ↓
                      Change Ticket
                              ↓
                         Validator
                              ↓
                    [Success? → Resolve]
                    [Failed? → Retry/Manual]
                              ↓
                         Narrator → END
```

## Directory Structure

```
backend/
├── core/
│   └── agents/
│       ├── __init__.py          # Agent exports
│       ├── state.py             # Graph state definition
│       ├── logger.py            # Rich console logging
│       ├── llm_config.py        # LLM configuration
│       ├── registry.py          # Incident database
│       ├── sensor.py            # Log ingestion agent
│       ├── auditor.py           # Compliance evaluation agent
│       ├── remediator.py        # Remediation execution agent
│       ├── validator.py         # Validation agent
│       ├── narrator.py          # Evidence generation agent
│       ├── ticketer.py          # Ticket management agent
│       └── graph.py             # LangGraph workflow
└── routers/
    └── agents.py                # API endpoints
```

## API Endpoints

### POST /api/agents/ingest
Ingest logs and trigger the agent workflow.

**Request:**
```json
{
  "logs": [
    {
      "event_source": "aws.s3",
      "event_type": "PutBucketPublicAccessBlock",
      "resource_id": "my-bucket",
      "user_identity": "arn:aws:iam::123456789012:user/admin",
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "DeletePublicAccessBlock"
    }
  ],
  "incident_id": "GIT-INC-1234"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "incident_id": "GIT-INC-1234",
  "message": "Workflow initiated for 1 log(s)",
  "evaluations_count": 1
}
```

### POST /api/agents/resume/{incident_id}
Resume a paused workflow (e.g., after human approval).

**Request:**
```json
{
  "approve": true,
  "change_ticket": "CHG-5678"  // Optional
}
```

### GET /api/agents/incidents
List all incidents from the registry.

### GET /api/agents/incidents/pending-approvals
List incidents waiting for human approval.

### GET /api/agents/stats
Get incident statistics.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Google Gemini (Recommended for agents)
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_ENABLED=true

# OpenCode.ai Zen (Alternative cloud provider)
OPENCODE_API_KEY=your_opencode_api_key_here
OPENCODE_MODEL=zen-1.0
OPENCODE_BASE_URL=https://api.opencode.ai/v1
OPENCODE_ENABLED=false

# LM Studio (Local alternative)
LM_STUDIO_HOST=http://localhost:1234
LM_STUDIO_MODEL=google/gemma-2-9b
LM_STUDIO_ENABLED=false

# OpenAI (Alternative)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ENABLED=false

# Ollama (Local alternative)
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=phi4-mini
OLLAMA_ENABLED=false
```

### LLM Provider Priority

The system selects LLM providers in this order:
1. **Google Gemini** (if `GEMINI_ENABLED=true`) - Recommended for production
2. **OpenCode.ai Zen** (if `OPENCODE_ENABLED=true`) - Alternative cloud provider
3. **LM Studio** (if `LM_STUDIO_ENABLED=true`) - Local development
4. **OpenAI** (if `OPENAI_ENABLED=true`) - Alternative cloud provider
5. **Ollama** (if `OLLAMA_ENABLED=true`) - Local development

## Dependencies

New dependencies added to `requirements.txt`:

```
langgraph==0.2.45
langchain-google-genai==1.0.10
chromadb==0.5.23
aiosqlite==0.20.0
pymysql==1.1.1
rich==13.9.4
```

Install with:
```bash
pip install -r backend/requirements.txt
```

## Database

The agent system uses SQLite for:
- **Incident Registry** (`./data/incidents.db`) - Tracks all incidents
- **Workflow Checkpoints** (`./data/checkpoints.sqlite`) - Enables workflow resumption
- **ChromaDB** (`./data/chroma_db`) - Vector store for compliance controls

## Evidence Reports

Forensic evidence reports are automatically generated and saved to:
```
./data/evidence/{incident_id}.md
```

Each report includes:
- Executive Summary
- Technical Details
- Compliance Impact
- Remediation Steps
- Validation Results
- Recommendations

## Remediation Scripts

Place remediation scripts in `./scripts/` directory:
- `close_s3_bucket.py`
- `enforce_mfa.py`
- `close_ssh_port.py`
- etc.

The Remediator agent will execute these scripts based on the Auditor's recommendations.

## Human-in-the-Loop

Critical severity violations trigger a workflow pause for human approval:

1. Workflow pauses at the `approval` node
2. Admin reviews via `/api/agents/incidents/pending-approvals`
3. Admin approves/rejects via `/api/agents/resume/{incident_id}`
4. Workflow continues based on decision

## Retry Logic

Failed remediations are automatically retried:
- Maximum 3 retry attempts
- After 3 failures, escalates to manual fix
- Validator confirms each attempt

## Integration with Existing System

The agent system integrates seamlessly with existing AuditAura features:

- **Event Sources** - Can trigger agent workflows
- **Skills System** - Agents can leverage existing detection skills
- **Notifications** - Agent events can trigger Slack/email notifications
- **WebSocket** - Real-time agent status updates
- **Vector Store** - Shared compliance control knowledge base

## Testing

Test the agent system:

```bash
# Test log ingestion
curl -X POST http://localhost:8000/api/agents/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [{
      "event_source": "aws.s3",
      "event_type": "DeletePublicAccessBlock",
      "resource_id": "test-bucket"
    }]
  }'

# Check incidents
curl http://localhost:8000/api/agents/incidents

# Check stats
curl http://localhost:8000/api/agents/stats
```

## Monitoring

Agent actions are logged with rich console output:
- Color-coded by agent type
- Detailed execution logs
- Timestamp tracking
- Error handling

View logs in the terminal where the backend is running.

## Future Enhancements

Potential improvements:
1. Real-time SSE streaming of agent events
2. Integration with existing WebSocket system
3. Custom remediation script marketplace
4. Advanced approval workflows
5. Multi-cloud platform support
6. Machine learning for control matching

## Troubleshooting

### ChromaDB Issues
If ChromaDB fails to initialize:
```bash
rm -rf ./data/chroma_db
# Restart the application
```

### LLM Connection Issues
Check your API keys and network connectivity:
```bash
# Test Gemini
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models

# Test LM Studio
curl http://localhost:1234/v1/models
```

### Workflow Stuck
If a workflow appears stuck:
```bash
# Check checkpoint database
sqlite3 ./data/checkpoints.sqlite "SELECT * FROM checkpoints;"

# Clear checkpoints (caution: loses workflow state)
rm ./data/checkpoints.sqlite
```

## References

- Original Repository: https://github.com/imdurgadas/audit-aura-agents
- LangGraph Documentation: https://langchain-ai.github.io/langgraph/
- Gemini API: https://ai.google.dev/docs

---

*Integration completed on 2026-05-15*