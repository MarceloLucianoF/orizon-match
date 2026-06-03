import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

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
 * Registra um log de auditoria imutável (Event Sourcing Light)
 */
export async function logAudit(
  actor: ActorInfo,
  action: string,
  projectId: string | null,
  projectTitle: string | null,
  before: any | null = null,
  after: any | null = null
) {
  try {
    const ipAddress = await getClientIp();
    const sessionId = getSessionId();
    
    await addDoc(collection(db, "audit_logs"), {
      action,
      actorId: actor.uid,
      actorName: actor.name || actor.email || "Usuário",
      actorEmail: actor.email || "",
      actorRole: actor.role || "unknown",
      projectId: projectId || null,
      projectTitle: projectTitle || null,
      before: before || null,
      after: after || null,
      ipAddress,
      userAgent: navigator.userAgent,
      sessionId,
      timestamp: serverTimestamp()
    });
    console.log(`[AUDIT LOG] Action: ${action} by user ${actor.uid}`);
  } catch (err) {
    console.error("Erro ao gravar log de auditoria:", err);
  }
}

/**
 * Registra um evento operacional para alimentar o feed da timeline
 */
export async function logActivity(
  eventType: string,
  actorName: string,
  projectId: string | null,
  projectTitle: string | null,
  metadata: any = {}
) {
  try {
    await addDoc(collection(db, "activity_events"), {
      eventType,
      actorName,
      projectId: projectId || null,
      projectTitle: projectTitle || null,
      metadata,
      timestamp: serverTimestamp()
    });
    console.log(`[ACTIVITY EVENT] ${eventType} recorded.`);
  } catch (err) {
    console.error("Erro ao gravar evento de atividade:", err);
  }
}

/**
 * Despacha um evento de domínio para integrações, notificações e IA
 */
export async function dispatchDomainEvent(
  eventType: string,
  payload: any = {}
) {
  try {
    await addDoc(collection(db, "domain_events"), {
      eventType,
      payload,
      processedStatus: "pending",
      timestamp: serverTimestamp()
    });
    console.log(`[DOMAIN EVENT] ${eventType} dispatched.`);
  } catch (err) {
    console.error("Erro ao despachar evento de domínio:", err);
  }
}
