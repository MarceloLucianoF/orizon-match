"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onProjectCreated = void 0;
const functions = require("firebase-functions");
const match_service_1 = require("./services/match.service");
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