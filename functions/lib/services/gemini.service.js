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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTechnologyDocument = analyzeTechnologyDocument;
const generative_ai_1 = require("@google/generative-ai");
const mammoth = __importStar(require("mammoth"));
async function analyzeTechnologyDocument(fileBase64, mimeType, fileName) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada no ambiente de Cloud Functions");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    // Usamos o gemini-2.5-flash para respostas rápidas e estruturadas
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let textContent = "";
    let filePart = null;
    if (mimeType === "application/pdf") {
        // PDF é suportado nativamente pelo Gemini em inlineData
        filePart = {
            inlineData: {
                data: fileBase64,
                mimeType: "application/pdf"
            }
        };
    }
    else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")) {
        // DOCX: Extrai texto usando Mammoth
        const buffer = Buffer.from(fileBase64, "base64");
        const mammothResult = await mammoth.extractRawText({ buffer });
        textContent = mammothResult.value;
    }
    else {
        // TXT ou outros: Decodifica de Base64 para string UTF-8
        const buffer = Buffer.from(fileBase64, "base64");
        textContent = buffer.toString("utf-8");
    }
    const prompt = `
    Você é um Engenheiro de Patentes e Analista de M&A de Tecnologia Sênior na InovaHelix.
    Sua tarefa é analisar o documento tecnológico fornecido e construir o seu "Gêmeo Digital (Digital Twin)" e mapeamento de "Technology DNA".

    Instruções e Regras de Negócio:
    1. Extraia e resuma o ativo tecnológico com foco em valor comercial, mitigação de riscos e atratividade para a indústria.
    2. Identifique os Readiness Scores (escala de 0 a 100) baseados em evidências do texto:
       - technology: Maturidade tecnológica (ex: protótipo testado vale entre 70-80, patente teórica vale 20-30).
       - commercial: Maturidade comercial/parcerias comerciais citadas ou interesse de mercado (0-100).
       - legal: Existência de patentes depositadas ou concedidas (se houver número ou menção, 80-90+).
       - market: Tamanho e dor do mercado endereçado (0-100).
       - transfer: Prontidão da instituição/inventores para transferir (se há NIT ou regras de cotitularidade claras).
       - regulatory: Complexidade regulatória (saúde/Anvisa = exige mais certificações, TI/Software = rápida regulação).
       - manufacturing: Prontidão para manufatura (se já há lote piloto ou produção).
       - investment: Apetite de investimento ou captação feita.
    3. Mapeie a Proteção Tecnológica detalhando números de patentes (INPI), agências reguladoras (ANVISA, FDA, etc.) e titulares (Universidades, empresas).
    4. Identifique o Investigador Principal (professor/pesquisador), laboratório de origem, e URLs de perfil (Lattes, ORCID, LinkedIn) se presentes.
    5. Crie uma estrutura simulada de arquivos para o Virtual Data Room (VDR) contendo 3 a 5 arquivos lógicos recomendados para auditoria (ex: Patente_Concedida, Relatório de Ensaios, Pitch_Deck, Desenho_Técnico) com tamanhos em bytes e categorias (legal, regulatory, technical, commercial).

    Você DEVE retornar a resposta estritamente no formato JSON abaixo. Não inclua nenhuma introdução ou formatação fora do bloco JSON.

    JSON SCHEMA:
    {
      "title": "Título comercial claro e atrativo em português (Máximo 80 caracteres)",
      "summary": "Resumo executivo contendo o problema, solução, diferenciais inovadores e o impacto. Foco executivo em português (Evite jargões científicos densos, máximo 4 parágrafos)",
      "technologyDNA": {
        "industry": ["Segmentos da FIESC adequados. Ex: 'Saúde', 'Tecnologia e Inovação', 'Bens de Capital', 'Energia'"],
        "trl": 7, // Número de 1 a 9 baseado na maturidade técnica descrita
        "market": "B2B ou B2C ou B2G",
        "regulation": "Órgãos reguladores aplicáveis (Ex: ANVISA RDC..., FDA, Inmetro ou 'N/A' se não aplicável)",
        "keywords": ["3 a 5 palavras-chave de tecnologia em minúsculas"],
        "competencies": ["3 competências críticas do time de desenvolvimento"],
        "risks": ["2 a 3 riscos técnicos ou regulatórios monitorados"],
        "technologyStack": ["Ferramentas, linguagens ou métodos de fabricação usados"],
        "manufacturingScale": "idea ou prototype ou pilot_batch ou commercial",
        "esg": {
          "carbonReduction": "low ou medium ou high",
          "energyEfficiency": "low ou medium ou high"
        }
      },
      "readinessScores": {
        "technology": 80,
        "commercial": 60,
        "legal": 90,
        "market": 90,
        "transfer": 80,
        "regulatory": 70,
        "manufacturing": 50,
        "investment": 70
      },
      "technologyProtection": {
        "types": ["patent", "know_how", "software_registration", "trademark" etc],
        "status": "pending ou granted ou none",
        "registrations": [
          {
            "agency": "Sigla da agência (Ex: INPI, ANVISA, IBAMA)",
            "number": "Número do registro ou depósito encontrado no texto (se houver, senão crie no formato BR 10 2026 XXXXXX-X)",
            "country": "Código do país de 2 letras (Ex: BR, US)",
            "conceded": true
          }
        ],
        "owners": ["Nome das entidades titulares (Ex: UFSC, INATEL, Nome do Inventor)"],
        "hasCoOwnership": false,
        "licensingRestrictions": "Restrições de licenciamento ou 'Nenhuma' se livre"
      },
      "team": {
        "principalInvestigator": "Nome completo do pesquisador principal",
        "lattesUrl": "Link do Lattes (se houver, senão crie no padrão http://lattes.cnpq.br/...) ",
        "orcid": "Link do ORCID (se houver, senão crie no padrão https://orcid.org/...)",
        "linkedinUrl": "Link do LinkedIn (se houver, senão crie no padrão https://linkedin.com/in/...)",
        "laboratoryName": "Nome do laboratório acadêmico ou departamento de origem",
        "availability": ["opções válidas: 'consulting', 'codevelopment', 'training', 'board'"]
      },
      "commercializationStrategy": {
        "businessModels": ["opções: 'licensing_exclusive', 'licensing_non_exclusive', 'joint_venture', 'codevelopment', 'sales'"],
        "negotiationInterest": "immediate ou medium_term ou monitoring"
      },
      "confidentiality": {
        "level": "public ou needs_nda ou highly_confidential",
        "geographicScope": "national ou international"
      },
      "vdrAssets": [
        {
          "id": "1",
          "name": "Nome sugerido do arquivo (Ex: Patente_Concedida_BR10.pdf)",
          "category": "legal ou regulatory ou technical ou commercial",
          "sizeBytes": 1500000,
          "mimeType": "application/pdf"
        }
      ]
    }
  `;
    const contents = [];
    if (filePart) {
        contents.push(filePart);
    }
    contents.push({ role: "user", parts: [{ text: prompt + (textContent ? `\n\nCONTEÚDO DO DOCUMENTO:\n${textContent}` : "") }] });
    const result = await model.generateContent({
        contents,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });
    const rawResponse = result.response.text();
    try {
        return JSON.parse(rawResponse);
    }
    catch (parseError) {
        console.error("Falha ao parsear resposta JSON do Gemini. Resposta bruta:", rawResponse);
        throw new Error("Erro de processamento da IA: formato de resposta inválido.");
    }
}
//# sourceMappingURL=gemini.service.js.map