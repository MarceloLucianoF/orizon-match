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
  'ict_fai_mg',
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

async function retry(fn, retries = 3, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`⚠️ Falha de rede temporária (${err.message || err}). Tentativa ${i + 1}/${retries}. Retentando em ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function cleanAuthUsers() {
  console.log("🧹 Limpando usuários indesejados do Firebase Auth...");
  let nextPageToken;
  do {
    const listUsersResult = await retry(() => admin.auth().listUsers(1000, nextPageToken));
    for (const userRecord of listUsersResult.users) {
      if (!KEEPUIDS.has(userRecord.uid)) {
        console.log(`🗑️ Deletando usuário Auth lixo: ${userRecord.email} (${userRecord.uid})`);
        try {
          await retry(() => admin.auth().deleteUser(userRecord.uid));
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
    const userRecord = await retry(() => admin.auth().getUser(uid));
    if (userRecord.email === email) {
      console.log(`👤 Usuário Auth ${email} já existe com o UID correto.`);
      return userRecord;
    }
    console.log(`🔄 UID ${uid} existe mas com email diferente. Deletando...`);
    await retry(() => admin.auth().deleteUser(uid));
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  try {
    const userByEmail = await retry(() => admin.auth().getUserByEmail(email));
    console.log(`🗑️ Email ${email} já em uso pelo UID ${userByEmail.uid}. Deletando conflito...`);
    await retry(() => admin.auth().deleteUser(userByEmail.uid));
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  const userRecord = await retry(() => admin.auth().createUser({
    uid: uid,
    email: email,
    password: password,
    emailVerified: true
  }));
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
  console.log("🚀 Iniciando InovaHelix Match Seed v3.0 (Merged Portuguese DeepTech Ecosystem & Rich Deal Flow)...");
  
  // Clean Firebase Auth
  await cleanAuthUsers();

  const collections = ['users', 'projects', 'matches', 'conversations', 'messages', 'challenges', 'assets_ip', 'logs_ai', 'organizations', 'deals', 'signed_ndas', 'audit_logs', 'activity_events', 'domain_events'];
  for (const col of collections) {
    await clearCollection(col);
  }

  // Create Users in Firebase Auth
  console.log("🔑 Criando/atualizando contas no Firebase Auth...");
  await getOrCreateUser('ict_inatel', 'ict@inatel.br', 'inovahelix123');
  await getOrCreateUser('ict_fai_mg', 'ict_fai_mg@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('comp_ericsson', 'empresa@ericsson.com', 'inovahelix123');
  await getOrCreateUser('comp_siemens', 'siemens@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('comp_weg', 'weg@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('inv_kaszek', 'kaszek@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('inv_canary', 'canary@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('inventor_rafael', 'inventor@wailab.br', 'inovahelix123');
  await getOrCreateUser('inventor_camila', 'pesquisadora@wailab.br', 'inovahelix123');
  
  // Extra corporations and investors for a realistic show/matching
  await getOrCreateUser('company_qualcomm', 'qualcomm@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_cemig', 'cemig@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_nidec', 'nidec@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_schneider', 'schneider@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_embraer', 'embraer@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_vivo', 'vivo@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('company_tim', 'tim@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('investor_xG', 'xg@inovahelix.com', 'inovahelix123');
  await getOrCreateUser('ict_outra', 'ict_outra@inovahelix.com', 'inovahelix123');

  const batch = db.batch();

  // 1. Users Firestore Profiles
  const users = {
    'ict_fai_mg': { 
      id: 'ict_fai_mg', 
      role: 'ict', 
      orgId: 'ict_fai_mg_org',
      name: 'FAI-MG (NPDI / INTEF)', 
      email: 'ict_fai_mg@inovahelix.com',
      segment: 'Cloud / EdTech / TI',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Santa Rita do Sapucaí, MG',
      capabilities: [
        'Núcleo de Pesquisa, Desenvolvimento e Inovação (NPDI)',
        'Incubadora de Empresas (INTEF)',
        'AWS Academy Program',
        'Projetos FAITEC (Engenharia de Produção, Sistemas de Informação, Administração)'
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'ict_outra': { 
      id: 'ict_outra', 
      role: 'ict', 
      orgId: 'ict_outra_org',
      name: 'Universidade Federal de Itajubá - UNIFEI', 
      email: 'ict_outra@inovahelix.com',
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
      email: 'siemens@inovahelix.com',
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
      email: 'weg@inovahelix.com',
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
      email: 'kaszek@inovahelix.com',
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
      email: 'canary@inovahelix.com',
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
      email: 'qualcomm@inovahelix.com',
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
      email: 'cemig@inovahelix.com',
      segment: 'Energia e Cidades Inteligentes',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'Belo Hinovahelixte, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_nidec': {
      id: 'company_nidec',
      role: 'industry',
      name: 'Nidec Global Appliance',
      email: 'nidec@inovahelix.com',
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
      email: 'schneider@inovahelix.com',
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
      email: 'embraer@inovahelix.com',
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
      email: 'vivo@inovahelix.com',
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
      email: 'tim@inovahelix.com',
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
      email: 'xg@inovahelix.com',
      segment: 'VC Focado em Telecom & IoT',
      verified: true,
      subscriptionStatus: 'premium',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(users)) {
    const segments = data.segment 
      ? data.segment.split(/, | e | & |\/| e /).map(s => s.trim()).filter(Boolean)
      : [];
    if (data.segment && !segments.includes(data.segment)) {
      segments.push(data.segment);
    }
    batch.set(db.collection('users').doc(id), { ...data, segments });
  }

  // Seeding organizations collection
  const organizations = {
    'ict_fai_mg_org': {
      id: 'ict_fai_mg_org',
      name: 'FAI-MG (NPDI / INTEF)',
      type: 'ICT',
      managers: ['ict_fai_mg'],
      researchers: [
        {
          id: 'res_fai_01',
          name: 'Prof. Dr. Fábio Gavião',
          title: 'Doutor - Sistemas de Informação',
          department: 'Sistemas de Informação',
          expertise: 'Computação de Alta Performance (HPC) e Cloud Computing (AWS)',
          lattesUrl: 'http://lattes.cnpq.br/simulado_fai_01',
          hIndex: 18,
          patents: 3,
          email: 'fabio.gaviao@fai-mg.br',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          compatibility: 96
        },
        {
          id: 'res_fai_02',
          name: 'Profa. Dra. Sandra Carvalho',
          title: 'Doutora - Engenharia de Produção',
          department: 'Engenharia de Produção',
          expertise: 'Manufatura Enxuta (Green Belt), Integração Industrial e Logística',
          lattesUrl: 'http://lattes.cnpq.br/simulado_fai_02',
          hIndex: 15,
          patents: 5,
          email: 'sandra.carvalho@fai-mg.br',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
          compatibility: 89
        },
        {
          id: 'res_fai_03',
          name: 'Prof. Me. Carlos Alberto Mont\' Alvão',
          title: 'Mestre - Gestão da Qualidade',
          department: 'Gestão da Qualidade',
          expertise: 'ISO 9001, Pesquisa Operacional e Gestão de Riscos Industriais',
          lattesUrl: 'http://lattes.cnpq.br/simulado_fai_03',
          hIndex: 12,
          patents: 2,
          email: 'carlos.alvao@fai-mg.br',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          compatibility: 82
        },
        {
          id: 'res_fai_04',
          name: 'Profa. Me. Margarete Siqueira',
          title: 'Mestra - Núcleo de Empreendedorismo',
          department: 'Núcleo de Empreendedorismo (NEI/INTEF)',
          expertise: 'EdTech, Adaptive Learning e Modelagem de Novos Negócios',
          lattesUrl: 'http://lattes.cnpq.br/simulado_fai_04',
          hIndex: 10,
          patents: 1,
          email: 'margarete.siqueira@fai-mg.br',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          compatibility: 85
        }
      ],
      fundingCalls: [
        {
          id: 'edital_fai_01',
          title: 'Programa Centelha MG (FAPEMIG)',
          agency: 'FAPEMIG',
          type: 'Subvenção Econômica',
          amount: 'R$ 130.000',
          deadline: '2026-08-30',
          focus: 'Apoio a startups em fase inicial incubadas (INTEF)',
          status: 'open',
          matchScore: 88
        },
        {
          id: 'edital_fai_02',
          title: 'Chamada FINEP - Soluções em EdTech & GovTech',
          agency: 'FINEP',
          type: 'Fomento à Pesquisa',
          amount: 'R$ 500.000',
          deadline: '2026-10-15',
          focus: 'Plataformas SaaS para Educação e Cidades Inteligentes',
          status: 'open',
          matchScore: 92
        },
        {
          id: 'edital_fai_03',
          title: 'AWS Academy Cloud Research Grant',
          agency: 'AWS Partner Network',
          type: 'Créditos Cloud / Grant',
          amount: 'US$ 10.000',
          deadline: 'Fluxo Contínuo',
          focus: 'Projetos nativos em nuvem e arquiteturas de Machine Learning',
          status: 'open',
          matchScore: 95
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
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
    },
    {
      id: 'proj_fai_1',
      title: 'Sistema de Apoio à Decisão e BI para Gestão Tecnológica',
      segment: 'Tecnologia e Inovação',
      trl: 5,
      verified: true,
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      summary: 'Plataforma inteligente de análise de dados e BI baseada em inteligência artificial para otimização de processos de gestão e tomada de decisão estratégica em micro e pequenas empresas do Vale da Eletrônica.',
      ticket: '100k',
      researcher: 'Prof. Msc. FAI de Santa Rita',
      patentStatus: 'Registro de Software Depositado',
      ictName: 'FAI-MG (NPDI / INTEF)',
      fundingTags: ['FAPEMIG', 'Editais FAI']
    },
    {
      id: 'proj_fai_2',
      title: 'Rastreabilidade de Café Especial via Blockchain (FAITEC)',
      segment: 'Software & Agro',
      trl: 6,
      verified: true,
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      summary: 'Plataforma descentralizada baseada em blockchain para rastreamento da cadeia de custódia de cafés especiais no Sul de Minas, conectando produtores a compradores globais com verificação de sustentabilidade.',
      ticket: '150k',
      researcher: 'Prof. Dr. Inovação FAI (FAITEC)',
      patentStatus: 'Registro de Software Solicitado',
      ictName: 'FAI-MG (NPDI / INTEF)',
      fundingTags: ['Lei do Bem', 'FAITEC']
    },
    {
      id: 'proj_fai_3',
      title: 'Dispositivo IoT de Baixo Custo para Eficiência Hídrica (FAITEC)',
      segment: 'Hardware & Agro',
      trl: 7,
      verified: true,
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      summary: 'Sensores de umidade do solo conectados via LoRaWAN com algoritmo de otimização de irrigação por IA, desenvolvidos especificamente para agricultura familiar e pequenas fazendas da microrregião de Santa Rita.',
      ticket: '80k',
      researcher: 'Coord. Engenharia FAI (FAITEC)',
      patentStatus: 'Patente Depositada (BR 10 2026)',
      ictName: 'FAI-MG (NPDI / INTEF)',
      fundingTags: ['FAPEMIG', 'FAITEC']
    },
    { 
      id: 'p_fai_01', 
      title: 'Cloud-Native Adaptive Learning Engine', 
      summary: 'Motor educacional preditivo hospedado em AWS. Analisa o engajamento de alunos em tempo real para personalizar trilhas de ensino.', 
      segment: 'EdTech / IA', 
      trl: 6, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '250k', 
      ictName: 'FAI-MG (INTEF)', 
      researcher: 'Profa. Me. Margarete Siqueira', 
      patentStatus: 'Registro de Software (INPI)',
      fundingTags: ['AWS Academy', 'FINEP']
    },
    { 
      id: 'p_fai_02', 
      title: 'ITIL V3 Automated Workflow Orchestrator', 
      summary: 'Plataforma SaaS para governança automatizada de TI baseada nas normativas ITIL. Reduz o MTTR (Mean Time to Repair) de service desks corporativos em 40%.', 
      segment: 'IT Management', 
      trl: 8, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '1M', 
      ictName: 'FAI-MG (NPDI)', 
      researcher: 'Prof. Rodrigo R. Magalhães', 
      patentStatus: 'Segredo Industrial',
      fundingTags: ['NPDI', 'Lei do Bem']
    },
    { 
      id: 'p_fai_03', 
      title: 'Edge-to-Cloud Backup Automation para IoT', 
      summary: 'Solução arquitetada na nuvem (AWS/Azure) para crescimento automático de infraestrutura e backups descentralizados para sensores Smart City.', 
      segment: 'Cloud Computing / IoT', 
      trl: 5, 
      verified: false, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '50k', 
      ictName: 'FAI-MG (NPDI)', 
      researcher: 'Núcleo de Computação FAI', 
      patentStatus: 'Depositada',
      fundingTags: ['AWS Academy', 'FAITEC']
    },
    { 
      id: 'p_fai_04', 
      title: 'Dashboard Analítico para Cadeias Produtivas', 
      summary: 'Sistema de gestão da informação acoplado a ERPs para otimização em tempo real de chão de fábrica e fomento de Lei da Informática.', 
      segment: 'Sistemas de Informação', 
      trl: 7, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '250k', 
      ictName: 'FAI-MG (INTEF)', 
      researcher: 'Prof. Dr. José Cláudio Pereira', 
      patentStatus: 'Registro de Software (INPI)',
      fundingTags: ['Lei da Informática', 'INTEF']
    },
    { 
      id: 'p_fai_05', 
      title: 'Smart Factory Twin (Digital Twin)', 
      summary: 'Gêmeo digital integrável a sistemas ERP legado para simulação de gargalos em linhas de montagem de eletrônicos do polo industrial.', 
      segment: 'Industry 4.0 / Gestão', 
      trl: 7, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '250k', 
      ictName: 'FAI-MG (Eng. de Produção)', 
      researcher: 'Núcleo de Engenharia de Produção', 
      patentStatus: 'Registro de Software (INPI)',
      fundingTags: ['FAPEMIG', 'Sebrae']
    },
    { 
      id: 'p_fai_06', 
      title: 'RiskScore AI Supply Chain', 
      summary: 'Motor de inteligência artificial para análise preditiva de crédito e risco de ruptura na cadeia de suprimentos de hardware B2B.', 
      segment: 'FinTech / Gestão', 
      trl: 5, 
      verified: false, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '50k', 
      ictName: 'FAI-MG (INTEF)', 
      researcher: 'Prof. Carlos Eduardo', 
      patentStatus: 'Segredo Industrial',
      fundingTags: ['INTEF', 'Sebrae']
    },
    { 
      id: 'p_fai_07', 
      title: 'Immersive Tech Training VR', 
      summary: 'Plataforma de realidade virtual (VR) para treinamento de operadores de maquinário SMT, reduzindo o tempo de onboarding industrial em 60%.', 
      segment: 'EdTech / HR Tech', 
      trl: 6, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '250k', 
      ictName: 'FAI-MG (FAITEC Lab)', 
      researcher: 'Grupo de Pesquisa em Educação Tecnológica', 
      patentStatus: 'Depositada',
      fundingTags: ['FAITEC', 'FAPEMIG']
    },
    { 
      id: 'p_fai_08', 
      title: 'Urban Logistics Data Mesh', 
      summary: 'Algoritmo de roteirização dinâmica baseado em análise de dados em nuvem para otimização logística em polos de inovação descentralizados.', 
      segment: 'Logistics / Smart City', 
      trl: 8, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '1M', 
      ictName: 'FAI-MG (Sistemas de Informação)', 
      researcher: 'Profa. Dra. Silvana', 
      patentStatus: 'Registro de Software (INPI)',
      fundingTags: ['CNPq', 'FINEP']
    },
    { 
      id: 'p_fai_09', 
      title: 'Automação RPA para Compliance Fiscal', 
      summary: 'Robôs de automação de processos (RPA) desenhados para auditoria fiscal contínua de indústrias que utilizam benefícios da Lei da Informática e Rota 2030.', 
      segment: 'RegTech / Gestão', 
      trl: 9, 
      verified: true, 
      userId: 'ict_fai_mg',
      orgId: 'ict_fai_mg_org',
      ticket: '250k', 
      ictName: 'FAI-MG (INTEF)', 
      researcher: 'Núcleo de Administração e Negócios', 
      patentStatus: 'Registro de Software (INPI)',
      fundingTags: ['Lei da Informática', 'INTEF']
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
      contactEmail: `${p.userId}@inovahelix.com`,
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
