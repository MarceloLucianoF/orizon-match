import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  increment
} from "firebase/firestore";
import { db } from "../firebase/config";

export type DealStage = "initial_contact" | "nda" | "proposal" | "negotiation" | "closed";
export type MessageType = "text" | "system" | "nda" | "meeting";

export interface Conversation {
  id: string;
  projectId: string;
  organizationId: string;
  matchId: string;
  participants: string[];
  stage: DealStage;
  updatedAt: any;
  lastMessage?: string;
  projectTitle?: string;
  unreadCount?: Record<string, number>;
  status?: "pending" | "active" | "declined";
  initiatorId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: any;
  type?: MessageType;
  isSystem?: boolean; // Mantido para compatibilidade, mas `type === "system"` é preferível
}

/**
 * Cria ou recupera uma conversa baseada num match
 */
export async function createOrGetConversation(
  matchId: string,
  projectId: string,
  organizationId: string,
  userId: string,
  projectTitle: string = "Projeto"
): Promise<string> {
  const convRef = doc(db, "conversations", matchId);
  
  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return snap.id;
    }
  } catch (error) {
    console.warn("Conversa não encontrada (ou sem permissão de leitura). Criando nova...");
  }

  // Cria nova conversa
  const newConv: Omit<Conversation, "id"> = {
    projectId,
    organizationId,
    matchId,
    participants: [userId, organizationId],
    stage: "initial_contact",
    status: "pending",
    initiatorId: userId,
    updatedAt: serverTimestamp(),
    projectTitle,
    unreadCount: {
      [userId]: 0,
      [organizationId]: 1 // O primeiro a receber já começa com 1 não lida do sistema
    }
  };

  await setDoc(convRef, newConv);
  
  // Mensagem inicial de sistema
  await addDoc(collection(db, "messages"), {
    conversationId: matchId,
    senderId: "system",
    text: "Interesse demonstrado. O Deal Flow foi iniciado na etapa de Contato Inicial.",
    type: "system",
    createdAt: serverTimestamp(),
    isSystem: true
  });

  return matchId;
}

/**
 * Envia uma mensagem de texto padrão no chat
 */
export async function sendMessage(conversationId: string, senderId: string, text: string, participants: string[]) {
  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text,
    type: "text",
    createdAt: serverTimestamp()
  });

  // Atualiza a conversa: lastMessage e unreadCount para o outro participante
  const receiverId = participants.find(p => p !== senderId) || "";
  
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1)
  });
}

/**
 * Envia um "Card Rico" no chat (Ex: NDA, Reunião)
 */
export async function sendActionMessage(
  conversationId: string, 
  senderId: string, 
  actionType: MessageType, 
  participants: string[],
  customText: string = ""
) {
  let defaultText = "";
  if (actionType === "nda") defaultText = "Minuta de NDA enviada para análise.";
  if (actionType === "meeting") defaultText = "Convite para reunião de alinhamento enviado.";

  const text = customText || defaultText;

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text,
    type: actionType,
    createdAt: serverTimestamp()
  });

  const receiverId = participants.find(p => p !== senderId) || "";
  
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1)
  });
}

/**
 * Zera o contador de não lidas para o usuário logado
 */
export async function markAsRead(conversationId: string, userId: string) {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCount.${userId}`]: 0
  });
}

/**
 * Avança o estágio do Deal Flow
 */
export async function updateDealStage(conversationId: string, newStage: DealStage) {
  await updateDoc(doc(db, "conversations", conversationId), {
    stage: newStage,
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId: "system",
    text: `O status da negociação avançou para: ${newStage.toUpperCase()}`,
    type: "system",
    createdAt: serverTimestamp(),
    isSystem: true
  });
}

/**
 * Atualiza o status do Double Opt-in (Aceitar/Recusar conexão)
 */
export async function updateConversationStatus(conversationId: string, newStatus: "active" | "declined") {
  await updateDoc(doc(db, "conversations", conversationId), {
    status: newStatus,
    updatedAt: serverTimestamp()
  });

  const messageText = newStatus === "active" 
    ? "O parceiro aceitou a conexão. O Deal Flow está oficialmente aberto." 
    : "A conexão foi declinada. A negociação foi encerrada.";

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId: "system",
    text: messageText,
    type: "system",
    createdAt: serverTimestamp(),
    isSystem: true
  });
}
