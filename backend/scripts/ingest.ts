import { loadAllPolicies, invalidatePolicyCache } from "../src/data/loader.js";
import { rebuildRetrieverIndex } from "../src/services/retriever.js";

async function main() {
  console.log("---------------------------------------------------------");
  console.log("  KOHLER Enterprise Policy Ingestion & Indexing Pipeline  ");
  console.log("---------------------------------------------------------");

  invalidatePolicyCache();
  const chunks = loadAllPolicies();
  rebuildRetrieverIndex();

  console.log(`\n✅ Ingestion complete!`);
  console.log(`• Total chunks indexed: ${chunks.length}`);
  console.log(`• Domains covered: HR, Finance, Support, Privacy, Legal`);
}

main().catch(console.error);
