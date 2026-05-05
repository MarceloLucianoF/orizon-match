import * as functions from "firebase-functions";
import { generateMatches } from "./services/match.service";
import { getPreviewMatches } from "./services/preview.service";

export const previewMatches = functions.https.onCall(async (data, context) => {
  try {
    return await getPreviewMatches(data);
  } catch (error) {
    console.error("Erro no previewMatches:", error);
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

    console.log("🚀 Novo projeto:", project.id);

    await generateMatches(project);

    console.log("✅ Matches gerados");
  });
