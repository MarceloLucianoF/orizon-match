# Guia de Fluxos e Processos: Orizon Match

Este documento detalha o funcionamento lógico da plataforma para análise e validação da gestão do projeto.

## 1. Onboarding e Personas

O onboarding é dinâmico e segmenta o usuário em três perfis logo no primeiro acesso:

### A. Fluxo do Inventor
*   **Entrada**: Onboarding focado na "Ideia".
*   **Ações**: Criação de Pitch (Refinado por IA), Registro de Ativos de PI, Assinatura de NDAs.
*   **Valor**: Visibilidade para investidores e proteção jurídica.

### B. Fluxo da ICT / Universidade (NIT)
*   **Entrada**: Onboarding focado em "Expertise e Infraestrutura".
*   **Campos Chave**: Linhas de Pesquisa, Equipamentos, Políticas de PI (Co-titularidade), Acesso a Fomento (Embrapii/FAPs).
*   **Valor**: Ferramenta de gestão de portfólio de pesquisa e transferência de tecnologia.

### C. Fluxo da Empresa / Investidor
*   **Entrada**: Onboarding focado em "Tese de Inovação".
*   **Ações**: Busca ativa por soluções, Declaração de Desafios, Acesso a Relatórios de Inteligência.
*   **Valor**: Redução de tempo na busca por P&D e mitigação de risco tecnológico.

---

## 2. O Motor de Inteligência Artificial (LLaMA 3.1)

A IA da Orizon não é apenas um chat; ela é uma camada de processamento de dados em três pontos:

1.  **Pitch Enhancer**: Transforma respostas simples em um "Executive Summary" persuasivo.
2.  **Matching Engine**: Analisa a semântica entre a "Tese de Inovação" da Empresa e o "Resumo do Projeto" do Inventor/ICT.
3.  **Intelligence Reports**: Gera Análises SWOT e Roadmaps de Parceria exportáveis em PDF.

---

## 3. Gestão Institucional (Multi-tenancy)

A plataforma suporta o modelo de "Gestão de Ecossistema":

*   **Entidade `Organization`**: Representa um Polo Tecnológico, NIT ou Escritório de Patentes.
*   **Lógica de `orgId`**: Todos os inventores e projetos vinculados a uma organização são visíveis para o `Manager` daquela conta.
*   **Permissões**: O `Manager` possui um dashboard consolidado para monitorar KPIs de todo o seu polo.

---

## 4. Fluxo Financeiro (Stripe)

A monetização ocorre em dois níveis:
1.  **Assinatura Pro**: Acesso ilimitado ao Radar e Relatórios de IA.
2.  **Pay-per-Match/Report**: Pagamentos pontuais por serviços específicos.

---

## 5. Protocolo de Segurança e Rede

Para garantir 100% de disponibilidade no Brasil (`southamerica-east1`):
*   **CORS Hardening**: Headers de CORS são injetados manualmente em cada requisição para evitar bloqueios de preflight em navegadores modernos.
*   **Firestore Rules**: Camada de proteção que garante que apenas donos ou gestores autorizados acessem documentos sensíveis.

---

## 6. Fluxo de Validação para o Gestor

Para validar o fluxo completo, recomenda-se:
1.  Criar uma conta como **Inventor** e gerar um Pitch com IA.
2.  Criar uma conta como **Empresa** e buscar o projeto criado.
3.  Simular um **Gestor de ICT** vinculando o projeto ao seu `orgId` (via Firebase Console) e visualizar o `OrganizationDashboard`.
4.  Gerar o **Executive Briefing** e exportar para PDF.

---
*Documentação atualizada em: 11 de Maio de 2026*
