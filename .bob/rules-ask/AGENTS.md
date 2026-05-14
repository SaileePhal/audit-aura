# AGENTS.md - Ask Mode Rules

This file provides documentation and explanation guidance for agents working in this repository.

## Critical Documentation Context (Non-Obvious Only)

### Project Architecture Understanding
- Backend is FastAPI (Python 3.12) with AI/ML capabilities
- Frontend is React 18 + TypeScript + Vite + Zustand
- Ollama service provides local LLM fallback (not just for dev)
- Docker Compose orchestrates 3 services: backend, frontend, ollama

### PDF Storage Persistence
- PDFs stored in `./backend/data/pdfs/` persist across container restarts
- Volume mount ensures data survives `docker-compose down`
- `/ingest` endpoint re-processes stored PDFs without re-upload
- This is NOT temporary storage - it's the permanent PDF repository

### AI Extraction Strategy
- System tries OpenAI first, automatically falls back to Ollama
- Fallback is NOT an error condition - it's designed behavior
- `phi4-mini` model used for Ollama (smaller, faster than `mistral`)
- HuggingFace embeddings are free and local (no API key needed)

### WebSocket Architecture
- WebSocket manager is a singleton with heartbeat mechanism
- Heartbeat prevents connection timeouts during idle periods
- Frontend proxy in Vite config routes `/ws` to backend in Docker
- All broadcasts go through `ws_manager.broadcast()` - never direct WebSocket sends

### Frontend State Patterns
- Zustand store has built-in mock data fallback (not an error state)
- Compliance score can be object or number - code handles both
- `fetchDashboard()` gracefully degrades to mock data on API failure
- This allows UI development without running backend

### Docker Networking
- Services communicate via service names (`backend`, `ollama`), not `localhost`
- Frontend dev server proxies API calls to backend service
- Ollama initialization happens in background during startup
- Backend waits for Ollama to be available before using it

### Configuration Philosophy
- `MOCK_MODE=true` is for demos and development (generates synthetic events)
- Config validation rejects placeholder values (prevents silent failures)
- Singleton pattern ensures config loaded once and shared globally
- Minimum intervals validated to prevent performance issues

### Testing Strategy
- Backend tests use pytest with async support
- Test files co-located with source (not in separate `tests/` directory)
- Mock mode provides synthetic data for UI testing without backend
- No frontend tests currently - would need vitest setup

### Code Organization Principles
- Python imports: stdlib → third-party → local (config always first)
- Services use singleton pattern via `get_*()` functions
- All services initialized in `startup_event()`, not at module level
- Type hints required for all Python functions

## Ask Mode Capabilities

- Explain code patterns and architecture
- Answer questions about implementation details
- Provide context on design decisions
- No code modification capabilities
- Focus on understanding and documentation