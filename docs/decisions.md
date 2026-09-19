# Architecture Decision Records (ADRs)

## ADR-001: Post-Retrieval vs Pre-Retrieval RBAC Filtering

### Context
Enterprise policy search requires enforcing role-based access control (RBAC). Filtering can occur before candidate retrieval (pre-filtering index) or after candidate retrieval (post-retrieval drop).

### Decision
We implemented **Post-Retrieval RBAC Filtering** with audit dropped count telemetry.

### Rationale
1. **Audit Visibility**: Post-retrieval filtering enables logging exactly how many restricted documents were attempted vs dropped (e.g. `RBAC_FILTERED: 3 documents dropped for EMPLOYEE role`).
2. **Honest Refusal**: If a user asks about executive compensation and relevant documents are retrieved but dropped, the system can explain *why* access was denied ("Requires FINANCE or ADMIN role") rather than returning a confusing "Document not found" message.
3. **Zero Inference Leak**: Only chunks that pass the RBAC filter are assembled into the LLM context prompt.

---

## ADR-002: Reciprocal Rank Fusion (RRF) for Hybrid Retrieval

### Context
Hybrid search needs to merge rankings from keyword matching (BM25) and semantic vector search.

### Decision
We adopted **Reciprocal Rank Fusion (RRF)** with standard constant $k=60$.
$$RRF(d) = \sum_{m \in \{semantic, bm25\}} \frac{1}{60 + rank_m(d)}$$

### Rationale
1. **Score Invariant**: BM25 scores (unbounded positive floats) and cosine similarities ($[0, 1]$) have different distributions. Score normalization often leads to bias toward one retriever.
2. **Robustness**: RRF ranks documents solely based on relative positions, ensuring consistent high performance across technical part numbers (where BM25 excels) and conceptual questions (where semantic search excels).

---

## ADR-003: Multi-Domain Intent Routing

### Context
A user query can involve multiple policy repositories simultaneously (e.g., Scenario 2: *"Can we share customer data with a cloud vendor?"* requires both Privacy DPA rules and Legal MSA indemnities).

### Decision
The Domain Router returns an array of `allDomains[]` when multiple domains score above the 0.45 threshold, and the Retriever fetches candidates across all qualified domains.

### Rationale
Prevents domain siloing and guarantees that cross-cutting compliance answers are complete and grounded in both legal and privacy source documents.

---

## ADR-004: Kohler Bold Design System Integration

### Context
The user interface needs to represent Kohler's enterprise design standards for AI tools.

### Decision
We adopted the **Kohler Bold AI-Ready Design System** tokens (Kohler Volt `#bdeb10`, Deep Charcoal `#141414`, `#1d1d1d`, `#383838`, uppercase 48px buttons, architectural corner cubes).

### Rationale
Ensures 1:1 parity with Kohler's design tokens and provides high-contrast, accessible, enterprise-grade UX.
