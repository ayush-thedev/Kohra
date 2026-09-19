import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
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
            self.drawRightString(612 - 54, 750, "Prompts, System Instructions & Workflows Manual")
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

def build_pdf_from_prompts_md(md_path="docs/prompts.md", output_pdf="docs/KOHRA_Prompts_System_Instructions_Workflows.pdf"):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        output_pdf,
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
    c_subtle = colors.HexColor("#f4f4f5")
    c_border = colors.HexColor("#e4e4e7")
    c_code_bg = colors.HexColor("#18181b")
    c_code_text = colors.HexColor("#f4f4f5")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_dark,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_brand,
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=c_brand,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=c_dark,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_dark,
        spaceAfter=5
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=c_code_text,
        backColor=c_code_bg,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6,
        borderRadius=2
    )

    story = []
    
    lines = md_text.split('\n')
    i = 0
    in_code_block = False
    code_accumulator = []
    table_accumulator = []

    def flush_table(rows):
        if not rows:
            return
        parsed_rows = []
        for r in rows:
            cols = [c.strip() for c in r.strip('|').split('|')]
            parsed_rows.append(cols)
        
        # Check if row 1 is delimiter
        if len(parsed_rows) > 1 and '---' in parsed_rows[1][0]:
            parsed_rows.pop(1)
        
        table_data = []
        for row_idx, r in enumerate(parsed_rows):
            formatted_row = []
            for col in r:
                # convert markdown formatting
                cell_text = col.replace('`', '"')
                cell_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', cell_text)
                if row_idx == 0:
                    cell_text = f"<b>{cell_text}</b>"
                formatted_row.append(Paragraph(cell_text, body_style))
            table_data.append(formatted_row)
        
        num_cols = max(len(r) for r in table_data)
        col_width = 504 / num_cols if num_cols > 0 else 504
        
        t = Table(table_data, colWidths=[col_width]*num_cols)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_subtle),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    while i < len(lines):
        line = lines[i]

        # Handle Code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                code_text = '\n'.join(code_accumulator)
                code_text_html = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>').replace(' ', '&nbsp;')
                story.append(Paragraph(code_text_html, code_style))
                code_accumulator = []
                in_code_block = False
            else:
                if table_accumulator:
                    flush_table(table_accumulator)
                    table_accumulator = []
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_accumulator.append(line)
            i += 1
            continue

        # Handle Tables
        if line.strip().startswith('|'):
            table_accumulator.append(line)
            i += 1
            continue
        else:
            if table_accumulator:
                flush_table(table_accumulator)
                table_accumulator = []

        # Handle Headers
        if line.startswith('# '):
            story.append(Paragraph(line[2:].strip(), title_style))
            story.append(Paragraph("Official Technical Specification Document (compiled from docs/prompts.md)", subtitle_style))
            story.append(HRFlowable(width="100%", thickness=2, color=c_brand, spaceAfter=10))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:].strip(), h1_style))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:].strip(), h2_style))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:].strip(), h3_style))
        elif line.strip() == '---':
            story.append(Spacer(1, 4))
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
            text = line.strip()[2:]
            text_fmt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text_fmt = re.sub(r'`(.*?)`', r'font-mono: \1', text_fmt)
            story.append(Paragraph(f"• {text_fmt}", bullet_style))
        elif line.strip():
            text_fmt = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            text_fmt = re.sub(r'`(.*?)`', r'<b>\1</b>', text_fmt)
            story.append(Paragraph(text_fmt, body_style))
        
        i += 1

    if table_accumulator:
        flush_table(table_accumulator)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built from {md_path} -> {output_pdf}")

if __name__ == "__main__":
    build_pdf_from_prompts_md()
