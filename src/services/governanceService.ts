import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export interface ActorInfo {
  uid: string;
  name: string;
  email: string;
  role: string;
}

let cachedIp: string | null = null;

async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    cachedIp = data.ip;
    return cachedIp || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("orizon_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
    sessionStorage.setItem("orizon_session_id", sid);
  }
  return sid;
}

/**
 * Gera um ID de correlação aleatório único no formato UUID para rastreamento de workflows
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "corr_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
}

/**
 * Gera um ID de correlação global para tracing de um fluxo
 */
export function getCorrelationId(projectId: string | null, userId: string | null): string {
  if (projectId && userId) {
    return `corr_${userId}_${projectId}`;
  }
  if (projectId) {
    return `corr_project_${projectId}`;
  }
  if (userId) {
    return `corr_user_${userId}`;
  }
  return "corr_global";
}

/**
 * Registra um log de auditoria imutável (Event Sourcing Light) enviando ao Event Bus
 */
export async function logAudit(
  actor: ActorInfo,
  action: string,
  projectId: string | null,
  projectTitle: string | null,
  before: any | null = null,
  after: any | null = null,
  correlationId?: string | null
) {
  try {
    const ipAddress = await getClientIp();
    const sessionId = getSessionId();
    const finalCorrelationId = correlationId || generateUUID();
    
    await dispatchDomainEvent("audit." + action, {
      actor,
      projectId,
      projectTitle,
      before,
      after,
      ipAddress,
      userAgent: navigator.userAgent,
      sessionId,
      correlationId: finalCorrelationId
    });
  } catch (err) {
    console.error("Erro ao gravar log de auditoria via Event Bus:", err);
  }
}

/**
 * Registra um evento operacional para timeline enviando ao Event Bus
 */
export async function logActivity(
  eventType: string,
  actorName: string,
  projectId: string | null,
  projectTitle: string | null,
  metadata: any = {},
  correlationId?: string | null
) {
  try {
    const ipAddress = await getClientIp();
    const sessionId = getSessionId();
    const finalCorrelationId = correlationId || generateUUID();
    
    await dispatchDomainEvent("activity." + eventType, {
      actorName,
      projectId,
      projectTitle,
      metadata,
      ipAddress,
      userAgent: navigator.userAgent,
      sessionId,
      correlationId: finalCorrelationId
    });
  } catch (err) {
    console.error("Erro ao gravar evento de atividade via Event Bus:", err);
  }
}

/**
 * Despacha um evento de domínio para o Event Bus no Firestore
 */
export async function dispatchDomainEvent(
  eventType: string,
  payload: any = {}
) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "domain_events"), {
      eventType,
      payload,
      processedStatus: "pending",
      actorUid: user ? user.uid : "system",
      eventVersion: 1,
      schemaVersion: 1,
      timestamp: serverTimestamp()
    });
    console.log(`[DOMAIN EVENT] ${eventType} dispatched.`);
  } catch (err) {
    console.error("Erro ao despachar evento de domínio:", err);
  }
}
