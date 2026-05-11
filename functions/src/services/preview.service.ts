import { db } from "../firebase";
import { calculateMatch } from "../matching/engine";
import { Project, Organization } from "../types/project";
import * as admin from "firebase-admin";

export async function getPreviewMatches(inputProject: Partial<Project>) {
  const segment = inputProject.segment || "tecnologia";
  const projectType = inputProject.type || 'inventor';

  // Lógica Bidirecional:
  // Se for Inventor/ICT -> busca Empresas/Investidores/Providers
  // Se for Empresa/Provider -> busca Inventores/ICTs
  const targetRoles = (projectType === 'inventor' || projectType === 'ict')
    ? ["company", "investor", "provider"]
    : ["ict", "provider"]; // Se for empresa buscando, busca centros de pesquisa e parceiros
  
  const snapshot = await db
    .collection("users")
    .where("role", "in", targetRoles)
    .where("segments", "array-contains", segment)
    .limit(10)
    .get();

  const matches: any[] = [];

  snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
    const org = doc.data() as Organization;
    org.id = doc.id;
    
    // Calcula o match assumindo que o input é um projeto válido o suficiente
    const result = calculateMatch(inputProject as Project, org);
    
    if (result.score >= 40) { // Preview generoso
      let maskedName = "Parceiro Estratégico";
      if (org.role === "investor") maskedName = "Investidor Anjo";
      else if (org.role === "ict") maskedName = "Centro de Pesquisa / ICT";
      else if (org.role === "company") maskedName = "Empresa do Setor";
      else if (org.role === "provider") maskedName = "Prestador de Serviços";

      matches.push({
        id: org.id,
        score: result.score,
        name: maskedName,
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
