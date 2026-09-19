import { Router, Request, Response } from "express";
import { auditLogger } from "../services/auditLog.js";

export const auditRouter = Router();

auditRouter.get("/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const events = auditLogger.getEventsForSession(sessionId);
  res.json({
    sessionId,
    eventCount: events.length,
    events
  });
});
