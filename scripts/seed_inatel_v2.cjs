// scripts/seed_inatel_v2.cjs
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const ADMIN_UID = "nqBV3Da1iqPbU46jGvO1ljBbIze2"; 

async function getOrCreateUser(uid, email, password) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    // Verify email matches
    if (userRecord.email === email) {
      console.log(`👤 Usuário Auth ${email} já existe com o UID correto.`);
      return userRecord;
    }
    // If UID exists but email is different, we can delete and recreate
    console.log(`🔄 UID ${uid} existe mas com email diferente. Deletando...`);
    await admin.auth().deleteUser(uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  // Check if email already exists under a different UID
  try {
    const userByEmail = await admin.auth().getUserByEmail(email);
    console.log(`🗑️ Email ${email} já em uso pelo UID ${userByEmail.uid}. Deletando conflito...`);
    await admin.auth().deleteUser(userByEmail.uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  // Create the new user
  const userRecord = await admin.auth().createUser({
    uid: uid,
    email: email,
    password: password,
    emailVerified: true
  });
  console.log(`👤 Usuário Auth ${email} criado com sucesso.`);
  return userRecord;
}

async function clearCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    if (collectionPath === 'users' && doc.id === ADMIN_UID) return;
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`🧹 Coleção ${collectionPath} limpa.`);
}

async function seedV2() {
  console.log("🚀 Iniciando Orizon Match Seed v2.0 (DeepTech Taxonomy)...");
  
  const collections = ['users', 'projects', 'matches', 'conversations', 'messages', 'challenges', 'assets_ip'];
  for (const col of collections) {
    await clearCollection(col);
  }

  // Create Users in Firebase Auth
  console.log("🔑 Criando/atualizando contas no Firebase Auth...");
  await getOrCreateUser('ict_inatel', 'ict@inatel.br', 'orizon123');
  await getOrCreateUser('comp_ericsson', 'empresa@ericsson.com', 'orizon123');
  await getOrCreateUser('comp_siemens', 'siemens@orizon.com', 'orizon123');
  await getOrCreateUser('comp_weg', 'weg@orizon.com', 'orizon123');
  await getOrCreateUser('inv_kaszek', 'kaszek@orizon.com', 'orizon123');
  await getOrCreateUser('inv_canary', 'canary@orizon.com', 'orizon123');
  await getOrCreateUser('inventor_rafael', 'inventor@wailab.br', 'orizon123');
  await getOrCreateUser('inventor_camila', 'pesquisadora@wailab.br', 'orizon123');

  const batch = db.batch();

  const users = {
    'ict_inatel': { 
      id: 'ict_inatel', 
      role: 'ict', 
      name: 'Inatel NGTI', 
      email: 'ict@inatel.br',
      segment: 'Telecom',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_ericsson': { 
      id: 'comp_ericsson', 
      role: 'industry', 
      name: 'Ericsson Ventures', 
      email: 'empresa@ericsson.com',
      segment: '5G / Edge Computing',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_siemens': { 
      id: 'comp_siemens', 
      role: 'industry', 
      name: 'Siemens Healthineers', 
      email: 'siemens@orizon.com',
      segment: 'MedTech',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_weg': { 
      id: 'comp_weg', 
      role: 'industry', 
      name: 'WEG Digital', 
      email: 'weg@orizon.com',
      segment: 'Industrial IoT',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inv_kaszek': { 
      id: 'inv_kaszek', 
      role: 'investor', 
      name: 'Kaszek DeepTech', 
      email: 'kaszek@orizon.com',
      segment: 'CleanTech',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inv_canary': { 
      id: 'inv_canary', 
      role: 'investor', 
      name: 'Canary VC', 
      email: 'canary@orizon.com',
      segment: 'PropTech',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inventor_rafael': { 
      id: 'inventor_rafael', 
      role: 'inventor', 
      name: 'Prof. Rafael Silva', 
      email: 'inventor@wailab.br',
      verified: true,
      subscriptionStatus: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inventor_camila': { 
      id: 'inventor_camila', 
      role: 'inventor', 
      name: 'Dra. Camila Santos', 
      email: 'pesquisadora@wailab.br',
      verified: true,
      subscriptionStatus: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(users)) {
    batch.set(db.collection('users').doc(id), data);
  }

  const projectsData = [
    { id: 'p01', title: 'Solid-State Battery Pack for Drones', segment: 'CleanTech', trl: 6, ticket: '1m', verified: true, userId: 'inventor_rafael', summary: 'Bateria de estado sólido com alta densidade energética voltada para drones industriais de longo alcance.' },
    { id: 'p02', title: 'Edge Computing Gateway Quantum Encryption', segment: 'Industrial IoT', trl: 7, ticket: '250k', verified: true, userId: 'inventor_rafael', summary: 'Gateway industrial dotado de criptografia pós-quântica para proteção de dados críticos em redes industriais.' },
    { id: 'p03', title: 'AI-driven Biosensors Pathogen Detection', segment: 'MedTech', trl: 4, ticket: '50k', verified: false, userId: 'inventor_camila', summary: 'Biossensores rápidos combinados com inteligência artificial para detecção imediata de patógenos em amostras biológicas.' },
    { id: 'p04', title: 'LPWAN Smart Grid Metering Platform', segment: 'Smart City', trl: 8, ticket: '1m', verified: true, userId: 'inventor_rafael', summary: 'Plataforma completa de medição inteligente para redes de energia usando canais de comunicação LPWAN redundantes.' },
    { id: 'p05', title: 'Next-Gen RF Amplifiers for 6G', segment: 'Telecom', trl: 5, ticket: '250k', verified: false, userId: 'inventor_rafael', summary: 'Amplificadores de radiofrequência de última geração com alta linearidade e eficiência energética projetados para faixas sub-terahertz do 6G.' },
    { id: 'p06', title: 'Bioactive Chitosan Coating', segment: 'AgTech', trl: 3, ticket: '50k', verified: false, userId: 'inventor_camila', summary: 'Revestimento bioativo natural derivado de quitosana para prolongar a vida útil de pós-colheita.' },
    { id: 'p07', title: 'Swarm Robotics for Warehouse Mgmt', segment: 'Robotics', trl: 7, ticket: '1m', verified: true, userId: 'inventor_rafael', summary: 'Algoritmos distribuídos para controle de enxames de robôs autônomos em centros de distribuição integrados.' },
    { id: 'p08', title: 'Graphene Nanotubes for Supercapacitors', segment: 'Materials', trl: 4, ticket: '250k', verified: true, userId: 'inventor_rafael', summary: 'Supercapacitores de alta performance desenvolvidos com nanotubos de carbono dopados com grafeno.' },
    { id: 'p09', title: 'Computer Vision Defect Detection', segment: 'Industry 4.0', trl: 9, ticket: '250k', verified: true, userId: 'inventor_camila', summary: 'Sistema de detecção de falhas em tempo real usando câmeras de alta velocidade e modelos compactos de visão computacional na borda.' },
    { id: 'p10', title: 'Predictive Maintenance Mesh Network', segment: 'Industrial IoT', trl: 6, ticket: '1m', verified: false, userId: 'inventor_rafael', summary: 'Sensores de vibração organizados em rede mesh para monitoramento preditivo de motores industriais WEG.' },
    { id: 'p11', title: 'Non-invasive Glucose Monitoring Wearable', segment: 'MedTech', trl: 5, ticket: '250k', verified: true, userId: 'inventor_camila', summary: 'Dispositivo wearable para monitoramento de glicose não invasivo por espectroscopia óptica de alta precisão.' },
    { id: 'p12', title: 'Carbon Capture Direct Air Tech', segment: 'CleanTech', trl: 3, ticket: '50k', verified: false, userId: 'inventor_camila', summary: 'Protótipo laboratorial de captura direta de CO2 da atmosfera usando novos sorventes sólidos regeneráveis.' },
    { id: 'p13', title: 'Autonomous Agricultural Drone V2', segment: 'AgTech', trl: 8, ticket: '1m', verified: true, userId: 'inventor_camila', summary: 'Drone com autonomia estendida e sistema multiespectral integrado para aplicação inteligente de defensivos agrícolas.' },
    { id: 'p14', title: 'Haptic Feedback Surgical Gloves', segment: 'MedTech', trl: 6, ticket: '250k', verified: true, userId: 'inventor_camila', summary: 'Luvas com sensores háticos táteis de alta fidelidade para treinamento de cirurgias em ambiente virtual.' },
    { id: 'p15', title: 'Blockchain Energy Trading Grid', segment: 'Smart City', trl: 7, ticket: '1m', verified: true, userId: 'inventor_rafael', summary: 'Rede descentralizada baseada em smart contracts para comercialização ponto a ponto de excedentes de energia solar residencial.' },
  ];

  projectsData.forEach(p => {
    batch.set(db.collection('projects').doc(p.id), {
      userId: p.userId,
      title: p.title,
      summary: p.summary,
      segment: p.segment,
      declaredTRL: p.trl,
      isIctVerified: p.verified,
      investmentStage: p.trl <= 3 ? 'concept' : p.trl <= 6 ? 'prototype' : 'market',
      ticketRange: p.ticket,
      status: 'active',
      vdrStatus: p.verified ? 'green' : 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // Seed default challenges
  const challenges = [
    { id: 'c01', companyName: 'Ericsson Ventures', title: 'Eficiência de Transmissão em Bandas Terahertz', description: 'Buscamos novas arquiteturas RF de amplificação de sinais para 6G com baixo ruído térmico.', budget: 800000, deadline: '30/12/2026' },
    { id: 'c02', companyName: 'WEG Digital', title: 'Sensores de Vibração sem Bateria', description: 'Monitoramento contínuo em motores industriais com colheita de energia térmica/vibracional local.', budget: 500000, deadline: '15/10/2026' }
  ];

  challenges.forEach(c => {
    batch.set(db.collection('challenges').doc(c.id), {
      ...c,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log("✅ Seed v2.0 Finalizado: 15 Projetos Deep Tech Injetados!");
  process.exit(0);
}

seedV2().catch(console.error);
