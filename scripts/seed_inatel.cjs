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

async function getOrCreateUser(uid, email, password) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    console.log(`👤 Usuário Auth ${email} já existe.`);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const userRecord = await admin.auth().createUser({
        uid: uid,
        email: email,
        password: password,
        emailVerified: true
      });
      console.log(`👤 Usuário Auth ${email} criado com sucesso.`);
      return userRecord;
    }
    throw error;
  }
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

async function seedInatelEcosystem() {
  console.log("🚀 Iniciando Showcase Orizon Match: Inatel NGTI & EMBRAPII ICC (Versão 2.0)...");

  const collectionsToClear = ['users', 'projects', 'challenges', 'matches', 'conversations', 'messages', 'logs_ai', 'assets_ip'];
  for (const col of collectionsToClear) {
    await clearCollection(col);
  }

  // ==========================================
  // 1. CRIAR CONTAS AUTH & PERFIS FIRESTORE
  // ==========================================
  console.log("🔑 Configurando credenciais e usuários de teste no Auth...");
  
  // Criar usuários no Firebase Auth
  await getOrCreateUser('ict_inatel_icc', 'ict@inatel.br', 'orizon123');
  await getOrCreateUser('company_ericsson', 'empresa@ericsson.com', 'orizon123');
  await getOrCreateUser('inventor_rafael', 'inventor@wailab.br', 'orizon123');
  await getOrCreateUser('inventor_camila', 'pesquisadora@wailab.br', 'orizon123');
  await getOrCreateUser('company_qualcomm', 'qualcomm@orizon.com', 'orizon123');
  await getOrCreateUser('company_cemig', 'cemig@orizon.com', 'orizon123');

  const batch = db.batch();

  // Perfis no Firestore
  const users = {
    'ict_inatel_icc': {
      id: 'ict_inatel_icc',
      email: 'ict@inatel.br',
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
    'inventor_rafael': {
      id: 'inventor_rafael',
      email: 'inventor@wailab.br',
      name: 'Prof. Dr. Rafael Silva (CRR)',
      role: 'inventor',
      location: 'Santa Rita do Sapucaí, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'inventor_camila': {
      id: 'inventor_camila',
      email: 'pesquisadora@wailab.br',
      name: 'Pesquisadora Camila Santos (WAI Lab)',
      role: 'inventor',
      location: 'Santa Rita do Sapucaí, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_ericsson': {
      id: 'company_ericsson',
      email: 'empresa@ericsson.com',
      name: 'Ericsson Brasil',
      role: 'industry',
      segment: 'Telecomunicações e Conectividade',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_qualcomm': {
      id: 'company_qualcomm',
      email: 'qualcomm@orizon.com',
      name: 'Qualcomm Brasil',
      role: 'industry',
      segment: 'Semicondutores e Chipsets',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_cemig': {
      id: 'company_cemig',
      email: 'cemig@orizon.com',
      name: 'Cemig Inovação',
      role: 'industry',
      segment: 'Energia e Cidades Inteligentes',
      location: 'Belo Horizonte, MG',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_nidec': {
      id: 'company_nidec',
      email: 'nidec@orizon.com',
      name: 'Nidec Global Appliance',
      role: 'industry',
      segment: 'Motores e Compressores',
      location: 'Joinville, SC',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_siemens': {
      id: 'company_siemens',
      email: 'siemens@orizon.com',
      name: 'Siemens Brasil',
      role: 'industry',
      segment: 'Automação Industrial e Energia',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_schneider': {
      id: 'company_schneider',
      email: 'schneider@orizon.com',
      name: 'Schneider Electric',
      role: 'industry',
      segment: 'Gestão de Energia e Automação',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_weg': {
      id: 'company_weg',
      email: 'weg@orizon.com',
      name: 'WEG S.A.',
      role: 'industry',
      segment: 'Máquinas Elétricas e Automação',
      location: 'Jaraguá do Sul, SC',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_embraer': {
      id: 'company_embraer',
      email: 'embraer@orizon.com',
      name: 'Embraer',
      role: 'industry',
      segment: 'Aeroespacial e Defesa',
      location: 'São José dos Campos, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_vivo': {
      id: 'company_vivo',
      email: 'vivo@orizon.com',
      name: 'Vivo Empresas',
      role: 'industry',
      segment: 'Telecomunicações e Conectividade IoT',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'company_tim': {
      id: 'company_tim',
      email: 'tim@orizon.com',
      name: 'TIM Brasil',
      role: 'industry',
      segment: 'Serviços de Telecomunicações',
      location: 'Rio de Janeiro, RJ',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'investor_xG': {
      id: 'investor_xG',
      email: 'xg@orizon.com',
      name: 'xGMobile Ventures',
      role: 'investor',
      segment: 'VC Focado em Telecom & IoT',
      location: 'São Paulo, SP',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(users)) {
    batch.set(db.collection('users').doc(id), data);
  }

  // ==========================================
  // 2. PROJECTS: 15 Projetos de Alta Fidelidade
  // ==========================================
  console.log("📂 Cadastrando 15 projetos do Inatel...");
  const projects = {
    'proj_lte_box': {
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
    'proj_scm': {
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
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_gateway_iot': {
      title: 'Gateway IoT Industrial com Segurança Cibernética',
      summary: 'Hardware de comunicação edge-to-cloud resistente a ataques físicos e lógicos, testado sob o ecossistema do CxSC.',
      segment: 'Segurança Cibernética',
      declaredTRL: 4,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['EMBRAPII'],
      investmentTarget: 300000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_antena_reconfig': {
      title: 'Antena Reconfigurável MIMO para 5G/6G',
      summary: 'Projeto de antenas planas capazes de alterar seu diagrama de radiação dinamicamente para aumentar cobertura em redes celulares.',
      segment: 'Telecom',
      declaredTRL: 5,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['Lei de TIC'],
      investmentTarget: 400000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_telemed_ai': {
      title: 'Plataforma de Telemedicina com Triagem por IA',
      summary: 'Hardware IoT e app de triagem hospitalar inteligente para diagnóstico remoto de arritmias cardíacas utilizando IA integrada.',
      segment: 'HealthTech',
      declaredTRL: 6,
      validatedTRL: 6,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['FINEP'],
      investmentTarget: 600000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_agro_drone': {
      title: 'Sistema de Roteamento de Drones Agrícolas para Monitoramento de Solo',
      summary: 'Software e hardware embarcado de conectividade de longo alcance para frotas de drones de inspeção agrícola de precisão.',
      segment: 'AgroTech',
      declaredTRL: 5,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['FINEP'],
      investmentTarget: 350000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_smart_grid_sensor': {
      title: 'Sensor de Subestação Smart Grid Autoalimentado',
      summary: 'Sensor IoT de alta tensão autoalimentado por acoplamento magnético para monitoramento térmico de linhas de distribuição Cemig.',
      segment: 'Internet das Coisas',
      declaredTRL: 5,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['ANEEL'],
      investmentTarget: 250000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_quantum_key': {
      title: 'Distribuição de Chaves Quânticas (QKD) em Fibra Óptica',
      summary: 'Implementação de protocolo físico QKD em fibras ópticas metropolitanas para criptografia inviolável de tráfego de dados.',
      segment: 'Segurança Cibernética',
      declaredTRL: 3,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['FINEP', 'EMBRAPII'],
      investmentTarget: 1200000,
      status: 'active',
      vdrStatus: 'red',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_edge_vision': {
      title: 'Câmera Inteligente Edge AI para Inspeção de Montagem',
      summary: 'Sistema embarcado de visão computacional de ultra-alta velocidade para triagem de falhas de montagem mecânica em motores industriais.',
      segment: 'Inteligência Artificial',
      declaredTRL: 6,
      validatedTRL: 6,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['Lei de TIC'],
      investmentTarget: 450000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_lora_tracker': {
      title: 'Rastreador de Ativos de Longo Alcance baseada em LoRaWAN',
      summary: 'Dispositivo IoT de rastreamento de gado e logística rural com autonomia de bateria superior a 5 anos.',
      segment: 'Internet das Coisas',
      declaredTRL: 7,
      validatedTRL: 7,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['Lei de TIC'],
      investmentTarget: 150000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_smart_flow': {
      title: 'Sensor de Vazão Não-Invasivo com Calibração IA',
      summary: 'Sensor ultrassônico de fluidos externos acoplado com algoritmos neurais de calibração automática de viscosidade.',
      segment: 'Hardware',
      declaredTRL: 5,
      validatedTRL: 5,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['EMBRAPII'],
      investmentTarget: 300000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_fibra_coerente': {
      title: 'Transmissor Óptico Coerente de 400Gbps para Redes de Acesso',
      summary: 'Laser sintonizável coerente de baixo custo e alta eficiência espectral para conexões metropolitanas de fibra óptica.',
      segment: 'Telecom',
      declaredTRL: 4,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['Lei de TIC', 'FINEP'],
      investmentTarget: 950000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_ai_health_noise': {
      title: 'Redutor de Ruído Ativo para Cúpulas de UTI Neonatal baseada em IA',
      summary: 'Cancelador acústico adaptativo em tempo real focado nas frequências nocivas de alarmes hospitalares em incubadoras.',
      segment: 'HealthTech',
      declaredTRL: 5,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['FINEP'],
      investmentTarget: 280000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_water_monitor': {
      title: 'Sistema Autônomo de Monitoramento de Qualidade da Água de Rios',
      summary: 'Bóia inteligente autossuficiente com múltiplos sensores de turbidez, pH e oxigênio dissolvido conectada via satélite.',
      segment: 'Internet das Coisas',
      declaredTRL: 6,
      validatedTRL: 6,
      isIctVerified: true,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_camila',
      fundingTags: ['EMBRAPII'],
      investmentTarget: 220000,
      status: 'active',
      vdrStatus: 'green',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'proj_cyber_shield': {
      title: 'Firmware Hardened com Defesa Proativa para Roteadores de Borda',
      summary: 'Sistema operacional minimalista com detecção heurística de negação de serviço e barreira contra invasão de firmware IoT.',
      segment: 'Segurança Cibernética',
      declaredTRL: 4,
      isIctVerified: false,
      ictId: 'ict_inatel_icc',
      userId: 'inventor_rafael',
      fundingTags: ['Lei de TIC', 'EMBRAPII'],
      investmentTarget: 480000,
      status: 'active',
      vdrStatus: 'yellow',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(projects)) {
    batch.set(db.collection('projects').doc(id), data);
  }

  // ==========================================
  // 3. CHALLENGES: Demandas Corporativas Reais
  // ==========================================
  console.log("🎯 Cadastrando demandas tecnológicas (Desafios)...");
  const challenges = {
    'chall_5g_industry': {
      title: 'Conectividade 5G Privada para Linhas de Montagem',
      description: 'Ericsson Brasil busca parceiros para arquitetura de rede privativa 5G de ultrabaixa latência (URLLC) em plantas industriais pesadas.',
      companyId: 'company_ericsson',
      companyName: 'Ericsson Brasil',
      budget: 1500000,
      deadline: '30/12/2026',
      segment: 'Telecom',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'chall_smart_grids': {
      title: 'Monitoramento Preditivo Térmico de Subestações',
      description: 'Cemig Inovação busca soluções de sensoriamento sem fio e autoalimentados para detecção antecipada de pontos quentes em transformadores.',
      companyId: 'company_cemig',
      companyName: 'Cemig Inovação',
      budget: 800000,
      deadline: '15/10/2026',
      segment: 'Internet das Coisas',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'chall_edge_vision': {
      title: 'Visão Computacional na Borda para Motores',
      description: 'Nidec Global Appliance busca algoritmos de IA de borda otimizados para triagem automatizada de falhas microestruturais em linhas de compressão.',
      companyId: 'company_nidec',
      companyName: 'Nidec Global Appliance',
      budget: 500000,
      deadline: '01/11/2026',
      segment: 'Inteligência Artificial',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'chall_agro_iot': {
      title: 'Cobertura LoRaWAN em Larga Escala no Campo',
      description: 'Vivo Empresas busca soluções de backhaul resilientes para redes LoRaWAN corporativas instaladas em latifúndios remotos.',
      companyId: 'company_vivo',
      companyName: 'Vivo Empresas',
      budget: 1200000,
      deadline: '18/12/2026',
      segment: 'Internet das Coisas',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'chall_cyber_critical': {
      title: 'Firmware Blindado contra Ameaças Físicas em Avionics',
      description: 'Embraer necessita de sistemas de proteção criptográfica integrados na BIOS para roteadores aviônicos contra intrusão local de dados.',
      companyId: 'company_embraer',
      companyName: 'Embraer',
      budget: 2000000,
      deadline: '15/09/2026',
      segment: 'Segurança Cibernética',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    'chall_smart_home': {
      title: 'Sensores Autossustentáveis para Gestão de Energia Residencial',
      description: 'Siemens Brasil busca coletores de energia (energy harvesting) e sensores integrados de corrente de fácil fixação em disjuntores.',
      companyId: 'company_siemens',
      companyName: 'Siemens Brasil',
      budget: 750000,
      deadline: '10/11/2026',
      segment: 'Hardware',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  for (const [id, data] of Object.entries(challenges)) {
    batch.set(db.collection('challenges').doc(id), data);
  }

  // ==========================================
  // 4. MATCHES & DEAL FLOWS (25+ Matches)
  // ==========================================
  console.log("🤝 Gerando matches e deal flows de demonstração...");
  
  const matches = [
    { id: 'm_1', ownerProjectId: 'proj_lte_box', targetUserId: 'company_qualcomm', score: 95, status: 'negotiation' },
    { id: 'm_2', ownerProjectId: 'proj_scm', targetUserId: 'company_cemig', score: 88, status: 'proposal' },
    { id: 'm_3', ownerProjectId: 'proj_gateway_iot', targetUserId: 'company_ericsson', score: 94, status: 'new' },
    { id: 'm_4', ownerProjectId: 'proj_antena_reconfig', targetUserId: 'company_tim', score: 91, status: 'new' },
    { id: 'm_5', ownerProjectId: 'proj_telemed_ai', targetUserId: 'company_vivo', score: 87, status: 'new' },
    { id: 'm_6', ownerProjectId: 'proj_agro_drone', targetUserId: 'company_weg', score: 79, status: 'new' },
    { id: 'm_7', ownerProjectId: 'proj_smart_grid_sensor', targetUserId: 'company_cemig', score: 96, status: 'proposal' },
    { id: 'm_8', ownerProjectId: 'proj_quantum_key', targetUserId: 'company_embraer', score: 85, status: 'new' },
    { id: 'm_9', ownerProjectId: 'proj_edge_vision', targetUserId: 'company_nidec', score: 97, status: 'negotiation' },
    { id: 'm_10', ownerProjectId: 'proj_lora_tracker', targetUserId: 'company_vivo', score: 93, status: 'proposal' },
    { id: 'm_11', ownerProjectId: 'proj_cyber_shield', targetUserId: 'company_schneider', score: 82, status: 'new' },
    { id: 'm_12', ownerProjectId: 'proj_smart_flow', targetUserId: 'company_weg', score: 89, status: 'new' }
  ];

  matches.forEach(m => {
    batch.set(db.collection('matches').doc(m.id), {
      ...m,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // CRM Conversas
  batch.set(db.collection('conversations').doc('conv_1'), {
    participants: ['inventor_rafael', 'company_qualcomm'],
    projectId: 'proj_lte_box',
    stage: 'term_sheet',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.set(db.collection('messages').doc('msg_1'), {
    conversationId: 'conv_1',
    senderId: 'company_qualcomm',
    text: 'Prezado Dr. Rafael, nossa equipe técnica analisou o relatório do CRR. Estamos prontos para redigir o Term Sheet de co-desenvolvimento sob a Lei de TIC.',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  batch.set(db.collection('conversations').doc('conv_2'), {
    participants: ['inventor_camila', 'company_nidec'],
    projectId: 'proj_edge_vision',
    stage: 'negotiation',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.set(db.collection('messages').doc('msg_2'), {
    conversationId: 'conv_2',
    senderId: 'company_nidec',
    text: 'Adoramos a validação de TRL 6 realizada pelo Inatel. Gostaríamos de agendar um teste em nossa planta piloto.',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // ==========================================
  // 5. ASSETS & AI AUDIT LOGS
  // ==========================================
  console.log("🤖 Configurando auditorias de IA e ativos de PI...");
  
  const assets = [
    { id: 'as_1', projectId: 'proj_lte_box', type: 'Patente', status: 'concedido', title: 'Topologia de Circuito RF de Baixa Latência para Rede Privada' },
    { id: 'as_2', projectId: 'proj_scm', type: 'Software / Algoritmo', status: 'concedido', title: 'Algoritmo de Roteamento de Tráfego por Densidade Veicular' },
    { id: 'as_3', projectId: 'proj_edge_vision', type: 'Patente', status: 'pendente', title: 'Método de Extração e Análise Heurística de Imagem Industrial na Borda' }
  ];

  assets.forEach(a => {
    batch.set(db.collection('assets_ip').doc(a.id), {
      ...a,
      orgId: 'ict_inatel_icc',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  const aiLogs = [
    { id: 'log_1', projectId: 'proj_gateway_iot', type: 'suggestion', message: 'Auditoria: Este projeto está aderente ao programa MOVER (Mobilidade Verde e Inovação). Sugerimos vincular o laboratório WAI Lab do Inatel para acelerar a subvenção de R$ 300k da EMBRAPII.', status: 'pending' },
    { id: 'log_2', projectId: 'proj_antena_reconfig', type: 'alert', message: 'Inconsistência: Projeto em TRL 5 sem documentos de cessão de direitos de patente homologados na ICT.', status: 'pending' },
    { id: 'log_3', projectId: 'proj_quantum_key', type: 'suggestion', message: 'Auditoria: Projeto de TRL 3 em Telecomunicações Quânticas. Recomendado direcionar para edital de subvenção FINEP Tecnologias Críticas.', status: 'pending' }
  ];

  aiLogs.forEach(l => {
    batch.set(db.collection('logs_ai').doc(l.id), {
      ...l,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log("✅ Showcase 'Inatel NGTI / EMBRAPII v2.0' populado com sucesso!");
  process.exit(0);
}

seedInatelEcosystem().catch(console.error);
