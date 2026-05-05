import {
  collection,
  getDocs,
  query,
  where
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
