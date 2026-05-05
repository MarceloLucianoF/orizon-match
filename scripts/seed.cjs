const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const now = Date.now();

// =========================
// 🎯 SEGMENTOS BASE
// =========================
const segments = ["agronegocio", "saude", "energia", "industria", "tecnologia"];

// =========================
// 👤 USERS (15 organizações)
// =========================
const users = [
  // INVESTIDORES
  {
    id: "investor_agro_1",
    name: "AgroTech Capital",
    role: "investor",
    type: "investor",
    segments: ["agronegocio"],
    interests: { investment: true, research: false, industry: false },
    location: { region: "SC" },
  },
  {
    id: "investor_health_1",
    name: "BioHealth Ventures",
    role: "investor",
    type: "investor",
    segments: ["saude"],
    interests: { investment: true, research: true, industry: false },
    location: { region: "SP" },
  },
  {
    id: "investor_energy_1",
    name: "Green Energy Fund",
    role: "investor",
    type: "investor",
    segments: ["energia"],
    interests: { investment: true, research: false, industry: false },
    location: { region: "RS" },
  },

  // EMPRESAS (INDÚSTRIA)
  {
    id: "company_agro_1",
    name: "AgroIndústria Sul",
    role: "company",
    type: "company",
    segments: ["agronegocio"],
    interests: { investment: false, research: false, industry: true },
    location: { region: "SC" },
  },
  {
    id: "company_health_1",
    name: "BioFuture Labs",
    role: "company",
    type: "company",
    segments: ["saude"],
    interests: { investment: false, research: true, industry: true },
    location: { region: "SP" },
  },
  {
    id: "company_energy_1",
    name: "Energia Brasil",
    role: "company",
    type: "company",
    segments: ["energia"],
    interests: { investment: false, research: true, industry: true },
    location: { region: "RJ" },
  },

  // ICT / UNIVERSIDADES
  {
    id: "ict_1",
    name: "UFSC Labs",
    role: "ict",
    type: "ict",
    segments: ["agronegocio", "energia"],
    interests: { investment: false, research: true, industry: false },
    location: { region: "SC" },
  },
  {
    id: "ict_2",
    name: "USP Inovação",
    role: "ict",
    type: "ict",
    segments: ["saude", "tecnologia"],
    interests: { investment: false, research: true, industry: false },
    location: { region: "SP" },
  },
];

// completar até 15
for (let i = users.length; i < 15; i++) {
  users.push({
    id: `company_extra_${i}`,
    name: `Empresa ${i}`,
    role: "company",
    type: "company",
    segments: [segments[i % segments.length]],
    interests: {
      investment: false,
      research: true,
      industry: true,
    },
    location: { region: ["SC", "SP", "RS", "MG"][i % 4] },
  });
}

// =========================
// 📁 PROJECTS (20 ideias)
// =========================
const projects = [
  {
    id: "proj_agro_1",
    title: "Redução de desperdício agrícola com IA",
    description: "Solução disruptiva focada em otimização de processos para o setor de agronegocio.",
    segment: "agronegocio",
    maturity: 2,
    needs: { investment: true, research: false, industry: true },
    location: { region: "SC" },
  },
  {
    id: "proj_health_1",
    title: "Diagnóstico médico com IA",
    description: "Solução disruptiva focada em otimização de processos para o setor de saude.",
    segment: "saude",
    maturity: 3,
    needs: { investment: true, research: true, industry: false },
    location: { region: "SP" },
  },
  {
    id: "proj_energy_1",
    title: "Otimização de energia solar",
    description: "Solução disruptiva focada em otimização de processos para o setor de energia.",
    segment: "energia",
    maturity: 2,
    needs: { investment: true, research: false, industry: true },
    location: { region: "RS" },
  },
];

// gerar restante
for (let i = projects.length; i < 20; i++) {
  const seg = segments[i % segments.length];

  projects.push({
    id: `proj_${seg}_${i}`,
    title: `Inovação em ${seg.toUpperCase()} #${i}`,
    description: `Solução disruptiva focada em otimização de processos para o setor de ${seg}.`,
    segment: seg,
    maturity: (i % 9) + 1,
    needs: {
      investment: i % 2 === 0,
      research: i % 3 === 0,
      industry: i % 2 !== 0,
    },
    location: { region: ["SC", "SP", "RS", "MG"][i % 4] },
  });
}

// =========================
// 🚀 EXECUÇÃO
// =========================
async function seed() {
  console.log("🌱 Populando banco...");

  for (const user of users) {
    await db.collection("users").doc(user.id).set({
      ...user,
      createdAt: now,
      email: `${user.id}@test.com`,
    });
  }

  console.log("✅ Users criados");

  for (const project of projects) {
    await db.collection("projects").doc(project.id).set({
      ...project,
      userId: `inventor_${Math.floor(Math.random() * 5)}`,
      createdAt: now,
    });
  }

  console.log("✅ Projects criados");

  console.log("🎉 Seed completo finalizado!");
}

seed().catch(console.error);