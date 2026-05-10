const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkLogs() {
  console.log("Checking AI logs...");
  const snapshot = await db.collection("logs_ai").orderBy("timestamp", "desc").limit(5).get();
  
  if (snapshot.empty) {
    console.log("No logs found.");
    return;
  }

  snapshot.forEach(doc => {
    console.log("-------------------");
    console.log("ID:", doc.id);
    console.log("Data:", JSON.stringify(doc.data(), null, 2));
  });
}

checkLogs().catch(console.error);
