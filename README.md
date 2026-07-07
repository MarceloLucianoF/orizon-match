# InovaHelix: Ecossistema de Inovação Estratégica B2B

InovaHelix é uma plataforma SaaS B2B projetada para conectar os três pilares da inovação: **Inventores**, **ICTs (Universidades)** e **Empresas/Investidores**. Utilizando Inteligência Artificial (LLaMA 3.1), a plataforma automatiza o matchmaking de projetos, auditoria de patentes e geração de briefings estratégicos.

## 🚀 Visão Geral
A plataforma resolve o gargalo de comunicação entre a academia e a indústria, permitindo que teses de inovação corporativas encontrem soluções técnicas validadas juridicamente.

---

## 🛠️ Stack Tecnológica
*   **Frontend**: React 19 (Vite), TypeScript, Tailwind CSS.
*   **Backend**: Firebase Cloud Functions (Node.js 22 - GCF 1st Gen).
*   **Banco de Dados**: Firestore (Multi-tenant ready).
*   **IA**: LLaMA 3.1 via NVIDIA NIM API (Processamento de Pitch e SWOT).
*   **Pagamentos**: Stripe (Assinaturas e Checkout).
*   **Infraestrutura**: Google Cloud Platform (Região: `southamerica-east1`).

---

## 🏗️ Arquitetura de 3 Pilares
1.  **Inventores**: Criam pitches, vinculam ativos de PI e buscam investimento.
2.  **ICTs / NITs**: Gerenciam portfólios de pesquisa, laboratórios e editais de fomento.
3.  **Empresas**: Declaram teses de inovação e encontram parceiros para co-desenvolvimento.

---

## 📋 Como Executar o Projeto

### Pré-requisitos
*   Node.js 20+
*   Firebase CLI (`npm install -g firebase-tools`)
*   Conta no Firebase com plano Blaze (para Cloud Functions).

### 🔑 Checklist de Configuração (Secrets)
Para que as integrações funcionem, você deve configurar as seguintes variáveis no **Firebase Secret Manager**:

| Variável | Serviço | Finalidade |
| :--- | :--- | :--- |
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM | Processamento de IA (LLaMA 3.1) para Pitches e Relatórios. |
| `STRIPE_SECRET_KEY` | Stripe | Processamento de pagamentos e assinaturas. |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Validação de eventos de pagamento recebidos via Webhook. |
| `RESEND_API_KEY` | Resend | Disparo de e-mails transacionais e convites jurídicos. |

**No Frontend (`.env`):**
*   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. (Configuração padrão do Firebase).

### Instalação
1.  Clone o repositório.
2.  Instale as dependências: `npm install && cd functions && npm install`.
3.  Configure o Firebase: `firebase use <seu-projeto-id>`.

### Desenvolvimento Local
*   Frontend: `npm run dev`
*   Backend: `cd functions && npm run build -- --watch`

### Deploy
Utilize o comando automatizado:
```bash
make deploy
```

---

## 📄 Documentação de Fluxos
Consulte o [Guia de Fluxos e Processos](./WORKFLOW_GUIDE.md) para detalhes de negócio.

---

## ⚖️ Segurança e Compliance
*   **CORS**: Gerenciamento manual em Cloud Functions para estabilidade regional.
*   **Legal Tech**: Sistema de Smart NDA e auditoria via INPI.
*   **Multi-tenancy**: Regras de Firestore baseadas em `orgId` e `managers[]`.
