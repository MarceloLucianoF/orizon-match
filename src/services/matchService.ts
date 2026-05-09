import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase/config";
/**
 * 🔍 CONSULTAR MATCHES (DASHBOARD)
 */
export async function getMatches(projectId: string) {
  const q = query(
    collection(db, "matches"),
    where("ownerProjectId", "==", projectId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateMatchAction(matchId: string, userId: string, action: 'save' | 'ignore' | 'reset') {
  const matchRef = doc(db, "matches", matchId);
  
  if (action === 'save') {
    await updateDoc(matchRef, {
      savedBy: arrayUnion(userId),
      ignoredBy: arrayRemove(userId)
    });
  } else if (action === 'ignore') {
    await updateDoc(matchRef, {
      ignoredBy: arrayUnion(userId),
      savedBy: arrayRemove(userId)
    });
  } else if (action === 'reset') {
    await updateDoc(matchRef, {
      savedBy: arrayRemove(userId),
      ignoredBy: arrayRemove(userId)
    });
  }
}
