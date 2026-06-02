// scripts/seed_inatel.cjs
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const ADMIN_UID = "nqBV3Da1iqPbU46jGvO1ljBbIze2"; // Preservado

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

async function seedInatelEcosystem() {
  console.log("🚀 Iniciando Showcase Orizon Match: Inatel NGTI & EMBRAPII ICC...");

  const collectionsToClear = ['users', 'projects', 'matches', 'conversations', 'messages', 'logs_ai', 'assets_ip'];
  for (const col of collectionsToClear) {
    await clearCollection(col);
  }

  const batch = db.batch();

  // ==========================================
  // 1. USERS: O Ecossistema Inatel & Parceiros
  // ==========================================
  const users = {
    // A Âncora (ICT) com os dados reais do portal
    'ict_inatel_icc': {
      id: 'ict_inatel_icc',
      email: 'ngti@inatel.br',
      name: 'Inatel - NGTI & Unidade EMBRAPII ICC',
      role: 'ict',
      segment: 'Telecomunicações, 5G/6G, IoT e IA',
      location: 'Santa Rita do Sapucaí, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      capabilities: [
        'Centro de Referência em Radiocomunicações (CRR)',
        'Wireless and Artificial Intelligence Lab (WAI Lab)',
        'Centro de Segurança Cibernética (CxSC)',
        'Laboratório WOCA (Wireless and Optical Convergent Access)'
      ],
      verified: true
    },
    // Indústrias Parceiras (Usando referências do portal como Qualcomm)
    'company_qualcomm': { id: 'company_qualcomm', name: 'Qualcomm Brasil', role: 'industry', location: 'Sudeste' },
    'company_cemig': { id: 'company_cemig', name: 'Cemig Inovação', role: 'industry', location: 'Belo Horizonte, MG' },
    'company_nidec': { id: 'company_nidec', name: 'Nidec Global Appliance', role: 'industry', location: 'Joinville, SC' },
    
    // VCs / Investidores
    'investor_xG': { id: 'investor_xG', name: 'xGMobile Ventures', role: 'investor', location: 'São Paulo, SP' },
    
    // Inventores (Alunos/Pesquisadores de Doutorado e Mestrado do Inatel)
    'inventor_rafael': { id: 'inventor_rafael', name: 'Prof. Dr. Rafael Silva (CRR)', role: 'inventor', location: 'Santa Rita do Sapucaí, MG' },
    'inventor_camila': { id: 'inventor_camila', name: 'Pesquisadora Camila Santos (WAI Lab)', role: 'inventor', location: 'Santa Rita do Sapucaí, MG' }
  };

  for (const [id, data] of Object.entries(users)) {
    batch.set(db.collection('users').doc(id), data);
  }

  // ==========================================
  // 2. PROJECTS: Cases Reais do Inatel
  // ==========================================
  const projects = {
    // Case 1: Telecom/5G (Foco CRR)
    'proj_lte_network': {
      title: 'LTE Network-in-a-box',
      summary: 'Solução compacta de rede LTE privada para ambientes industriais e rurais, com núcleo de rede e rádio integrados em um único hardware.',
      segment: 'Telecom',
      declaredTRL: 7,
      validatedTRL: 7,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['Lei de TIC', 'EMBRAPII'],
      investmentTarget: 850000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    // Case 2: Smart City / ANEEL (Foco WOCA e WAI Lab)
    'proj_scm_embrapii': {
      title: 'Projeto SCM (Smart City Manager)',
      summary: 'Plataforma IoT de gestão de cidades inteligentes utilizando aprendizado de máquina para otimização de iluminação pública e tráfego.',
      segment: 'Internet das Coisas',
      declaredTRL: 6,
      validatedTRL: 6,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['ANEEL', 'EMBRAPII'],
      investmentTarget: 500000,
      status: 'active',
      vdrStatus: 'green'
    },
    // Case 3: O alvo principal (O Gateway de 300k)
    'proj_gateway_iot': {
      title: 'Gateway IoT Industrial com Segurança Cibernética',
      summary: 'Hardware de comunicação edge-to-cloud resistente a ataques, testado no Centro de Segurança Cibernética (CxSC).',
      segment: 'Segurança Cibernética',
      declaredTRL: 4,
      isIctVerified: false, // Inventor iniciou sozinho
      userId: 'inventor_rafael',
      status: 'active',
      vdrStatus: 'yellow'
    }
  };

  for (const [id, data] of Object.entries(projects)) {
    batch.set(db.collection('projects').doc(id), data);
  }

  // ==========================================
  // 3. MATCHES & DEAL FLOWS
  // ==========================================
  // Match 1: Qualcomm + LTE Network
  batch.set(db.collection('matches').doc('match_1'), {
    ownerProjectId: 'proj_lte_network',
    targetUserId: 'company_qualcomm',
    score: 95,
    status: 'negotiation',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Match 2: Cemig + Smart City
  batch.set(db.collection('matches').doc('match_2'), {
    ownerProjectId: 'proj_scm_embrapii',
    targetUserId: 'company_cemig',
    score: 88,
    status: 'proposal',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Deal Flow: Qualcomm 
  batch.set(db.collection('conversations').doc('conv_1'), {
    participants: ['inventor_rafael', 'company_qualcomm'],
    projectId: 'proj_lte_network',
    stage: 'term_sheet',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  batch.set(db.collection('messages').doc('msg_1'), {
    conversationId: 'conv_1',
    senderId: 'company_qualcomm',
    text: 'Avaliamos os testes realizados no Centro de Referência em Radiocomunicações (CRR) do Inatel. O LTE Network-in-a-box está perfeitamente aderente. Vamos usar a subvenção da Lei de TIC para fecharmos esse lote.',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // ==========================================
  // 4. ASSETS & AI AUDIT
  // ==========================================
  batch.set(db.collection('assets_ip').doc('asset_1'), {
    projectId: 'proj_lte_network',
    type: 'Software / Algoritmo',
    status: 'concedido',
    title: 'Algoritmo de Roteamento de Baixa Latência para Redes 5G/LTE'
  });

  batch.set(db.collection('logs_ai').doc('log_1'), {
    projectId: 'proj_gateway_iot',
    type: 'suggestion',
    message: 'Auditoria: Este projeto está aderente ao programa MOVER (Mobilidade Verde e Inovação). Sugerimos vincular o laboratório WAI Lab do Inatel para acelerar a subvenção de R$ 300k da EMBRAPII.',
    status: 'pending'
  });

  await batch.commit();
  console.log("✅ Showcase 'Inatel NGTI / EMBRAPII' injetado com sucesso!");
  process.exit(0);
}

seedInatelEcosystem().catch(console.error);
