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
const DEVELOPER_UID = "BfIgQtnAZxRFuHCoiMw4bMkfgWW2";

const KEEPUIDS = new Set([
  'ict_inatel',
  'comp_ericsson',
  'comp_siemens',
  'comp_weg',
  'inv_kaszek',
  'inv_canary',
  'inventor_rafael',
  'inventor_camila',
  'company_qualcomm',
  'company_cemig',
  'company_nidec',
  'company_schneider',
  'company_embraer',
  'company_vivo',
  'company_tim',
  'investor_xG',
  'ict_outra',
  ADMIN_UID,
  DEVELOPER_UID
]);

async function cleanAuthUsers() {
  console.log("🧹 Limpando usuários indesejados do Firebase Auth...");
  let nextPageToken;
  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      if (!KEEPUIDS.has(userRecord.uid)) {
        console.log(`🗑️ Deletando usuário Auth lixo: ${userRecord.email} (${userRecord.uid})`);
        try {
          await admin.auth().deleteUser(userRecord.uid);
        } catch (err) {
          console.error(`Erro ao deletar usuário ${userRecord.email}:`, err);
        }
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
}

async function getOrCreateUser(uid, email, password) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    if (userRecord.email === email) {
      console.log(`👤 Usuário Auth ${email} já existe com o UID correto.`);
      return userRecord;
    }
    console.log(`🔄 UID ${uid} existe mas com email diferente. Deletando...`);
    await admin.auth().deleteUser(uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  try {
    const userByEmail = await admin.auth().getUserByEmail(email);
    console.log(`🗑️ Email ${email} já em uso pelo UID ${userByEmail.uid}. Deletando conflito...`);
    await admin.auth().deleteUser(userByEmail.uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

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
    if (collectionPath === 'users' && (doc.id === ADMIN_UID || doc.id === DEVELOPER_UID)) return;
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`🧹 Coleção ${collectionPath} limpa.`);
}

async function seedV2() {
  console.log("🚀 Iniciando Orizon Match Seed v3.0 (Merged Portuguese DeepTech Ecosystem & Rich Deal Flow)...");
  
  // Clean Firebase Auth
  await cleanAuthUsers();

  const collections = ['users', 'projects', 'matches', 'conversations', 'messages', 'challenges', 'assets_ip', 'logs_ai', 'organizations', 'deals', 'signed_ndas', 'audit_logs', 'activity_events', 'domain_events'];
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
  
  // Extra corporations and investors for a realistic show/matching
  await getOrCreateUser('company_qualcomm', 'qualcomm@orizon.com', 'orizon123');
  await getOrCreateUser('company_cemig', 'cemig@orizon.com', 'orizon123');
  await getOrCreateUser('company_nidec', 'nidec@orizon.com', 'orizon123');
  await getOrCreateUser('company_schneider', 'schneider@orizon.com', 'orizon123');
  await getOrCreateUser('company_embraer', 'embraer@orizon.com', 'orizon123');
  await getOrCreateUser('company_vivo', 'vivo@orizon.com', 'orizon123');
  await getOrCreateUser('company_tim', 'tim@orizon.com', 'orizon123');
  await getOrCreateUser('investor_xG', 'xg@orizon.com', 'orizon123');
  await getOrCreateUser('ict_outra', 'ict_outra@orizon.com', 'orizon123');

  const batch = db.batch();

  // 1. Users Firestore Profiles
  const users = {
    'ict_outra': { 
      id: 'ict_outra', 
      role: 'ict', 
      orgId: 'ict_outra_org',
      name: 'Universidade Federal de Itajubá - UNIFEI', 
      email: 'ict_outra@orizon.com',
      segment: 'Energia Limpa, Hidrogênio e Smart Grids',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Itajubá, MG',
      capabilities: [
        'Centro de Hidrogênio Verde (CH2V)',
        'Instituto de Sistemas Elétricos e Energia (ISEE)'
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'ict_inatel': { 
      id: 'ict_inatel', 
      role: 'ict', 
      orgId: 'ict_inatel',
      name: 'Inatel - NGTI & Unidade EMBRAPII ICC', 
      email: 'ict@inatel.br',
      segment: 'Telecomunicações, 5G/6G, IoT e IA',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Santa Rita do Sapucaí, MG',
      capabilities: [
        'Centro de Referência em Radiocomunicações (CRR)',
        'Wireless and Artificial Intelligence Lab (WAI Lab)',
        'Centro de Segurança Cibernética (CxSC)',
        'Laboratório WOCA (Wireless and Optical Convergent Access)'
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_ericsson': { 
      id: 'comp_ericsson', 
      role: 'industry', 
      name: 'Ericsson Brasil', 
      email: 'empresa@ericsson.com',
      segment: 'Telecomunicações e Conectividade',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_siemens': { 
      id: 'comp_siemens', 
      role: 'industry', 
      name: 'Siemens Brasil', 
      email: 'siemens@orizon.com',
      segment: 'Automação Industrial e Energia',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'comp_weg': { 
      id: 'comp_weg', 
      role: 'industry', 
      name: 'WEG S.A.', 
      email: 'weg@orizon.com',
      segment: 'Máquinas Elétricas e Automação',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Jaraguá do Sul, SC',
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
      location: 'São Paulo, SP',
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
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inventor_rafael': { 
      id: 'inventor_rafael', 
      role: 'inventor', 
      orgId: 'ict_inatel',
      name: 'Prof. Dr. Rafael Silva (CRR)', 
      email: 'inventor@wailab.br',
      verified: true,
      subscriptionStatus: 'free',
      location: 'Santa Rita do Sapucaí, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inventor_camila': { 
      id: 'inventor_camila', 
      role: 'inventor', 
      orgId: 'ict_inatel',
      name: 'Pesquisadora Camila Santos (WAI Lab)', 
      email: 'pesquisadora@wailab.br',
      verified: true,
      subscriptionStatus: 'free',
      location: 'Santa Rita do Sapucaí, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'nqBV3Da1iqPbU46jGvO1ljBbIze2': {
      id: 'nqBV3Da1iqPbU46jGvO1ljBbIze2',
      role: 'admin',
      name: 'Administrador Supremo',
      email: 'magoteteu@gmail.com',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'BfIgQtnAZxRFuHCoiMw4bMkfgWW2': {
      id: 'BfIgQtnAZxRFuHCoiMw4bMkfgWW2',
      role: 'admin',
      name: 'Marcelo Luciano',
      email: 'marceloluciano30@gmail.com',
      verified: true,
      subscriptionStatus: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_qualcomm': {
      id: 'company_qualcomm',
      role: 'industry',
      name: 'Qualcomm Brasil',
      email: 'qualcomm@orizon.com',
      segment: 'Semicondutores e Chipsets',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_cemig': {
      id: 'company_cemig',
      role: 'industry',
      name: 'Cemig Inovação',
      email: 'cemig@orizon.com',
      segment: 'Energia e Cidades Inteligentes',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Belo Horizonte, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_nidec': {
      id: 'company_nidec',
      role: 'industry',
      name: 'Nidec Global Appliance',
      email: 'nidec@orizon.com',
      segment: 'Motores e Compressores',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Joinville, SC',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_schneider': {
      id: 'company_schneider',
      role: 'industry',
      name: 'Schneider Electric',
      email: 'schneider@orizon.com',
      segment: 'Gestão de Energia e Automação',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_embraer': {
      id: 'company_embraer',
      role: 'industry',
      name: 'Embraer',
      email: 'embraer@orizon.com',
      segment: 'Aeroespacial e Defesa',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São José dos Campos, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_vivo': {
      id: 'company_vivo',
      role: 'industry',
      name: 'Vivo Empresas',
      email: 'vivo@orizon.com',
      segment: 'Telecomunicações e Conectividade IoT',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_tim': {
      id: 'company_tim',
      role: 'industry',
      name: 'TIM Brasil',
      email: 'tim@orizon.com',
      segment: 'Serviços de Telecomunicações',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Rio de Janeiro, RJ',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'investor_xG': {
      id: 'investor_xG',
      role: 'investor',
      name: 'xGMobile Ventures',
      email: 'xg@orizon.com',
      segment: 'VC Focado em Telecom & IoT',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(users)) {
    batch.set(db.collection('users').doc(id), data);
  }

  // Seeding organizations collection
  const organizations = {
    'ict_outra_org': {
      id: 'ict_outra_org',
      name: 'Universidade Federal de Itajubá - UNIFEI',
      type: 'ICT',
      managers: ['ict_outra'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'ict_inatel': {
      id: 'ict_inatel',
      name: 'Inatel - NGTI & Unidade EMBRAPII ICC',
      type: 'ICT',
      managers: ['ict_inatel'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(organizations)) {
    batch.set(db.collection('organizations').doc(id), data);
  }

  // 2. Projects: 15 Highly Complete, Realistic Portuguese/English Deep Tech projects
  const projectsData = [
    { 
      id: 'proj_lte_box', 
      title: 'LTE Network-in-a-box', 
      segment: 'Telecom', 
      trl: 7, 
      verified: true, 
      userId: 'inventor_rafael',
      summary: 'Solução compacta de rede LTE privada para ambientes industriais e rurais, com núcleo de rede e rádio integrados em um único hardware.',
      ticket: '250k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Concedida (BR 10 2024)',
      ictName: 'Inatel NGTI',
      fundingTags: ['Lei de TIC', 'EMBRAPII']
    },
    { 
      id: 'proj_scm', 
      title: 'Projeto SCM (Smart City Manager)', 
      segment: 'Internet das Coisas', 
      trl: 6, 
      verified: true, 
      userId: 'inventor_camila',
      summary: 'Plataforma IoT de gestão de cidades inteligentes utilizando aprendizado de máquina para otimização de iluminação pública e tráfego.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Concedida (BR 10 2023)',
      ictName: 'Inatel - WAI Lab',
      fundingTags: ['ANEEL', 'EMBRAPII']
    },
    { 
      id: 'proj_gateway_iot', 
      title: 'Gateway IoT Industrial com Segurança Cibernética', 
      segment: 'Segurança Cibernética', 
      trl: 4, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Hardware de comunicação edge-to-cloud resistente a ataques físicos e lógicos, testado sob o ecossistema do CxSC.',
      ticket: '250k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['EMBRAPII']
    },
    { 
      id: 'proj_antena_reconfig', 
      title: 'Antena Reconfigurável MIMO para 5G/6G', 
      segment: 'Telecom', 
      trl: 5, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Projeto de antenas planas capazes de alterar seu diagrama de radiação dinamicamente para aumentar cobertura em redes celulares.',
      ticket: '250k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['Lei de TIC']
    },
    { 
      id: 'proj_telemed_ai', 
      title: 'Plataforma de Telemedicina com Triagem por IA', 
      segment: 'HealthTech', 
      trl: 6, 
      verified: true, 
      userId: 'inventor_camila',
      summary: 'Hardware IoT e app de triagem hospitalar inteligente para diagnóstico remoto de arritmias cardíacas utilizando IA integrada.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Concedida (BR 10 2024)',
      ictName: 'Inatel NGTI',
      fundingTags: ['FINEP']
    },
    { 
      id: 'proj_agro_drone', 
      title: 'Sistema de Roteamento de Drones Agrícolas', 
      segment: 'AgroTech', 
      trl: 5, 
      verified: false, 
      userId: 'inventor_camila',
      summary: 'Software e hardware embarcado de conectividade de longo alcance para frotas de drones de inspeção agrícola de precisão.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel - WAI Lab',
      fundingTags: ['FINEP']
    },
    { 
      id: 'proj_smart_grid_sensor', 
      title: 'Sensor de Subestação Smart Grid Autoalimentado', 
      segment: 'Internet das Coisas', 
      trl: 5, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Sensor IoT de alta tensão autoalimentado por acoplamento magnético para monitoramento térmico de linhas de distribuição Cemig.',
      ticket: '50k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['ANEEL']
    },
    { 
      id: 'proj_quantum_key', 
      title: 'Distribuição de Chaves Quânticas (QKD)', 
      segment: 'Segurança Cibernética', 
      trl: 3, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Implementação de protocolo físico QKD em fibras ópticas metropolitanas para criptografia inviolável de tráfego de dados.',
      ticket: '1m',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Em Desenho (Patente pendente)',
      ictName: 'Inatel NGTI',
      fundingTags: ['FINEP', 'EMBRAPII']
    },
    { 
      id: 'proj_edge_vision', 
      title: 'Câmera Inteligente Edge AI', 
      segment: 'Inteligência Artificial', 
      trl: 6, 
      verified: true, 
      userId: 'inventor_camila',
      summary: 'Sistema embarcado de visão computacional de ultra-alta velocidade para triagem de falhas de montagem mecânica em motores industriais.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Concedida (BR 10 2023)',
      ictName: 'Inatel - WAI Lab',
      fundingTags: ['Lei de TIC']
    },
    { 
      id: 'proj_lora_tracker', 
      title: 'Rastreador de Ativos LoRaWAN', 
      segment: 'Internet das Coisas', 
      trl: 7, 
      verified: true, 
      userId: 'inventor_rafael',
      summary: 'Dispositivo IoT de rastreamento de gado e logística rural com autonomia de bateria superior a 5 anos.',
      ticket: '50k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Concedida (BR 10 2024)',
      ictName: 'Inatel NGTI',
      fundingTags: ['Lei de TIC']
    },
    { 
      id: 'proj_smart_flow', 
      title: 'Sensor de Vazão Não-Invasivo com IA', 
      segment: 'Hardware', 
      trl: 5, 
      verified: true, 
      userId: 'inventor_camila',
      summary: 'Sensor ultrassônico de fluidos externos acoplado com algoritmos neurais de calibração automática de viscosidade.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Concedida (BR 10 2024)',
      ictName: 'Inatel NGTI',
      fundingTags: ['EMBRAPII']
    },
    { 
      id: 'proj_fibra_coerente', 
      title: 'Transmissor Óptico Coerente de 400Gbps', 
      segment: 'Telecom', 
      trl: 4, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Laser sintonizável coerente de baixo custo e alta eficiência espectral para conexões metropolitanas de fibra óptica.',
      ticket: '250k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['Lei de TIC', 'FINEP']
    },
    { 
      id: 'proj_ai_health_noise', 
      title: 'Redutor de Ruído Ativo para UTI Neonatal', 
      segment: 'HealthTech', 
      trl: 5, 
      verified: false, 
      userId: 'inventor_camila',
      summary: 'Cancelador acústico adaptativo em tempo real focado nas frequências nocivas de alarmes hospitalares em incubadoras.',
      ticket: '250k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['FINEP']
    },
    { 
      id: 'proj_water_monitor', 
      title: 'Monitoramento de Qualidade da Água de Rios', 
      segment: 'Internet das Coisas', 
      trl: 6, 
      verified: true, 
      userId: 'inventor_camila',
      summary: 'Bóia inteligente autossuficiente com múltiplos sensores de turbidez, pH e oxigênio dissolvido conectada via satélite.',
      ticket: '50k',
      researcher: 'Dra. Camila Santos (WAI Lab)',
      patentStatus: 'Concedida (BR 10 2024)',
      ictName: 'Inatel NGTI',
      fundingTags: ['EMBRAPII']
    },
    { 
      id: 'proj_cyber_shield', 
      title: 'Firmware Hardened com Defesa Proativa', 
      segment: 'Segurança Cibernética', 
      trl: 4, 
      verified: false, 
      userId: 'inventor_rafael',
      summary: 'Sistema operacional minimalista com detecção heurística de negação de serviço e barreira contra invasão de firmware IoT.',
      ticket: '250k',
      researcher: 'Prof. Dr. Rafael Silva (CRR)',
      patentStatus: 'Depositada (BR 10 2025)',
      ictName: 'Inatel NGTI',
      fundingTags: ['Lei de TIC', 'EMBRAPII']
    },
    {
      id: 'proj_outra_ict',
      title: 'Conversor de Hidrogênio Verde de Alta Eficiência',
      segment: 'Energia',
      trl: 5,
      verified: true,
      userId: 'ict_outra',
      orgId: 'ict_outra_org',
      summary: 'Conversor estático otimizado para eletrolisadores de hidrogênio verde, reduzindo perdas harmônicas em até 12%.',
      ticket: '500k',
      researcher: 'Prof. Dr. Itajubá (CH2V)',
      patentStatus: 'Depositada (BR 10 2026)',
      ictName: 'UNIFEI CH2V',
      fundingTags: ['FINEP', 'CNPq']
    }
  ];

  projectsData.forEach(p => {
    const projectRef = db.collection('projects').doc(p.id);
    batch.set(projectRef, {
      userId: p.userId,
      orgId: p.orgId || 'ict_inatel',
      title: p.title,
      summary: p.summary,
      segment: p.segment,
      declaredTRL: p.trl,
      validatedTRL: p.verified ? p.trl : null,
      isIctVerified: p.verified,
      investmentStage: p.trl <= 3 ? 'concept' : p.trl <= 6 ? 'prototype' : 'market',
      ticketRange: p.ticket,
      status: 'active',
      vdrStatus: p.verified ? 'green' : 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ictName: p.ictName,
      fundingTags: p.fundingTags,
      location: { region: 'Santa Rita do Sapucaí, MG' }
    });

    const privateRef = projectRef.collection('private').doc('details');
    batch.set(privateRef, {
      researcher: p.researcher,
      patentStatus: p.patentStatus,
      contactEmail: `${p.userId}@orizon.com`,
      confidentialNotes: `Detalhes de PI confidenciais para o projeto ${p.title}.`
    });
  });

  // 3. Seed Challenges
  const challenges = [
    { id: 'chall_5g_industry', companyId: 'comp_ericsson', companyName: 'Ericsson Brasil', title: 'Conectividade 5G Privada para Linhas de Montagem', description: 'Ericsson Brasil busca parceiros para arquitetura de rede privativa 5G de ultrabaixa latência (URLLC) em plantas industriais pesadas.', budget: 1500000, deadline: '30/12/2026', segment: 'Telecom' },
    { id: 'chall_smart_grids', companyId: 'company_cemig', companyName: 'Cemig Inovação', title: 'Monitoramento Preditivo Térmico de Subestações', description: 'Cemig Inovação busca soluções de sensoriamento sem fio e autoalimentados para detecção antecipada de pontos quentes em transformadores.', budget: 800000, deadline: '15/10/2026', segment: 'Internet das Coisas' },
    { id: 'chall_edge_vision', companyId: 'company_nidec', companyName: 'Nidec Global Appliance', title: 'Visão Computacional na Borda para Motores', description: 'Nidec Global Appliance busca algoritmos de IA de borda otimizados para triagem automatizada de falhas microestruturais em linhas de compressão.', budget: 500000, deadline: '01/11/2026', segment: 'Inteligência Artificial' },
    { id: 'chall_agro_iot', companyId: 'company_vivo', companyName: 'Vivo Empresas', title: 'Cobertura LoRaWAN em Larga Escala no Campo', description: 'Vivo Empresas busca soluções de backhaul resilientes para redes LoRaWAN corporativas instaladas em latifúndios remotos.', budget: 1200000, deadline: '18/12/2026', segment: 'Internet das Coisas' },
    { id: 'chall_cyber_critical', companyId: 'company_embraer', companyName: 'Embraer', title: 'Firmware Blindado contra Ameaças Físicas em Avionics', description: 'Embraer necessita de sistemas de proteção criptográfica integrados na BIOS para roteadores aviônicos contra intrusão local de dados.', budget: 2000000, deadline: '15/09/2026', segment: 'Segurança Cibernética' },
    { id: 'chall_smart_home', companyId: 'comp_siemens', companyName: 'Siemens Brasil', title: 'Sensores Autossustentáveis para Gestão de Energia Residencial', description: 'Siemens Brasil busca coletores de energia (energy harvesting) e sensores integrados de corrente de fácil fixação em disjuntores.', budget: 750000, deadline: '10/11/2026', segment: 'Hardware' }
  ];

  challenges.forEach(c => {
    batch.set(db.collection('challenges').doc(c.id), {
      ...c,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // 4. Seed Matches (Connecting projects to VC / Industries)
  const matches = [
    { id: 'm_01', ownerProjectId: 'proj_lte_box', targetUserId: 'company_qualcomm', score: 95, status: 'negotiation' },
    { id: 'm_02', ownerProjectId: 'proj_scm', targetUserId: 'company_cemig', score: 88, status: 'proposal' },
    { id: 'm_03', ownerProjectId: 'proj_gateway_iot', targetUserId: 'comp_ericsson', score: 94, status: 'new' },
    { id: 'm_04', ownerProjectId: 'proj_antena_reconfig', targetUserId: 'company_tim', score: 91, status: 'new' },
    { id: 'm_05', ownerProjectId: 'proj_telemed_ai', targetUserId: 'company_vivo', score: 87, status: 'new' },
    { id: 'm_06', ownerProjectId: 'proj_agro_drone', targetUserId: 'comp_weg', score: 79, status: 'new' },
    { id: 'm_07', ownerProjectId: 'proj_smart_grid_sensor', targetUserId: 'company_cemig', score: 96, status: 'proposal' },
    { id: 'm_08', ownerProjectId: 'proj_quantum_key', targetUserId: 'company_embraer', score: 85, status: 'new' },
    { id: 'm_09', ownerProjectId: 'proj_edge_vision', targetUserId: 'company_nidec', score: 97, status: 'negotiation' },
    { id: 'm_10', ownerProjectId: 'proj_lora_tracker', targetUserId: 'company_vivo', score: 93, status: 'proposal' },
    { id: 'm_11', ownerProjectId: 'proj_cyber_shield', targetUserId: 'company_schneider', score: 82, status: 'new' },
    { id: 'm_12', ownerProjectId: 'proj_smart_flow', targetUserId: 'comp_weg', score: 89, status: 'new' }
  ];

  matches.forEach(m => {
    batch.set(db.collection('matches').doc(m.id), {
      ...m,
      orgId: 'ict_inatel',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // 5. Seed Conversations & Messages
  const conversations = [
    {
      id: 'conv_1',
      projectId: 'proj_lte_box',
      organizationId: 'company_qualcomm',
      matchId: 'm_01',
      participants: ['inventor_rafael', 'company_qualcomm'],
      stage: 'term_sheet',
      status: 'active',
      initiatorId: 'inventor_rafael',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      projectTitle: 'LTE Network-in-a-box',
      unreadCount: { 'inventor_rafael': 0, 'company_qualcomm': 0 },
      lastMessage: 'Prezado Dr. Rafael, nossa equipe técnica analisou o relatório do CRR. Estamos prontos para redigir o Term Sheet de co-desenvolvimento sob a Lei de TIC.'
    },
    {
      id: 'conv_2',
      projectId: 'proj_edge_vision',
      organizationId: 'company_nidec',
      matchId: 'm_09',
      participants: ['inventor_camila', 'company_nidec'],
      stage: 'negotiation',
      status: 'active',
      initiatorId: 'inventor_camila',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      projectTitle: 'Câmera Inteligente Edge AI',
      unreadCount: { 'inventor_camila': 0, 'company_nidec': 0 },
      lastMessage: 'Adoramos a validação de TRL 6 realizada pelo Inatel. Gostaríamos de agendar um teste em nossa planta piloto.'
    }
  ];

  conversations.forEach(c => {
    batch.set(db.collection('conversations').doc(c.id), {
      ...c,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // Initial messages
  const messages = [
    { id: 'msg_01_sys', conversationId: 'conv_1', senderId: 'system', text: 'Deal Flow iniciado na etapa de Term Sheet.', type: 'system', createdAt: admin.firestore.FieldValue.serverTimestamp(), isSystem: true },
    { id: 'msg_01_user', conversationId: 'conv_1', senderId: 'company_qualcomm', text: 'Prezado Dr. Rafael, nossa equipe técnica analisou o relatório do CRR. Estamos prontos para redigir o Term Sheet de co-desenvolvimento sob a Lei de TIC.', type: 'text', createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { id: 'msg_02_sys', conversationId: 'conv_2', senderId: 'system', text: 'Deal Flow iniciado na etapa de Negociação.', type: 'system', createdAt: admin.firestore.FieldValue.serverTimestamp(), isSystem: true },
    { id: 'msg_02_user', conversationId: 'conv_2', senderId: 'company_nidec', text: 'Adoramos a validação de TRL 6 realizada pelo Inatel. Gostaríamos de agendar um teste em nossa planta piloto.', type: 'text', createdAt: admin.firestore.FieldValue.serverTimestamp() }
  ];

  messages.forEach(m => {
    batch.set(db.collection('messages').doc(m.id), {
      ...m,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // 6. Seed assets_ip
  const assets = [
    { id: 'as_1', projectId: 'proj_lte_box', type: 'Patente', status: 'licensingAvailable', title: 'Topologia de Circuito RF de Baixa Latência para Rede Privada', inpi: 'BR 10 2024 001234 5', trl: 7 },
    { id: 'as_2', projectId: 'proj_scm', type: 'Software / Algoritmo', status: 'licensingActive', title: 'Algoritmo de Roteamento de Tráfego por Densidade Veicular', inpi: 'BR 10 2023 008910 2', trl: 6 },
    { id: 'as_3', projectId: 'proj_edge_vision', type: 'Patente', status: 'licensingAvailable', title: 'Método de Extração e Análise Heurística de Imagem Industrial na Borda', inpi: 'BR 10 2025 000456 1', trl: 6 }
  ];

  assets.forEach(a => {
    batch.set(db.collection('assets_ip').doc(a.id), {
      ...a,
      orgId: 'ict_inatel',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // 7. Seed logs_ai
  const aiLogs = [
    { id: 'log_1', projectId: 'proj_gateway_iot', projectTitle: 'Gateway IoT Industrial com Segurança Cibernética', type: 'suggestion', message: 'Auditoria: Este projeto está aderente ao programa MOVER (Mobilidade Verde e Inovação). Sugerimos vincular o laboratório WAI Lab do Inatel para acelerar a subvenção de R$ 300k da EMBRAPII.', status: 'pending' },
    { id: 'log_2', projectId: 'proj_antena_reconfig', projectTitle: 'Antena Reconfigurável MIMO para 5G/6G', type: 'alert', message: 'Inconsistência: Projeto em TRL 5 sem documentos de cessão de direitos de patente homologados na ICT.', status: 'pending' },
    { id: 'log_3', projectId: 'proj_quantum_key', projectTitle: 'Distribuição de Chaves Quânticas (QKD)', type: 'suggestion', message: 'Auditoria: Projeto de TRL 3 em Telecomunicações Quânticas. Recomendado direcionar para edital de subvenção FINEP Tecnologias Críticas.', status: 'pending' }
  ];

  aiLogs.forEach(l => {
    batch.set(db.collection('logs_ai').doc(l.id), {
      ...l,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log("✅ Seed v3.0 Finalizado: 15 Projetos Deep Tech & Rich Flows Injetados com sucesso!");
  process.exit(0);
}

seedV2().catch(console.error);
