import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateMatches } from "./services/match.service";
import { getPreviewMatches } from "./services/preview.service";
import OpenAI from "openai";

admin.initializeApp();
const db = admin.firestore();

export const previewMatches = functions.https.onCall(async (data, context) => {
  try {
    return await getPreviewMatches(data);
  } catch (error) {
    console.error("Error on previewMatches:", error);
    throw new functions.https.HttpsError("internal", "Erro ao gerar preview de matches");
  }
});

export const onProjectCreated = functions.firestore
  .document("projects/{projectId}")
  .onCreate(async (snap) => {
    const data = snap.data();

    const project = {
      id: snap.id,
      ...data,
    } as any;

    console.log("New project created:", project.id);

    await generateMatches(project);

    console.log("Matches generated successfully");
  });

export const enhancePitch = functions.https.onCall(async (data, context) => {
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
    const openai = new OpenAI({
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
      input: { problem, solution, difference }
    });

    throw new functions.https.HttpsError("internal", "Erro ao comunicar com a IA");
  }
});
