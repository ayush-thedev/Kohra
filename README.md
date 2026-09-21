# KOHRA Enterprise Policy Intelligence Agent

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SheetJS](https://img.shields.io/badge/SheetJS-0D47A1?style=for-the-badge&logo=excel&logoColor=white)](https://sheetjs.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f05032?style=for-the-badge&logoColor=white)](https://groq.com/)

> **Track 3: Unified Enterprise Conversational AI Agent**  
> **Target Track:** Track 3 Enterprise Conversational AI Prototype

---

## Submission Deliverables

| # | Deliverable | Description | Link |
|:---:|---|---|---|
| 1 | **Working Model** | Source code, configuration, instructions, and scripts required to run the Kohra Enterprise Policy Intelligence Agent. | [Prototype](./) |
| 2 | **Video Demonstration** | Video walkthrough demonstrating the working Kohra prototype, its enterprise governance features, and RBAC containment. | [Watch Demo Video](https://drive.google.com/file/d/1VCK0BpEf7yotWk0D7KJLgMpAUZO3zIv5/view?usp=sharing) |
| 3 | **Presentation Deck (PDF)** | Presentation covering the core approach, system architecture, technology stack, and innovation pitch. | [View Presentation Deck](./docs/pdf/deck.pdf) |
| 4 | **Prompts Documentation (PDF)** | Comprehensive documentation containing all AI prompts, system instructions, agent workflows, and prompt engineering strategies. | [View Prompts Documentation](./docs/pdf/KOHRA_Prompts_System_Instructions_Workflows.pdf) |

---

## Executive Overview

The **KOHRA Enterprise Intelligence Agent** is an enterprise-grade conversational AI platform designed to answer complex cross-domain policy questions across **30 enterprise policy repositories** (HR, Finance, Customer Support, Privacy, Legal & Compliance). The agent provides:

1. **Grounded Hybrid Retrieval**: Integrates BM25 keyword search and high-dimensional semantic vector ranking fused via **Reciprocal Rank Fusion (RRF $k=60$)**.
2. **Strict Post-Retrieval RBAC Containment**: Evaluates 6 governance tiers (`EMPLOYEE`, `MANAGER`, `HR`, `FINANCE`, `LEGAL`, `ADMIN`), dropping unauthorized chunks before LLM synthesis and logging `droppedCount` telemetry.
3. **Temporal Conflict & Supersession Detection**: Resolves active policies over legacy versions (e.g., Paid Time Off Policy v3.0 superseding v2.0) and flags cross-domain policy interactions.
4. **Human-in-the-Loop (HITL) Safety Gating**: Flags and escalates high-risk actions (executive compensation, breach notifications, security overrides).
5. **Dynamic Multi-Format Serialization**: Renders the exact same grounded answer across **5 formats** (Prose Markdown, validated JSON, XML, binary Excel `.xlsx` spreadsheets via SheetJS, and Handlebars Email drafts).
6. **Structured Audit Logging**: Real-time event telemetry and millisecond latency breakdowns (`routeMs`, `retrieveMs`, `rbacMs`, `conflictMs`, `answerMs`, `formatMs`, `totalMs`).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   React 19 Frontend (Vite + Tailwind CSS)                                  │
│   ├─ Conversational Stream with Format Toggle                               │
│   ├─ 1-Click Evaluation Scenario Launcher (8 Scenarios)                     │
│   ├─ Interactive Source Citations Drawer                                    │
│   ├─ Real-Time Governance Audit Trail Viewer                                │
│   └─ RBAC Governance Role Switcher                                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (HTTP POST /api/chat)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│   Express Backend (Node.js + TypeScript)                                    │
│   ├─ 1. Session Manager (Multi-turn, last 3 turns)                          │
│   ├─ 2. Domain Router (Local Embeddings + Multi-Domain)                     │
│   ├─ 3. Hybrid Retriever (Semantic + BM25 with RRF)                         │
│   ├─ 4. RBAC Containment Gate (Post-retrieval role filter)                  │
│   ├─ 5. Conflict & Supersession Detector                                    │
│   ├─ 6. HITL Safety & Escalation Gate                                       │
│   ├─ 7. Grounded Answer Generator (Groq Llama 3.3 70B)                      │
│   ├─ 8. Multi-Format Output Formatter                                       │
│   └─ 9. Structured Audit Logger                                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│   Knowledge Base & Data Layer (30 Policy Repositories / 206 Chunks)         │
│   ├─ HR: PTO v2/v3, Severance, Benefits, Remote Work                        │
│   ├─ Finance: Travel Per Diem, Approval Limits, Procurement, Exec Budget    │
│   ├─ Support: Warranty Terms, Defect Triage, Replacement Parts, India D2C   │
│   ├─ Privacy: Cloud Data Sharing, Retention, GDPR, Employee Privacy Notice  │
│   └─ Legal: Supplier Code of Conduct, Impact Report, IP Protection, MSA     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8 Evaluation Scenarios (100% Pass)

| # | Scenario | Query & Role | Expected & Verified Outcome | Status |
|---|---|---|---|:---:|
| **1** | **Single-Domain Grounding** | *"What's my daily travel per diem for domestic trips?"* (`EMPLOYEE`) | Classified as `finance`, returns `$75/day`, cites *Travel Per Diem Policy v2.1 > Domestic Travel*. | 🟢 **PASS** |
| **2** | **Cross-Domain Synthesis** | *"Can we share customer data with a cloud vendor?"* (`LEGAL`) | Synthesizes across `privacy` (DPA & encryption) and `legal` (MSA indemnification) with dual citations. | 🟢 **PASS** |
| **3** | **RBAC Containment** | *"What are executive entertainment budgets?"* (`EMPLOYEE` vs `FINANCE`) | `EMPLOYEE` is blocked (*"Access Restricted"*, 3 docs dropped); `FINANCE` receives full budget schedule. | 🟢 **PASS** |
| **4** | **Policy Conflict Resolution** | *"What's my leave allowance?"* (`EMPLOYEE`) | Returns **20 days PTO** under active v3.0, records `CONFLICT_DETECTED: policy supersession` replacing legacy v2.0 (15 days). | 🟢 **PASS** |
| **5** | **Multi-Format Output** | *"List all HR policies"* (`ADMIN`) | Generates all 5 output formats: Prose, valid JSON, valid XML, binary 3-sheet Excel spreadsheet (`.xlsx`), and Handlebars Email draft. | 🟢 **PASS** |
| **6** | **Customer Support & Warranty Terms** | *"What are the warranty and return terms for India?"* (`EMPLOYEE`) | Grounded against official India D2C Terms of Service and Global Warranty terms. | 🟢 **PASS** |
| **7** | **RBAC Supplier Governance** | *"What is the supplier code of conduct?"* (`EMPLOYEE` vs `LEGAL`) | `EMPLOYEE` is blocked (5 docs dropped); `LEGAL`/`MANAGER` receives full supplier compliance rules. | 🟢 **PASS** |
| **8** | **Employee Privacy Governance** | *"What data is collected under the employee privacy notice?"* (`EMPLOYEE`) | Grounded against official Employee Privacy Notice data collection guidelines. | 🟢 **PASS** |

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

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, gray-matter, Handlebars, SheetJS (`xlsx`), groq-sdk, uuid.
- **Knowledge Base**: 30 YAML frontmatter Markdown documents, section-level chunker (max 380 words, 40 overlap).
- **Retrieval Engine**: BM25 inverted index + Semantic vector search + Reciprocal Rank Fusion ($k=60$).

---

## Project Structure

```
Kohra/
├── backend/
│   ├── policies/                  # 30 Markdown policy files (5 domains)
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
│   │   ├── design-system/         # Custom design system components (button, badge, card, tabs, modal)
│   │   ├── components/            # ChatShell, MessageList, SourcePanel, AuditLogViewer, ScenarioLauncher
│   │   ├── hooks/useChat.ts       # React state machine
│   │   └── index.css              # Custom design system styles
├── docs/
│   ├── architecture.md            # Comprehensive architecture documentation
│   ├── decisions.md               # Architecture Decision Records (ADRs)
│   ├── prompts.md                 # System prompts, few-shots, grounding rules
│   ├── deck.md                    # 4-Slide Track 3 Pitch Deck
│   └── demo-script.md             # 1-3 minute video demonstration script
└── package.json
```

---

## Knowledge Base Inventory: Official vs. Synthetic Policies

The knowledge base consists of **30 active policy repositories** (206 total chunks). The raw source documents are organized into **Official Corporate Documents** (sourced from official corporate disclosures, D2C terms, and compliance PDFs transcribed into structured Markdown) and **Synthetic Enterprise Benchmark Documents** (designed to exercise specific governance edge cases like supersession, multi-tier RBAC containment, and conflict detection).

### 🏛️ Official Corporate Policies (9 Repositories)

These documents are derived directly from official public legal, privacy, sustainability, and D2C terms:

- **Customer Support Domain**:
  - `official-global-terms-and-conditions.md` — *Global Terms & Conditions*
  - `official-india-d2c-terms-of-service.md` — *India D2C User Agreement & Terms of Service*
  - `official-india-terms-explained.md` — *India Terms & Conditions Explained*
- **Legal & Compliance Domain**:
  - `official-global-impact-report.md` — *2024 Global Impact Report (Believing in Better)*
  - `official-supplier-code-of-conduct.md` — *Global Supplier Code of Conduct*
  - `official-supplier-sustainability-policy.md` — *Operations Supplier Sustainability Policy*
- **Privacy Domain**:
  - `official-employee-privacy-notice.md` — *Global Employee Privacy Notice*
  - `official-global-privacy-notice.md` — *Global Website & Customer Privacy Policy*
  - `official-india-website-privacy-policy.md` — *India Privacy & Data Protection Policy*

---

### ⚙️ Synthetic Enterprise Governance Policies (21 Repositories)

These policies were constructed with explicit YAML metadata and schema variations to validate complex RAG pipeline behaviors:

- **HR Domain (5 Repositories)**:
  - `pto-policy-v3.md` — Active Paid Time Off Policy (20 days annual allowance)
  - `pto-policy-v2.md` — Legacy Paid Time Off Policy (15 days annual allowance - *used for temporal supersession testing*)
  - `benefits.md` — Employee Healthcare & Wellness Stipend Program
  - `remote-work.md` — Hybrid & Remote Work Eligibility Guidelines
  - `severance.md` — Executive Restructuring & Separation Formula (*Restricted to HR / ADMIN*)
- **Finance Domain (4 Repositories)**:
  - `travel-per-diem.md` — Domestic & International Per Diem Tier Schedules
  - `approval-thresholds.md` — Financial Delegation of Authority & Approval Matrix
  - `procurement-rules.md` — Competitive Bidding & RFP Directives
  - `executive-entertainment.md` — Executive Hospitality Schedules (*Restricted to FINANCE / ADMIN*)
- **Customer Support Domain (4 Repositories)**:
  - `warranty-terms.md` — Plumbing Fixtures & Electronic Valves Limited Warranty
  - `defect-handling.md` — Tier 1 to Tier 3 Defect Escalation & Triage Matrix
  - `replacement-parts.md` — Genuine Replacement Part Availability Window
  - `escalation-workflow.md` — Customer Support Incident Escalation Matrix
- **Privacy Domain (4 Repositories)**:
  - `cloud-data-sharing.md` — Third-Party Cloud Data Protection Agreement (DPA) Rules
  - `data-retention.md` — Corporate Records Retention & Disposal Schedules
  - `breach-reporting.md` — Security Incident Notification Timelines
  - `gdpr-subject-access.md` — Data Subject Access Request (DSAR) Response Guidelines
- **Legal & Compliance Domain (4 Repositories)**:
  - `vendor-agreements.md` — Master Services Agreement (MSA) Indemnification Requirements
  - `whistleblower-hotline.md` — Anonymous Ethics & Compliance Hotline Guidelines (*Restricted to LEGAL / ADMIN*)
  - `ip-protection.md` — Design Prototype NDA & Intellectual Property Requirements
  - `regulatory-compliance.md` — EPA WaterSense Fixture Compliance Standards
