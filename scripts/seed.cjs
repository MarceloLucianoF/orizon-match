const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const now = Date.now();

// =========================
// 🎯 SEGMENTOS BASE (Sincronizado com FIESC_CHAMBERS)
// =========================
const segments = [
  "Tecnologia e Inovação",
  "Energia",
  "Alimentos e Bebidas",
  "Agroindústria",
  "Construção Civil",
  "Bens de Capital",
  "Transporte e Logística"
];

// =========================
// 👤 USERS (Organizações Reais/Realistas)
// =========================
const users = [
  // ICT / UNIVERSIDADES
  {
    id: "ict_embrapit_ufsc",
    name: "EMBRAPII UFSC - Unidade de Automação Industrial",
    role: "ict",
    type: "ict",
    segments: ["Tecnologia e Inovação", "Bens de Capital"],
    interests: { investment: false, research: true, industry: true },
    location: { region: "Sul" },
    verified: true,
    bio: "Unidade EMBRAPII focada em sistemas de automação e controle industrial inteligente."
  },
  {
    id: "ict_certi",
    name: "Fundação CERTI - Florianópolis",
    role: "ict",
    type: "ict",
    segments: ["Tecnologia e Inovação", "Energia"],
    interests: { investment: false, research: true, industry: true },
    location: { region: "Sul" },
    verified: true,
    bio: "Centro de referência em tecnologia inovadora e fomento ao ecossistema de startups."
  },
  {
    id: "ict_senai_sc",
    name: "SENAI/SC - Instituto de Inovação em Sistemas de Manufatura",
    role: "ict",
    type: "ict",
    segments: ["Bens de Capital", "Tecnologia e Inovação"],
    interests: { investment: false, research: true, industry: true },
    location: { region: "Sul" },
    verified: true,
    bio: "Pesquisa aplicada e desenvolvimento de soluções de manufatura avançada para a indústria."
  },

  // EMPRESAS (INDÚSTRIA / INVESTIDORAS)
  {
    id: "company_weg",
    name: "WEG S.A. - Departamento de Inovação",
    role: "company",
    type: "company",
    segments: ["Energia", "Bens de Capital", "Tecnologia e Inovação"],
    interests: { investment: true, research: true, industry: true },
    location: { region: "Sul" },
    verified: true,
    bio: "Uma das maiores fabricantes de equipamentos elétricos do mundo, focada em eficiência energética."
  },
  {
    id: "company_engie",
    name: "Engie Brasil Energia",
    role: "company",
    type: "company",
    segments: ["Energia", "Tecnologia e Inovação"],
    interests: { investment: true, research: true, industry: false },
    location: { region: "Sul" },
    verified: true,
    bio: "Líder em energia renovável no Brasil, buscando soluções de descarbonização e smart grids."
  },
  {
    id: "company_acate",
    name: "ACATE - Investimentos",
    role: "investor",
    type: "investor",
    segments: ["Tecnologia e Inovação"],
    interests: { investment: true, research: false, industry: false },
    location: { region: "Sul" },
    verified: true,
    bio: "Braço de investimento e aceleração da principal associação de tecnologia de Santa Catarina."
  }
];

// Gerar mais 10 empresas genéricas para volume
for (let i = 0; i < 10; i++) {
  const seg = segments[i % segments.length];
  users.push({
    id: `company_gen_${i}`,
    name: `Indústria ${seg} S.A. #${i+1}`,
    role: "company",
    type: "company",
    segments: [seg],
    interests: { investment: i % 3 === 0, research: true, industry: true },
    location: { region: ["Sul", "Sudeste", "Norte"][i % 3] },
    verified: i % 2 === 0,
    bio: `Empresa atuante no setor de ${seg} buscando parcerias estratégicas.`
  });
}

// =========================
// 📁 PROJECTS (Ideias de Patentes Reais/Realistas)
// =========================
const projects = [
  {
    id: "proj_patente_1",
    title: "Sistema de Monitoramento Preditivo para Motores Industriais",
    summary: "Algoritmo baseado em rede neural para detecção precoce de falhas em motores síncronos de alta potência, reduzindo downtime em 25%.",
    segment: "Tecnologia e Inovação",
    maturity: 7,
    type: "idea",
    innovationType: "melhoria",
    isProtected: true,
    patentNumber: "BR 10 2024 012345-6",
    inpiStatus: "concedida",
    needs: { investment: true, research: true, industry: true },
    location: { region: "Sul" },
    stats: { views: 142, saves: 12 }
  },
  {
    id: "proj_patente_2",
    title: "Gerador Eólico de Pequena Escala com Ímãs de Terras Raras",
    summary: "Novo design de gerador de fluxo axial para aplicação urbana, com eficiência 15% superior aos modelos de mercado.",
    segment: "Energia",
    maturity: 5,
    type: "idea",
    innovationType: "inovacao",
    isProtected: true,
    patentNumber: "BR 20 2023 987654-2",
    inpiStatus: "depositada",
    needs: { investment: true, research: false, industry: true },
    location: { region: "Sudeste" },
    stats: { views: 89, saves: 5 }
  },
  {
    id: "proj_patente_3",
    title: "Revestimento Bioativo para Embalagens de Alimentos",
    summary: "Película biodegradável baseada em quitosana que estende a vida útil de frutas em até 40% sem conservantes químicos.",
    segment: "Alimentos e Bebidas",
    maturity: 4,
    type: "idea",
    innovationType: "inovacao",
    isProtected: false,
    needs: { investment: true, research: true, industry: true },
    location: { region: "Sul" },
    stats: { views: 210, saves: 18 }
  }
];

// Gerar mais 15 projetos genéricos
for (let i = 0; i < 15; i++) {
  const seg = segments[i % segments.length];
  projects.push({
    id: `proj_gen_${i}`,
    title: `Inovação Tecnológica em ${seg} #${i+1}`,
    summary: `Desenvolvimento de solução integrada para otimização de fluxos produtivos no setor de ${seg}.`,
    segment: seg,
    maturity: (i % 6) + 1,
    type: "idea",
    innovationType: i % 2 === 0 ? "melhoria" : "inovacao",
    isProtected: i % 3 !== 0,
    needs: { investment: true, research: i % 2 === 0, industry: true },
    location: { region: ["Sul", "Sudeste", "Centro-Oeste"][i % 3] },
    stats: { views: Math.floor(Math.random() * 100), saves: Math.floor(Math.random() * 10) }
  });
}

// =========================
// 🚀 UTILS
// =========================
async function deleteCollection(collectionPath, batchSize = 10) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

// =========================
// 🚀 EXECUÇÃO
// =========================
async function seed() {
  console.log("🧹 Limpando dados antigos...");
  await deleteCollection("users");
  await deleteCollection("projects");
  await deleteCollection("ndas");
  await deleteCollection("chats");
  await deleteCollection("matches");
  
  console.log("🌱 Populando InovaHelix Match com dados realistas...");

  // Limpar coleções (opcional, mas recomendado para seed limpo)
  // Nota: Em produção, cuidado com isso!
  
  for (const user of users) {
    await db.collection("users").doc(user.id).set({
      ...user,
      createdAt: now,
      email: `${user.id}@inovahelix.test`,
      onboardingComplete: true
    });
  }

  console.log(`✅ ${users.length} Organizações criadas`);

  for (const project of projects) {
    await db.collection("projects").doc(project.id).set({
      ...project,
      userId: users[Math.floor(Math.random() * users.length)].id,
      createdAt: now,
      active: true
    });
  }

  console.log(`✅ ${projects.length} Projetos/Patentes criados`);

  console.log("🎉 Seed finalizado com sucesso!");
}

seed().catch(console.error);