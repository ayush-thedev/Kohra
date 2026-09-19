import { AuditEvent, TimingBreakdown } from "../types/index.js";

class AuditLogger {
  private eventsByRequest: Map<string, AuditEvent[]> = new Map();
  private eventsBySession: Map<string, AuditEvent[]> = new Map();

  public logEvent(
    requestId: string,
    event: AuditEvent["event"],
    severity: AuditEvent["severity"],
    details: Record<string, any>,
    sessionId?: string
  ): AuditEvent {
    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      requestId,
      event,
      severity,
      details
    };

    if (!this.eventsByRequest.has(requestId)) {
      this.eventsByRequest.set(requestId, []);
    }
    this.eventsByRequest.get(requestId)!.push(auditEvent);

    if (sessionId) {
      if (!this.eventsBySession.has(sessionId)) {
        this.eventsBySession.set(sessionId, []);
      }
      this.eventsBySession.get(sessionId)!.push(auditEvent);
    }

    return auditEvent;
  }

  public getEventsForRequest(requestId: string): AuditEvent[] {
    return this.eventsByRequest.get(requestId) || [];
  }

  public getEventsForSession(sessionId: string): AuditEvent[] {
    return this.eventsBySession.get(sessionId) || [];
  }

  public clear(): void {
    this.eventsByRequest.clear();
    this.eventsBySession.clear();
  }
}

export const auditLogger = new AuditLogger();
