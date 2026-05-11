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

    ESTRUTURA DO RELATÓRIO (Use Markdown):
    1. **Sumário Executivo**: Visão geral do potencial de disrupção.
    2. **Análise SWOT Estratégica**:
       - Forças (Internas)
       - Fraquezas (Internas)
       - Oportunidades (Mercado)
       - Ameaças (Competição/Regulação)
    3. **Roadmap de Parceria**: 3 fases sugeridas para escala.
    4. **Conclusão Consultiva**: Recomendação final da Orizon.

    Importante: Não use saudações. Vá direto ao Sumário. Use formatação Markdown profissional.
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
