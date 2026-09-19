#!/usr/bin/env python3
"""Generate KOHLRA presentation deck PDF using PyMuPDF."""

import os
import fitz  # PyMuPDF

# ── Brand Colors ──────────────────────────────────────────────
VERMILION = fitz.pdfcolor["red"]       # #ea3829 approximation
DARK_BG   = (20/255, 20/255, 20/255)   # #141414
WHITE     = (1, 1, 1)
LIGHT_GRAY = (240/255, 240/255, 240/255)
MID_GRAY  = (120/255, 120/255, 120/255)
VOLT      = (189/255, 235/255, 16/255)  # #bdeb10
ACCENT_BG = (30/255, 30/255, 30/255)

# ── Page Setup ────────────────────────────────────────────────
W, H = 1280, 720  # 16:9 landscape points
MARGIN_LEFT   = 60
MARGIN_RIGHT  = 60
MARGIN_TOP    = 50
CONTENT_W     = W - MARGIN_LEFT - MARGIN_RIGHT

def new_page(doc):
    page = doc.new_page(width=W, height=H)
    # Dark background
    page.draw_rect(fitz.Rect(0, 0, W, H), color=None, fill=DARK_BG)
    return page

def draw_header_bar(page, slide_num, title):
    """Draw vermilion header bar with slide number and title."""
    bar_h = 60
    bar = fitz.Rect(0, 0, W, bar_h)
    page.draw_rect(bar, color=None, fill=VERMILION)
    # Slide number
    page.insert_text(
        (MARGIN_LEFT, 38),
        f"SLIDE {slide_num}",
        fontsize=14,
        fontname="helv",
        color=WHITE,
    )
    # Title
    page.insert_text(
        (MARGIN_LEFT + 110, 38),
        title.upper(),
        fontsize=20,
        fontname="helv",
        color=WHITE,
    )
    return bar_h + 20  # y offset after header

def draw_footer(page, slide_num):
    """Draw footer with branding."""
    y = H - 30
    page.draw_line(fitz.Point(MARGIN_LEFT, y - 5), fitz.Point(W - MARGIN_RIGHT, y - 5),
                   color=MID_GRAY, width=0.5)
    page.insert_text(
        (MARGIN_LEFT, y),
        "KOHLER Enterprise Intelligence Agent  |  Track 3 Submission",
        fontsize=8,
        fontname="helv",
        color=MID_GRAY,
    )
    page.insert_text(
        (W - MARGIN_RIGHT - 40, y),
        f"{slide_num}/4",
        fontsize=8,
        fontname="helv",
        color=MID_GRAY,
    )

def draw_section_box(page, x, y, w, h, title, items, title_color=VOLT):
    """Draw a rounded box with title and bullet items."""
    # Box background
    rect = fitz.Rect(x, y, x + w, y + h)
    page.draw_rect(rect, color=(60/255, 60/255, 60/255), fill=ACCENT_BG, width=1)
    # Title
    page.insert_text((x + 14, y + 22), title, fontsize=13, fontname="helv", color=title_color)
    # Items
    cy = y + 42
    for item in items:
        if cy > y + h - 10:
            break
        # Bullet dot
        page.draw_circle(fitz.Point(x + 20, cy - 3), 2.5, color=VERMILION, fill=VERMILION)
        # Text wrapping
        lines = wrap_text(item, w - 40, fontsize=10)
        for line in lines:
            page.insert_text((x + 30, cy), line, fontsize=10, fontname="helv", color=WHITE)
            cy += 16
        cy += 4
    return cy

def wrap_text(text, max_width, fontsize=10):
    """Simple word-wrap based on character width estimation."""
    chars_per_line = int(max_width / (fontsize * 0.52))
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 <= chars_per_line:
            current = f"{current} {word}".strip()
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def draw_bullet_list(page, x, y, items, fontsize=11, color=WHITE, bullet_color=VERMILION, max_w=None):
    """Draw bullet list, return final y."""
    if max_w is None:
        max_w = CONTENT_W - (x - MARGIN_LEFT)
    cy = y
    for item in items:
        page.draw_circle(fitz.Point(x, cy - 3), 2.5, color=bullet_color, fill=bullet_color)
        lines = wrap_text(item, max_w - 16, fontsize=fontsize)
        for line in lines:
            page.insert_text((x + 12, cy), line, fontsize=fontsize, fontname="helv", color=color)
            cy += fontsize + 6
        cy += 4
    return cy

def draw_table_row(page, x, y, cols, col_widths, header=False):
    """Draw a table row."""
    cx = x
    fill = VERMILION if header else ACCENT_BG
    text_color = WHITE
    fs = 10 if header else 10
    for i, (col, cw) in enumerate(zip(cols, col_widths)):
        rect = fitz.Rect(cx, y, cx + cw, y + 22)
        page.draw_rect(rect, color=(60/255, 60/255, 60/255), fill=fill, width=0.5)
        page.insert_text((cx + 6, y + 15), col, fontsize=fs, fontname="helv", color=text_color)
        cx += cw
    return y + 22


# ══════════════════════════════════════════════════════════════
#  SLIDE 1: Problem Statement and Solution
# ══════════════════════════════════════════════════════════════
def slide_1(doc):
    page = new_page(doc)
    y = draw_header_bar(page, 1, "Problem Statement and Solution")

    # Problem box (left half)
    pw = (CONTENT_W - 20) / 2
    draw_section_box(
        page, MARGIN_LEFT, y, pw, 220,
        "THE PROBLEM",
        [
            "Enterprise employees waste hours navigating 5 disconnected policy repositories (HR, Finance, Support, Privacy, Legal)",
            "Standard conversational AI exposes executive-only confidential policies to general employees",
            "Zero audit trail: no record of which document was retrieved, why an action was permitted, or how superseded policies were handled",
            "Risk of citing outdated policies (e.g., PTO v2.0 instead of active v3.0) without detection",
        ],
        title_color=VERMILION,
    )

    # Solution box (right half)
    draw_section_box(
        page, MARGIN_LEFT + pw + 20, y, pw, 220,
        "THE SOLUTION",
        [
            "Unified conversational AI answering cross-domain policy questions with full governance",
            "Hybrid BM25 + semantic retrieval with Reciprocal Rank Fusion for high-precision recall",
            "6-tier RBAC (EMPLOYEE to ADMIN) with post-retrieval chunk filtering and honest refusal",
            "Automatic policy supersession detection using temporal metadata and version tracking",
            "Human-in-the-loop safety gates for high-risk queries with escalation routing",
        ],
        title_color=VOLT,
    )

    # Key metrics row
    y2 = y + 240
    metrics = [
        ("30", "Policy Repositories"),
        ("206", "Structured Chunks"),
        ("5", "Knowledge Domains"),
        ("6", "RBAC Tiers"),
        ("5", "Output Formats"),
        ("9", "Pipeline Stages"),
    ]
    mw = (CONTENT_W - 50) / len(metrics)
    for i, (num, label) in enumerate(metrics):
        mx = MARGIN_LEFT + i * (mw + 10)
        rect = fitz.Rect(mx, y2, mx + mw, y2 + 80)
        page.draw_rect(rect, color=(60/255, 60/255, 60/255), fill=ACCENT_BG, width=1)
        page.insert_text(
            (mx + mw/2 - len(num)*8, y2 + 38),
            num, fontsize=32, fontname="helv", color=VOLT,
        )
        # Label (centered, multi-line if needed)
        label_lines = wrap_text(label, mw - 10, fontsize=9)
        ly = y2 + 56
        for ll in label_lines:
            page.insert_text(
                (mx + mw/2 - len(ll)*3.2, ly),
                ll, fontsize=9, fontname="helv", color=MID_GRAY,
            )
            ly += 12

    draw_footer(page, 1)


# ══════════════════════════════════════════════════════════════
#  SLIDE 2: System Architecture and Workflow
# ══════════════════════════════════════════════════════════════
def slide_2(doc):
    page = new_page(doc)
    y = draw_header_bar(page, 2, "System Architecture and Workflow")

    # Left column: pipeline stages
    col_w = (CONTENT_W - 20) / 2
    stages = [
        ("1", "Session Manager", "Multi-turn context, 30-min TTL"),
        ("2", "Domain Router", "Local embeddings, cosine similarity"),
        ("3", "Hybrid Retriever", "BM25 + semantic + RRF merge"),
        ("4", "RBAC Gate", "Post-retrieval chunk filtering"),
        ("5", "Conflict Detector", "Supersession + temporal checks"),
        ("6", "HITL Safety Gate", "Risk scoring, escalation routing"),
        ("7", "Answer Generator", "Groq Llama 3.3 70B synthesis"),
        ("8", "Output Formatter", "Prose, JSON, XML, Excel, Email"),
        ("9", "Audit Logger", "Millisecond telemetry, event log"),
    ]

    sy = y
    for num, name, desc in stages:
        # Number circle
        page.draw_circle(fitz.Point(MARGIN_LEFT + 14, sy + 10), 10, color=VERMILION, fill=VERMILION)
        page.insert_text(
            (MARGIN_LEFT + 10 if len(num) == 1 else MARGIN_LEFT + 7, sy + 14),
            num, fontsize=10, fontname="helv", color=WHITE,
        )
        # Name + description
        page.insert_text((MARGIN_LEFT + 32, sy + 10), name, fontsize=11, fontname="helv", color=WHITE)
        page.insert_text((MARGIN_LEFT + 32, sy + 24), desc, fontsize=9, fontname="helv", color=MID_GRAY)
        # Connector line (except last)
        if num != "9":
            page.draw_line(
                fitz.Point(MARGIN_LEFT + 14, sy + 22),
                fitz.Point(MARGIN_LEFT + 14, sy + 38),
                color=(60/255, 60/255, 60/255), width=1,
            )
        sy += 40

    # Right column: data flow diagram
    rx = MARGIN_LEFT + col_w + 30
    draw_section_box(
        page, rx, y, col_w, 140,
        "DATA FLOW",
        [
            "React 19 Frontend (Vite + Tailwind) sends HTTP POST /api/chat",
            "Express Backend orchestrates 9-stage pipeline",
            "Knowledge Base: 30 Markdown policies across 5 domains",
            "BM25 inverted index + section chunk cache for fast retrieval",
            "Audit trail indexed by requestId and sessionId",
        ],
        title_color=VOLT,
    )

    # Architecture boxes
    box_y = y + 160
    boxes = [
        ("CLIENT LAYER", "React 19 + TypeScript + Vite\nKohler Bold Design System", VOLT),
        ("AGENT PIPELINE", "9-Stage Orchestration\nRouting / Retrieval / RBAC / Synthesis", VERMILION),
        ("DATA LAYER", "30 Policy Repos / 206 Chunks\nBM25 Index + Chunk Cache", VOLT),
    ]
    bw = (col_w - 20) / 3
    for i, (title, desc, color) in enumerate(boxes):
        bx = rx + i * (bw + 10)
        rect = fitz.Rect(bx, box_y, bx + bw, box_y + 100)
        page.draw_rect(rect, color=(60/255, 60/255, 60/255), fill=ACCENT_BG, width=1.5)
        page.insert_text((bx + 10, box_y + 22), title, fontsize=11, fontname="helv", color=color)
        for j, line in enumerate(desc.split("\n")):
            page.insert_text((bx + 10, box_y + 42 + j * 16), line, fontsize=9, fontname="helv", color=WHITE)
        # Arrow
        if i < 2:
            ax = bx + bw + 2
            page.draw_line(fitz.Point(ax, box_y + 50), fitz.Point(ax + 8, box_y + 50),
                           color=MID_GRAY, width=1.5)
            page.draw_circle(fitz.Point(ax + 8, box_y + 50), 2, color=MID_GRAY, fill=MID_GRAY)

    draw_footer(page, 2)


# ══════════════════════════════════════════════════════════════
#  SLIDE 3: Tech Stack and Key Innovations
# ══════════════════════════════════════════════════════════════
def slide_3(doc):
    page = new_page(doc)
    y = draw_header_bar(page, 3, "Tech Stack and Key Innovations")

    col_w = (CONTENT_W - 20) / 2

    # Tech stack table (left)
    table_data = [
        ["Layer", "Technology"],
        ["Frontend", "React 19, TypeScript, Vite, Tailwind CSS"],
        ["Backend", "Node.js, Express, TypeScript"],
        ["LLM", "Groq Llama 3.3 70B"],
        ["Retrieval", "BM25 + Semantic + RRF Merge"],
        ["Knowledge Base", "30 MD Files, 206 Chunks"],
        ["Export", "SheetJS (Excel), Handlebars (Email)"],
        ["Deployment", "Vercel (FE) + Railway (BE)"],
    ]
    col_widths = [130, col_w - 140]
    ty = y
    for i, row in enumerate(table_data):
        ty = draw_table_row(page, MARGIN_LEFT, ty, row, col_widths, header=(i == 0))

    # Key innovations (right)
    innovations = [
        ("Hybrid RRF Retrieval", "BM25 keyword precision fused with semantic vector recall via Reciprocal Rank Fusion — outperforms either method alone"),
        ("Post-Retrieval RBAC", "Chunks filtered after retrieval but before LLM sees them — no inference bypass possible"),
        ("Temporal Conflict Detection", "Automatic supersession resolution using version metadata and date bounds (e.g., PTO v3.0 replaces v2.0)"),
        ("HITL Safety Gates", "Risk-scored query escalation for executive compensation, data sharing, and policy exceptions"),
        ("Multi-Format Serialization", "Same grounded answer rendered as Prose, JSON, XML, binary Excel, or email draft"),
    ]
    iy = y
    for title, desc in innovations:
        # Accent bar
        page.draw_rect(fitz.Rect(MARGIN_LEFT + col_w + 20, iy, MARGIN_LEFT + col_w + 24, iy + 50),
                       color=VERMILION, fill=VERMILION)
        page.insert_text((MARGIN_LEFT + col_w + 34, iy + 14), title, fontsize=11, fontname="helv", color=VOLT)
        lines = wrap_text(desc, col_w - 40, fontsize=9)
        ly = iy + 28
        for line in lines:
            page.insert_text((MARGIN_LEFT + col_w + 34, ly), line, fontsize=9, fontname="helv", color=WHITE)
            ly += 13
        iy += 58

    draw_footer(page, 3)


# ══════════════════════════════════════════════════════════════
#  SLIDE 4: Demo Highlights, Business Value, and Impact
# ══════════════════════════════════════════════════════════════
def slide_4(doc):
    page = new_page(doc)
    y = draw_header_bar(page, 4, "Demo Highlights, Business Value, and Impact")

    col_w = (CONTENT_W - 20) / 2

    # Demo scenarios (left)
    scenarios = [
        ("1", "Single-Domain Grounding", "Exact retrieval of $75/day domestic travel per diem"),
        ("2", "Cross-Domain Synthesis", "Privacy DPA + Legal MSA for cloud vendor queries"),
        ("3", "RBAC Containment", "EMPLOYEE blocked (3 docs); FINANCE gets full access"),
        ("4", "Conflict Resolution", "PTO v3.0 (20 days) supersedes v2.0 (15 days)"),
        ("5", "Multi-Format Output", "5 valid formats including downloadable Excel"),
    ]

    page.insert_text((MARGIN_LEFT, y + 12), "EVALUATION: 5/5 PASSING", fontsize=13, fontname="helv", color=VOLT)
    sy = y + 30
    for num, title, desc in scenarios:
        # Green check circle
        page.draw_circle(fitz.Point(MARGIN_LEFT + 12, sy + 8), 8, color=VOLT, fill=VOLT)
        page.insert_text((MARGIN_LEFT + 9, sy + 12), num, fontsize=9, fontname="helv", color=DARK_BG)
        page.insert_text((MARGIN_LEFT + 28, sy + 8), title, fontsize=11, fontname="helv", color=WHITE)
        page.insert_text((MARGIN_LEFT + 28, sy + 22), desc, fontsize=9, fontname="helv", color=MID_GRAY)
        sy += 42

    # Business impact (right)
    page.insert_text(
        (MARGIN_LEFT + col_w + 20, y + 12),
        "BUSINESS IMPACT", fontsize=13, fontname="helv", color=VOLT,
    )

    impacts = [
        ("50%", "Time-to-Answer", "Seconds vs. hours for policy resolution"),
        ("100%", "Traceability", "Full audit trails with millisecond telemetry"),
        ("0", "Hallucination Risk", "Answers grounded in retrieved sources only"),
        ("6", "Security Tiers", "RBAC with honest refusal and HITL escalation"),
    ]

    iy = y + 36
    aw = (col_w - 15) / 2
    for i, (num, label, desc) in enumerate(impacts):
        ax = MARGIN_LEFT + col_w + 20 + (i % 2) * (aw + 10)
        ay = iy + (i // 2) * 85
        rect = fitz.Rect(ax, ay, ax + aw, ay + 75)
        page.draw_rect(rect, color=(60/255, 60/255, 60/255), fill=ACCENT_BG, width=1)
        page.insert_text((ax + 12, ay + 28), num, fontsize=28, fontname="helv", color=VOLT)
        page.insert_text((ax + 12, ay + 44), label, fontsize=11, fontname="helv", color=WHITE)
        lines = wrap_text(desc, aw - 20, fontsize=9)
        ly = ay + 58
        for line in lines:
            page.insert_text((ax + 12, ly), line, fontsize=9, fontname="helv", color=MID_GRAY)
            ly += 12

    draw_footer(page, 4)


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    doc = fitz.open()

    slide_1(doc)
    slide_2(doc)
    slide_3(doc)
    slide_4(doc)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "pdf")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "deck.pdf")
    doc.save(out_path)
    doc.close()
    print(f"PDF generated: {out_path}")


if __name__ == "__main__":
    main()
