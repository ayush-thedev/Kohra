import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { chatRouter } from "./routes/chat.js";
import { scenariosRouter } from "./routes/scenarios.js";
import { auditRouter } from "./routes/audit.js";
import { loadAllPolicies } from "./data/loader.js";
import { rebuildRetrieverIndex } from "./services/retriever.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ingest / Index on boot
console.log("[Bootstrap] Initializing Kohler Enterprise Policy Knowledge Base...");
const chunks = loadAllPolicies();
rebuildRetrieverIndex();
console.log(`[Bootstrap] Knowledge base ready with ${chunks.length} chunks indexed.`);

// API Routes
app.use("/api/chat", chatRouter);
app.use("/api/scenarios", scenariosRouter);
app.use("/api/audit", auditRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "KOHLER Enterprise Intelligence Agent",
    timestamp: new Date().toISOString(),
    chunksIndexed: chunks.length,
    domains: ["hr", "finance", "support", "privacy", "legal"]
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  KOHLER Enterprise Intelligence Agent — API Server  `);
  console.log(`  Listening on http://localhost:${PORT}              `);
  console.log(`======================================================\n`);
});

export default app;
