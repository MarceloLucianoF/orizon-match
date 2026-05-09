import { db } from "../firebase";
import { calculateMatch, isValidPair } from "../matching/engine";
import { Project, Organization } from "../types/project";
import * as admin from "firebase-admin";

export async function generateMatches(newProject: Project) {
  const snapshot = await db
    .collection("users")
    .where("role", "in", ["company", "investor"])
    .where("segments", "array-contains", newProject.segment) // 🔥 pré-filtro
    .limit(30)
    .get();

  console.log("MATCH:", {
    project: newProject.id,
    compared: snapshot.size,
  });

  const batch = db.batch();

  snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
    const other = { id: doc.id, ...doc.data() } as Organization;

    if (!isValidPair(newProject, other)) return;

    const result = calculateMatch(newProject, other);

    if (result.score < 60) return;

    // 🔐 evita duplicidade
    const matchId = [newProject.id, other.id].sort().join("_");

    const ref = db.collection("matches").doc(matchId);

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
