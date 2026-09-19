import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { PolicyChunk, PolicyMetadata, RBACRole, DomainType } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function approximateTokenCount(text: string): number {
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
}

function chunkContent(
  fullContent: string,
  meta: PolicyMetadata,
  fileSlug: string
): PolicyChunk[] {
  const chunks: PolicyChunk[] = [];
  const lines = fullContent.split("\n");
  
  let currentSection = "General";
  let sectionLines: string[] = [];
  let chunkIdx = 1;

  const flushSection = (sectionName: string, linesToFlush: string[]) => {
    const rawText = linesToFlush.join("\n").trim();
    if (!rawText) return;

    const words = rawText.split(/\s+/);
    const maxWords = 380; // ~500 tokens
    const overlapWords = 40; // ~50 tokens

    if (words.length <= maxWords) {
      chunks.push({
        id: `${meta.domain}_${fileSlug}_${String(chunkIdx++).padStart(3, "0")}`,
        domain: meta.domain,
        title: meta.title,
        section: sectionName,
        content: rawText,
        keywords: meta.keywords || [],
        version: meta.version || "1.0",
        validFrom: meta.validFrom || "2026-01-01",
        validUntil: meta.validUntil,
        supersedes: meta.supersedes,
        rbacTiers: meta.rbacTiers || ["EMPLOYEE", "MANAGER", "HR", "FINANCE", "LEGAL", "ADMIN"],
        conflictsWith: meta.conflictsWith || [],
        filePath: meta.filePath
      });
    } else {
      // Split large section with overlap
      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + maxWords, words.length);
        const subWords = words.slice(start, end);
        const chunkText = subWords.join(" ");

        chunks.push({
          id: `${meta.domain}_${fileSlug}_${String(chunkIdx++).padStart(3, "0")}`,
          domain: meta.domain,
          title: meta.title,
          section: sectionName,
          content: chunkText,
          keywords: meta.keywords || [],
          version: meta.version || "1.0",
          validFrom: meta.validFrom || "2026-01-01",
          validUntil: meta.validUntil,
          supersedes: meta.supersedes,
          rbacTiers: meta.rbacTiers || ["EMPLOYEE", "MANAGER", "HR", "FINANCE", "LEGAL", "ADMIN"],
          conflictsWith: meta.conflictsWith || [],
          filePath: meta.filePath
        });

        if (end === words.length) break;
        start += maxWords - overlapWords;
      }
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (sectionLines.length > 0) {
        flushSection(currentSection, sectionLines);
        sectionLines = [];
      }
      currentSection = line.replace(/^##\s+/, "").trim();
    } else {
      sectionLines.push(line);
    }
  }

  if (sectionLines.length > 0) {
    flushSection(currentSection, sectionLines);
  }

  return chunks;
}

let cachedChunks: PolicyChunk[] | null = null;

export function loadAllPolicies(policiesDir?: string): PolicyChunk[] {
  if (cachedChunks) {
    return cachedChunks;
  }

  const resolvedDir =
    policiesDir ||
    path.resolve(process.cwd(), "policies") ||
    path.resolve(process.cwd(), "backend/policies");

  const fallbackDir = fs.existsSync(resolvedDir)
    ? resolvedDir
    : path.resolve(__dirname, "../../policies");

  const dirToUse = fs.existsSync(resolvedDir) ? resolvedDir : fallbackDir;

  if (!fs.existsSync(dirToUse)) {
    console.warn(`[Loader] Policies directory not found at: ${dirToUse}`);
    return [];
  }

  const allChunks: PolicyChunk[] = [];
  const domains = fs.readdirSync(dirToUse);

  for (const domain of domains) {
    // Skip non-domain folders
    if (domain === "0_official_policies") continue;

    const domainPath = path.join(dirToUse, domain);
    if (!fs.statSync(domainPath).isDirectory()) continue;

    const files = fs.readdirSync(domainPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const fullFilePath = path.join(domainPath, file);
      const fileContent = fs.readFileSync(fullFilePath, "utf-8");
      const { data, content } = matter(fileContent);

      const fileSlug = file.replace(/\.md$/, "");
      const relFilePath = `policies/${domain}/${file}`;

      const meta: PolicyMetadata = {
        title: data.title || fileSlug,
        domain: (data.domain?.toLowerCase() as DomainType) || (domain as DomainType),
        version: String(data.version || "1.0"),
        validFrom: String(data.validFrom || "2026-01-01"),
        validUntil: data.validUntil ? String(data.validUntil) : undefined,
        supersedes: data.supersedes ? String(data.supersedes) : undefined,
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        rbacTiers: Array.isArray(data.rbacTiers)
          ? (data.rbacTiers as RBACRole[])
          : ["EMPLOYEE", "MANAGER", "HR", "FINANCE", "LEGAL", "ADMIN"],
        conflictsWith: Array.isArray(data.conflictsWith) ? data.conflictsWith : [],
        filePath: relFilePath
      };

      const chunks = chunkContent(content, meta, fileSlug);
      allChunks.push(...chunks);
    }
  }

  console.log(`[Loader] Loaded ${allChunks.length} policy chunks from ${dirToUse}`);
  cachedChunks = allChunks;
  return allChunks;
}

export function invalidatePolicyCache(): void {
  cachedChunks = null;
}
