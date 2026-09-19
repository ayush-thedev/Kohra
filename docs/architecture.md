# Architecture Specification: KOHLER Enterprise Intelligence Agent

## 1. System Overview

The KOHLER Enterprise Intelligence Agent is designed for multi-domain enterprise policy synthesis with strict role-based access control (RBAC), conflict resolution, human-in-the-loop safety gates, and dynamic serialization.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 + TypeScript + Vite + Kohler Bold Design System   │
│  • ChatShell • MessageList • SourcePanel • AuditLogViewer   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (JSON over HTTP)
┌──────────────────────────────▼──────────────────────────────┐
│                   Agent Pipeline Orchestrator               │
│                                                             │
│ 1. Session Manager (In-Memory Map, TTL: 30 mins)            │
│ 2. Domain Router (Local Embeddings + Multi-Domain Routing)  │
│ 3. Hybrid Retriever (Semantic + BM25 with RRF Rank Merge)   │
│ 4. RBAC Gate (Post-Retrieval Chunk Drop & Audit Tracking)   │
│ 5. Conflict & Supersession Detector (v2 vs v3 & Dates)      │
│ 6. HITL Safety Gate (CRITICAL/HIGH Escalation Routing)      │
│ 7. Answer Generator (Groq Llama 3.3 70B Grounded Synthesis) │
│ 8. Output Formatter (Prose, JSON, XML, SheetJS, Email)      │
│ 9. Audit Logger (Millisecond Stage Timings & Event Log)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      Data Store                             │
│  • 19 Markdown Policy Repositories (5 Domains)              │
│  • Inverted BM25 Term Index                                 │
│  • Section Chunk Cache (66 Chunks)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Pipeline Stage Detailed Breakdown

### Stage 1: Session Management
- **Store**: `Map<sessionId, SessionData>`
- **TTL**: 30-minute idle eviction.
- **Context Injection**: Injects the last 3 conversational turns into the LLM prompt to maintain multi-turn context.

### Stage 2: Domain Routing
- **Mechanism**: Calculates cosine similarity against domain query profiles.
- **Multi-Domain Routing**: When 2+ domains score above the 0.45 threshold (such as Privacy + Legal queries), the router includes all qualifying domains to ensure complete retrieval coverage.
- **Out of Scope Gate**: Queries with top score < 0.2 trigger graceful honest refusal with department redirection.

### Stage 3: Hybrid Retrieval & Reciprocal Rank Fusion (RRF)
- **Keyword Search**: BM25 with $k_1 = 1.5, b = 0.75$.
- **Semantic Search**: Vector similarity scoring across titles, sections, keywords, and content.
- **RRF Merge**: Combines rankings using:
  $$RRF(d) = \sum_{m \in \{semantic, bm25\}} \frac{1}{60 + rank_m(d)}$$
- **Top-K**: Fetches the top-5 merged chunks.

### Stage 4: RBAC Containment Gate
- **Execution**: Runs **after** candidate retrieval and **before** LLM prompt assembly.
- **Rule**: `chunk.rbacTiers.includes(userRole)`.
- **Audit Logging**: Records `droppedCount` and reasons (e.g., `"Document 'Executive Entertainment' requires FINANCE or ADMIN"`).
- **Honest Refusal**: If 100% of candidate chunks are filtered out, the agent returns an explicit access denial notice without leaking restricted policy data.

### Stage 5: Conflict & Supersession Detector
- **Supersession**: Scans `supersedes` metadata (e.g. PTO Policy v3.0 supersedes v2.0) and forces precedence on the active policy.
- **Temporal Check**: Verifies `validFrom` and `validUntil` date bounds.
- **Interactions**: Identifies `conflictsWith` tags and provides advisory warnings.

### Stage 6: Human-in-the-Loop (HITL) Safety Gate
- **Risk Scoring**:
  - `CRITICAL`: Executive compensation, confidential severance formulas, regulatory breach filings.
  - `HIGH`: Third-party data sharing deviations, security waivers.
  - `MEDIUM`: Financial threshold exceptions.
  - `LOW`: Standard policy questions.
- **Escalation Routing**: Directs critical requests to HR, Legal, or Executive leadership.

### Stage 7: Grounded Answer Synthesis
- **Model**: Groq `llama-3.3-70b-versatile` (or deterministic local synthesizer fallback).
- **Format**: Structured JSON output with answer text, confidence rating, grounded boolean, and exact source citations.

### Stage 8: Dynamic Output Formatter
- **Prose**: Clean Markdown with source list.
- **JSON**: Validated schema.
- **XML**: Strict `<kohlerResponse>` XML tree.
- **Excel (.xlsx)**: Multi-sheet workbook (Summary, Source Citations, Governance Metadata) generated via SheetJS.
- **Email**: Parameterized Handlebars template.

### Stage 9: Structured Audit Logger
- **Telemetry**: High-resolution latency profiling (`routeMs`, `retrieveMs`, `rbacMs`, `conflictMs`, `hitlMs`, `answerMs`, `formatMs`, `totalMs`).
- **Audit Events**: Full lifecycle tracking indexed by `requestId` and `sessionId`.
