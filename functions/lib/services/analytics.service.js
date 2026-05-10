"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordProjectView = recordProjectView;
exports.recordMatchCreated = recordMatchCreated;
const admin = __importStar(require("firebase-admin"));
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