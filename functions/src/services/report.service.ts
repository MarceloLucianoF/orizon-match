import * as admin from "firebase-admin";
import OpenAI from "openai";

const db = admin.firestore();

export async function generateIntelligenceReport(projectId: string) {
  const projectDoc = await db.collection("projects").doc(projectId).get();
  
  if (!projectDoc.exists) {
    throw new Error("Projeto não encontrado");
  }

  const projectData = projectDoc.data();
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  
  if (!apiKey) {
    throw new Error("NVIDIA NIM API Key não configurada");
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  const prompt = `
    Você é um Consultor de Inovação Estratégica Senior da Orizon Match.
    Sua tarefa é gerar um "Executive Briefing" de altíssimo nível para o projeto abaixo.
    O tom deve ser executivo, analítico e persuasivo.

    DADOS DO PROJETO:
    - Título: ${projectData?.title}
    - Segmento: ${projectData?.segment}
    - Maturidade (TRL): ${projectData?.maturity}
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
    (Recomendação final e parecer da Orizon Match sobre o investimento/parceria.)

    > **[Risco]** (Escreva um aviso sobre o maior risco técnico, regulatório ou de mercado que precisa ser mitigado no curto prazo.)

    Importante: Não use saudações de boas-vindas, introduções ou conclusão da IA. Comece o texto diretamente com o título "## Sumário Executivo". Use formatação Markdown profissional rigorosamente.
  `;

  const completion = await openai.chat.completions.create({
    model: "meta/llama-3.1-70b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 2048,
  });

  const reportContent = completion.choices[0]?.message?.content || "";

  // Salva o relatório no Firestore para referência futura
  await db.collection("projects").doc(projectId).update({
    lastAiReport: {
      content: reportContent,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: "1.0"
    }
  });

  return reportContent;
}
