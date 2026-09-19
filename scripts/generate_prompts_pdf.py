import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#ea3829")) # Kohler Foundations Vermilion
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "KOHRA ENTERPRISE POLICY INTELLIGENCE CORE")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#71717a"))
            self.drawRightString(612 - 54, 750, "AI System Prompts & Workflow Manual")
            self.setStrokeColor(colors.HexColor("#e4e4e7"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
        
        # Footer (all pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717a"))
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — KOHRA ARCHITECTURE & PROMPT SPECIFICATION")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)
        self.setStrokeColor(colors.HexColor("#e4e4e7"))
        self.setLineWidth(0.5)
        self.line(54, 48, 612 - 54, 48)
        
        self.restoreState()

def build_pdf(filename="docs/KOHRA_AI_Prompts_System_Instructions_and_Workflows.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_brand = colors.HexColor("#ea3829")
    c_dark = colors.HexColor("#18181b")
    c_muted = colors.HexColor("#27272a")
    c_subtle = colors.HexColor("#f4f4f5")
    c_border = colors.HexColor("#e4e4e7")
    c_code_bg = colors.HexColor("#18181b")
    c_code_text = colors.HexColor("#f4f4f5")
    c_green = colors.HexColor("#16a34a")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_brand,
        spaceAfter=15
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_dark,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_brand,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=c_code_text,
        backColor=c_code_bg,
        borderPadding=8,
        spaceBefore=6,
        spaceAfter=8,
        borderRadius=2
    )

    story = []

    # Title Banner
    story.append(Paragraph("KOHRA ENTERPRISE POLICY INTELLIGENCE", title_style))
    story.append(Paragraph("Comprehensive Technical Manual: Prompts, System Instructions & Agent Workflows", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_brand, spaceAfter=15))

    # Executive Overview
    story.append(Paragraph("1. System & Architecture Overview", h1_style))
    story.append(Paragraph(
        "The KOHRA Enterprise Policy Intelligence Agent is an enterprise conversational AI platform built to deliver "
        "authoritative, zero-hallucination policy intelligence across 30 enterprise repositories (206 policy chunks). "
        "The solution enforces post-retrieval Role-Based Access Control (RBAC), automatic temporal supersession resolution, "
        "Human-in-the-Loop (HITL) risk gating, multi-format serialization (Prose, JSON, XML, Excel .xlsx, and Email), and real-time millisecond audit logging.",
        body_style
    ))
    
    # System Metadata Table
    meta_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Specification / Tech Stack</b>", body_style)],
        [Paragraph("System Core", body_style), Paragraph("KOHRA Foundations Intelligence Core", body_style)],
        [Paragraph("Target Architecture", body_style), Paragraph("Track 3 Enterprise Conversational AI Agent", body_style)],
        [Paragraph("LLM Engine", body_style), Paragraph("Groq Llama-3.3-70B-Versatile + Local Grounded Synthesizer", body_style)],
        [Paragraph("Retrieval Engine", body_style), Paragraph("BM25 + Semantic Vector Ranking + Reciprocal Rank Fusion (RRF k=60)", body_style)],
        [Paragraph("Knowledge Base", body_style), Paragraph("30 Policy Repositories (9 Official Kohler Docs + 21 Synthetic Governance Repos)", body_style)],
        [Paragraph("RBAC Governance", body_style), Paragraph("6 Roles: EMPLOYEE, MANAGER, HR, FINANCE, LEGAL, ADMIN", body_style)],
        [Paragraph("Multi-Format Formats", body_style), Paragraph("Prose Markdown, JSON, XML, Excel (.xlsx), Handlebars Email", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[140, 364])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_subtle),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # System Prompt Specification
    story.append(Paragraph("2. Primary LLM System Prompt Specification", h1_style))
    story.append(Paragraph(
        "The following prompt is injected as the system instruction into the LLM context. It strictly constrains the agent "
        "to provided policy chunks, mandates citation extraction, enforces temporal conflict awareness, and requires valid JSON schema output.",
        body_style
    ))
    
    sys_prompt_text = (
        "You are the KOHRA Enterprise Intelligence Agent, an authoritative policy assistant.\n"
        "Answer the user's question using ONLY the provided CONTEXT DOCUMENTS.\n\n"
        "RULES:\n"
        "1. Ground every statement in the provided documents. Never speculate or hallucinate.\n"
        "2. If a policy has superseded an older version (e.g. v3.0 replacing v2.0), explicitly state the newer active terms and note the update.\n"
        "3. If documents do not contain the answer, say 'I don't have sufficient information about this in the knowledge base.'\n"
        "4. Extract precise citations matching the documents you used.\n"
        "5. You MUST return ONLY a valid JSON object matching this exact schema without markdown wrapping:\n"
        "{\n"
        '  "answer": "string (clear, professional markdown text)",\n'
        '  "confidence": 0.0 to 1.0,\n'
        '  "grounded": true,\n'
        '  "citations": [\n'
        '    {\n'
        '      "documentTitle": "string",\n'
        '      "section": "string",\n'
        '      "version": "string",\n'
        '      "snippet": "exact brief text snippet from doc",\n'
        '      "filePath": "relative path to markdown file"\n'
        '    }\n'
        '  ]\n'
        "}"
    )
    story.append(Paragraph(sys_prompt_text.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style))

    # User Prompt & Context Assembly Structure
    story.append(Paragraph("3. Context & Prompt Assembly Pipeline", h1_style))
    story.append(Paragraph(
        "Before sending requests to the LLM, the backend orchestrator formats the retrieved context documents, "
        "known policy conflicts/supersessions, conversation history, and user RBAC role into a structured payload:",
        body_style
    ))

    context_assembly_text = (
        "CONTEXT DOCUMENTS:\n"
        '[DOC 1] Title: "Travel Per Diem Policy" | Section: "Domestic Travel" | Version: "2.1" | Domain: "finance" | File: "policies/finance/travel-per-diem.md"\n'
        "Daily limit: $75/day for meals and incidentals (breakfast $15, lunch $25, dinner $35)...\n"
        "---\n"
        '[DOC 2] Title: "Paid Time Off Policy (Active)" | Section: "Annual Allocation" | Version: "3.0" | Domain: "hr" | File: "policies/hr/pto-policy-v3.md"\n'
        "Effective January 1, 2026, Kohler enhanced standard annual leave allocation to 20 days PTO...\n\n"
        "KNOWN POLICY CONFLICTS / SUPERSESSIONS:\n"
        '- [SUPERSEDED] Policy "Paid Time Off Policy (Active)" v3.0 supersedes version 2.0 (effective 2026-01-01).\n\n'
        "CONVERSATION HISTORY:\n"
        "User: Hello, I have a travel question.\n"
        "Assistant: I can assist you with Kohler travel policies.\n\n"
        "USER ROLE: EMPLOYEE\n"
        "USER QUESTION: What's my daily travel per diem for domestic trips?\n\n"
        "RESPONSE (JSON only):"
    )
    story.append(Paragraph(context_assembly_text.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style))

    story.append(PageBreak())

    # Agent Workflows & Specialized Skills
    story.append(Paragraph("4. Specialized Agent Workflows & Operations", h1_style))
    story.append(Paragraph(
        "KOHRA incorporates 11 structured agent workflows designed for end-to-end software development, auditing, and maintenance:",
        body_style
    ))

    workflows_data = [
        [Paragraph("<b>Workflow</b>", body_style), Paragraph("<b>Trigger</b>", body_style), Paragraph("<b>Operational Scope & Responsibilities</b>", body_style)],
        [Paragraph("`/orchestrate`", body_style), Paragraph("Complex multi-step task", body_style), Paragraph("Master agent routing across backend, frontend, security, and design specialists.", body_style)],
        [Paragraph("`/plan`", body_style), Paragraph("Feature planning", body_style), Paragraph("4-phase planning methodology: Analysis, Planning (task-slug.md), Solutioning, Implementation.", body_style)],
        [Paragraph("`/brainstorm`", body_style), Paragraph("New feature / vagueness", body_style), Paragraph("Socratic Discovery Protocol asking minimum 3 strategic clarification/trade-off questions.", body_style)],
        [Paragraph("`/create`", body_style), Paragraph("Build application", body_style), Paragraph("Full-stack creation pipeline coordinating schema, API routes, and Foundations UI components.", body_style)],
        [Paragraph("`/debug`", body_style), Paragraph("Bug or test failure", body_style), Paragraph("4-phase systematic debugging: Root cause investigation, traceback verification, evidence fix.", body_style)],
        [Paragraph("`/test`", body_style), Paragraph("Test execution", body_style), Paragraph("Executes 8-scenario benchmark suite, unit tests, and Playwright web app tests.", body_style)],
        [Paragraph("`/deploy`", body_style), Paragraph("Production release", body_style), Paragraph("5-phase safe deployment: Pre-flight security scan, bundle analysis, zero secrets verification.", body_style)],
        [Paragraph("`/ui-ux-pro-max`", body_style), Paragraph("UI design & review", body_style), Paragraph("Enforces Kohler Foundations DS rules, light H1-H6 scales, zero purple ban, accessibility.", body_style)],
        [Paragraph("`/enhance`", body_style), Paragraph("Performance tune", body_style), Paragraph("Core Web Vitals profiling, bundle reduction, and React component waterfall elimination.", body_style)],
        [Paragraph("`/preview`", body_style), Paragraph("UI inspection", body_style), Paragraph("Generates visual previews and live walkthrough artifacts for UI verification.", body_style)],
        [Paragraph("`/status`", body_style), Paragraph("System check", body_style), Paragraph("Audits workspace status, git state, policy chunk counts, and benchmark pass rates.", body_style)]
    ]
    t_wf = Table(workflows_data, colWidths=[90, 110, 304])
    t_wf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_subtle),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_wf)
    story.append(Spacer(1, 12))

    # 8 Verification Scenarios Detail
    story.append(Paragraph("5. 8 Evaluation Benchmark Scenarios (100% Pass)", h1_style))
    story.append(Paragraph(
        "The automated verification suite (`npx tsx scripts/test-scenarios.ts`) tests all 8 core enterprise governance scenarios:",
        body_style
    ))

    scenarios_data = [
        [Paragraph("<b>#</b>", body_style), Paragraph("<b>Scenario</b>", body_style), Paragraph("<b>Domain & Role</b>", body_style), Paragraph("<b>Target Assertion & Result</b>", body_style)],
        [Paragraph("1", body_style), Paragraph("Single-Domain Grounding", body_style), Paragraph("`finance` / EMPLOYEE", body_style), Paragraph("Extracts $75/day per diem; cites Travel Per Diem Policy v2.1. (PASS)", body_style)],
        [Paragraph("2", body_style), Paragraph("Cross-Domain Synthesis", body_style), Paragraph("`privacy` + `legal` / LEGAL", body_style), Paragraph("Synthesizes DPA encryption + MSA indemnification rules. (PASS)", body_style)],
        [Paragraph("3", body_style), Paragraph("RBAC Containment", body_style), Paragraph("`finance` / EMPLOYEE vs FINANCE", body_style), Paragraph("EMPLOYEE blocked (3 docs dropped); FINANCE receives full budget schedule. (PASS)", body_style)],
        [Paragraph("4", body_style), Paragraph("Policy Conflict Resolution", body_style), Paragraph("`hr` / EMPLOYEE", body_style), Paragraph("Flags active v3.0 (20 days) superseding legacy v2.0 (15 days). (PASS)", body_style)],
        [Paragraph("5", body_style), Paragraph("Multi-Format Output", body_style), Paragraph("`hr` / ADMIN", body_style), Paragraph("Serializes output across Prose, JSON, XML, Excel (.xlsx), and Email. (PASS)", body_style)],
        [Paragraph("6", body_style), Paragraph("Customer Support Terms", body_style), Paragraph("`support` / EMPLOYEE", body_style), Paragraph("Extracts Kohler India D2C Terms & global warranty terms. (PASS)", body_style)],
        [Paragraph("7", body_style), Paragraph("RBAC Supplier Governance", body_style), Paragraph("`legal` / EMPLOYEE vs LEGAL", body_style), Paragraph("EMPLOYEE blocked from Supplier Code of Conduct; LEGAL permitted. (PASS)", body_style)],
        [Paragraph("8", body_style), Paragraph("Employee Privacy Notice", body_style), Paragraph("`privacy` / EMPLOYEE", body_style), Paragraph("Extracts employee data collection rules from official Privacy Notice. (PASS)", body_style)]
    ]
    t_sc = Table(scenarios_data, colWidths=[20, 130, 110, 244])
    t_sc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_subtle),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_sc)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at {filename}")

if __name__ == "__main__":
    build_pdf()
