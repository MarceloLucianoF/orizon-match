# 🌌 Orizon Match

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-react/lucide/main/icons/rocket.svg" width="80" height="80" />
</p>

<p align="center">
  <strong>A Inteligência por trás da Inovação Aberta.</strong><br/>
  Plataforma SaaS B2B para conexão estratégica entre Ecossistemas de Inovação, Indústrias e Capital.
</p>

<p align="center">
  <a href="https://orizon-match.web.app"><img src="https://img.shields.io/badge/🌐_Acesse_Online-orizon--match.web.app-4F46E5?style=for-the-badge&logo=google-chrome&logoColor=white" /></a>
  <img src="https://img.shields.io/badge/Versão-Stage_3_Alpha-indigo?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase_9-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/NVIDIA_NIM-IA-76B900?logo=nvidia&logoColor=white" />
</p>

---

## 🚀 Visão Geral

O **Orizon Match** não é apenas um diretório de projetos; é um ecossistema de **Deal-Making**. Utilizamos algoritmos de alta fidelidade para cruzar a maturidade tecnológica (TRL) de patentes e ideias com as demandas reais da indústria e interesses de fundos de Venture Capital.

### O Modelo de Tríplice Hélice 🧬
Conectamos os três pilares fundamentais da inovação:
1. **Academia (ICTs):** Universidades e centros de pesquisa (ex: UFSC, EMBRAPII).
2. **Mercado (Indústrias):** Gigantes e PMEs buscando eficiência (ex: WEG, Engie).
3. **Estado/Capital:** Fomento e investimento estratégico.

---

## 💎 Funcionalidades Premium

### 🧠 Matchmaking por IA & Heurística
- **Score 360°:** Avaliação baseada em Segmento, TRL, IRL, Localização e Necessidades.
- **Executive Summary:** Transformação de dados técnicos em pitches comerciais via NVIDIA NIM.

### 🛡️ Deal-Making Seguro (Clickwrap NDA)
- **VDR Protegido:** Sala de dados virtual com pastas sensíveis (Jurídico, Financeiro) bloqueadas.
- **Clickwrap NDA:** Aceite digital de termos de confidencialidade com registro jurídico de timestamp.
- **Due Diligence:** Checklist interativo para auditoria de projetos.

### 📊 Dashboards de Alto Impacto
- **Pipeline de Investimento:** Kanban dinâmico para gestão de Deal Flow.
- **Radar de Mercado:** Visualização de compatibilidade em tempo real.
- **Curadoria Jurídica:** Painel exclusivo para validação de documentação.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Diferencial |
|------------|------------|-------------|
| **Framework** | React 19 | Performance de ponta com suporte a hooks modernos. |
| **Back-end** | Firebase | Serverless robusto com Firestore e Cloud Functions. |
| **Estilização** | Tailwind CSS v4 | Design System moderno, dark-mode nativo e responsividade total. |
| **Inteligência** | NVIDIA NIM / Llama 3 | Processamento de linguagem natural para sumários executivos. |
| **UX/UI** | Lucide React | Biblioteca de ícones consistente e minimalista. |

---

## 📦 Estrutura do Ecossistema

```bash
src/
├── components/          # Componentes reutilizáveis (VDRRoom, SecureNDA, TRLCalculator)
├── context/             # Estado global e autenticação (AuthContext)
├── firebase/            # Camada de dados e segurança (Firestore Rules, Cloud Functions)
├── hooks/               # Custom hooks para lógica de negócio (useAuth)
├── layout/              # Arquitetura de interface (Sidebar responsiva, MainLayout)
├── lib/                 # O "Cérebro": Algoritmos de matching e validadores Zod
├── pages/               # Views organizadas por Persona (Inventor, Company, Legal, Admin)
└── services/            # Integrações: INPI, Chat, AI, Analytics
```

---

## 🏗️ Guia de Implementação

### Configuração Inicial
```bash
# 1. Instalar dependências
npm install

# 2. Configurar Firebase (Functions)
cd functions && npm install && cd ..

# 3. Rodar localmente
npm run dev
```

### Comandos de Gestão (Makefile)
Utilize o `Makefile` para agilizar o fluxo de trabalho:

- `make build`: Gera o pacote de produção otimizado.
- `make seed`: Alimenta o banco com dados realistas (EMBRAPII, SENAI, etc).
- `make deploy`: Deploy completo (Hosting + Regras).
- `make deploy-all`: Deploy total (incluindo Cloud Functions).

---

## 📜 Licença e Propriedade
Projeto desenvolvido para a plataforma **Orizon Match**. Todos os direitos reservados.
Desenvolvido com ❤️ pelo time de Inovação.

<p align="center">
  <a href="https://orizon-match.web.app">orizon-match.web.app</a>
</p>
