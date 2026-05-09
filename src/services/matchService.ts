import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase/config";
import { calculateMatch } from "../lib/matching";

/**
 * CONSULTAR MATCHES (DASHBOARD)
 */
export async function getMatches(projectId: string) {
  const q = query(
    collection(db, "matches"),
    where("ownerProjectId", "==", projectId)
  );

  const snapshot = await getDocs(q);

  const matches = await Promise.all(snapshot.docs.map(async (matchDoc) => {
    const data = matchDoc.data();
    let stats = { views: 0, saves: 0, ndaRequests: 0 };
    let recalculatedScore = data.score;
    let recalculatedBreakdown = data.breakdown;
    let isVdrReady = false;

    if (data.targetProjectId) {
      try {
        const targetProjDoc = await getDoc(doc(db, "projects", data.targetProjectId));
        if (targetProjDoc.exists()) {
          const projData = targetProjDoc.data();
          stats = projData.stats || stats;
          isVdrReady = projData.isVdrReady || (projData.dueDiligenceProgress === 100);

          // Get Target User Data to understand their Role and Preferences
          const targetUserDoc = await getDoc(doc(db, "users", data.targetUserId));
          if (targetUserDoc.exists()) {
            const targetUserData = targetUserDoc.data();
            
            // Fetch the Project Owner Data to get TRL/IRL/VDR
            const ownerProjDoc = await getDoc(doc(db, "projects", data.ownerProjectId));
            if (ownerProjDoc.exists()) {
              const ownerProjData = ownerProjDoc.data();
              const result = calculateMatch(ownerProjData, { ...targetUserData, id: data.targetUserId });
              recalculatedScore = result.score;
              recalculatedBreakdown = result.breakdown;
            }
          }
        }
      } catch(e) {
        console.error("Error fetching target project for match", e);
      }
    }

    return {
      id: matchDoc.id,
      ...data,
      score: recalculatedScore,
      breakdown: recalculatedBreakdown,
      targetStats: stats,
      isVdrReady
    };
  }));

  return matches;
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
