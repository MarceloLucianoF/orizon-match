const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function inspect() {
  const ndasSnap = await db.collection("signed_ndas").get();
  console.log("=== SIGNED NDAS ===");
  ndasSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

inspect().catch(console.error);
