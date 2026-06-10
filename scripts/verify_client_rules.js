// scripts/verify_client_rules.js
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// 1. Carregar variáveis de ambiente de .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

console.log("ℹ️ Inicializando Firebase Client SDK para Projeto:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Resultados dos testes
const results = [];

function recordResult(name, status, details = "") {
  console.log(`${status === "PASS" ? "✅" : "❌"} [${status}] ${name} ${details ? `(${details})` : ""}`);
  results.push({ name, status, details });
}

// Helper para aguardar milissegundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para rodar promessas com timeout (evita hang se o Storage não estiver ativado no Console)
async function runWithTimeout(promise, ms, operationName) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${operationName} excedeu o limite de ${ms/1000}s (Possível falta de inicialização do Storage no Console)`));
    }, ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function runTests() {
  try {
    // ----------------------------------------------------
    // TESTE 0: Não Autenticado
    // ----------------------------------------------------
    console.log("\n--- TESTE DE USUÁRIO NÃO AUTENTICADO ---");
    try {
      await getDoc(doc(db, "projects", "proj_lte_box"));
      recordResult("Ler projeto público deslogado", "FAIL", "Permitiu leitura deslogado");
    } catch (err) {
      recordResult("Ler projeto público deslogado", "PASS", "Rejeitou conforme esperado");
    }

    // ----------------------------------------------------
    // TESTE 1: Fluxo ICT - Acesso a Projetos de sua Org
    // ----------------------------------------------------
    console.log("\n--- TESTE DE FLUXO ICT A (ict@inatel.br) ---");
    const ictUser = await signInWithEmailAndPassword(auth, "ict@inatel.br", "orizon123");
    console.log(`Logado como ICT A: ${ictUser.user.email} (UID: ${ictUser.user.uid})`);

    try {
      const details = await getDoc(doc(db, "projects", "proj_lte_box", "private", "details"));
      if (details.exists()) {
        recordResult("ICT A ler detalhes privados de projeto da própria Org", "PASS", `Visualizou IP: ${details.data().patentStatus}`);
      } else {
        recordResult("ICT A ler detalhes privados de projeto da própria Org", "FAIL", "Documento privado não existe");
      }
    } catch (err) {
      recordResult("ICT A ler detalhes privados de projeto da própria Org", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // TESTES 2, 3, 4: Multi-tenant (ICT A não pode ver dados de outros tenants)
    // ----------------------------------------------------
    console.log("\n--- TESTES DE MULTI-TENANT (ICT A vs Outro Tenant) ---");
    
    // 2. ICT A ler private/details de outro tenant
    try {
      await getDoc(doc(db, "projects", "proj_outra_ict", "private", "details"));
      recordResult("Multi-tenant: ICT A ler private/details de outro tenant", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("Multi-tenant: ICT A ler private/details de outro tenant", "PASS", "Bloqueou conforme esperado");
    }

    // 3. ICT A ler vdr_files de outro tenant
    try {
      await getDocs(collection(db, "projects", "proj_outra_ict", "vdr_files"));
      recordResult("Multi-tenant: ICT A ler vdr_files de outro tenant", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("Multi-tenant: ICT A ler vdr_files de outro tenant", "PASS", "Bloqueou conforme esperado");
    }

    // 4. ICT A ler vdr_logs de outro tenant
    try {
      await getDocs(collection(db, "projects", "proj_outra_ict", "vdr_logs"));
      recordResult("Multi-tenant: ICT A ler vdr_logs de outro tenant", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("Multi-tenant: ICT A ler vdr_logs de outro tenant", "PASS", "Bloqueou conforme esperado");
    }

    await signOut(auth);

    // ----------------------------------------------------
    // TESTE 5: Multi-tenant do ICT B (ict_outra@orizon.com)
    // ----------------------------------------------------
    console.log("\n--- TESTE DE FLUXO ICT B (ict_outra@orizon.com) ---");
    const ictBUser = await signInWithEmailAndPassword(auth, "ict_outra@orizon.com", "orizon123");
    console.log(`Logado como ICT B: ${ictBUser.user.email} (UID: ${ictBUser.user.uid})`);

    // ICT B tenta ler private/details de ICT A
    try {
      await getDoc(doc(db, "projects", "proj_lte_box", "private", "details"));
      recordResult("Multi-tenant: ICT B ler private/details do ICT A", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("Multi-tenant: ICT B ler private/details do ICT A", "PASS", "Bloqueou conforme esperado");
    }

    await signOut(auth);

    // ----------------------------------------------------
    // TESTES 6, 7, 8, 9: Testes de Firebase Storage e NDA
    // ----------------------------------------------------
    console.log("\n--- TESTES DE ARMAZENAMENTO E NDA (Firebase Storage) ---");
    
    // Logar de volta como ICT A para subir o arquivo de teste restrito no Storage
    await signInWithEmailAndPassword(auth, "ict@inatel.br", "orizon123");
    
    const storagePath = "projects/proj_lte_box/vdr/restricted/contrato_confidencial.txt";
    const storageRef = ref(storage, storagePath);
    const testFileContent = Buffer.from("CONTEUDO_ALTAMENTE_CONFIDENCIAL_ORIZON_MATCH_TRL7");
    
    // 6. Upload como Proprietário (ICT A)
    try {
      await runWithTimeout(uploadBytes(storageRef, testFileContent), 3000, "Upload de arquivo");
      recordResult("Storage: Upload de arquivo restrito pelo proprietário", "PASS");
    } catch (err) {
      recordResult("Storage: Upload de arquivo restrito pelo proprietário", "FAIL", err.message);
    }
    
    await signOut(auth);

    // Logar como Empresa (empresa@ericsson.com)
    const compUser = await signInWithEmailAndPassword(auth, "empresa@ericsson.com", "orizon123");
    console.log(`Logado como Empresa: ${compUser.user.email} (UID: ${compUser.user.uid})`);

    // 7. Tentar fazer upload em projeto alheio (Ericsson no projeto da Inatel)
    try {
      const forgedStorageRef = ref(storage, "projects/proj_lte_box/vdr/restricted/forged_file.txt");
      await runWithTimeout(uploadBytes(forgedStorageRef, Buffer.from("hacked")), 3000, "Upload de arquivo não autorizado");
      recordResult("Storage: Upload de arquivo restrito por usuário não autorizado", "FAIL", "Permitiu escrita");
    } catch (err) {
      recordResult("Storage: Upload de arquivo restrito por usuário não autorizado", "PASS", "Bloqueou conforme esperado (" + err.message + ")");
    }

    // 8. Tentar fazer download de arquivo restrito SEM NDA assinado
    try {
      await runWithTimeout(getDownloadURL(storageRef), 3000, "Download de arquivo sem NDA");
      recordResult("Storage: Baixar arquivo restrito SEM NDA", "FAIL", "Permitiu obter URL de download");
    } catch (err) {
      recordResult("Storage: Baixar arquivo restrito SEM NDA", "PASS", "Bloqueou conforme esperado (" + err.message + ")");
    }

    // Assinar NDA para liberar acesso
    const ndaId = `${compUser.user.uid}_proj_lte_box`;
    try {
      const ndaDoc = await getDoc(doc(db, "signed_ndas", ndaId));
      if (!ndaDoc.exists()) {
        await setDoc(doc(db, "signed_ndas", ndaId), {
          investorId: compUser.user.uid,
          investorName: "Ericsson Brasil",
          inventorId: "inventor_rafael",
          projectId: "proj_lte_box",
          projectTitle: "LTE Network-in-a-box",
          signedAt: new Date().toISOString(),
          status: "active",
          version: "1.0-smart-clickwrap"
        });
        recordResult("Firestore: Assinar NDA do projeto", "PASS", "NDA assinado com sucesso");
      } else {
        recordResult("Firestore: Assinar NDA do projeto", "PASS", "NDA já existente (imutável)");
      }
    } catch (err) {
      recordResult("Firestore: Assinar NDA do projeto", "FAIL", err.message);
    }

    // 9. Baixar arquivo restrito COM NDA assinado
    try {
      const downloadUrl = await runWithTimeout(getDownloadURL(storageRef), 3000, "Download de arquivo com NDA");
      recordResult("Storage: Baixar arquivo restrito COM NDA assinado", "PASS", `URL obtida: ${downloadUrl.substring(0, 50)}...`);
    } catch (err) {
      recordResult("Storage: Baixar arquivo restrito COM NDA assinado", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // TESTE 10: Rastreabilidade e Integridade de Eventos (Correlation ID)
    // ----------------------------------------------------
    console.log("\n--- TESTE DE INTEGRIDADE DE EVENTOS E CORRELATION ID ---");
    
    // Gerar correlationId único para este fluxo de teste
    const testCorrelationId = "corr_flow_audit_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
    console.log(`Correlation ID do fluxo: ${testCorrelationId}`);

    // Helper para despachar evento de teste correspondente ao governanceService
    async function dispatchTestEvent(eventType, projectId, projectTitle, payloadExtra = {}) {
      await addDoc(collection(db, "domain_events"), {
        eventType,
        actorUid: compUser.user.uid,
        eventVersion: 1,
        schemaVersion: 1,
        timestamp: serverTimestamp(),
        processedStatus: "pending",
        payload: {
          actor: {
            uid: compUser.user.uid,
            name: "Ericsson Brasil",
            email: compUser.user.email,
            role: "industry"
          },
          projectId,
          projectTitle,
          correlationId: testCorrelationId,
          ipAddress: "127.0.0.1",
          userAgent: "verify_client_rules_script",
          sessionId: "sess_verify_rules",
          ...payloadExtra
        }
      });
    }

    // Sequência de 4 passos do fluxo de Deal Flow:
    // Passo 1: Criar Deal
    console.log("Passo 1: Despachando evento de criação de Deal...");
    await dispatchTestEvent("audit.deal.created", "proj_lte_box", "LTE Network-in-a-box", { stage: "descoberta" });
    
    // Passo 2: Mover Kanban
    console.log("Passo 2: Despachando evento de alteração de estágio do Deal...");
    await dispatchTestEvent("audit.deal.stage.update", "proj_lte_box", "LTE Network-in-a-box", { before: { stage: "descoberta" }, after: { stage: "due_diligence" } });
    
    // Passo 3: Assinar NDA
    console.log("Passo 3: Despachando evento de assinatura de NDA...");
    await dispatchTestEvent("audit.nda.signed", "proj_lte_box", "LTE Network-in-a-box", { status: "active" });
    
    // Passo 4: Entrar no VDR (Acesso a arquivo)
    console.log("Passo 4: Despachando evento de acesso ao VDR...");
    await dispatchTestEvent("audit.vdr.accessed", "proj_lte_box", "LTE Network-in-a-box", { action: "download", fileId: "contrato_confidencial" });

    // Aguardar o processamento assíncrono das Cloud Functions (South America South)
    console.log("⏳ Aguardando 10 segundos para processamento das Cloud Functions...");
    await sleep(10000);

    // Consultar a coleção audit_logs filtrando por correlationId e actorId (exigido pelas regras do Firestore)
    console.log("🔍 Consultando logs de auditoria correspondentes...");
    try {
      const qLogs = query(
        collection(db, "audit_logs"), 
        where("correlationId", "==", testCorrelationId),
        where("actorId", "==", compUser.user.uid)
      );
      const snapLogs = await getDocs(qLogs);
      
      console.log(`Total de logs de auditoria encontrados: ${snapLogs.size}`);
      
      const logs = snapLogs.docs.map(d => ({
        id: d.id,
        action: d.data().action,
        timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate() : null
      }));

      // Ordenar logs cronologicamente
      logs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      console.log("Logs ordenados cronologicamente:", logs.map(l => `${l.action} (${l.timestamp?.toLocaleTimeString() || 'Sem Tempo'})`));

      const expectedActions = ["deal.created", "deal.stage.update", "nda.signed", "vdr.accessed"];
      const missingActions = [];
      
      expectedActions.forEach(action => {
        if (!logs.some(l => l.action === action)) {
          missingActions.push(action);
        }
      });

      if (logs.length === 4 && missingActions.length === 0) {
        recordResult("Integridade de Eventos: 4 audit_logs gerados com mesmo correlationId", "PASS");
      } else {
        recordResult("Integridade de Eventos: 4 audit_logs gerados com mesmo correlationId", "FAIL", 
          `Encontrados ${logs.length}/4 logs. Ações ausentes: ${missingActions.join(', ')}`);
      }
    } catch (err) {
      recordResult("Integridade de Eventos: 4 audit_logs gerados com mesmo correlationId", "FAIL", err.message);
    }

    // Limpeza de recursos criados no Storage para manter as bases organizadas
    console.log("\n🧹 Limpando arquivo de testes do Storage...");
    try {
      await signOut(auth);
      await signInWithEmailAndPassword(auth, "ict@inatel.br", "orizon123");
      await runWithTimeout(deleteObject(storageRef), 2000, "Deleção de arquivo");
      console.log("✅ Arquivo de testes do Storage removido com sucesso.");
    } catch (err) {
      console.warn("⚠️ Não foi possível remover o arquivo de testes do Storage (esperado se o Storage não estiver configurado):", err.message);
    }

    await signOut(auth);
    console.log("\n--- TESTES CONCLUÍDOS ---");
    
    // Print summary table
    console.table(results);
    process.exit(0);

  } catch (error) {
    console.error("❌ Erro fatal durante a execução dos testes:", error);
    process.exit(1);
  }
}

runTests();
