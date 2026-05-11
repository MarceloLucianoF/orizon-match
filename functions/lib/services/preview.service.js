"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreviewMatches = getPreviewMatches;
const firebase_1 = require("../firebase");
const engine_1 = require("../matching/engine");
async function getPreviewMatches(inputProject) {
    const segment = inputProject.segment || "tecnologia";
    const projectType = inputProject.type || 'inventor';
    // Lógica Bidirecional:
    // Se for Inventor/ICT -> busca Empresas/Investidores/Providers
    // Se for Empresa/Provider -> busca Inventores/ICTs
    const targetRoles = (projectType === 'inventor' || projectType === 'ict')
        ? ["company", "investor", "provider"]
        : ["ict", "provider"]; // Se for empresa buscando, busca centros de pesquisa e parceiros
    const snapshot = await firebase_1.db
        .collection("users")
        .where("role", "in", targetRoles)
        .where("segments", "array-contains", segment)
        .limit(10)
        .get();
    const matches = [];
    snapshot.forEach((doc) => {
        const org = doc.data();
        org.id = doc.id;
        // Calcula o match assumindo que o input é um projeto válido o suficiente
        const result = (0, engine_1.calculateMatch)(inputProject, org);
        if (result.score >= 40) { // Preview generoso
            let maskedName = "Parceiro Estratégico";
            if (org.role === "investor")
                maskedName = "Investidor Anjo";
            else if (org.role === "ict")
                maskedName = "Centro de Pesquisa / ICT";
            else if (org.role === "company")
                maskedName = "Empresa do Setor";
            else if (org.role === "provider")
                maskedName = "Prestador de Serviços";
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
//# sourceMappingURL=preview.service.js.map