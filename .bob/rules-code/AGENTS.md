# AGENTS.md - Code Mode Rules

This file provides coding-specific guidance for agents working in this repository.

## Critical Coding Patterns (Non-Obvious Only)

### Service Initialization Pattern
- Services MUST be initialized in `startup_event()` in `backend/main.py`
- Global variables declared at module level, assigned in startup
- Use singleton pattern via `get_*()` functions (e.g., `get_vector_store()`, `get_config()`)
- Never instantiate services directly in route handlers

### PDF Processing Chain
- PDFs saved to `./backend/data/pdfs/` automatically (not temp files)
- Extraction tries OpenAI first, falls back to Ollama on error
- `ComplianceExtractor._extract_with_ollama()` uses `phi4-mini` model (hardcoded, not from config)
- Vector store uses HuggingFace embeddings (no API key needed)

### Safe Rule Evaluation
- NEVER use `eval()` for condition evaluation
- Use `SafeRuleEvaluator` in `backend/services/evaluator.py`
- Conditions parsed manually with operator dictionary
- Format: `event.field operator value` (e.g., `event.public == False`)

### WebSocket Broadcasting
- Use global `ws_manager` singleton from `backend/services/websocket_manager.py`
- Call `ws_manager.broadcast(message)` for all WebSocket sends
- Heartbeat task keeps connections alive (started in `startup_event()`)
- Frontend connects to `/ws` (proxied through Vite in dev mode)

### Frontend State Management
- Zustand store in `frontend/src/store/useComplianceStore.ts`
- `fetchDashboard()` has built-in mock data fallback on API failure
- Compliance score extraction handles both object and number formats
- Never assume API response structure - always provide fallbacks

### Docker Service Communication
- Use service names (`backend`, `ollama`) in docker-compose, NOT `localhost`
- Frontend proxies `/api` and `/ws` to `backend:8000` (see `vite.config.ts`)
- Backend depends on Ollama service (must start first)
- Volume mount at `./backend/data:/app/data` for persistence

### Configuration Validation
- `config.py` validates `OPENAI_API_KEY` - rejects placeholder values like `your_openai_api_key_here`
- Config loaded once via `get_config()` singleton
- `MOCK_MODE=true` generates synthetic events (no cloud credentials needed)
- `COMPLIANCE_CHECK_INTERVAL` minimum is 1 second (validated)

### Import Order (Enforced)
- Python: stdlib → third-party → local (config first, then services)
- TypeScript: React → third-party → local components → types → services
- Always import config before services in Python

### Type Hints (Required)
- All Python function parameters and returns must have type hints
- Use Pydantic models for configuration and API schemas
- TypeScript: Use types from `frontend/src/types/index.ts`

### Async Patterns
- FastAPI endpoints must be async for I/O operations
- WebSocket handlers must be async
- Use `await` for all service calls that perform I/O

## Testing Requirements

- Backend tests use `pytest` with `pytest-asyncio`
- Test files MUST be in same directory as source (not separate `tests/` folder)
- Mock mode (`MOCK_MODE=true`) provides synthetic data for testing
- No frontend test setup currently (add vitest if needed)

## Code Mode Restrictions

- No access to MCP tools
- No access to Browser tools
- Focus on code implementation and file modifications