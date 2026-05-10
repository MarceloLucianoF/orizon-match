"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordProjectView = recordProjectView;
exports.recordMatchCreated = recordMatchCreated;
const admin = require("firebase-admin");
const db = admin.firestore();
/**
 * Incrementa as visualizações de um projeto e métricas globais
 */
async function recordProjectView(projectId) {
    const projectRef = db.collection("projects").doc(projectId);
    const globalRef = db.collection("analytics_aggregation").doc("global");
    const batch = db.batch();
    // Incrementa no projeto (para o dashboard do inventor)
    batch.set(projectRef, {
        stats: {
            views: admin.firestore.FieldValue.increment(1),
            lastViewedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }, { merge: true });
    // Incrementa globalmente (para o dashboard do admin)
    batch.set(globalRef, {
        totalViews: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    await batch.commit();
}
/**
 * Registra um novo match para métricas de eficiência
 */
async function recordMatchCreated(matchId) {
    const globalRef = db.collection("analytics_aggregation").doc("global");
    await globalRef.set({
        totalMatchesGenerated: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}
//# sourceMappingURL=analytics.service.js.map