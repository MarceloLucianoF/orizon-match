import { db } from "../firebase";
import { calculateMatch } from "../matching/engine";
import { Project, Organization } from "../types/project";
import * as admin from "firebase-admin";

export async function getPreviewMatches(inputProject: Partial<Project>) {
  const segment = inputProject.segment || "tecnologia";
  
  const snapshot = await db
    .collection("users")
    .where("role", "in", ["company", "investor"])
    .where("segment", "==", segment)
    .limit(10)
    .get();

  const matches: any[] = [];

  snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
    const org = { id: doc.id, ...doc.data() } as Organization;
    
    // Calcula o match assumindo que o input é um projeto válido o suficiente
    const result = calculateMatch(inputProject as Project, org);
    
    if (result.score >= 60) {
      matches.push({
        id: org.id,
        score: result.score,
        // Mascara os dados para criar curiosidade
        name: org.role === "investor" ? "Investidor Anjo" : "Empresa do Setor",
        role: org.role,
        breakdown: result.breakdown
      });
    }
  });

  // Ordena por maior score
  matches.sort((a, b) => b.score - a.score);

  return {
    total: matches.length + Math.floor(Math.random() * 5), // Leve variação para marketing
    topMatches: matches.slice(0, 3)
  };
}
