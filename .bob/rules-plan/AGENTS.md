# AGENTS.md - Plan Mode Rules

This file provides planning and architecture guidance for agents working in this repository.

## Critical Architectural Constraints (Non-Obvious Only)

### Service Dependency Chain
- Ollama MUST start before backend (backend depends on it)
- Backend MUST be ready before frontend can function properly
- WebSocket manager initialized in `startup_event()` - not at module level
- Services use singleton pattern to prevent multiple initializations

### PDF Processing Architecture
- PDFs stored permanently in `./backend/data/pdfs/` (not temporary)
- Extraction has two-tier fallback: OpenAI → Ollama (phi4-mini)
- Vector store uses local HuggingFace embeddings (no external dependencies)
- Re-ingestion possible without re-upload via `/ingest` endpoint

### Safe Evaluation Design
- System NEVER uses `eval()` for security reasons
- Custom `SafeRuleEvaluator` parses conditions manually
- Operator dictionary maps string operators to lambda functions
- This prevents arbitrary code execution vulnerabilities

### WebSocket Communication Pattern
- Single global `ws_manager` singleton handles all WebSocket operations
- Heartbeat mechanism prevents connection timeouts
- Frontend connects through Vite proxy in development
- All broadcasts centralized through `ws_manager.broadcast()`

### State Management Strategy
- Zustand store provides global state (not Redux/Context)
- Built-in mock data fallback for resilient UI development
- Compliance score handling supports both object and number formats
- Store uses devtools middleware for debugging

### Docker Networking Constraints
- Services communicate via Docker service names, NOT `localhost`
- Frontend dev server proxies `/api` and `/ws` to backend service
- Volume mounts ensure data persistence across container restarts
- Ollama initialization runs in background (non-blocking)

### Configuration Architecture
- Config validation rejects placeholder values (fails fast)
- Singleton pattern ensures single config instance globally
- `MOCK_MODE=true` enables demo mode with synthetic events
- Minimum intervals validated to prevent performance degradation

### Testing Architecture
- Backend tests co-located with source (not separate directory)
- Pytest with async support for FastAPI testing
- Mock mode provides synthetic data for UI testing
- No frontend test infrastructure currently (would need vitest)

### Import Dependency Order
- Python: stdlib → third-party → local (config MUST be first)
- Config imported before services to ensure initialization order
- Services depend on config singleton being available
- Circular dependencies prevented by singleton pattern

### Type System Requirements
- Python requires type hints on all function signatures
- Pydantic models enforce runtime validation
- TypeScript types centralized in `frontend/src/types/index.ts`
- Type safety enforced at build time and runtime

## Plan Mode Capabilities

- Design system architecture and workflows
- Plan multi-step implementations
- Identify dependencies and constraints
- Create technical specifications
- No code modification capabilities
- Focus on high-level design and planning