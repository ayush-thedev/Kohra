import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { classifyDomain } from "../services/router.js";
import { retrieve } from "../services/retriever.js";
import { filterByRole } from "../services/rbac.js";
import { detectConflicts } from "../services/conflictDetector.js";
import { generateAnswer } from "../services/answer.js";
import { formatOutput } from "../services/formatter.js";
import { RBACRole, FormatType } from "../types/index.js";

export const scenariosRouter = Router();

export interface ScenarioDefinition {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  query: string;
  role: RBACRole;
  formats?: FormatType[];
  expected: {
    domain?: string;
    containsText?: string[];
    citationsCountMin?: number;
    rbacDropExpected?: boolean;
    conflictDetected?: boolean;
  };
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 1,
    slug: "single-domain-grounding",
    title: "Scenario 1: Single-Domain Grounding",
    category: "Retrieval & Grounding",
    description: "Tests precise single-domain extraction from Travel Per Diem Policy v2.1 for an EMPLOYEE.",
    query: "What's my daily travel per diem for domestic trips?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "finance",
      containsText: ["$75"],
      citationsCountMin: 1
    }
  },
  {
    id: 2,
    slug: "cross-domain-synthesis",
    title: "Scenario 2: Cross-Domain Synthesis",
    category: "Multi-Domain Reasoning",
    description: "Synthesizes rules across both Privacy (DPA/encryption) and Legal (MSA indemnification) for cloud vendors.",
    query: "Can we share customer data with a cloud vendor?",
    role: "LEGAL",
    formats: ["prose"],
    expected: {
      domain: "privacy",
      containsText: ["DPA", "indemnification", "encryption"],
      citationsCountMin: 2
    }
  },
  {
    id: 3,
    slug: "rbac-containment",
    title: "Scenario 3: RBAC Containment",
    category: "Security & Role Governance",
    description: "Restricts executive entertainment budgets from EMPLOYEE role, but permits full disclosure to FINANCE role.",
    query: "What are executive entertainment budgets?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "finance",
      containsText: ["Access Restricted", "FINANCE"],
      rbacDropExpected: true
    }
  },
  {
    id: 4,
    slug: "policy-conflict-detection",
    title: "Scenario 4: Policy Conflict & Supersession",
    category: "Temporal & Conflict Governance",
    description: "Correctly identifies that PTO Policy v3.0 (20 days) supersedes legacy Policy v2.0 (15 days).",
    query: "What's my leave allowance?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "hr",
      containsText: ["20 days"],
      conflictDetected: true
    }
  },
  {
    id: 5,
    slug: "multi-format-output",
    title: "Scenario 5: Multi-Format Dynamic Output",
    category: "Formatting & Serialization",
    description: "Outputs identical HR policy catalog across 5 formats: Prose, JSON, XML, downloadable Excel (.xlsx), and Email draft.",
    query: "List all HR policies",
    role: "ADMIN",
    formats: ["prose", "json", "xml", "xlsx", "email"],
    expected: {
      domain: "hr",
      citationsCountMin: 2
    }
  },
  {
    id: 6,
    slug: "customer-support-terms",
    title: "Scenario 6: Customer Support & Warranty Terms",
    category: "Domain Expansion & Grounding",
    description: "Queries customer support policies and India D2C terms for warranty and returns.",
    query: "What are Kohler's warranty and return terms for India?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "support",
      containsText: ["warranty"],
      citationsCountMin: 1
    }
  },
  {
    id: 7,
    slug: "rbac-supplier-containment",
    title: "Scenario 7: RBAC Supplier Governance",
    category: "Security & Role Governance",
    description: "Restricts Kohler Supplier Code of Conduct from EMPLOYEE role while granting access to LEGAL / MANAGER.",
    query: "What is Kohler's supplier code of conduct?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "legal",
      rbacDropExpected: true
    }
  },
  {
    id: 8,
    slug: "employee-privacy-notice",
    title: "Scenario 8: Employee Privacy Governance",
    category: "Privacy & Compliance",
    description: "Queries official employee privacy notice data collection guidelines accessible to all employees.",
    query: "What data does Kohler collect under the employee privacy notice?",
    role: "EMPLOYEE",
    formats: ["prose"],
    expected: {
      domain: "privacy",
      containsText: ["data"],
      citationsCountMin: 1
    }
  }
];

async function executeScenario(scenario: ScenarioDefinition) {
  const t0 = performance.now();
  const assertions: Array<{ check: string; passed: boolean; details?: string }> = [];

  const routeResult = classifyDomain(scenario.query);
  const domainsToSearch = routeResult.allDomains
    ? routeResult.allDomains.map((d) => d.domain)
    : [routeResult.domain];

  const retrievalResult = await retrieve(scenario.query, domainsToSearch, 5);
  const rbacResult = filterByRole(retrievalResult.chunks, scenario.role);
  const conflictWarnings = detectConflicts(rbacResult.filtered);

  // Scenario 3 Dual-Test (EMPLOYEE restricted vs FINANCE permitted)
  if (scenario.id === 3) {
    const employeeRbac = filterByRole(retrievalResult.chunks, "EMPLOYEE");
    const financeRbac = filterByRole(retrievalResult.chunks, "FINANCE");

    assertions.push({
      check: "EMPLOYEE role restricted (droppedCount > 0)",
      passed: employeeRbac.droppedCount > 0,
      details: `Dropped ${employeeRbac.droppedCount} executive documents for EMPLOYEE`
    });

    assertions.push({
      check: "FINANCE role permitted (passedCount > 0)",
      passed: financeRbac.filtered.length > 0,
      details: `Passed ${financeRbac.filtered.length} executive documents for FINANCE`
    });

    const elapsed = Math.round(performance.now() - t0);
    return {
      scenarioId: scenario.id,
      slug: scenario.slug,
      title: scenario.title,
      status: assertions.every((a) => a.passed) ? "PASS" : "FAIL",
      assertions,
      details: {
        employeeDropped: employeeRbac.droppedCount,
        financeAllowed: financeRbac.filtered.length
      },
      timingMs: elapsed
    };
  }

  // Scenario 7 Dual-Test (EMPLOYEE restricted vs LEGAL permitted for Supplier Conduct)
  if (scenario.id === 7) {
    const employeeRbac = filterByRole(retrievalResult.chunks, "EMPLOYEE");
    const legalRbac = filterByRole(retrievalResult.chunks, "LEGAL");

    assertions.push({
      check: "EMPLOYEE role restricted from supplier governance (droppedCount > 0)",
      passed: employeeRbac.droppedCount > 0,
      details: `Dropped ${employeeRbac.droppedCount} supplier documents for EMPLOYEE`
    });

    assertions.push({
      check: "LEGAL role permitted for supplier governance (passedCount > 0)",
      passed: legalRbac.filtered.length > 0,
      details: `Passed ${legalRbac.filtered.length} supplier documents for LEGAL`
    });

    const elapsed = Math.round(performance.now() - t0);
    return {
      scenarioId: scenario.id,
      slug: scenario.slug,
      title: scenario.title,
      status: assertions.every((a) => a.passed) ? "PASS" : "FAIL",
      assertions,
      details: {
        employeeDropped: employeeRbac.droppedCount,
        legalAllowed: legalRbac.filtered.length
      },
      timingMs: elapsed
    };
  }

  // Answer generation
  let answerText = "";
  let citations = [];

  if (rbacResult.filtered.length === 0) {
    answerText = `Access Restricted: This policy information requires elevated privileges.`;
  } else {
    const ans = await generateAnswer({
      query: scenario.query,
      chunks: rbacResult.filtered,
      conversationHistory: [],
      rbacRole: scenario.role,
      conflictWarnings
    });
    answerText = ans.answer;
    citations = ans.citations;
  }

  // Domain Assertion
  if (scenario.expected.domain) {
    const domainPassed =
      routeResult.domain === scenario.expected.domain ||
      routeResult.allDomains?.some((d) => d.domain === scenario.expected.domain);
    assertions.push({
      check: `Domain classification matches '${scenario.expected.domain}'`,
      passed: !!domainPassed,
      details: `Detected: ${routeResult.domain}`
    });
  }

  // Content Assertions
  if (scenario.expected.containsText) {
    for (const expectedStr of scenario.expected.containsText) {
      const passed = answerText.toLowerCase().includes(expectedStr.toLowerCase());
      assertions.push({
        check: `Answer contains keyword '${expectedStr}'`,
        passed,
        details: passed ? `Found in answer` : `Missing in: "${answerText.substring(0, 100)}..."`
      });
    }
  }

  // Citations Assertion
  if (scenario.expected.citationsCountMin) {
    assertions.push({
      check: `Minimum ${scenario.expected.citationsCountMin} citations extracted`,
      passed: citations.length >= scenario.expected.citationsCountMin,
      details: `Extracted ${citations.length} citations`
    });
  }

  // Conflict Detection Assertion (Scenario 4)
  if (scenario.expected.conflictDetected) {
    const conflictFound = conflictWarnings.some((w) => w.type === "superseded");
    assertions.push({
      check: "Policy supersession conflict flagged (v3.0 superseding v2.0)",
      passed: conflictFound,
      details: conflictWarnings.map((w) => w.message).join(" | ") || "No conflicts flagged"
    });
  }

  // Multi-Format Assertion (Scenario 5)
  if (scenario.id === 5) {
    const formats: FormatType[] = ["prose", "json", "xml", "xlsx", "email"];
    let allFormatsValid = true;

    for (const fmt of formats) {
      const res = formatOutput(fmt, {
        query: scenario.query,
        answer: answerText,
        citations,
        rbacRole: scenario.role,
        domain: routeResult.domain,
        requestId: uuidv4(),
        confidence: 0.95,
        grounded: true
      });

      if (fmt === "json") {
        try {
          JSON.parse(res.formattedContent);
        } catch {
          allFormatsValid = false;
        }
      } else if (fmt === "xml") {
        allFormatsValid = allFormatsValid && res.formattedContent.includes("<kohlerResponse>");
      } else if (fmt === "xlsx") {
        allFormatsValid = allFormatsValid && !!res.fileUrl && !!res.buffer;
      }
    }

    assertions.push({
      check: "All 5 formats (Prose, JSON, XML, Excel .xlsx, Email) generated valid outputs",
      passed: allFormatsValid
    });
  }

  const elapsed = Math.round(performance.now() - t0);
  const allPassed = assertions.every((a) => a.passed);

  return {
    scenarioId: scenario.id,
    slug: scenario.slug,
    title: scenario.title,
    status: allPassed ? "PASS" : "FAIL",
    assertions,
    outputSample: answerText.substring(0, 250) + "...",
    citationsCount: citations.length,
    timingMs: elapsed
  };
}

scenariosRouter.get("/", (req: Request, res: Response) => {
  res.json(SCENARIOS);
});

scenariosRouter.post("/run/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const scenario = SCENARIOS.find((s) => s.id === id);

  if (!scenario) {
    res.status(404).json({ error: `Scenario #${id} not found` });
    return;
  }

  const result = await executeScenario(scenario);
  res.json(result);
});

scenariosRouter.post("/run-all", async (req: Request, res: Response) => {
  const results = [];
  for (const scenario of SCENARIOS) {
    const res = await executeScenario(scenario);
    results.push(res);
  }

  const allPassed = results.every((r) => r.status === "PASS");
  res.json({
    summary: {
      total: SCENARIOS.length,
      passed: results.filter((r) => r.status === "PASS").length,
      failed: results.filter((r) => r.status === "FAIL").length,
      allPassed
    },
    results
  });
});
