const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Mappings
const roleMapping = {
  company: "industry",
  industria: "industry",
  investidor: "investor",
  juridico: "legal",
  ideia: "inventor",
  idea: "inventor",
};

const innovationTypeMapping = {
  melhoria: "improvement",
  inovacao: "innovation",
};

const statusMapping = {
  rascunho: "draft",
  publicado: "published",
  emmatching: "matching",
  combinado: "matched",
};

const maturityMapping = {
  ideia: "idea",
  idea: "idea",
  prototipo: "prototype",
  prototype: "prototype",
  mvp: "mvp",
  produto: "product",
  product: "product",
};

async function migrate() {
  console.log("Starting Firestore migration...");

  // 1. Migrate USERS
  console.log("Migrating collection: users...");
  const usersSnap = await db.collection("users").get();
  let usersMigratedCount = 0;
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const update = {};

    if (data.role && roleMapping[data.role]) {
      update.role = roleMapping[data.role];
    }
    if (data.type && roleMapping[data.type]) {
      update.type = roleMapping[data.type];
    }
    if (data.tipo && roleMapping[data.tipo]) {
      update.tipo = roleMapping[data.tipo];
    }

    if (Object.keys(update).length > 0) {
      await doc.ref.update(update);
      usersMigratedCount++;
    }
  }
  console.log(`Successfully migrated ${usersMigratedCount} user documents.`);

  // 2. Migrate PROJECTS
  console.log("Migrating collection: projects...");
  const projectsSnap = await db.collection("projects").get();
  let projectsMigratedCount = 0;
  for (const doc of projectsSnap.docs) {
    const data = doc.data();
    const update = {};

    // Map innovationType
    if (data.innovationType && innovationTypeMapping[data.innovationType]) {
      update.innovationType = innovationTypeMapping[data.innovationType];
    }
    if (data.tipo && innovationTypeMapping[data.tipo]) {
      update.tipo = innovationTypeMapping[data.tipo];
    }

    // Map status
    if (data.status && statusMapping[data.status]) {
      update.status = statusMapping[data.status];
    }

    // Map maturity/maturidade (if strings)
    if (data.maturity && typeof data.maturity === "string" && maturityMapping[data.maturity]) {
      update.maturity = maturityMapping[data.maturity];
    }
    if (data.maturidade && typeof data.maturidade === "string" && maturityMapping[data.maturidade]) {
      update.maturidade = maturityMapping[data.maturidade];
    }

    // Map project type if it uses role strings
    if (data.type && roleMapping[data.type]) {
      // Note: for projects, roleMapping maps "idea" to "inventor", but project type might need to be "idea" or "inventor" or "industry" or "ict".
      // Let's be careful: if project type is "company", we map it to "industry".
      if (data.type === "company" || data.type === "industria") {
        update.type = "industry";
      }
    }

    if (Object.keys(update).length > 0) {
      await doc.ref.update(update);
      projectsMigratedCount++;
    }
  }
  console.log(`Successfully migrated ${projectsMigratedCount} project documents.`);

  // 3. Migrate MATCHES
  console.log("Migrating collection: matches...");
  const matchesSnap = await db.collection("matches").get();
  let matchesMigratedCount = 0;
  for (const doc of matchesSnap.docs) {
    const data = doc.data();
    const update = {};

    if (data.status && statusMapping[data.status]) {
      update.status = statusMapping[data.status];
    }
    if (data.role && roleMapping[data.role]) {
      update.role = roleMapping[data.role];
    }
    if (data.type && roleMapping[data.type]) {
      update.type = roleMapping[data.type];
    }

    if (Object.keys(update).length > 0) {
      await doc.ref.update(update);
      matchesMigratedCount++;
    }
  }
  console.log(`Successfully migrated ${matchesMigratedCount} match documents.`);

  console.log("Migration completed successfully!");
}

migrate().catch(error => {
  console.error("Migration failed:", error);
  process.exit(1);
});
