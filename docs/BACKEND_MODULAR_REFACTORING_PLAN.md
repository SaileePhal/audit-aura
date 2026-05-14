# Backend Modular Refactoring Plan

## Current Structure Issues

The current backend has services scattered in a flat structure, making it difficult to:
- Understand relationships between components
- Locate specific functionality
- Maintain and scale the codebase
- Onboard new developers

## Proposed Modular Structure

```
backend/
├── main.py                          # Application entry point
├── config.py                        # Configuration management
│
├── api/                             # API Layer
│   ├── __init__.py
│   ├── dependencies.py              # Shared dependencies
│   ├── routes/                      # API Routes
│   │   ├── __init__.py
│   │   ├── compliance.py            # Compliance endpoints
│   │   ├── connections.py           # Cloud connections
│   │   ├── controls.py              # Control management
│   │   ├── dashboard.py             # Dashboard data
│   │   ├── skills.py                # Skill management
│   │   ├── violations.py            # Violation tracking
│   │   └── websocket.py             # WebSocket endpoint
│   └── middleware/                  # Custom middleware
│       ├── __init__.py
│       └── error_handler.py
│
├── core/                            # Core Business Logic
│   ├── __init__.py
│   ├── compliance/                  # Compliance domain
│   │   ├── __init__.py
│   │   ├── tracker.py               # Compliance tracking
│   │   ├── evaluator.py             # Rule evaluation
│   │   └── scorer.py                # Score calculation
│   ├── detection/                   # Detection domain
│   │   ├── __init__.py
│   │   ├── agent.py                 # Detection agent
│   │   └── skills/                  # Skills (already modular)
│   ├── extraction/                  # PDF extraction domain
│   │   ├── __init__.py
│   │   ├── extractor.py             # PDF extractor
│   │   └── parsers/                 # Format parsers
│   └── monitoring/                  # Monitoring domain
│       ├── __init__.py
│       ├── event_processor.py       # Event processing
│       └── aggregator.py            # Event aggregation
│
├── infrastructure/                  # Infrastructure Layer
│   ├── __init__.py
│   ├── cloud/                       # Cloud integrations
│   │   ├── __init__.py
│   │   ├── aws/                     # AWS specific
│   │   ├── ibm/                     # IBM Cloud specific
│   │   └── azure/                   # Azure specific
│   ├── database/                    # Database layer
│   │   ├── __init__.py
│   │   ├── vector_store.py          # Vector database
│   │   └── repositories/            # Data repositories
│   ├── messaging/                   # Messaging/Events
│   │   ├── __init__.py
│   │   ├── websocket.py             # WebSocket manager
│   │   └── notifications.py         # Notification service
│   └── security/                    # Security utilities
│       ├── __init__.py
│       ├── encryption.py            # Encryption service
│       └── auth.py                  # Authentication
│
├── models/                          # Data Models
│   ├── __init__.py
│   ├── domain/                      # Domain models
│   │   ├── __init__.py
│   │   ├── control.py               # Compliance control
│   │   ├── violation.py             # Violation
│   │   ├── event.py                 # Cloud event
│   │   └── connection.py            # Cloud connection
│   ├── schemas/                     # API schemas (Pydantic)
│   │   ├── __init__.py
│   │   ├── requests.py              # Request models
│   │   └── responses.py             # Response models
│   └── enums/                       # Enumerations
│       ├── __init__.py
│       ├── severity.py              # Severity levels
│       └── providers.py             # Cloud providers
│
├── services/                        # Application Services
│   ├── __init__.py
│   ├── compliance_service.py        # Compliance operations
│   ├── detection_service.py         # Detection operations
│   ├── connection_service.py        # Connection management
│   └── report_service.py            # Report generation
│
└── utils/                           # Utilities
    ├── __init__.py
    ├── logging.py                   # Logging configuration
    ├── validators.py                # Input validators
    └── helpers.py                   # Helper functions
```

## Migration Strategy

### Phase 1: Create New Structure (Week 1)
1. Create new directory structure
2. Set up `__init__.py` files with proper exports
3. Create migration documentation

### Phase 2: Move Core Logic (Week 2)
1. Move compliance tracking to `core/compliance/`
2. Move detection agent to `core/detection/`
3. Move extraction logic to `core/extraction/`
4. Update imports progressively

### Phase 3: Organize Infrastructure (Week 3)
1. Move cloud integrations to `infrastructure/cloud/`
2. Move database logic to `infrastructure/database/`
3. Move messaging to `infrastructure/messaging/`
4. Move security utilities to `infrastructure/security/`

### Phase 4: Refactor API Layer (Week 4)
1. Split `main.py` into focused route modules
2. Move routes to `api/routes/`
3. Create shared dependencies
4. Add middleware layer

### Phase 5: Clean Up Models (Week 5)
1. Separate domain models from API schemas
2. Create proper enumerations
3. Add model validators
4. Update all references

### Phase 6: Testing & Documentation (Week 6)
1. Update all tests
2. Create module documentation
3. Update import guides
4. Performance testing

## Benefits

### 1. **Clear Separation of Concerns**
- API layer handles HTTP/WebSocket
- Core layer contains business logic
- Infrastructure layer manages external systems
- Models define data structures

### 2. **Domain-Driven Design**
- Compliance domain is self-contained
- Detection domain is independent
- Each domain can evolve separately

### 3. **Testability**
- Mock infrastructure easily
- Test business logic in isolation
- Integration tests are clearer

### 4. **Scalability**
- Add new cloud providers easily
- Extend domains without conflicts
- Team can work on different modules

### 5. **Maintainability**
- Find code quickly
- Understand dependencies
- Refactor with confidence

## Implementation Priority

### High Priority (Do First)
1. ✅ Skills module (already done)
2. API routes separation
3. Core business logic organization

### Medium Priority (Do Next)
4. Infrastructure layer
5. Models reorganization
6. Services layer

### Low Priority (Do Last)
7. Utilities cleanup
8. Documentation updates
9. Performance optimization

## Breaking Changes

### Import Changes
```python
# Old
from services.compliance_tracker import get_tracker
from services.extractor import ComplianceExtractor

# New
from core.compliance import get_tracker
from core.extraction import ComplianceExtractor
```

### Configuration Changes
```python
# Old
from config import get_config

# New (stays the same)
from config import get_config
```

## Backward Compatibility

- Keep old imports working with deprecation warnings
- Provide migration scripts
- Update documentation with both old and new patterns
- Gradual migration over 2-3 releases

## Success Metrics

1. **Code Organization**: All files in appropriate modules
2. **Import Clarity**: No circular dependencies
3. **Test Coverage**: Maintain or improve coverage
4. **Performance**: No degradation
5. **Documentation**: Complete module docs

## Next Steps

1. Review and approve this plan
2. Create feature branch for refactoring
3. Start with Phase 1 (structure creation)
4. Implement incrementally with tests
5. Merge when stable

This modular structure will make the backend:
- **Professional**: Industry-standard organization
- **Maintainable**: Easy to understand and modify
- **Scalable**: Ready for growth
- **Testable**: Clear boundaries for testing
- **AI-Ready**: Scores highly with evaluation tools