import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";

// UID do super admin (em um ambiente de prod seria uma custom claim)
export const SUPER_ADMIN_UID = "nqBV3Da1iqPbU46jGvO1ljBbIze2";

export async function getGlobalMetrics() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const projectsSnap = await getDocs(collection(db, "projects"));
    const matchesSnap = await getDocs(collection(db, "matches"));
    const conversationsSnap = await getDocs(collection(db, "conversations"));

    const users = usersSnap.docs.map(d => d.data());
    const projects = projectsSnap.docs.map(d => d.data());
    
    const icts = users.filter(u => u.role === "ict").length;
    const companies = users.filter(u => u.role === "company").length;
    const investors = users.filter(u => u.role === "investor").length;

    // TRL Distribution
    const trlDistribution = {
      ideia: projects.filter(p => (p.maturity || p.trlScore) <= 3).length,
      prototipo: projects.filter(p => (p.maturity || p.trlScore) > 3 && (p.maturity || p.trlScore) <= 6).length,
      mercado: projects.filter(p => (p.maturity || p.trlScore) > 6).length
    };

    // VDR Progress
    const totalVdrProgress = projects.reduce((acc, p) => acc + (p.dueDiligenceProgress || 0), 0);
    const avgVdrProgress = projects.length > 0 ? Math.round(totalVdrProgress / projects.length) : 0;

    return {
      totalUsers: usersSnap.size,
      breakdownUsers: { icts, companies, investors },
      totalProjects: projectsSnap.size,
      totalMatchesGenerated: matchesSnap.size,
      totalActiveDeals: conversationsSnap.size,
      trlDistribution,
      avgVdrProgress
    };
  } catch (error) {
    console.error("Erro ao buscar métricas globais:", error);
    throw error;
  }
}

export async function getLiveDealFlows() {
  try {
    const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar conversas globais:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    throw error;
  }
}

import { doc, updateDoc } from "firebase/firestore";

export async function toggleUserVerification(userId: string, isVerified: boolean) {
  try {
    await updateDoc(doc(db, "users", userId), { verified: isVerified });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    throw error;
  }
}
