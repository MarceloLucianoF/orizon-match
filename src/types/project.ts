import type { MaturityLevel, InnovationType, StakeholderType, ProjectStatus, Localizacao } from "./index";

export interface TechnologyDNA {
  industry: string[];
  trl: number;
  market: 'B2B' | 'B2C' | 'B2B2C' | 'B2G';
  regulation?: string;
  keywords: string[];
  competencies: string[];
  risks: string[];
  technologyStack?: string[];
  manufacturingScale?: 'lab_scale' | 'pilot_batch' | 'industrial_scale';
  esg?: {
    carbonReduction: 'high' | 'medium' | 'low' | 'none';
    energyEfficiency: 'high' | 'medium' | 'low' | 'none';
  };
}

export interface TechnologyProtection {
  types: ('patent' | 'software' | 'know_how' | 'dataset' | 'firmware' | 'process' | 'regulatory_approval')[];
  status: 'drafting' | 'pending' | 'granted' | 'unprotected';
  registrations: {
    agency: 'INPI' | 'ANVISA' | 'MAPA' | 'INMETRO' | 'other';
    number: string;
    country: string;
    conceded: boolean;
  }[];
  owners: string[];
  hasCoOwnership: boolean;
  licensingRestrictions?: string;
}

export interface VdrAsset {
  id: string;
  name: string;
  category: 'technical' | 'commercial' | 'legal' | 'financial' | 'regulatory' | 'scientific' | 'manufacturing' | 'multimedia';
  url: string;
  uploadedAt: number; // timestamp
  sizeBytes: number;
  mimeType: string;
}

export interface ProjectTwin {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  segmento: string; // Câmara FIESC
  maturidade: MaturityLevel;
  tipo: InnovationType;
  precisa: StakeholderType[];
  localizacao: Localizacao;
  status: ProjectStatus;
  
  // Legacy / Compatibility fields
  patent?: {
    number: string;
    conceded: boolean;
  };
  protectionIntent?: {
    isProtected: boolean;
    wantToProtectNow: boolean;
    proceedWithoutProtection: boolean;
  };

  summaryMethod: "guiado" | "textoLivre";
  summaryDetails?: {
    problem: string;
    solution: string;
    targetAudience: string;
    differentiator: string;
    marketPotential: string;
    nextSteps: string;
  };

  views: number;
  matches: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp

  // --- NEW DIGITAL TWIN & MATCHMAKING ALGORITHM FIELDS ---
  role?: 'idea' | 'ict' | 'provider';
  
  // O Cérebro: Technology DNA
  technologyDNA?: TechnologyDNA;
  
  // Multi-Readiness Scores (0-100)
  readinessScores?: {
    technology: number; // TRL-derived
    commercial: number; // IRL-derived
    legal: number;      // Protection status-derived
    market: number;     // Market depth
    transfer: number;   // TTR index
    regulatory: number; // Regulatory moats
    manufacturing: number; // Production capacity
    investment: number; // Investment interest
    overall: number;    // Calculated weighted score
  };

  // Proteção Tecnológica
  technologyProtection?: TechnologyProtection;

  // Equipe & Disponibilidade
  team?: {
    principalInvestigator: string;
    lattesUrl?: string;
    orcid?: string;
    linkedinUrl?: string;
    laboratoryName?: string;
    researchGroup?: string;
    availability: ('consulting' | 'codevelopment' | 'transfer' | 'technical_residence' | 'training')[];
  };

  // Estratégia de Comercialização
  commercializationStrategy?: {
    businessModels: ('licensing_exclusive' | 'licensing_non_exclusive' | 'sale' | 'codevelopment' | 'service')[];
    negotiationInterest: 'immediate' | '6_months' | '12_months' | 'prospecting';
  };

  // Confidencialidade Dinâmica
  confidentiality?: {
    level: 'public' | 'needs_nda' | 'vdr_only' | 'restricted';
    geographicScope: 'national' | 'international' | 'none';
  };

  // VDR - Data Room Temático
  vdrAssets?: VdrAsset[];
}
