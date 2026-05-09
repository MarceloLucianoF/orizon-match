"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onProjectCreated = exports.previewMatches = void 0;
const functions = require("firebase-functions");
const match_service_1 = require("./services/match.service");
const preview_service_1 = require("./services/preview.service");
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
//# sourceMappingURL=index.js.map