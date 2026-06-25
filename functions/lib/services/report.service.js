"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIntelligenceReport = generateIntelligenceReport;
const admin = __importStar(require("firebase-admin"));
const openai_1 = __importDefault(require("openai"));
const db = admin.firestore();
async function generateIntelligenceReport(projectId) {
    var _a, _b;
    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
        throw new Error("Projeto não encontrado");
    }
    const projectData = projectDoc.data();
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    if (!apiKey) {
        throw new Error("NVIDIA NIM API Key não configurada");
    }
    const openai = new openai_1.default({
        apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
    });
    const prompt = `
    Você é um Consultor de Inovação Estratégica Senior da Orizon Match.
    Sua tarefa é gerar um "Executive Briefing" de altíssimo nível para o projeto abaixo.
    O tom deve ser executivo, analítico e persuasivo.

    DADOS DO PROJETO:
    - Título: ${projectData === null || projectData === void 0 ? void 0 : projectData.title}
    - Segmento: ${projectData === null || projectData === void 0 ? void 0 : projectData.segment}
    - Maturidade (TRL): ${projectData === null || projectData === void 0 ? void 0 : projectData.maturity}
    - Resumo: ${projectData === null || projectData === void 0 ? void 0 : projectData.summary}
    - Tipo de Inovação: ${projectData === null || projectData === void 0 ? void 0 : projectData.innovationType}
    - Necessidades: ${JSON.stringify(projectData === null || projectData === void 0 ? void 0 : projectData.needs)}

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
    const reportContent = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
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
//# sourceMappingURL=report.service.js.map