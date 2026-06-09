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
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

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

// Resultados dos testes
const results = [];

function recordResult(name, status, details = "") {
  console.log(`${status === "PASS" ? "✅" : "❌"} [${status}] ${name} ${details ? `(${details})` : ""}`);
  results.push({ name, status, details });
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
    console.log("\n--- TESTE DE FLUXO ICT (ict@inatel.br) ---");
    const ictUser = await signInWithEmailAndPassword(auth, "ict@inatel.br", "orizon123");
    console.log(`Logado como ICT: ${ictUser.user.email} (UID: ${ictUser.user.uid})`);

    try {
      // ICT deve ler detalhes privados de projetos de sua própria organização (ict_inatel)
      const details = await getDoc(doc(db, "projects", "proj_lte_box", "private", "details"));
      if (details.exists()) {
        recordResult("ICT ler detalhes privados de projeto da própria Org", "PASS", `Visualizou IP: ${details.data().patentStatus}`);
      } else {
        recordResult("ICT ler detalhes privados de projeto da própria Org", "FAIL", "Documento privado não existe");
      }
    } catch (err) {
      recordResult("ICT ler detalhes privados de projeto da própria Org", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // TESTE 2: Multi-tenant - ICT não pode ver dados privados de outras Orgs
    // ----------------------------------------------------
    // Para fins deste teste, fingiremos que o projeto proj_telemed_ai ou similar pertence a outra org ou inventor sem vínculo de gerência
    // O seed coloca proj_lte_box e proj_scm vinculados a ict_inatel.
    // Vamos simular a tentativa de ler um deal que não lhe pertence.
    try {
      await getDoc(doc(db, "deals", "comp_siemens_p2"));
      recordResult("ICT ler deal privado de outra empresa", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("ICT ler deal privado de outra empresa", "PASS", "Bloqueou acesso conforme esperado");
    }

    await signOut(auth);

    // ----------------------------------------------------
    // TESTE 3: Fluxo Empresa (empresa@ericsson.com) - NDA / VDR Lockout
    // ----------------------------------------------------
    console.log("\n--- TESTE DE FLUXO EMPRESA (empresa@ericsson.com) ---");
    const compUser = await signInWithEmailAndPassword(auth, "empresa@ericsson.com", "orizon123");
    console.log(`Logado como Empresa: ${compUser.user.email} (UID: ${compUser.user.uid})`);

    try {
      // Tentar ler detalhes privados sem NDA
      await getDoc(doc(db, "projects", "proj_lte_box", "private", "details"));
      recordResult("Empresa ler detalhes privados SEM NDA", "FAIL", "Permitiu leitura sem restrições");
    } catch (err) {
      recordResult("Empresa ler detalhes privados SEM NDA", "PASS", "Bloqueou leitura privada sem NDA");
    }

    // Assinar NDA
    const ndaId = `${compUser.user.uid}_proj_lte_box`;
    try {
      await setDoc(doc(db, "signed_ndas", ndaId), {
        investorId: compUser.user.uid,
        inventorId: "inventor_rafael",
        projectId: "proj_lte_box",
        signedAt: new Date().toISOString(),
        status: "signed"
      });
      recordResult("Assinar NDA Clickwrap", "PASS");
    } catch (err) {
      recordResult("Assinar NDA Clickwrap", "FAIL", err.message);
    }

    // Agora deve conseguir ler os detalhes privados
    try {
      const details = await getDoc(doc(db, "projects", "proj_lte_box", "private", "details"));
      recordResult("Empresa ler detalhes privados COM NDA assinado", "PASS", `IP Desbloqueada: ${details.data().patentStatus}`);
    } catch (err) {
      recordResult("Empresa ler detalhes privados COM NDA assinado", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // TESTE 4: Regras de Imutabilidade (audit_logs / activity_events)
    // ----------------------------------------------------
    try {
      await setDoc(doc(db, "audit_logs", "fake_log"), {
        actorId: compUser.user.uid,
        action: "hack"
      });
      recordResult("Empresa tentar gravar diretamente em audit_logs", "FAIL", "Permitiu escrita direta");
    } catch (err) {
      recordResult("Empresa tentar gravar diretamente em audit_logs", "PASS", "Escrita direta bloqueada");
    }

    try {
      await setDoc(doc(db, "activity_events", "fake_event"), {
        actorName: "Hacker"
      });
      recordResult("Empresa tentar gravar diretamente em activity_events", "FAIL", "Permitiu escrita direta");
    } catch (err) {
      recordResult("Empresa tentar gravar diretamente em activity_events", "PASS", "Escrita direta bloqueada");
    }

    // ----------------------------------------------------
    // TESTE 5: Event Bus Forgery Protection (domain_events)
    // ----------------------------------------------------
    // Escrita com actorUid correto deve passar
    const corrId = `corr_${compUser.user.uid}_test_flow`;
    try {
      await setDoc(doc(db, "domain_events", "valid_event"), {
        actorUid: compUser.user.uid,
        action: "deal.stage.update",
        projectId: "proj_lte_box",
        timestamp: serverTimestamp(),
        eventVersion: 1,
        schemaVersion: 1,
        correlationId: corrId
      });
      recordResult("Enviar Domain Event válido", "PASS");
    } catch (err) {
      recordResult("Enviar Domain Event válido", "FAIL", err.message);
    }

    // Escrita com actorUid falsificado (forgery) deve falhar
    try {
      await setDoc(doc(db, "domain_events", "forged_event"), {
        actorUid: "admin_uid", // tentando se passar pelo admin
        action: "deal.stage.update",
        projectId: "proj_lte_box",
        eventVersion: 1,
        schemaVersion: 1,
        correlationId: corrId
      });
      recordResult("Forjar Domain Event com outro actorUid", "FAIL", "Permitiu forjar evento");
    } catch (err) {
      recordResult("Forjar Domain Event com outro actorUid", "PASS", "Bloqueou forgery de identidade");
    }

    // ----------------------------------------------------
    // TESTE 6: Multi-tenant do Inventor (inventor@wailab.br)
    // ----------------------------------------------------
    await signOut(auth);
    const inventorUser = await signInWithEmailAndPassword(auth, "inventor@wailab.br", "orizon123");
    console.log(`Logado como Inventor: ${inventorUser.user.email} (UID: ${inventorUser.user.uid})`);

    try {
      // Tentar ler deals de outra empresa/investidor
      await getDoc(doc(db, "deals", "comp_siemens_p2"));
      recordResult("Inventor ler deal privado de outro tenant", "FAIL", "Permitiu leitura");
    } catch (err) {
      recordResult("Inventor ler deal privado de outro tenant", "PASS", "Bloqueou leitura de outro tenant");
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
