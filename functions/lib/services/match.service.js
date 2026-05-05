"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMatches = generateMatches;
const firebase_1 = require("../firebase");
const engine_1 = require("../matching/engine");
async function generateMatches(newProject) {
    const snapshot = await firebase_1.db
        .collection("projects")
        .where("segment", "==", newProject.segment) // 🔥 pré-filtro 1
        .where("type", "!=", newProject.type) // 🔥 pré-filtro 2 (direcionado)
        // Firestore requer orderBy no campo da desigualdade antes de outros orderBys
        .orderBy("type")
        .orderBy("createdAt", "desc") // 🔥 incremental / recência
        .limit(30)
        .get();
    console.log("MATCH:", {
        project: newProject.id,
        compared: snapshot.size,
    });
    const batch = firebase_1.db.batch();
    snapshot.forEach((doc) => {
        const other = Object.assign({ id: doc.id }, doc.data());
        if (other.id === newProject.id)
            return;
        if (!(0, engine_1.isValidPair)(newProject, other))
            return;
        const result = (0, engine_1.calculateMatch)(newProject, other);
        if (result.score < 60)
            return;
        // 🔐 evita duplicidade
        const matchId = [newProject.id, other.id].sort().join("_");
        const ref = firebase_1.db.collection("matches").doc(matchId);
        batch.set(ref, {
            pairId: matchId,
            ownerProjectId: newProject.id,
            targetProjectId: other.id,
            score: result.score,
            breakdown: result.breakdown,
            createdAt: Date.now(),
        });
    });
    await batch.commit();
}
//# sourceMappingURL=match.service.js.map