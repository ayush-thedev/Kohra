# KOHLER Enterprise Intelligence Agent — Live Demonstration Script
**Duration:** 2.5 to 3 Minutes  
**Target Audience:** Hackathon Judges, Enterprise Stakeholders, Technical Leadership  
**Goal:** Prove grounded policy retrieval, strict RBAC governance, supersession conflict detection, multi-format export, and Kohler Bold design alignment.

---

## 🎬 Pre-Flight Checklist
1. **Backend Server**: Running on `http://localhost:3001` (`npm run dev:backend` from root).
2. **Frontend App**: Running on `http://localhost:5173` (`npm run dev:frontend` from root).
3. **Browser**: Open `http://localhost:5173` in full screen dark mode.
4. **Network**: Offline-ready (deterministic fallback enabled) or online with Groq API key.

---

## ⏱️ Act 1: Introduction & Kohler Bold Interface (0:00 – 0:45)

### 🖥️ Screen Action:
Show the main application header and home state. Point out the Kohler Bold branding (Volt `#bdeb10` accents, dark charcoal `#141414` background, role switcher, and quick scenario prompt chips).

### 🎙️ Speaker Script:
> "Welcome everyone. Today I'm presenting the **KOHLER Enterprise Intelligence Agent**—a unified enterprise conversational intelligence platform designed to eliminate policy silos across HR, Finance, Support, Privacy, and Legal.
>
> Built entirely in accordance with the **Kohler Bold AI-Ready Design System**, the interface uses Kohler's signature Volt neon accents, architectural geometry, and high-contrast dark surfaces.
>
> Notice in the top navigation bar: we have an instant **Role-Based Access Control (RBAC)** selector with six discrete privilege tiers, from standard `EMPLOYEE` up to `EXECUTIVE` and `ADMIN`, alongside an interactive **Scenario Benchmark Launcher**."

---

## ⏱️ Act 2: Zero-Leakage RBAC Containment (0:45 – 1:30)

### 🖥️ Screen Action:
1. Ensure the active role in the top selector is set to **`EMPLOYEE`**.
2. In the chat input or prompt cards, select / type:
   `"What is our budget for executive dinner entertainment at client events?"`
3. Hit **Send** (or Enter).
4. Show the polite refusal response and click the **"🔒 3 restricted sources hidden"** or **"Sources"** button to inspect the dropped document telemetry.
5. Now switch the role selector to **`FINANCE`** and resend the identical prompt.
6. Show the authorized response detailing the exact $250/person limit and approval thresholds.

### 🎙️ Speaker Script:
> "Let's demonstrate our dual-layer security model in action. 
> 
> As a standard **`EMPLOYEE`**, I ask about confidential executive entertainment budgets. The hybrid BM25 and Semantic retriever pulls the policy chunks, but our **Post-Retrieval RBAC Gate** immediately intercepts them. 3 confidential documents are dropped, and the agent delivers a clean, honest refusal without hallucinating or leaking numbers.
>
> Now watch what happens when I switch my role to **`FINANCE`** and submit the exact same question. The RBAC filter verifies permission, admits the documents, and immediately synthesizes the exact policy schedule: $250 per person, Director pre-approval required for groups over six, and all receipts retained for 7 years."

---

## ⏱️ Act 3: Conflict Detection & Multi-Format Synthesis (1:30 – 2:15)

### 🖥️ Screen Action:
1. Switch the output format tab in the bottom bar from `PROSE` to **`EXCEL (.XLSX)`** or **`EMAIL`**.
2. In the chat input, ask:
   `"What is our current annual PTO leave allowance?"`
3. Highlight the **"Policy Conflict / Supersession Detected"** badge in the message bubble.
4. Point out that the agent cites **PTO Policy v3.0 (20 days)** while explicitly flagging that v2.0 (15 days) has been superseded.
5. If in Excel mode, click **"Download Excel Spreadsheet"** to demonstrate automatic multi-sheet binary generation.

### 🎙️ Speaker Script:
> "Enterprise policies change constantly. Here, our **Temporal Conflict Detector** compares active timestamps and versions between HR PTO Policy v2.0 and v3.0.
>
> Rather than averaging the numbers or hallucinating, the agent pinpoints that v3.0 (effective January 2026) supersedes v2.0, providing the accurate 20-day figure and annotating the supersession for full legal compliance.
>
> Furthermore, users aren't limited to plain text. With one click, the response is dynamically converted into structured JSON, XML, a pre-formatted Handlebars email draft, or a multi-sheet binary Excel workbook."

---

## ⏱️ Act 4: Live 5/5 Benchmark Suite & Millisecond Audit Trail (2:15 – 3:00)

### 🖥️ Screen Action:
1. Click the **"Scenario Tests"** button in the header to open the Benchmark Launcher modal.
2. Click **"Run All Scenarios"** button.
3. Watch the animated progress run through all 5 PRD benchmark scenarios with live millisecond timing and green `PASS` badges.
4. Close the modal and click **"View Audit Trail"** on the latest message to show the 9-stage telemetry timeline (`routeMs`, `retrieveMs`, `rbacMs`, `answerMs`).

### 🎙️ Speaker Script:
> "Finally, to guarantee enterprise reliability, we built an automated verification harness directly into the application.
> 
> Clicking **'Run All Scenarios'** triggers our automated test suite across all 5 PRD evaluation vectors:
> 1. Single-Domain Grounding ($75/day Travel Per Diem)
> 2. Cross-Domain Synthesis (Privacy DPA + Legal MSA)
> 3. Strict RBAC Containment
> 4. Temporal Supersession Conflict Resolution
> 5. Multi-Format Binary & Template Generation
>
> Every single transaction records a cryptographic audit log with millisecond timing across all 9 pipeline stages.
>
> The Kohler Enterprise Intelligence Agent combines Kohler design sophistication with zero-hallucination governance. Thank you!"

---

## 📊 Summary of Demo Commands & Quick Inputs

| Scenario | Input Query | Active Role | Expected Key Result |
|---|---|---|---|
| **1. Grounding** | `"What is our travel per diem for domestic meals?"` | `EMPLOYEE` | $75/day ($15/$25/$35 breakdown) |
| **2. Cross-Domain** | `"Can we share customer analytics data with a new cloud vendor?"` | `MANAGER` | DPA required (Privacy) + MSA indemnification (Legal) |
| **3. RBAC Block** | `"What is our budget for executive dinner entertainment at client events?"` | `EMPLOYEE` | Access Restricted (3 docs dropped) |
| **3. RBAC Allow** | `"What is our budget for executive dinner entertainment at client events?"` | `FINANCE` | $250/person limit, Director approval required |
| **4. Conflict** | `"What is our current annual PTO leave allowance?"` | `EMPLOYEE` | 20 days (v3.0 supersedes v2.0's 15 days) |
| **5. Multi-Format** | `"List all active HR policies"` (Format: Excel) | `HR` | Generates 3-sheet `.xlsx` download |
