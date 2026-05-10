"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLegalInviteCreated = exports.enhancePitch = exports.recordView = exports.onMatchCreated = exports.onProjectCreated = exports.previewMatches = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const match_service_1 = require("./services/match.service");
const preview_service_1 = require("./services/preview.service");
const analytics_service_1 = require("./services/analytics.service");
const openai_1 = require("openai");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Secrets
// Note: functions.runWith() is used in the exports themselves to specify secrets
exports.previewMatches = functions.https.onCall(async (data, context) => {
    try {
        return await (0, preview_service_1.getPreviewMatches)(data);
    }
    catch (error) {
        console.error("Error on previewMatches:", error);
        throw new functions.https.HttpsError("internal", "Erro ao gerar preview de matches");
    }
});
const notifications_service_1 = require("./services/notifications.service");
exports.onProjectCreated = functions.firestore
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
exports.onMatchCreated = functions.firestore
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
exports.recordView = functions.region("us-central1").https.onCall(async (data, context) => {
    const { projectId } = data;
    if (!projectId)
        throw new functions.https.HttpsError("invalid-argument", "projectId is required");
    try {
        await (0, analytics_service_1.recordProjectView)(projectId);
        return { success: true };
    }
    catch (error) {
        console.error("Error recording view:", error);
        throw new functions.https.HttpsError("internal", "Erro ao registrar visualização");
    }
});
exports.enhancePitch = functions.region("us-central1").runWith({
    secrets: ["NVIDIA_NIM_API_KEY"],
    timeoutSeconds: 60,
    memory: "256MB"
}).https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    const { problem, solution, difference } = data;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const userId = ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid) || "anonymous";
    if (!problem || !solution || !difference) {
        await db.collection("logs_ai").add({
            userId,
            timestamp,
            error: "Dados incompletos",
            input: { problem, solution, difference }
        });
        throw new functions.https.HttpsError("invalid-argument", "Dados incompletos");
    }
    try {
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
        if (!apiKey) {
            throw new functions.https.HttpsError("failed-precondition", "API Key da NVIDIA não configurada.");
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
        const summary = ((_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
        // Log success
        await db.collection("logs_ai").add({
            userId,
            timestamp,
            status: "success",
            input: { problem, solution, difference },
            output: summary
        });
        return { summary };
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
        if (error.status === 401 || ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes("API key"))) {
            throw new functions.https.HttpsError("unauthenticated", "Chave de API da NVIDIA não configurada ou inválida. Verifique os Secrets no Firebase.");
        }
        throw new functions.https.HttpsError("internal", error.message || "Erro ao comunicar com a IA");
    }
});
// ====================================================
// B2: Email transacional — Convite Jurídico via Resend
// ====================================================
const resend_1 = require("resend");
const emailTemplates_1 = require("./emailTemplates");
exports.onLegalInviteCreated = functions.runWith({
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
//# sourceMappingURL=index.js.map