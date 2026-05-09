"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancePitch = exports.onProjectCreated = exports.previewMatches = void 0;
const functions = require("firebase-functions");
const match_service_1 = require("./services/match.service");
const preview_service_1 = require("./services/preview.service");
const openai_1 = require("openai");
exports.previewMatches = functions.https.onCall(async (data, context) => {
    try {
        return await (0, preview_service_1.getPreviewMatches)(data);
    }
    catch (error) {
        console.error("Erro no previewMatches:", error);
        throw new functions.https.HttpsError("internal", "Erro ao gerar preview de matches");
    }
});
exports.onProjectCreated = functions.firestore
    .document("projects/{projectId}")
    .onCreate(async (snap) => {
    const data = snap.data();
    const project = Object.assign({ id: snap.id }, data);
    console.log("🚀 Novo projeto:", project.id);
    await (0, match_service_1.generateMatches)(project);
    console.log("✅ Matches gerados");
});
exports.enhancePitch = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const { problem, solution, difference } = data;
    if (!problem || !solution || !difference) {
        throw new functions.https.HttpsError("invalid-argument", "Dados incompletos");
    }
    try {
        const openai = new openai_1.default({
            apiKey: process.env.NVIDIA_NIM_API_KEY || "dummy",
            baseURL: "https://integrate.api.nvidia.com/v1",
        });
        const completion = await openai.chat.completions.create({
            model: "meta/llama3-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: "Você é um especialista em inovação B2B. Sua tarefa é transformar as respostas do inventor em um 'Executive Summary' de alto impacto, profissional e objetivo, adequado para investidores e empresas parceiras. Não use jargões desnecessários. Crie um texto único, coeso e persuasivo (máximo de 3 parágrafos). Não inclua saudações, vá direto ao texto.",
                },
                {
                    role: "user",
                    content: `Problema: ${problem}\nSolução: ${solution}\nDiferencial: ${difference}`,
                },
            ],
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
        });
        return {
            summary: ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "",
        };
    }
    catch (error) {
        console.error("Erro ao gerar pitch:", error);
        throw new functions.https.HttpsError("internal", "Erro ao comunicar com a IA");
    }
});
//# sourceMappingURL=index.js.map