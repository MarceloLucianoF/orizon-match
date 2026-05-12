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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteUser = exports.adminCreateUser = exports.generateProjectReport = exports.stripeWebhook = exports.createPortalSession = exports.createCheckoutSession = exports.onLegalInviteCreated = exports.enhancePitch = exports.recordView = exports.onMatchCreated = exports.onProjectCreated = exports.getMatchesPreview = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const match_service_1 = require("./services/match.service");
const preview_service_1 = require("./services/preview.service");
const analytics_service_1 = require("./services/analytics.service");
const report_service_1 = require("./services/report.service");
const openai_1 = __importDefault(require("openai"));
const stripe_service_1 = require("./services/stripe.service");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Secrets
// Note: functions.runWith() is used in the exports themselves to specify secrets
exports.getMatchesPreview = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
    // Configuração manual de CORS para máxima compatibilidade em southamerica-east1
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const result = await (0, preview_service_1.getPreviewMatches)(req.body.data || req.body);
        res.status(200).json({ data: result });
    }
    catch (error) {
        console.error("Error on previewMatches:", error);
        res.status(500).json({
            error: {
                message: error.message || "Erro ao gerar preview de matches",
                status: "INTERNAL"
            }
        });
    }
});
const notifications_service_1 = require("./services/notifications.service");
exports.onProjectCreated = functions.region("southamerica-east1").firestore
    .document("projects/{projectId}")
    .onCreate(async (snap) => {
    const data = snap.data();
    const project = Object.assign({ id: snap.id }, data);
    await (0, match_service_1.generateMatches)(project);
    await (0, analytics_service_1.recordMatchCreated)(snap.id);
    // Notificar o admin (opcional) ou o próprio inventor confirmando
    await (0, notifications_service_1.createNotification)({
        userId: project.userId,
        title: "Projeto Criado! 🚀",
        message: `Seu projeto "${project.title}" foi publicado. Estamos buscando matches industriais agora mesmo.`,
        type: "system",
        link: "/app/dashboard"
    });
});
exports.onMatchCreated = functions.region("southamerica-east1").firestore
    .document("matches/{matchId}")
    .onCreate(async (snap) => {
    const match = snap.data();
    // Notificar o dono do projeto
    // Precisamos buscar o userId do dono do projeto se não estiver no match
    const projectDoc = await db.collection("projects").doc(match.ownerProjectId).get();
    const projectData = projectDoc.data();
    if (projectData) {
        await (0, notifications_service_1.createNotification)({
            userId: projectData.userId,
            title: "Novo Match Identificado! ⚡",
            message: `Encontramos uma oportunidade com ${match.score}% de afinidade para o seu projeto.`,
            type: "match",
            link: "/app/match-history"
        });
    }
    // Notificar a empresa alvo
    await (0, notifications_service_1.createNotification)({
        userId: match.targetProjectId, // assumindo que targetProjectId é o UID da empresa/investidor
        title: "Novo Projeto no seu Radar! 🎯",
        message: `Um novo projeto alinhado com sua tese de investimento acaba de entrar na plataforma.`,
        type: "match",
        link: "/app/match-history"
    });
});
exports.recordView = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const { projectId } = req.body.data || req.body;
        if (!projectId) {
            res.status(400).json({ error: { message: "projectId is required" } });
            return;
        }
        await (0, analytics_service_1.recordProjectView)(projectId);
        res.status(200).json({ data: { success: true } });
    }
    catch (error) {
        console.error("Error recording view:", error);
        res.status(500).json({ error: { message: "Erro ao registrar visualização" } });
    }
});
exports.enhancePitch = functions.region("southamerica-east1").runWith({
    secrets: ["NVIDIA_NIM_API_KEY"],
    timeoutSeconds: 60,
    memory: "256MB"
}).https.onRequest(async (req, res) => {
    var _a, _b, _c;
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const { problem, solution, difference, userId: providedUserId } = req.body.data || req.body;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const userId = providedUserId || "anonymous";
    if (!problem || !solution || !difference) {
        await db.collection("logs_ai").add({
            userId,
            timestamp,
            error: "Dados incompletos",
            input: { problem, solution, difference }
        });
        res.status(400).json({ error: { message: "Dados incompletos" } });
        return;
    }
    try {
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: { message: "API Key da NVIDIA não configurada." } });
            return;
        }
        const openai = new openai_1.default({
            apiKey,
            baseURL: "https://integrate.api.nvidia.com/v1",
        });
        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
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
        const summary = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
        // Log success
        await db.collection("logs_ai").add({
            userId,
            timestamp,
            status: "success",
            input: { problem, solution, difference },
            output: summary
        });
        res.status(200).json({ data: { summary } });
    }
    catch (error) {
        console.error("Error generating pitch:", error);
        // Log error
        await db.collection("logs_ai").add({
            userId,
            timestamp,
            status: "error",
            error: error.message || "Unknown error",
            stack: error.stack,
            input: { problem, solution, difference }
        });
        if (error.status === 401 || ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes("API key"))) {
            res.status(401).json({ error: { message: "Chave de API da NVIDIA não configurada ou inválida." } });
            return;
        }
        res.status(500).json({ error: { message: error.message || "Erro ao comunicar com a IA" } });
    }
});
// ====================================================
// B2: Email transacional — Convite Jurídico via Resend
// ====================================================
const resend_1 = require("resend");
const emailTemplates_1 = require("./emailTemplates");
exports.onLegalInviteCreated = functions.region("southamerica-east1").runWith({
    secrets: ["RESEND_API_KEY"]
}).firestore
    .document("legal_invites/{inviteId}")
    .onCreate(async (snap) => {
    var _a;
    const invite = snap.data();
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        console.warn("RESEND_API_KEY not configured. Skipping email.");
        return;
    }
    try {
        // Fetch inviter profile
        const inviterDoc = await db.collection("users").doc(invite.invitedBy).get();
        const inviterName = ((_a = inviterDoc.data()) === null || _a === void 0 ? void 0 : _a.name) || "Um inventor";
        const inviteLink = `https://orizon-match.web.app/onboarding?ref=legal&invite=${snap.id}`;
        const { subject, html } = (0, emailTemplates_1.legalInviteEmail)({
            inviterName,
            projectTitle: invite.projectTitle || "Projeto Confidencial",
            message: invite.message,
            inviteLink,
        });
        const resend = new resend_1.Resend(resendApiKey);
        await resend.emails.send({
            from: "Orizon Match <onboarding@resend.dev>",
            to: invite.email,
            subject,
            html,
        });
        // Mark invite as email_sent
        await snap.ref.update({ emailSent: true, emailSentAt: admin.firestore.FieldValue.serverTimestamp() });
        // NOTIFICATION for the invited office (if they are already in system)
        // This is a placeholder since we don't have their UID yet, but we could notify the admin
        await (0, notifications_service_1.createNotification)({
            userId: "nqBV3Da1iqPbU46jGvO1ljBbIze2", // Admin UID
            title: "Novo Convite Jurídico ⚖️",
            message: `${inviterName} enviou um convite para ${invite.email}`,
            type: "invite",
            link: "/app/admin-panel"
        });
        console.log(`Legal invite email sent to ${invite.email}`);
    }
    catch (error) {
        console.error("Error sending legal invite email:", error);
        await snap.ref.update({ emailError: error.message || "Unknown error" });
    }
});
// ====================================================
// FASE B: Monetização com Stripe
// ====================================================
exports.createCheckoutSession = functions.region("southamerica-east1").runWith({
    secrets: ["STRIPE_SECRET_KEY"]
}).https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const { priceId, userId, email } = req.body.data || req.body;
        if (!priceId) {
            res.status(400).json({ error: { message: "priceId é obrigatório." } });
            return;
        }
        const result = await (0, stripe_service_1.createCheckoutSession)(userId, email, priceId);
        res.status(200).json({ data: result });
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});
exports.createPortalSession = functions.region("southamerica-east1").runWith({
    secrets: ["STRIPE_SECRET_KEY"]
}).https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const { userId } = req.body.data || req.body;
        if (!userId) {
            res.status(400).json({ error: { message: "userId é obrigatório." } });
            return;
        }
        const result = await (0, stripe_service_1.createPortalSession)(userId);
        res.status(200).json({ data: result });
    }
    catch (error) {
        console.error("Error creating portal session:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});
exports.stripeWebhook = functions.region("southamerica-east1").runWith({
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
}).https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        res.status(400).send("Webhook Error: Missing signature");
        return;
    }
    try {
        const result = await (0, stripe_service_1.handleWebhook)(req.rawBody, sig);
        res.status(200).json(result);
    }
    catch (err) {
        console.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});
exports.generateProjectReport = functions.region("southamerica-east1").runWith({
    secrets: ["NVIDIA_NIM_API_KEY"],
    timeoutSeconds: 120,
    memory: "512MB"
}).https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const { projectId } = req.body.data || req.body;
        if (!projectId) {
            res.status(400).json({ error: { message: "projectId é obrigatório" } });
            return;
        }
        const report = await (0, report_service_1.generateIntelligenceReport)(projectId);
        res.status(200).json({ data: { report } });
    }
    catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ error: { message: error.message || "Erro ao gerar relatório" } });
    }
});
exports.adminCreateUser = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
    var _a;
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: { message: "Não autorizado." } });
            return;
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const callerDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            res.status(403).json({ error: { message: "Apenas administradores podem criar usuários." } });
            return;
        }
        const { email, password, displayName, role } = req.body.data || req.body;
        if (!email || !password) {
            res.status(400).json({ error: { message: "Email e senha são obrigatórios." } });
            return;
        }
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
        });
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            name: displayName || "Novo Usuário",
            email,
            role: role || "user",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ data: { uid: userRecord.uid, message: "Usuário criado com sucesso." } });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: { message: error.message || "Erro ao criar usuário." } });
    }
});
exports.adminDeleteUser = functions.region("southamerica-east1").https.onRequest(async (req, res) => {
    var _a;
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: { message: "Não autorizado." } });
            return;
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const callerDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            res.status(403).json({ error: { message: "Apenas administradores podem deletar usuários." } });
            return;
        }
        const { targetUid } = req.body.data || req.body;
        if (!targetUid) {
            res.status(400).json({ error: { message: "UID alvo é obrigatório." } });
            return;
        }
        if (targetUid === decodedToken.uid) {
            res.status(400).json({ error: { message: "Você não pode deletar a si mesmo por esta API." } });
            return;
        }
        // 1. Apagar no Firebase Auth
        await admin.auth().deleteUser(targetUid);
        // 2. Apagar no Firestore (Cascade Delete)
        const batch = db.batch();
        const userRef = db.collection("users").doc(targetUid);
        batch.delete(userRef);
        const projectsSnapshot = await db.collection("projects").where("userId", "==", targetUid).get();
        projectsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        const assetsSnapshot = await db.collection("assets").where("userId", "==", targetUid).get();
        assetsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        // Matches
        const ownerMatches = await db.collection("matches").where("ownerUserId", "==", targetUid).get();
        ownerMatches.docs.forEach((doc) => batch.delete(doc.ref));
        const targetMatches = await db.collection("matches").where("targetUserId", "==", targetUid).get();
        targetMatches.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        res.status(200).json({ data: { message: "Usuário deletado com sucesso." } });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: { message: error.message || "Erro ao deletar usuário." } });
    }
});
//# sourceMappingURL=index.js.map