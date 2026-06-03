import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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
    // 1. Criar o registro imutável do NDA assinado com ID previsível
    const ndaId = `${request.investorId}_${request.projectId}`;
    const ndaRef = doc(db, "signed_ndas", ndaId);
    await setDoc(ndaRef, {
      ...request,
      signedAt: serverTimestamp(),
      version: "1.0-smart-clickwrap",
      status: "active"
    });

    return ndaId;
  } catch (error) {
    console.error("Erro ao assinar NDA:", error);
    throw error;
  }
}

export async function checkExistingNDA(investorId: string, projectId: string) {
  try {
    const ndaRef = doc(db, "signed_ndas", `${investorId}_${projectId}`);
    const snap = await getDoc(ndaRef);
    return snap.exists();
  } catch (error) {
    console.error("Erro ao verificar NDA existente:", error);
    return false;
  }
}
