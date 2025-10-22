# adgLang Playground Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Monaco Editor (Code Editing)                              │  │
│  │ - ADGLANG Syntax Highlighting                                 │  │
│  │ - Real-time Editing                                       │  │
│  │ - Auto-formatting                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓ ↑                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Stats Dashboard (Live Updates)                            │  │
│  │ - Server Status: Online/Offline                           │  │
│  │ - Compilation Count: Success/Total                        │  │
│  │ - Average Time: XXms                                      │  │
│  │ - Auto-refresh every 5s                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓ ↑                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Output Panels (Tabbed)                                    │  │
│  │ - Output: Program execution results                       │  │
│  │ - LLVM IR: Generated intermediate representation          │  │
│  │ - AST: Abstract syntax tree                               │  │
│  │ - Tokens: Lexer output                                    │  │
│  │ - Execution Info: Time & Size metrics                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↑
                      HTTP REST API
                            ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Bun HTTP Server (Port 3001)                               │  │
│  │                                                            │  │
│  │ Endpoints:                                                │  │
│  │ - POST /compile    → Compile & Execute ADGLANG code          │  │
│  │ - POST /format     → Format ADGLANG code                      │  │
│  │ - GET  /examples   → Load example programs                │  │
│  │ - GET  /health     → Server health check                  │  │
│  │ - GET  /stats      → Statistics & metrics                 │  │
│  │ - GET  /logs       → Retrieve server logs                 │  │
│  │ - POST /logs/clear → Clear log history                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Logger System                                             │  │
│  │ - Multi-level: info, warn, error, debug                   │  │
│  │ - Colored console output                                  │  │
│  │ - Timestamped entries                                     │  │
│  │ - Request ID tracking                                     │  │
│  │ - Retention: Last 1000 logs                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Statistics Tracker                                        │  │
│  │ - Total requests                                          │  │
│  │ - Success/failure counts                                  │  │
│  │ - Average compile time                                    │  │
│  │ - Server uptime                                           │  │
│  │ - Real-time calculations                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ADGLANG Compilation Pipeline                                  │  │
│  │                                                            │  │
│  │ 1. Lexical Analysis (lexWithGrammar)                      │  │
│  │    └─> Tokens                                             │  │
│  │                                                            │  │
│  │ 2. Parsing (Parser)                                       │  │
│  │    └─> AST                                                │  │
│  │                                                            │  │
│  │ 3. Type Checking (TypeChecker)                            │  │
│  │    └─> Validated AST                                      │  │
│  │                                                            │  │
│  │ 4. Code Generation (CodeGenerator)                        │  │
│  │    └─> LLVM IR                                            │  │
│  │                                                            │  │
│  │ 5. Binary Compilation (Clang)                             │  │
│  │    └─> Executable                                         │  │
│  │                                                            │  │
│  │ 6. Execution                                              │  │
│  │    └─> Output                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User writes code → POST /compile → Logger logs request         │
│       ↓                                                          │
│  Code → Lexer → Parser → TypeChecker → CodeGen → Clang          │
│       ↓         ↓         ↓            ↓          ↓              │
│     Tokens     AST     Validated     LLVM IR    Binary           │
│                                                   ↓              │
│                                              Execute             │
│                                                   ↓              │
│  Response ← Stats Update ← Logger ← Output + Metrics            │
│       ↓                                                          │
│  Frontend displays results + updates stats dashboard             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Every 5 seconds:                                               │
│    Frontend → GET /stats → Backend                              │
│         ↓                      ↓                                 │
│    Display stats          Calculate metrics                     │
│    Update UI              Return JSON                            │
│                                                                  │
│  Every 5 minutes:                                               │
│    Backend → Logger → Console output                            │
│         ↓                                                        │
│    Periodic stats summary                                       │
│                                                                  │
│  On demand:                                                     │
│    GET /health  → Status check                                  │
│    GET /logs    → Recent log entries                            │
│    POST /clear  → Reset logs                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE TRACKING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request ID: req_1234567890_abc123                              │
│                                                                  │
│  Phase Breakdown:                                               │
│  ├─ Lexing:         15ms                                        │
│  ├─ Parsing:        25ms                                        │
│  ├─ Type Check:     35ms                                        │
│  ├─ Code Gen:       40ms                                        │
│  ├─ LLVM Compile:   50ms                                        │
│  └─ Execute:        10ms                                        │
│                                                                  │
│  Total:            175ms                                        │
│                                                                  │
│  Every phase is logged with timestamps and durations            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend Components

- **Monaco Editor**: Full-featured editor for writing code
- **Stats Dashboard**: Live view of runtime metrics
- **Output Tabs**: Multiple views for debugging details
- **Input Controls**: Configuration for stdin and args

### Backend Services

- **HTTP Server**: REST API built on Bun
- **Logger**: Shared logging system
- **Stats Tracker**: Performance and usage metrics
- **Compiler Pipeline**: End-to-end adgLang compilation flow

### Integration Points

- **REST API**: JSON-based communication layer
- **Polling**: Stats refresh every 5 seconds
- **WebSocket** (future): Real-time log streaming
- **Health Checks**: Built-in monitoring hooks

### Monitoring & Observability

- **Logs**: Detailed request-level tracing
- **Metrics**: Performance and usage stats
- **Health**: Server availability checks
- **Debug**: AST/IR/Token inspection
