import { SessionData, MessageTurn } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

class SessionStore {
  private sessions: Map<string, SessionData> = new Map();
  private readonly TTL_MS = 30 * 60 * 1000; // 30 minutes

  public getOrCreate(sessionId?: string): SessionData {
    const now = new Date().toISOString();

    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      const lastAccess = new Date(session.lastAccessedAt).getTime();
      if (Date.now() - lastAccess < this.TTL_MS) {
        session.lastAccessedAt = now;
        return session;
      } else {
        // Expired
        this.sessions.delete(sessionId);
      }
    }

    const newId = sessionId || `sess_${uuidv4().substring(0, 8)}`;
    const newSession: SessionData = {
      sessionId: newId,
      messages: [],
      createdAt: now,
      lastAccessedAt: now
    };

    this.sessions.set(newId, newSession);
    return newSession;
  }

  public addMessage(sessionId: string, role: "user" | "assistant", content: string): void {
    const session = this.getOrCreate(sessionId);
    session.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    session.lastAccessedAt = new Date().toISOString();
  }

  public getRecentHistory(sessionId: string, maxTurns: number = 3): MessageTurn[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.messages.slice(-maxTurns * 2);
  }

  public getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }
}

export const sessionStore = new SessionStore();
