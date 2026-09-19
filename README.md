# KOHLER Enterprise Intelligence Agent

> **Track 3: Unified Enterprise Conversational AI Agent**  
> **Design System:** Kohler Bold AI-Ready Enterprise Design System  
> **Target Track:** Track 3 Enterprise Conversational AI Prototype

---

## Executive Overview

The **KOHLER Enterprise Intelligence Agent** is an enterprise-grade conversational AI platform designed to answer complex cross-domain policy questions across **five enterprise repositories** (HR, Finance, Customer Support, Privacy, Legal & Compliance).

Built with the **Kohler Bold Enterprise Design System** (signature Kohler Volt `#bdeb10` + architectural dark charcoal `#141414`/`#000000`), the agent provides:

1. **Grounded Hybrid Retrieval**: Integrates BM25 keyword search and high-dimensional semantic vector ranking fused via **Reciprocal Rank Fusion (RRF $k=60$)**.
2. **Strict Post-Retrieval RBAC Containment**: Evaluates 6 governance tiers (`EMPLOYEE`, `MANAGER`, `HR`, `FINANCE`, `LEGAL`, `ADMIN`), dropping unauthorized chunks before LLM synthesis and logging `droppedCount` telemetry.
3. **Temporal Conflict & Supersession Detection**: Resolves active policies over legacy versions (e.g., Paid Time Off Policy v3.0 superseding v2.0) and flags cross-domain policy interactions.
4. **Human-in-the-Loop (HITL) Safety Gating**: Flags and escalates high-risk actions (executive compensation, breach notifications, security overrides).
5. **Dynamic Multi-Format Serialization**: Renders the exact same grounded answer across **5 formats** (Prose Markdown, validated JSON, XML, binary Excel `.xlsx` spreadsheets via SheetJS, and Handlebars Email drafts).
6. **Structured Audit Logging**: Real-time event telemetry and millisecond latency breakdowns (`routeMs`, `retrieveMs`, `rbacMs`, `conflictMs`, `answerMs`, `formatMs`, `totalMs`).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│   React 19 Frontend (Vite + Tailwind + Kohler Bold Design)  │
│   ├─ Conversational Stream with Format Toggle               │
│   ├─ 1-Click Evaluation Scenario Launcher (5 Scenarios)     │
│   ├─ Interactive Source Citations Drawer                    │
│   ├─ Real-Time Governance Audit Trail Viewer                │
│   └─ RBAC Governance Role Switcher                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ (HTTP POST /api/chat)
┌──────────────────────────────▼──────────────────────────────┐
│   Express Backend (Node.js + TypeScript)                    │
│   ├─ 1. Session Manager (Multi-turn, last 3 turns)          │
│   ├─ 2. Domain Router (Local Embeddings + Multi-Domain)     │
│   ├─ 3. Hybrid Retriever (Semantic + BM25 with RRF)         │
│   ├─ 4. RBAC Containment Gate (Post-retrieval role filter)  │
│   ├─ 5. Conflict & Supersession Detector                    │
│   ├─ 6. HITL Safety & Escalation Gate                       │
│   ├─ 7. Grounded Answer Generator (Groq Llama 3.3 70B)      │
│   ├─ 8. Multi-Format Output Formatter                       │
│   └─ 9. Structured Audit Logger                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│   Knowledge Base & Data Layer (19 Policies / 66 Chunks)     │
│   ├─ HR: PTO v2/v3, Severance, Benefits, Remote Work        │
│   ├─ Finance: Travel Per Diem, Approval Limits, Exec Budget │
│   ├─ Support: Warranty Terms, Defect Triage, Escalation     │
│   ├─ Privacy: Cloud Data Sharing, Retention, Breach Notice  │
│   └─ Legal: Vendor Contracts, Whistleblower, WaterSense     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5 Evaluation Scenarios (100% Pass)

| # | Scenario | Query & Role | Expected & Verified Outcome | Status |
|---|---|---|---|:---:|
| **1** | **Single-Domain Grounding** | *"What's my daily travel per diem for domestic trips?"* (`EMPLOYEE`) | Classified as `finance`, returns `$75/day`, cites *Travel Per Diem Policy v2.1 > Domestic Travel*. | 🟢 **PASS** |
| **2** | **Cross-Domain Synthesis** | *"Can we share customer data with a cloud vendor?"* (`LEGAL`) | Synthesizes across `privacy` (DPA & encryption) and `legal` (MSA indemnification) with dual citations. | 🟢 **PASS** |
| **3** | **RBAC Containment** | *"What are executive entertainment budgets?"* (`EMPLOYEE` vs `FINANCE`) | `EMPLOYEE` is blocked (*"Access Restricted"*, 3 docs dropped); `FINANCE` receives full budget schedule ($50k VP / $120k SVP). | 🟢 **PASS** |
| **4** | **Policy Conflict Resolution** | *"What's my leave allowance?"* (`EMPLOYEE`) | Returns **20 days PTO** under active v3.0, records `CONFLICT_DETECTED: policy supersession` replacing legacy v2.0 (15 days). | 🟢 **PASS** |
| **5** | **Multi-Format Output** | *"List all HR policies"* (`ADMIN`) | Generates all 5 output formats: Prose, valid JSON, valid XML, binary 3-sheet Excel spreadsheet (`.xlsx`), and Handlebars Email draft. | 🟢 **PASS** |

---

## Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment (Optional for Groq API)
Create `backend/.env` (if not provided, deterministic offline synthesis runs automatically):
```env
PORT=3001
NODE_ENV=development
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Run the Automated Benchmark Suite
```bash
npm run test:scenarios
```

### 4. Start the Application
In terminal 1 (Backend API on `http://localhost:3001`):
```bash
npm run dev:backend
```

In terminal 2 (Frontend UI on `http://localhost:5173`):
```bash
npm run dev:frontend
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Kohler Bold AI Design Tokens.
- **Backend**: Node.js, Express, TypeScript, gray-matter, Handlebars, SheetJS (`xlsx`), groq-sdk, uuid.
- **Knowledge Base**: 19 YAML frontmatter Markdown documents, section-level chunker (max 500 tokens, 50 overlap).
- **Retrieval Engine**: BM25 inverted index + Semantic vector search + Reciprocal Rank Fusion ($k=60$).

---

## Project Structure

```
Kohra/
├── backend/
│   ├── policies/                  # 19 Markdown policy files (5 domains)
│   ├── src/
│   │   ├── types/index.ts         # Shared TypeScript interfaces
│   │   ├── data/loader.ts         # YAML frontmatter parser & chunker
│   │   ├── services/              # Router, Retriever, RBAC, Conflict, HITL, Answer, Formatter, Audit
│   │   ├── routes/                # POST /api/chat, /api/scenarios, /api/audit
│   │   └── index.ts               # Express bootstrap
│   └── scripts/
│       ├── ingest.ts              # Ingestion & indexer
│       └── test-scenarios.ts      # Automated benchmark runner (100% Pass)
├── frontend/
│   ├── src/
│   │   ├── design-system/         # Kohler Bold button, badge, card, tabs, modal
│   │   ├── components/            # ChatShell, MessageList, SourcePanel, AuditLogViewer, ScenarioLauncher
│   │   ├── hooks/useChat.ts       # React state machine
│   │   └── index.css              # Kohler Bold dark theme styles
├── docs/
│   ├── architecture.md            # Comprehensive architecture documentation
│   ├── decisions.md               # Architecture Decision Records (ADRs)
│   ├── prompts.md                 # System prompts, few-shots, grounding rules
│   ├── deck.md                    # 4-Slide Track 3 Pitch Deck
│   └── demo-script.md             # 1-3 minute video demonstration script
└── package.json
```
