"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreviewMatches = getPreviewMatches;
const firebase_1 = require("../firebase");
const engine_1 = require("../matching/engine");
async function getPreviewMatches(inputProject) {
    const segment = inputProject.segment || "tecnologia";
    const snapshot = await firebase_1.db
        .collection("users")
        .where("role", "in", ["company", "investor"])
        .where("segments", "array-contains", segment)
        .limit(10)
        .get();
    const matches = [];
    snapshot.forEach((doc) => {
        const org = Object.assign({ id: doc.id }, doc.data());
        // Calcula o match assumindo que o input é um projeto válido o suficiente
        const result = (0, engine_1.calculateMatch)(inputProject, org);
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
//# sourceMappingURL=preview.service.js.map