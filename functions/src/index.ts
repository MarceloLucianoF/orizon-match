import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateMatches } from "./services/match.service";
import { getPreviewMatches } from "./services/preview.service";
import { recordProjectView, recordMatchCreated } from "./services/analytics.service";
import OpenAI from "openai";
import cors from "cors";
const corsHandler = cors({ origin: true });
import { createCheckoutSession as createStripeSession, createPortalSession as createStripePortal, handleWebhook } from "./services/stripe.service";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Secrets
// Note: functions.runWith() is used in the exports themselves to specify secrets

export const getMatchesPreview = functions.region("us-central1").https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // No onRequest, o corpo vem em req.body diretamente
      const result = await getPreviewMatches(req.body.data || req.body);
      res.status(200).json({ data: result });
    } catch (error: any) {
      console.error("Error on previewMatches:", error);
      res.status(500).json({ 
        error: {
          message: error.message || "Erro ao gerar preview de matches",
          status: "INTERNAL"
        }
      });
    }
  });
});

import { createNotification } from "./services/notifications.service";

export const onProjectCreated = functions.region("us-central1").firestore
  .document("projects/{projectId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const project = { id: snap.id, ...data } as any;

    await generateMatches(project);
    await recordMatchCreated(snap.id);

    // Notificar o admin (opcional) ou o próprio inventor confirmando
    await createNotification({
      userId: project.userId,
      title: "Projeto Criado! 🚀",
      message: `Seu projeto "${project.title}" foi publicado. Estamos buscando matches industriais agora mesmo.`,
      type: "system",
      link: "/app/dashboard"
    });
  });

export const onMatchCreated = functions.region("us-central1").firestore
  .document("matches/{matchId}")
  .onCreate(async (snap) => {
    const match = snap.data();
    
    // Notificar o dono do projeto
    // Precisamos buscar o userId do dono do projeto se não estiver no match
    const projectDoc = await db.collection("projects").doc(match.ownerProjectId).get();
    const projectData = projectDoc.data();

    if (projectData) {
      await createNotification({
        userId: projectData.userId,
        title: "Novo Match Identificado! ⚡",
        message: `Encontramos uma oportunidade com ${match.score}% de afinidade para o seu projeto.`,
        type: "match",
        link: "/app/match-history"
      });
    }

    // Notificar a empresa alvo
    await createNotification({
      userId: match.targetProjectId, // assumindo que targetProjectId é o UID da empresa/investidor
      title: "Novo Projeto no seu Radar! 🎯",
      message: `Um novo projeto alinhado com sua tese de investimento acaba de entrar na plataforma.`,
      type: "match",
      link: "/app/match-history"
    });
  });

export const recordView = functions.region("us-central1").https.onCall(async (data, context) => {
  const { projectId } = data;
  if (!projectId) throw new functions.https.HttpsError("invalid-argument", "projectId is required");
  
  try {
    await recordProjectView(projectId);
    return { success: true };
  } catch (error) {
    console.error("Error recording view:", error);
    throw new functions.https.HttpsError("internal", "Erro ao registrar visualização");
  }
});

export const enhancePitch = functions.region("us-central1").runWith({ 
  secrets: ["NVIDIA_NIM_API_KEY"],
  timeoutSeconds: 60,
  memory: "256MB" 
}).https.onCall(async (data, context) => {
  const { problem, solution, difference } = data;
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const userId = context.auth?.uid || "anonymous";

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

    const openai = new OpenAI({
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

    const summary = completion.choices[0]?.message?.content || "";

    // Log success
    await db.collection("logs_ai").add({
      userId,
      timestamp,
      status: "success",
      input: { problem, solution, difference },
      output: summary
    });

    return { summary };
  } catch (error: any) {
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

    if (error.status === 401 || error.message?.includes("API key")) {
      throw new functions.https.HttpsError("unauthenticated", "Chave de API da NVIDIA não configurada ou inválida. Verifique os Secrets no Firebase.");
    }

    throw new functions.https.HttpsError("internal", error.message || "Erro ao comunicar com a IA");
  }
});

// ====================================================
// B2: Email transacional — Convite Jurídico via Resend
// ====================================================
import { Resend } from "resend";
import { legalInviteEmail } from "./emailTemplates";

export const onLegalInviteCreated = functions.region("us-central1").runWith({
  secrets: ["RESEND_API_KEY"]
}).firestore
  .document("legal_invites/{inviteId}")
  .onCreate(async (snap) => {
    const invite = snap.data();
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured. Skipping email.");
      return;
    }

    try {
      // Fetch inviter profile
      const inviterDoc = await db.collection("users").doc(invite.invitedBy).get();
      const inviterName = inviterDoc.data()?.name || "Um inventor";

      const inviteLink = `https://orizon-match.web.app/onboarding?ref=legal&invite=${snap.id}`;

      const { subject, html } = legalInviteEmail({
        inviterName,
        projectTitle: invite.projectTitle || "Projeto Confidencial",
        message: invite.message,
        inviteLink,
      });

      const resend = new Resend(resendApiKey);

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
      await createNotification({
        userId: "nqBV3Da1iqPbU46jGvO1ljBbIze2", // Admin UID
        title: "Novo Convite Jurídico ⚖️",
        message: `${inviterName} enviou um convite para ${invite.email}`,
        type: "invite",
        link: "/app/admin-panel"
      });

      console.log(`Legal invite email sent to ${invite.email}`);
    } catch (error: any) {
      console.error("Error sending legal invite email:", error);
      await snap.ref.update({ emailError: error.message || "Unknown error" });
    }
  });

// ====================================================
// FASE B: Monetização com Stripe
// ====================================================

export const createCheckoutSession = functions.region("us-central1").runWith({
  secrets: ["STRIPE_SECRET_KEY"]
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Apenas usuários logados podem assinar.");
  }

  const { priceId } = data;
  if (!priceId) {
    throw new functions.https.HttpsError("invalid-argument", "priceId é obrigatório.");
  }

  try {
    return await createStripeSession(context.auth.uid, context.auth.token.email || "", priceId);
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const createPortalSession = functions.region("us-central1").runWith({
  secrets: ["STRIPE_SECRET_KEY"]
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Apenas usuários logados podem gerenciar faturamento.");
  }

  try {
    return await createStripePortal(context.auth.uid);
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const stripeWebhook = functions.region("us-central1").runWith({
  secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
}).https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).send("Webhook Error: Missing signature");
    return;
  }

  try {
    const result = await handleWebhook(req.rawBody, sig as string);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

