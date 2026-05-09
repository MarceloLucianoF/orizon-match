const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupUser(email) {
  try {
    console.log(`🔍 Buscando usuário com email: ${email}...`);
    // Busca o UID do usuário que você criou lá no painel de Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    console.log(`✅ Usuário encontrado! UID: ${uid}`);
    console.log(`💾 Salvando no Firestore...`);

    // Aqui usamos o exemplo de uma ICT (Universidade), 
    // assim você pode ver todos os seus projetos e receber matches das empresas!
    const userData = {
      id: uid,
      email: email,
      name: "Administrador / Teste (ICT)",
      role: "ict",
      type: "ict",
      segments: ["saude", "tecnologia", "agronegocio", "energia", "industria"], // Coloquei todos para dar match fácil
      interests: {
        investment: false,
        research: true,
        industry: true,
      },
      location: { region: "SP" },
      createdAt: Date.now(),
    };

    await db.collection("users").doc(uid).set(userData);
    console.log(`🎉 Sucesso! Seu usuário foi registrado no banco com a role 'ict'.`);
    console.log(`👉 Agora você pode fazer login na plataforma e testar o fluxo de matches.`);

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Erro: Nenhum usuário encontrado no Firebase Auth com o email '${email}'.`);
    } else {
      console.error("❌ Erro inesperado:", error);
    }
  }
}

// Pega o email dos argumentos da linha de comando
const email = process.argv[2];
if (!email) {
  console.log("⚠️ Uso correto: node scripts/setup_user.cjs <seu_email_aqui>");
  process.exit(1);
}

setupUser(email);
