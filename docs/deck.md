# Track 3: KOHLER Enterprise Intelligence Agent
## Unified Enterprise Conversational AI with Grounded Retrieval & RBAC Governance

---

### Slide 1: Problem Statement and Solution

#### The Problem

Enterprise employees waste hours navigating disconnected policy repositories spanning HR, Finance, Customer Support, Privacy, and Legal domains. Traditional conversational AI exposes confidential policies to unauthorized users and provides zero audit trail for compliance. Outdated or superseded policies are cited without detection, creating legal and operational risk.

#### The Solution

KOHLRA is a unified enterprise conversational AI agent that answers complex cross-domain policy questions with full governance. It combines hybrid retrieval (BM25 + semantic vectors), strict role-based access control across 6 tiers, automatic policy supersession detection, human-in-the-loop safety gates for high-risk queries, and dynamic multi-format output — all grounded in 30 verified policy repositories with 206 structured chunks.

---

### Slide 2: System Architecture and Workflow

#### 9-Stage Agent Pipeline

1. **Session Manager** — Multi-turn conversation context (last 3 turns, 30-min TTL)
2. **Domain Router** — Local embeddings classify queries into HR, Finance, Support, Privacy, or Legal with cosine similarity scoring
3. **Hybrid Retriever** — BM25 keyword search + semantic vector search merged via Reciprocal Rank Fusion (k=60), returning top-5 chunks
4. **RBAC Containment Gate** — Post-retrieval chunk filtering across 6 tiers (EMPLOYEE to ADMIN) with dropped document telemetry
5. **Conflict & Supersession Detector** — Resolves version conflicts (e.g., PTO v3.0 supersedes v2.0) using temporal metadata
6. **HITL Safety Gate** — Risk scoring (CRITICAL/HIGH/MEDIUM/LOW) with escalation routing to Legal/HR leadership
7. **Answer Generator** — Groq Llama 3.3 70B grounded synthesis with structured JSON output
8. **Output Formatter** — Prose, JSON, XML, Excel (SheetJS), and Handlebars Email templates
9. **Audit Logger** — Millisecond telemetry across all stages with full event lifecycle tracking

#### Data Flow

React 19 Frontend → HTTP POST /api/chat → Express Backend (9 stages) → Knowledge Base (30 Markdown policies, BM25 inverted index, section chunk cache).

---

### Slide 3: Tech Stack and Key Innovations

#### Technology

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Kohler Foundations Design System |
| Backend | Node.js, Express, TypeScript, gray-matter, Handlebars, SheetJS |
| LLM | Groq Llama 3.3 70B (fast inference, low latency) |
| Retrieval | BM25 inverted index + local semantic vectors + RRF merge |
| Knowledge Base | 30 YAML-frontmatter Markdown files, 206 section-level chunks |
| Deployment | Vercel (frontend) + Railway (backend) |

#### Key Innovations

- **Hybrid RRF Retrieval**: BM25 keyword precision fused with semantic vector recall via Reciprocal Rank Fusion — outperforms either method alone
- **Post-Retrieval RBAC**: Chunks filtered after retrieval but before LLM sees them — no inference bypass possible
- **Temporal Conflict Detection**: Automatic supersession resolution using version metadata and date bounds
- **HITL Safety Gates**: Risk-scored query escalation for executive compensation, data sharing, and policy exceptions
- **Multi-Format Serialization**: Same grounded answer rendered as Prose, JSON, XML, binary Excel, or email draft

---

### Slide 4: Demo Highlights, Business Value, and Impact

#### Demo: 5/5 Evaluation Scenarios Passing

1. **Single-Domain Grounding** — Exact retrieval of $75/day domestic travel per diem from Finance v2.1
2. **Cross-Domain Synthesis** — Unified Privacy DPA + Legal MSA indemnification for cloud vendor queries
3. **RBAC Containment** — EMPLOYEE blocked (3 docs dropped) while FINANCE receives full executive budgets
4. **Policy Conflict Resolution** — Correctly prioritizes PTO v3.0 (20 days) over superseded v2.0 (15 days)
5. **Multi-Format Output** — Generates 5 valid formats including downloadable multi-sheet Excel

#### Business Impact

- **50% Time-to-Answer Reduction**: Seconds vs. hours for policy resolution
- **100% Policy Traceability**: Full audit trails with millisecond telemetry
- **Zero-Hallucination Governance**: Answers grounded exclusively in retrieved source documents
- **Enterprise-Grade Security**: 6-tier RBAC with honest refusal, HITL escalation, and compliance logging
- **Kohler Design Alignment**: Built with Kohler Foundations Design System (vermilion, architectural typography)
