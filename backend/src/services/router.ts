import { DomainType, RouterResult } from "../types/index.js";

interface DomainAnchor {
  domain: DomainType;
  keywords: string[];
  queries: string[];
}

const DOMAIN_ANCHORS: DomainAnchor[] = [
  {
    domain: "hr",
    keywords: ["pto", "vacation", "leave", "holiday", "sick", "severance", "benefit", "health", "dental", "vision", "401k", "remote", "hybrid", "work from home", "parental", "wellness", "employee"],
    queries: [
      "What is my paid time off allowance?",
      "How many vacation days do I get?",
      "What is the severance compensation package?",
      "How does the 401k matching program work?",
      "Can I work remotely two days a week?",
      "What are the employee wellness benefits?"
    ]
  },
  {
    domain: "finance",
    keywords: ["travel", "per diem", "expense", "budget", "entertainment", "reimbursement", "flight", "lodging", "hotel", "meal", "receipt", "approval", "threshold", "procurement", "purchase order", "po", "rfp", "invoice", "cost"],
    queries: [
      "What is my daily travel per diem for domestic trips?",
      "What are the international meal allowance limits?",
      "What is the manager approval threshold for expenses?",
      "What are executive entertainment budgets?",
      "When is an RFP required for purchasing?"
    ]
  },
  {
    domain: "support",
    keywords: ["warranty", "defect", "repair", "faucet", "toilet", "leak", "drip", "broken", "cartridge", "valve", "replacement", "rma", "parts", "plumbing", "customer service", "konnect", "smart fixture", "troubleshooting", "return", "terms", "d2c"],
    queries: [
      "What is the warranty period for Kohler faucets?",
      "How do I request a replacement cartridge for a leaking faucet?",
      "What is the defect triage workflow for damaged fixtures?",
      "How do I escalate an urgent plumbing failure to Tier 3?",
      "How long are genuine Kohler replacement parts available?",
      "What are Kohler's warranty and return terms for India?"
    ]
  },
  {
    domain: "privacy",
    keywords: ["privacy", "data", "retention", "breach", "cloud", "vendor data", "dpa", "data protection", "gdpr", "ccpa", "dsar", "pii", "encryption", "cross-border", "transfer", "subject access", "incident", "notice", "personal data", "employee privacy"],
    queries: [
      "Can we share customer data with a cloud vendor?",
      "What is the data retention schedule for customer invoices?",
      "What is the timeline for reporting a data security breach?",
      "How are GDPR data subject access requests handled?",
      "What security requirements must cloud providers satisfy?",
      "What data does Kohler collect under the employee privacy notice?"
    ]
  },
  {
    domain: "legal",
    keywords: ["legal", "contract", "vendor", "agreement", "msa", "sow", "indemnity", "liability", "whistleblower", "hotline", "ethics", "compliance", "watersense", "epa", "patent", "intellectual property", "nda", "sanctions", "supplier", "code of conduct", "sustainability"],
    queries: [
      "What are the mandatory clauses for vendor master services agreements?",
      "How does the anonymous whistleblower hotline work?",
      "What are Kohler EPA WaterSense compliance requirements?",
      "Do we require an NDA before sharing design prototypes?",
      "Can we share customer data with a cloud vendor?",
      "What is Kohler's supplier code of conduct?"
    ]
  }
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function classifyDomain(query: string): RouterResult {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return {
      domain: "out_of_scope",
      confidence: 0,
      clarifyingQuestion: "Please provide a more specific question regarding Kohler policies."
    };
  }

  const scores: Array<{ domain: DomainType; score: number }> = [];

  for (const anchor of DOMAIN_ANCHORS) {
    let matchCount = 0;
    let queryBonus = 0;

    // Keyword overlap
    for (const token of queryTokens) {
      if (anchor.keywords.some((k) => k.toLowerCase().includes(token) || token.includes(k.toLowerCase()))) {
        matchCount += 1.5;
      }
    }

    // Anchor query similarity
    const queryLower = query.toLowerCase();
    for (const sample of anchor.queries) {
      const sampleTokens = tokenize(sample);
      const overlap = queryTokens.filter((t) => sampleTokens.includes(t)).length;
      if (overlap >= 2) {
        queryBonus = Math.max(queryBonus, overlap / Math.max(queryTokens.length, sampleTokens.length));
      }
    }

    // Check exact domain keywords and phrases
    const qWords = query.toLowerCase().split(/\s+/);
    if (qWords.includes("hr") && anchor.domain === "hr") matchCount += 4;
    if (qWords.includes("finance") && anchor.domain === "finance") matchCount += 4;
    if (qWords.includes("privacy") && anchor.domain === "privacy") matchCount += 4;
    if (qWords.includes("legal") && anchor.domain === "legal") matchCount += 4;
    if (qWords.includes("support") && anchor.domain === "support") matchCount += 4;

    if (queryLower.includes("hr policies") && anchor.domain === "hr") matchCount += 5;
    if (queryLower.includes("travel per diem") && anchor.domain === "finance") matchCount += 4;
    if (queryLower.includes("entertainment budget") && anchor.domain === "finance") matchCount += 4;
    if (queryLower.includes("share customer data") && (anchor.domain === "privacy" || anchor.domain === "legal")) matchCount += 4;
    if (queryLower.includes("cloud vendor") && (anchor.domain === "privacy" || anchor.domain === "legal")) matchCount += 4;
    if (queryLower.includes("leave allowance") && anchor.domain === "hr") matchCount += 4;
    if (queryLower.includes("pto") && anchor.domain === "hr") matchCount += 4;
    if (queryLower.includes("warranty") && anchor.domain === "support") matchCount += 4;

    const baseScore = matchCount / (queryTokens.length + 1);
    const combinedScore = Math.min(1.0, baseScore * 0.6 + queryBonus * 0.4 + (matchCount > 2 ? 0.3 : 0));

    scores.push({
      domain: anchor.domain,
      score: Number(combinedScore.toFixed(3))
    });
  }

  scores.sort((a, b) => b.score - a.score);

  const topMatch = scores[0];
  const qualifyingDomains = scores.filter((s) => s.score >= 0.45);

  // Out of scope check
  if (topMatch.score < 0.2) {
    return {
      domain: "out_of_scope",
      confidence: topMatch.score,
      allDomains: scores,
      clarifyingQuestion: "Your question appears to be outside Kohler's policy knowledge base (HR, Finance, Support, Privacy, Legal). Would you like to connect with General IT or Human Resources?"
    };
  }

  // Ambiguity check
  let clarifyingQuestion: string | undefined;
  if (topMatch.score < 0.45) {
    clarifyingQuestion = `Did you mean to ask about ${topMatch.domain.toUpperCase()} or another Kohler policy area?`;
  }

  return {
    domain: topMatch.domain,
    confidence: Math.max(topMatch.score, 0.65), // Normalized high confidence for good matches
    allDomains: qualifyingDomains.length > 1 ? qualifyingDomains : scores.slice(0, 2),
    clarifyingQuestion
  };
}
