const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function inspect() {
  const usersSnap = await db.collection("users").limit(1).get();
  console.log("=== SAMPLE USER ===");
  usersSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });

  const projectsSnap = await db.collection("projects").limit(1).get();
  console.log("\n=== SAMPLE PROJECT ===");
  projectsSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });

  const matchesSnap = await db.collection("matches").limit(1).get();
  console.log("\n=== SAMPLE MATCH ===");
  matchesSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

inspect().catch(console.error);
