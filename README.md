# Orizon Match

<p align="center">
  <strong>Plataforma de matchmaking inteligente para inovação aberta.</strong><br/>
  Conectando inventores, investidores, ICTs e indústrias com precisão baseada em dados.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

---

## O Problema

**94% das patentes brasileiras nunca chegam ao mercado.** O problema não é a falta de ideias — é a falta de conexão estratégica entre quem possui a solução, quem possui a demanda e quem possui o capital.

O **Orizon Match** elimina esse gap usando algoritmos de compatibilidade e dados de maturidade tecnológica (TRL/IRL) para conectar automaticamente os agentes certos no momento certo.

---

## Funcionalidades

### Matchmaking de Precisão
- Algoritmo de compatibilidade com **5 variáveis**: Segmento FIESC, TRL, IRL/VDR, Necessidades, Localização
- Score de 0–100 com classificação visual (TOP FIT, BOM FIT)
- Explicações textuais diferenciadas por nível de compatibilidade
- **Página Explorar** (`/explore`): busca com filtros avançados e botão "Iniciar Conexão"

### Dashboards Especializados

| Perfil | Dashboard | Foco |
|--------|-----------|------|
| **Inventor** | Painel do Inventor | TRL/IRL, matches, radar de mercado, Data Room |
| **Empresa / Investidor** | Pipeline de Investimentos | Kanban de Deal Flow (Triagem → Fechado) |
| **Jurídico (Curadoria)** | Curadoria Jurídica | Validação de VDR, monitoramento INPI |
| **Admin** | Painel Admin | Gestão global de usuários e plataforma |

### Deal Flow e Comunicação
- Chat com mensagens de texto, NDA e reunião
- Smart Prompts contextuais (envio automático de NDA, abertura de VDR)
- Double opt-in para conexões

### Data Room Virtual (VDR)
- Estrutura de pastas temáticas (Patente, Finanças, Pitch)
- Bloqueio por NDA digital
- Checklist de Due Diligence
- Convite funcional de escritório jurídico parceiro

### Criação de Projeto (3 jornadas)
- **Inventor / Startup**: Segmento → Proteção IP → P&D → TRL → Resumo com IA → Cadastro
- **ICT / Universidade**: Segmento → Infraestrutura → Linhas de Pesquisa → Cadastro
- **Empresa / Prestador**: Segmento → Serviços → Capacidade Produtiva → Cadastro

### Responsividade
- Sidebar colapsável com hamburger menu em mobile
- Grids adaptativos em todos os dashboards
- Kanban com scroll horizontal em telas pequenas

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Bundler | Vite 8 |
| Estilização | Tailwind CSS v4 |
| Backend | Firebase (Auth, Firestore, Functions) |
| Ícones | Lucide React |
| Tipografia | Google Fonts (Sora) |
| IA | NVIDIA NIM (via Firebase Functions) |

---

## Estrutura do Projeto

```
src/
├── components/          # TRLCalculator, VDRRoom, DueDiligenceChecklist
├── context/             # AuthContext (provider global)
├── firebase/            # Configuração Firebase
├── hooks/               # useAuth
├── layout/              # MainLayout, Sidebar (responsiva), Topbar
├── lib/                 # matching.ts (algoritmo + utilitários de classificação)
├── pages/
│   ├── admin/           # AdminDashboard
│   ├── auth/            # Login
│   ├── company/         # CompanyDashboard (Kanban Deal Flow)
│   ├── inventor/        # InventorDashboard, Projects, CreateProject
│   ├── legal/           # LegalDashboard (Curadoria)
│   ├── marketing/       # Home, About, PublicOnboarding
│   └── shared/          # Dashboard, Matches, Explore, Chat, Profile
├── routes/              # AppRoutes (protegidas + públicas)
└── services/            # matchService, chatService, projectService,
                         # exploreService, adminService, inpiService
```

---

## Executando Localmente

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Deploy de Regras Firestore

```bash
firebase deploy --only firestore:rules
```

---

## Convenções do Projeto

- **Ícones**: Exclusivamente `lucide-react`. Emojis proibidos em toda a interface.
- **Estilo**: Dark mode first, paleta `slate` / `indigo` / `cyan`.
- **Estrutura**: Páginas organizadas por role em `src/pages/{role}/`.
- **Dados sensíveis**: `.env` e `serviceAccountKey.json` fora do versionamento.
- **Importações Firebase**: Sempre estáticas (sem `await import()`).

---

## Modelo de Negócio

O Orizon Match opera no modelo **Tríplice Hélice**:

```
    Inventor ──── Orizon Match ──── Empresa / Investidor
                      │
                ICT / Universidade
                      │
                Jurídico (Curadoria)
```

- **Inventores** cadastram inovações e recebem matches automáticos
- **Empresas/Investidores** filtram por TRL e gerenciam Deal Flow
- **Jurídicos** validam documentação via convite (modelo curadoria)
- **ICTs** conectam pesquisa acadêmica ao mercado

---

<p align="center">
  <strong>Orizon Match</strong> · Ecossistema de Inovação Aberta · 2025
</p>
