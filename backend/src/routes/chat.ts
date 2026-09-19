import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { classifyDomain } from "../services/router.js";
import { retrieve } from "../services/retriever.js";
import { filterByRole } from "../services/rbac.js";
import { detectConflicts } from "../services/conflictDetector.js";
import { assessRisk } from "../services/hitlGate.js";
import { generateAnswer } from "../services/answer.js";
import { formatOutput } from "../services/formatter.js";
import { auditLogger } from "../services/auditLog.js";
import { sessionStore } from "../services/sessionStore.js";
import { ChatRequest, ChatResponse, ErrorResponse, TimingBreakdown, RBACRole, FormatType } from "../types/index.js";

export const chatRouter = Router();

chatRouter.post("/", async (req: Request, res: Response) => {
  const startTime = performance.now();
  const body = req.body as ChatRequest;

  const requestId = body.requestId || uuidv4();
  const query = (body.query || "").trim();
  const rbacRole: RBACRole = body.rbacRole || "EMPLOYEE";
  const format: FormatType = body.format || "prose";
  const sessionId = body.sessionId || `sess_${uuidv4().substring(0, 8)}`;

  const timing: TimingBreakdown = {
    routeMs: 0,
    retrieveMs: 0,
    rbacMs: 0,
    conflictMs: 0,
    hitlMs: 0,
    answerMs: 0,
    formatMs: 0,
    totalMs: 0
  };

  // 1. Initial Logging & Validation
  auditLogger.logEvent(
    requestId,
    "QUERY_RECEIVED",
    "INFO",
    { query, rbacRole, format, sessionId },
    sessionId
  );

  if (!query) {
    const errResp: ErrorResponse = {
      requestId,
      error: "VALIDATION_ERROR",
      message: "Query cannot be empty. Please enter a valid policy question.",
      suggestedAction: "PROVIDE_MORE_CONTEXT"
    };
    res.status(400).json(errResp);
    return;
  }

  // Session retrieval
  const session = sessionStore.getOrCreate(sessionId);
  const conversationHistory = sessionStore.getRecentHistory(sessionId, 3);
  sessionStore.addMessage(sessionId, "user", query);

  // 2. Domain Classification
  const tRoute0 = performance.now();
  const routeResult = classifyDomain(query);
  timing.routeMs = Math.round(performance.now() - tRoute0);

  auditLogger.logEvent(
    requestId,
    "ROUTER_CLASSIFIED",
    "INFO",
    {
      domain: routeResult.domain,
      confidence: routeResult.confidence,
      allDomains: routeResult.allDomains,
      clarifyingQuestion: routeResult.clarifyingQuestion
    },
    sessionId
  );

  if (routeResult.domain === "out_of_scope") {
    timing.totalMs = Math.round(performance.now() - startTime);
    const errResp: ErrorResponse = {
      requestId,
      error: "OUT_OF_SCOPE",
      message: routeResult.clarifyingQuestion || "Your question is outside the scope of the Kohler policy knowledge base.",
      suggestedAction: "REDIRECT_TO_TEAM",
      recommendedTeam: "IT_SUPPORT",
      auditEvents: auditLogger.getEventsForRequest(requestId),
      timing
    };
    res.status(200).json({
      requestId,
      sessionId,
      answer: errResp.message,
      domain: "out_of_scope",
      confidence: routeResult.confidence,
      grounded: false,
      stage: "refused",
      citations: [],
      auditEvents: auditLogger.getEventsForRequest(requestId),
      timing
    });
    return;
  }

  // 3. Retrieval
  const tRetrieve0 = performance.now();
  const domainsToSearch = routeResult.allDomains
    ? routeResult.allDomains.map((d) => d.domain)
    : [routeResult.domain];

  const retrievalResult = await retrieve(query, domainsToSearch, 5);
  timing.retrieveMs = Math.round(performance.now() - tRetrieve0);

  auditLogger.logEvent(
    requestId,
    "RETRIEVAL_EXECUTED",
    "INFO",
    {
      chunksRetrieved: retrievalResult.chunks.length,
      domainsSearched: domainsToSearch,
      mergedScores: retrievalResult.mergedScores
    },
    sessionId
  );

  // 4. RBAC Containment Gate (Post-Retrieval Filtering)
  const tRbac0 = performance.now();
  const rbacResult = filterByRole(retrievalResult.chunks, rbacRole);
  timing.rbacMs = Math.round(performance.now() - tRbac0);

  auditLogger.logEvent(
    requestId,
    "RBAC_FILTERED",
    rbacResult.droppedCount > 0 ? "WARNING" : "INFO",
    {
      passedCount: rbacResult.filtered.length,
      droppedCount: rbacResult.droppedCount,
      droppedReasons: rbacResult.droppedReasons,
      userRole: rbacRole
    },
    sessionId
  );

  // If ALL relevant chunks were dropped by RBAC: Honest Refusal
  if (rbacResult.filtered.length === 0 && retrievalResult.chunks.length > 0) {
    timing.totalMs = Math.round(performance.now() - startTime);
    const accessDeniedMessage = `Access Restricted: This policy information requires elevated privileges (${rbacResult.droppedReasons[0] || "higher tier role"}). You are currently operating with the ${rbacRole} role.`;

    sessionStore.addMessage(sessionId, "assistant", accessDeniedMessage);

    const response: ChatResponse = {
      requestId,
      sessionId,
      answer: accessDeniedMessage,
      domain: routeResult.domain,
      confidence: 1.0,
      grounded: true,
      stage: "restricted",
      citations: [],
      auditEvents: auditLogger.getEventsForRequest(requestId),
      timing
    };
    res.json(response);
    return;
  }

  // 5. Policy Conflict & Supersession Detection
  const tConflict0 = performance.now();
  const conflictWarnings = detectConflicts(rbacResult.filtered);
  timing.conflictMs = Math.round(performance.now() - tConflict0);

  if (conflictWarnings.length > 0) {
    auditLogger.logEvent(
      requestId,
      "CONFLICT_DETECTED",
      "WARNING",
      { warnings: conflictWarnings },
      sessionId
    );
  }

  // 6. HITL Risk Gate
  const tHitl0 = performance.now();
  const hitlDecision = assessRisk(query, routeResult.domain, rbacRole);
  timing.hitlMs = Math.round(performance.now() - tHitl0);

  if (hitlDecision.requiresApproval) {
    auditLogger.logEvent(
      requestId,
      "HITL_REQUIRED",
      "WARNING",
      {
        riskLevel: hitlDecision.riskLevel,
        reason: hitlDecision.reason,
        escalateTo: hitlDecision.escalateTo
      },
      sessionId
    );

    const escalationMessage = `[Human-in-the-Loop Safety Gate Triggered]\n\nRisk Level: ${hitlDecision.riskLevel}\nReason: ${hitlDecision.reason}\n\nThis inquiry has been escalated to the Kohler **${hitlDecision.escalateTo}** department for formal authorization.`;
    sessionStore.addMessage(sessionId, "assistant", escalationMessage);

    timing.totalMs = Math.round(performance.now() - startTime);
    const response: ChatResponse = {
      requestId,
      sessionId,
      answer: escalationMessage,
      domain: routeResult.domain,
      confidence: 1.0,
      grounded: true,
      stage: "escalated",
      citations: [],
      hitlDecision,
      auditEvents: auditLogger.getEventsForRequest(requestId),
      timing
    };
    res.json(response);
    return;
  }

  // 7. Answer Generation
  const tAnswer0 = performance.now();
  const answerResult = await generateAnswer({
    query,
    chunks: rbacResult.filtered,
    conversationHistory,
    rbacRole,
    conflictWarnings
  });
  timing.answerMs = Math.round(performance.now() - tAnswer0);

  auditLogger.logEvent(
    requestId,
    "ANSWER_GENERATED",
    "INFO",
    {
      model: answerResult.model,
      tokenCount: answerResult.tokenCount,
      citationsCount: answerResult.citations.length,
      confidence: answerResult.confidence,
      grounded: answerResult.grounded
    },
    sessionId
  );

  // 8. Output Formatting
  const tFormat0 = performance.now();
  const formatResult = formatOutput(format, {
    query,
    answer: answerResult.answer,
    citations: answerResult.citations,
    rbacRole,
    domain: routeResult.domain,
    requestId,
    confidence: answerResult.confidence,
    grounded: answerResult.grounded
  });
  timing.formatMs = Math.round(performance.now() - tFormat0);

  timing.totalMs = Math.round(performance.now() - startTime);

  auditLogger.logEvent(
    requestId,
    "RESPONSE_SENT",
    "INFO",
    {
      format,
      fileUrl: formatResult.fileUrl,
      totalMs: timing.totalMs
    },
    sessionId
  );

  sessionStore.addMessage(sessionId, "assistant", answerResult.answer);

  const response: ChatResponse = {
    requestId,
    sessionId,
    answer: formatResult.formattedContent,
    domain: routeResult.domain,
    confidence: answerResult.confidence,
    grounded: answerResult.grounded,
    stage: "answered",
    citations: answerResult.citations,
    fileUrl: formatResult.fileUrl,
    filename: formatResult.filename,
    mimeType: formatResult.mimeType,
    hitlDecision,
    conflictWarnings,
    auditEvents: auditLogger.getEventsForRequest(requestId),
    timing
  };

  res.json(response);
});

// Excel Download Endpoint
chatRouter.get("/export/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.resolve(process.cwd(), "exports", safeFilename);

  if (fs.existsSync(filePath)) {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Export file not found or expired" });
  }
});
