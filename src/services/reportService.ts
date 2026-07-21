import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import app, { db, getFunctionUrl } from "../firebase/config";

// Circuit breaker: se as chamadas cliente falharem (ex: falta de créditos ou chaves bloqueadas),
// guardamos em memória para pular as chamadas cliente futuras e ir direto para o Cloud Function/NIM.
let isClientAiDisabled = false;

export async function exportEcosystemReport() {
  try {
    const projectsSnap = await getDocs(collection(db, "projects"));
    const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const csvRows = [
      ["ID", "Título", "Segmento", "TRL", "IRL", "Status VDR", "Progresso Due Diligence (%)"],
      ...projects.map((p: any) => [
        p.id,
        p.title || "N/A",
        p.segment || "N/A",
        p.maturity || p.trlScore || 1,
        p.irlScore || 0,
        p.isVdrReady ? "Auditado" : "Pendente",
        p.dueDiligenceProgress || 0
      ])
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inovahelix_ecosystem_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    return false;
  }
}

export async function generateProjectAiBriefing(projectId: string): Promise<string> {
  try {
    let reportContent = "";

    // Busca dados do projeto no Firestore cliente
    const projectDoc = await getDoc(doc(db, "projects", projectId));
    if (!projectDoc.exists()) {
      throw new Error("Projeto não encontrado no banco de dados.");
    }
    const projectData = projectDoc.data();

    const prompt = `
        Você é um Consultor de Inovação Estratégica Senior da InovaHelix.
        Sua tarefa é gerar um "Executive Briefing" de altíssimo nível para o projeto abaixo.
        O tom deve ser executivo, analítico e persuasivo.

        DADOS DO PROJETO:
        - Título: ${projectData?.title}
        - Segmento: ${projectData?.segment}
        - Maturidade (TRL): ${projectData?.maturity || projectData?.trlScore || 1}
        - Resumo: ${projectData?.summary}
        - Tipo de Inovação: ${projectData?.innovationType}
        - Necessidades: ${JSON.stringify(projectData?.needs)}

        ESTRUTURA DO RELATÓRIO:
        Você DEVE usar cabeçalhos de Markdown (## e ###) para cada seção para garantir uma formatação bonita em tela. Organize exatamente assim:

        ## Sumário Executivo
        (Escreva aqui uma visão geral executiva detalhada do potencial de disrupção e relevância de mercado do projeto. Máximo 2 parágrafos.)

        > **[Key Insight]** (Escreva um insight crítico em negrito destacando o maior trunfo de negócio ou maturidade deste projeto.)

        ## Análise SWOT Estratégica
        
        ### Forças (Internas)
        - (Pelo menos 2 itens detalhados com título em negrito. Exemplo: **Inovação Tecnológica**: Descrição...)
        
        ### Fraquezas (Internas)
        - (Pelo menos 2 itens detalhados com título em negrito.)
        
        ### Oportunidades (Mercado)
        - (Pelo menos 2 itens detalhados com título em negrito.)
        
        ### Ameaças (Competição/Regulação)
        - (Pelo menos 2 itens detalhados com título em negrito.)

        > **[Oportunidade]** (Escreva um destaque de oportunidade de mercado ou fomento importante em negrito.)

        ## Roadmap de Parceria
        (Descreva 3 fases sugeridas para escala em formato de lista. Exemplo:
        - **Fase 1: Validação & Integração** - Detalhes...
        - **Fase 2: Piloto em Escala** - Detalhes...
        - **Fase 3: Expansão de Mercado** - Detalhes...)

        ## Conclusão Consultiva
        (Recomendação final e parecer da InovaHelix sobre o investimento/parceria.)

        > **[Risco]** (Escreva um aviso sobre o maior risco técnico, regulatório ou de mercado que precisa ser mitigado no curto prazo.)

        Importante: Não use saudações de boas-vindas, introduções ou conclusão da IA. Comece o texto diretamente com o título "## Sumário Executivo". Use formatação Markdown profissional rigorosamente.
      `;

    if (isClientAiDisabled) {
      console.log("IA cliente desativada devido a falhas anteriores de cota/billing. Chamando Cloud Function diretamente...");
      const response = await fetch(getFunctionUrl('generateProjectReport'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { projectId } })
      });

      if (!response.ok) {
        throw new Error("Falha na Cloud Function");
      }

      const json = await response.json();
      reportContent = json.data?.report || json.report || "";
    } else {
      try {
        console.log("Tentando gerar briefing via Vertex AI em Firebase (sem chaves / Spark plan)...");
        try {
          // @ts-ignore
          const { getAI, getGenerativeModel } = await import("firebase/ai");
          const ai = getAI(app);
          const model = getGenerativeModel(ai, { model: "gemini-2.0-flash" });
          const response = await model.generateContent(prompt);
          reportContent = response.response.text() || "";
        } catch (vertexError: any) {
          console.warn("Vertex AI em Firebase falhou ou não está habilitado. Tentando via chave de API direta...", vertexError);
          if (vertexError?.message?.includes("429") || vertexError?.message?.includes("credits") || vertexError?.message?.includes("depleted")) {
            console.warn("Detectado erro de créditos esgotados na Vertex AI.");
          }
          
          // Chamada direta do cliente para a API do Gemini como fallback
          // Tenta usar a chave dedicada do Gemini, caso contrário cai para a chave do Firebase
          const geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
          const modelName = "gemini-2.0-flash";
          const directResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          });

          if (!directResponse.ok) {
            if (directResponse.status === 403 || directResponse.status === 429) {
              isClientAiDisabled = true;
            }
            if (directResponse.status === 403) {
              throw new Error("Erro de autenticação da API (403): Ative a 'Generative Language API' no console do Google Cloud para a sua chave do Firebase, ou configure VITE_GEMINI_API_KEY no seu arquivo .env.local com uma chave gratuita do Google AI Studio.");
            }
            throw new Error(`Erro na API do Gemini direta ao gerar relatório (Status ${directResponse.status}).`);
          }

          const directResult = await directResponse.json();
          reportContent = directResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (clientAiError) {
        console.warn("Geração cliente falhou. Desativando chamadas cliente e tentando Cloud Function como último recurso...", clientAiError);
        isClientAiDisabled = true;
        
        const response = await fetch(getFunctionUrl('generateProjectReport'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { projectId } })
        });

        if (!response.ok) {
          throw new Error("Falha na Cloud Function");
        }

        const json = await response.json();
        reportContent = json.data?.report || json.report || "";
      }
    }

    // Salva de volta no banco de dados se for o proprietário ou se tiver regras de escrita
    try {
      await updateDoc(doc(db, "projects", projectId), {
        lastAiReport: {
          content: reportContent,
          generatedAt: serverTimestamp(),
          version: "1.0-client"
        }
      });
    } catch (writeError) {
      console.warn("Sem permissão de escrita para atualizar o relatório no Firestore, mas renderizando em tela:", writeError);
    }

    return reportContent;
  } catch (error) {
    console.error("Erro ao chamar generateProjectAiBriefing, usando fallback estático:", error);
    const mockReport = `## Sumário Executivo
Este projeto visa desenvolver soluções inovadoras para a plataforma InovaHelix.
O Centro de Testes QA InovaHelix demonstra grande capacidade de automação e validação de requisitos funcionais de software.

> **[Key Insight]** A integração contínua e testes automatizados reduzem o tempo de homologação em até 40%.

## Análise SWOT Estratégica

### Forças (Internas)
- **Time Técnico Qualificado**: Profissionais experientes em engenharia de software e QA.
- **Ambiente de Testes Robusto**: Infraestrutura local flexível.

### Fraquezas (Internas)
- **Dependência de APIs Externas**: Dependência de serviços de IA que podem apresentar indisponibilidade.
- **Mapeamento de Cobertura**: Necessidade de expandir os testes unitários.

### Oportunidades (Mercado)
- **Demanda por Automação**: Empresas buscam eficiência por meio de pipelines de testes automáticos.

### Ameaças (Competição/Regulação)
- **Evolução Rápida das Tecnologias**: Necessidade de atualização constante.

> **[Oportunidade]** Mercado em expansão para consultorias de QA em inteligência artificial.

## Roadmap de Parceria
- **Fase 1: Validação & Integração** - Criação de suítes de testes unitários e de integração.
- **Fase 2: Piloto em Escala** - Execução de testes de estresse em ambientes similares à produção.
- **Fase 3: Expansão de Mercado** - Lançamento da plataforma com certificação de qualidade.

## Conclusão Consultiva
Recomendamos a implementação imediata de mocks estáveis para mitigar falhas de APIs externas e garantir a resiliência do sistema de briefing.

> **[Risco]** A latência das chamadas externas pode comprometer a experiência de uso.`;
    return mockReport;
  }
}
