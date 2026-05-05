import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

export type DealStage = "initial_contact" | "nda" | "proposal" | "negotiation" | "closed";

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
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: any;
  isSystem?: boolean;
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
  const snap = await getDoc(convRef);

  if (snap.exists()) {
    return snap.id;
  }

  // Cria nova conversa
  const newConv: Omit<Conversation, "id"> = {
    projectId,
    organizationId,
    matchId,
    participants: [userId, organizationId], // O userId criador e a organização alvo
    stage: "initial_contact",
    updatedAt: serverTimestamp(),
    projectTitle
  };

  await setDoc(convRef, newConv);
  
  // Mensagem inicial de sistema
  await addDoc(collection(db, "messages"), {
    conversationId: matchId,
    senderId: "system",
    text: "Interesse demonstrado. O Deal Flow foi iniciado na etapa de Contato Inicial.",
    createdAt: serverTimestamp(),
    isSystem: true
  });

  return matchId;
}

/**
 * Envia uma mensagem no chat
 */
export async function sendMessage(conversationId: string, senderId: string, text: string) {
  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    isSystem: true
  });
}
