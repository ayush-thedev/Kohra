import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { Citation, FormatType, RBACRole, DomainType } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FormatContext {
  query: string;
  answer: string;
  citations: Citation[];
  rbacRole: RBACRole;
  domain: DomainType;
  requestId: string;
  confidence: number;
  grounded: boolean;
}

interface FormatterResult {
  formattedContent: string;
  fileUrl?: string;
  filename?: string;
  mimeType?: string;
  buffer?: Buffer;
}

const exportDir = path.resolve(process.cwd(), "exports");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

export function formatOutput(
  format: FormatType,
  ctx: FormatContext
): FormatterResult {
  const { query, answer, citations, rbacRole, domain, requestId, confidence, grounded } = ctx;

  switch (format) {
    case "json": {
      const jsonObj = {
        requestId,
        query,
        answer,
        domain,
        confidence,
        grounded,
        rbacRole,
        citations,
        timestamp: new Date().toISOString()
      };
      return {
        formattedContent: JSON.stringify(jsonObj, null, 2),
        mimeType: "application/json"
      };
    }

    case "xml": {
      const escapeXml = (unsafe: string) =>
        unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const citationsXml = citations
        .map(
          (c) => `    <citation>
      <documentTitle>${escapeXml(c.documentTitle)}</documentTitle>
      <section>${escapeXml(c.section)}</section>
      <version>${escapeXml(c.version)}</version>
      <snippet>${escapeXml(c.snippet)}</snippet>
    </citation>`
        )
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<kohlerResponse>
  <requestId>${escapeXml(requestId)}</requestId>
  <timestamp>${new Date().toISOString()}</timestamp>
  <query>${escapeXml(query)}</query>
  <domain>${escapeXml(domain)}</domain>
  <rbacRole>${escapeXml(rbacRole)}</rbacRole>
  <confidence>${confidence}</confidence>
  <grounded>${grounded}</grounded>
  <answer>${escapeXml(answer)}</answer>
  <citations>
${citationsXml}
  </citations>
</kohlerResponse>`;

      return {
        formattedContent: xml,
        mimeType: "application/xml"
      };
    }

    case "xlsx": {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ["Field", "Value"],
        ["Request ID", requestId],
        ["Timestamp", new Date().toISOString()],
        ["User Query", query],
        ["Domain", domain.toUpperCase()],
        ["RBAC Role", rbacRole],
        ["Confidence Score", `${(confidence * 100).toFixed(1)}%`],
        ["Grounded in Sources", grounded ? "TRUE" : "FALSE"],
        ["", ""],
        ["Synthesized Answer", answer]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Sheet 2: Citations Table
      const citationRows = citations.map((c, i) => ({
        "Citation #": i + 1,
        "Policy Document": c.documentTitle,
        "Section": c.section,
        "Version": c.version,
        "Excerpt / Snippet": c.snippet
      }));
      const wsCitations = XLSX.utils.json_to_sheet(
        citationRows.length > 0
          ? citationRows
          : [{ "Citation #": 1, "Policy Document": "N/A", "Section": "", "Version": "", "Excerpt / Snippet": "No direct citations" }]
      );
      XLSX.utils.book_append_sheet(wb, wsCitations, "Source Citations");

      // Sheet 3: Governance Metadata
      const metaData = [
        ["Parameter", "Setting"],
        ["Organization", "Kohler Co."],
        ["System", "KOHLER Enterprise Intelligence Agent"],
        ["Data Classification", "Confidential / Internal"],
        ["Export Format", "OpenXML Spreadsheet (.xlsx)"]
      ];
      const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
      XLSX.utils.book_append_sheet(wb, wsMeta, "Governance Metadata");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
      const fileId = `export_${Date.now()}_${uuidv4().substring(0, 6)}`;
      const filename = `kohler_policy_report_${fileId}.xlsx`;
      const filePath = path.join(exportDir, filename);

      fs.writeFileSync(filePath, buffer);

      return {
        formattedContent: `[Excel Report Generated: ${filename}] (Summary, Source Citations, Governance Metadata sheets created)`,
        fileUrl: `/api/chat/export/${filename}`,
        filename,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer
      };
    }

    case "email": {
      const templatePath = path.resolve(__dirname, "../templates/email.hbs");
      const fallbackTemplatePath = path.resolve(process.cwd(), "src/templates/email.hbs");
      const resolvedPath = fs.existsSync(templatePath) ? templatePath : fallbackTemplatePath;

      let emailBody = "";
      if (fs.existsSync(resolvedPath)) {
        const source = fs.readFileSync(resolvedPath, "utf-8");
        const compiled = Handlebars.compile(source);
        emailBody = compiled({
          recipientEmail: getEmailForRole(rbacRole),
          subject: generateSubject(query),
          timestamp: new Date().toUTCString(),
          query,
          answer,
          citations,
          rbacRole,
          domain: domain.toUpperCase(),
          requestId
        });
      } else {
        emailBody = `To: ${getEmailForRole(rbacRole)}
Subject: Re: ${generateSubject(query)}
Cc: compliance-team@kohler.com

${answer}

Sources:
${citations.map((c) => `- ${c.documentTitle} > ${c.section} (v${c.version})`).join("\n")}

--
KOHLER Enterprise Intelligence Agent`;
      }

      return {
        formattedContent: emailBody,
        mimeType: "text/plain"
      };
    }

    case "prose":
    default: {
      let content = answer;
      if (citations.length > 0) {
        content += `\n\n**Sources & Policy References:**\n` +
          citations.map((c) => `- *${c.documentTitle}* — Section: **${c.section}** (v${c.version})`).join("\n");
      }
      return {
        formattedContent: content,
        mimeType: "text/markdown"
      };
    }
  }
}

function getEmailForRole(role: RBACRole): string {
  switch (role) {
    case "FINANCE":
      return "finance-approvals@kohler.com";
    case "HR":
      return "people-support@kohler.com";
    case "LEGAL":
      return "compliance-legal@kohler.com";
    case "MANAGER":
      return "leadership-desk@kohler.com";
    case "ADMIN":
      return "enterprise-admin@kohler.com";
    case "EMPLOYEE":
    default:
      return "employee-inquiry@kohler.com";
  }
}

function generateSubject(query: string): string {
  const clean = query.replace(/[^\w\s]/g, "").trim();
  const words = clean.split(/\s+/).slice(0, 7).join(" ");
  return words ? `Kohler Policy Inquiry: ${words}` : "Kohler Enterprise Policy Guidance";
}
