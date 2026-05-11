# Orizon Match: Ecossistema de Inovação Estratégica B2B

Orizon Match é uma plataforma SaaS B2B projetada para conectar os três pilares da inovação: **Inventores**, **ICTs (Universidades)** e **Empresas/Investidores**. Utilizando Inteligência Artificial (LLaMA 3.1), a plataforma automatiza o matchmaking de projetos, auditoria de patentes e geração de briefings estratégicos.

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

### Instalação
1.  Clone o repositório.
2.  Instale as dependências: `npm install && cd functions && npm install`.
3.  Configure o Firebase: `firebase use <seu-projeto-id>`.

### Desenvolvimento Local
*   Frontend: `npm run dev`
*   Backend: `cd functions && npm run build -- --watch` (ou use o Firebase Emulator).

### Deploy
Utilize o comando automatizado (Makefile/Bash):
```bash
make deploy
```
*(Ou execute `npm run build && firebase deploy`)*

---

## 📄 Documentação de Fluxos
Para uma análise detalhada de como cada persona interage com o sistema e como a IA processa os dados, consulte o [Guia de Fluxos e Processos](./WORKFLOW_GUIDE.md).

---

## ⚖️ Segurança e Compliance
*   **CORS**: Gerenciamento manual em Cloud Functions para estabilidade regional.
*   **Legal Tech**: Sistema de Smart NDA integrado e auditoria via INPI.
*   **Multi-tenancy**: Regras de Firestore baseadas em `orgId` para gestão institucional.
