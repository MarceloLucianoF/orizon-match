import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export interface NDASignRequest {
  investorId: string;
  investorName: string;
  projectId: string;
  projectTitle: string;
  inventorId: string;
  inventorName: string;
  linkedAssets: Array<{
    id: string;
    title: string;
    inpiNumber?: string;
  }>;
}

export async function signNDA(request: NDASignRequest) {
  try {
    // 1. Criar o registro imutável do NDA assinado
    const ndaDoc = await addDoc(collection(db, "signed_ndas"), {
      ...request,
      signedAt: serverTimestamp(),
      version: "1.0-smart-clickwrap",
      status: "active"
    });

    // 2. Opcional: Atualizar permissões no VDR para este investidor (lógica de backend/rules)
    // Em produção, isso dispararia uma Cloud Function para dar acesso ao Storage

    return ndaDoc.id;
  } catch (error) {
    console.error("Erro ao assinar NDA:", error);
    throw error;
  }
}

export async function checkExistingNDA(investorId: string, projectId: string) {
  try {
    const q = query(
      collection(db, "signed_ndas"), 
      where("investorId", "==", investorId),
      where("projectId", "==", projectId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Erro ao verificar NDA existente:", error);
    return false;
  }
}
