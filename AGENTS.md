# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Project-Specific Patterns

### PDF Storage & Persistence
- PDFs uploaded via `/upload` are automatically saved to `./backend/data/pdfs/` (not temporary)
- Use `/ingest` endpoint to re-process stored PDFs without re-uploading
- Docker volume mount at `./backend/data:/app/data` ensures persistence across restarts
- List stored PDFs with `/pdfs` endpoint before attempting re-upload

### AI Extraction Fallback Chain
- OpenAI extraction attempts first, falls back to Ollama (local LLM) on quota/error
- Ollama uses `phi4-mini` model (not `mistral` as config suggests) for extraction
- HuggingFace embeddings (`sentence-transformers/all-MiniLM-L6-v2`) used for vector store (no API key needed)
- Check `self.ollama_available` in `ComplianceExtractor` before attempting Ollama fallback

### Safe Rule Evaluation (No eval())
- `SafeRuleEvaluator` in `backend/services/evaluator.py` parses conditions without `eval()`
- Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not in`, `contains`, `startswith`, `endswith`, `matches`
- Condition format: `event.field operator value` (e.g., `event.public == False`)
- Boolean fields can be checked directly: `event.encrypted` (no operator needed)

### WebSocket Manager Pattern
- Global `ws_manager` singleton in `backend/services/websocket_manager.py`
- Heartbeat task started in `startup_event()` to keep connections alive
- All WebSocket broadcasts go through `ws_manager.broadcast()` method
- Frontend connects to `/ws` endpoint (proxied through Vite in dev)

### Frontend State Management
- Zustand store in `frontend/src/store/useComplianceStore.ts` handles global state
- `fetchDashboard()` has built-in fallback to mock data on API failure
- Compliance score extraction handles both object (`{overall_score: 85}`) and number formats
- Store uses devtools middleware for debugging

### Docker Service Dependencies
- Backend depends on Ollama service (must start first)
- Frontend proxies `/api` and `/ws` to backend service (not localhost in container)
- Ollama initialization via `ollama-init.sh` runs in background during startup
- Use service names (`backend`, `ollama`) in docker-compose, not `localhost`

### Configuration Validation
- `config.py` validates `OPENAI_API_KEY` - rejects placeholder values
- `MOCK_MODE=true` generates synthetic events (no cloud credentials needed)
- `COMPLIANCE_CHECK_INTERVAL` minimum is 1 second (validated)
- Config loaded once globally via `get_config()` singleton pattern

## Build & Test Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
pytest                          # Run all tests
pytest --cov=. --cov-report=html  # With coverage
uvicorn main:app --reload       # Dev server
```

### Frontend
```bash
cd frontend
npm install
npm run dev                     # Dev server (port 3000)
npm run build                   # Production build
npm run lint                    # ESLint
npm run type-check              # TypeScript check
```

### Docker
```bash
./start.sh                      # Full stack startup
docker-compose up --build       # Manual startup
docker-compose logs -f          # Follow logs
docker-compose down             # Stop services
```

## Code Style

### Python
- Type hints required for function parameters and returns
- Pydantic models for configuration and API schemas
- Logging via `logger = logging.getLogger(__name__)`
- Services use singleton pattern via `get_*()` functions
- Async/await for I/O operations (FastAPI endpoints, WebSocket)

### TypeScript/React
- Path alias `@/` maps to `frontend/src/`
- Zustand for state management (not Redux/Context)
- Functional components with hooks only
- Types defined in `frontend/src/types/index.ts`
- API calls through `apiService` singleton in `frontend/src/services/api.ts`

### Import Order
- Python: stdlib → third-party → local (config first, then services)
- TypeScript: React → third-party → local components → types → services

## Testing

- Backend tests use `pytest` with `pytest-asyncio` for async tests
- Test files must be in same directory as source (not separate `tests/` folder)
- Frontend has no test setup currently (add vitest if needed)
- Mock mode (`MOCK_MODE=true`) provides synthetic data for testing UI without backend