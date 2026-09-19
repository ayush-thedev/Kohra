import { SCENARIOS } from "../src/routes/scenarios.js";
import { classifyDomain } from "../src/services/router.js";
import { retrieve } from "../src/services/retriever.js";
import { filterByRole } from "../src/services/rbac.js";
import { detectConflicts } from "../src/services/conflictDetector.js";
import { generateAnswer } from "../src/services/answer.js";
import { formatOutput } from "../src/services/formatter.js";
import { v4 as uuidv4 } from "uuid";
import { loadAllPolicies } from "../src/data/loader.js";

async function runBenchmark() {
  console.log("\n========================================================================");
  console.log("   KOHLER Enterprise Intelligence Agent — Benchmark Verification Suite  ");
  console.log("========================================================================\n");

  loadAllPolicies();
  let passedCount = 0;

  for (const s of SCENARIOS) {
    console.log(`\n▶ Running ${s.title}`);
    console.log(`  Query: "${s.query}" | Role: ${s.role}`);

    const t0 = performance.now();
    const route = classifyDomain(s.query);
    const domains = route.allDomains ? route.allDomains.map((d) => d.domain) : [route.domain];
    const retrieval = await retrieve(s.query, domains, 5);
    const rbac = filterByRole(retrieval.chunks, s.role);
    const conflicts = detectConflicts(rbac.filtered);

    let answer = "";
    let citations = [];

    if (s.id === 3) {
      // Scenario 3: RBAC Check (Finance)
      const employeeRbac = filterByRole(retrieval.chunks, "EMPLOYEE");
      const financeRbac = filterByRole(retrieval.chunks, "FINANCE");

      const employeePass = employeeRbac.droppedCount > 0;
      const financePass = financeRbac.filtered.length > 0;

      console.log(`  [ASSERT] EMPLOYEE blocked from executive budgets: ${employeePass ? "✅ PASS" : "❌ FAIL"} (Dropped: ${employeeRbac.droppedCount})`);
      console.log(`  [ASSERT] FINANCE permitted to view executive budgets: ${financePass ? "✅ PASS" : "❌ FAIL"} (Allowed: ${financeRbac.filtered.length})`);

      if (employeePass && financePass) passedCount++;
      continue;
    }

    if (s.id === 7) {
      // Scenario 7: RBAC Check (Supplier Governance)
      const employeeRbac = filterByRole(retrieval.chunks, "EMPLOYEE");
      const legalRbac = filterByRole(retrieval.chunks, "LEGAL");

      const employeePass = employeeRbac.droppedCount > 0;
      const legalPass = legalRbac.filtered.length > 0;

      console.log(`  [ASSERT] EMPLOYEE blocked from supplier governance: ${employeePass ? "✅ PASS" : "❌ FAIL"} (Dropped: ${employeeRbac.droppedCount})`);
      console.log(`  [ASSERT] LEGAL permitted to view supplier governance: ${legalPass ? "✅ PASS" : "❌ FAIL"} (Allowed: ${legalRbac.filtered.length})`);

      if (employeePass && legalPass) passedCount++;
      continue;
    }

    if (rbac.filtered.length > 0) {
      const res = await generateAnswer({
        query: s.query,
        chunks: rbac.filtered,
        conversationHistory: [],
        rbacRole: s.role,
        conflictWarnings: conflicts
      });
      answer = res.answer;
      citations = res.citations;
    }

    const checks: boolean[] = [];

    // Domain check
    if (s.expected.domain) {
      const dPass = route.domain === s.expected.domain || route.allDomains?.some((d) => d.domain === s.expected.domain);
      console.log(`  [ASSERT] Domain Routing (${s.expected.domain}): ${dPass ? "✅ PASS" : "❌ FAIL"} (Got: ${route.domain})`);
      checks.push(!!dPass);
    }

    // Keyword checks
    if (s.expected.containsText) {
      for (const text of s.expected.containsText) {
        const kPass = answer.toLowerCase().includes(text.toLowerCase());
        console.log(`  [ASSERT] Answer Contains '${text}': ${kPass ? "✅ PASS" : "❌ FAIL"}`);
        checks.push(kPass);
      }
    }

    // Citations check
    if (s.expected.citationsCountMin) {
      const cPass = citations.length >= s.expected.citationsCountMin;
      console.log(`  [ASSERT] Min ${s.expected.citationsCountMin} Citations: ${cPass ? "✅ PASS" : "❌ FAIL"} (Got: ${citations.length})`);
      checks.push(cPass);
    }

    // Conflict check
    if (s.expected.conflictDetected) {
      const confPass = conflicts.some((w) => w.type === "superseded");
      console.log(`  [ASSERT] Policy Supersession Flagged: ${confPass ? "✅ PASS" : "❌ FAIL"}`);
      checks.push(confPass);
    }

    // Scenario 5 multi-format
    if (s.id === 5) {
      const fmts = ["prose", "json", "xml", "xlsx", "email"] as const;
      let valid = true;
      for (const f of fmts) {
        const out = formatOutput(f, {
          query: s.query,
          answer,
          citations,
          rbacRole: s.role,
          domain: route.domain,
          requestId: uuidv4(),
          confidence: 0.95,
          grounded: true
        });
        if (f === "json") JSON.parse(out.formattedContent);
        if (f === "xml" && !out.formattedContent.includes("<kohlerResponse>")) valid = false;
        if (f === "xlsx" && !out.buffer) valid = false;
      }
      console.log(`  [ASSERT] Multi-Format Generation (5 formats): ${valid ? "✅ PASS" : "❌ FAIL"}`);
      checks.push(valid);
    }

    const scenarioPassed = checks.every((c) => c);
    const duration = Math.round(performance.now() - t0);
    console.log(`  STATUS: ${scenarioPassed ? "🟢 PASSED" : "🔴 FAILED"} (${duration}ms)`);
    if (scenarioPassed) passedCount++;
  }

  console.log("\n------------------------------------------------------------------------");
  console.log(`  FINAL BENCHMARK SCORE: ${passedCount} / ${SCENARIOS.length} SCENARIOS PASSED (${Math.round((passedCount / SCENARIOS.length) * 100)}%)`);
  console.log("------------------------------------------------------------------------\n");

  if (passedCount === SCENARIOS.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runBenchmark().catch(console.error);
