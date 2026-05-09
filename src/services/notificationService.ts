import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function notifyStakeholdersOnVdrCompletion(projectId: string, projectTitle: string) {
  try {
    // 1. Encontrar todos os matches onde este projeto foi "salvo" (Heart)
    const matchesQ = query(
      collection(db, "matches"),
      where("ownerProjectId", "==", projectId),
      where("savedBy", "!=", [])
    );
    
    const matchesSnap = await getDocs(matchesQ);
    const companyIds = new Set<string>();
    
    matchesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.savedBy) {
        data.savedBy.forEach((uid: string) => companyIds.add(uid));
      }
    });

    // 2. Criar notificações para cada empresa interessada
    const promises = Array.from(companyIds).map(companyId => {
      return addDoc(collection(db, "notifications"), {
        userId: companyId,
        type: 'vdr_ready',
        title: 'Data Room Auditado',
        message: `O projeto "${projectTitle}" atingiu 100% de Due Diligence. A documentação agora está validada para sua análise.`,
        projectId,
        read: false,
        timestamp: serverTimestamp()
      });
    });

    await Promise.all(promises);
    console.log(`Notificações enviadas para ${companyIds.size} stakeholders.`);
  } catch (error) {
    console.error("Erro ao disparar notificações de VDR:", error);
  }
}
