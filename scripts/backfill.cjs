const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function calculateMatch(a, b) {
  let score = 0;

  const breakdown = {
    segment: 0,
    maturity: 0,
    needs: 0,
    location: 0,
  };

  breakdown.segment = b.segments && b.segments.includes(a.segment) ? 30 : 10;
  breakdown.maturity = 20;

  if (a.needs && b.interests) {
    if (a.needs.investment && b.interests.investment) breakdown.needs += 20;
    if (a.needs.research && b.interests.research) breakdown.needs += 20;
    if (a.needs.industry && b.interests.industry) breakdown.needs += 20;
  }

  breakdown.location =
    a.location && b.location && a.location.region === b.location.region ? 10 : 5;

  score =
    breakdown.segment +
    breakdown.maturity +
    breakdown.needs +
    breakdown.location;

  return {
    score: Math.min(score, 100),
    breakdown,
  };
}

async function runBackfill() {
  console.log("🚀 Iniciando backfill de matches...");

  const projectsSnap = await db.collection("projects").get();
  const usersSnap = await db.collection("users").where("role", "in", ["company", "investor"]).get();

  const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const batch = db.batch();
  let count = 0;

  for (const project of projects) {
    for (const org of users) {
      // Ignora se for o próprio criador do projeto
      if (project.userId === org.id) continue;
      
      const result = calculateMatch(project, org);

      if (result.score >= 60) {
        const matchId = [project.id, org.id].sort().join("_");
        const ref = db.collection("matches").doc(matchId);

        batch.set(ref, {
          pairId: matchId,
          ownerProjectId: project.id,
          targetProjectId: org.id,
          score: result.score,
          breakdown: result.breakdown,
          createdAt: Date.now(),
        });
        count++;
      }
    }
  }

  await batch.commit();
  console.log(`✅ Backfill concluído! ${count} matches gerados.`);
}

runBackfill().catch(console.error);
