// ===== ENUMS =====

export type StakeholderType =
  | "inventor"  // Creator of the idea
  | "investor"  // Provider of capital
  | "ict"       // Scientific/Technological Institute
  | "industry"  // Executing company/industry
  | "legal";    // Legal protection

export type MaturityLevel =
  | "idea"      // Initial concept
  | "prototype" // Proof of concept
  | "mvp"       // Minimum viable product
  | "product";  // Mature product

export type IdeaMaturidade = MaturityLevel; // Alias for backward compatibility if needed

export type InnovationType =
  | "innovation"  // Completely new
  | "improvement"; // Incremental improvement

export type InovaType = InnovationType; // Alias for backward compatibility if needed

export type ProjectStatus =
  | "draft"
  | "published"
  | "matching"
  | "matched"
  | "archived";

export type MatchStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "negotiating"
  | "closed";

export type InterestStatus =
  | "interested"
  | "not_interested"
  | "contacted";

// ===== LOCATION =====

export interface Localizacao {
  cidade: string;
  estado: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
}

// ===== USER (Stakeholder) =====

export interface User {
  id: string;
  uid: string; // Firebase UID
  email: string;
  displayName: string;
  tipo: StakeholderType;

  // Perfil de interesse
  segmentosInteresse: string[];
  interessesMaturidade: MaturityLevel[];

  // Localização
  localizacao: Localizacao;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ===== PROJECT (Ideia) =====

export interface Project {
  id: string;
  userId: string; // Quem criou
  userName: string;

  // Básico
  title: string;
  description: string;

  // Classificação
  segmento: string;
  maturidade: MaturityLevel;
  tipo: InnovationType;

  // CORE: O que precisa (matchmaking)
  precisa: StakeholderType[];

  // Localização
  localizacao: Localizacao;

  // Status
  status: ProjectStatus;

  // Proteção
  patent?: {
    number: string;
    conceded: boolean;
  };
  protectionIntent?: {
    isProtected: boolean;
    wantToProtectNow: boolean;
    proceedWithoutProtection: boolean;
  };

  // Descrição estruturada
  summaryMethod: "guiado" | "textoLivre";
  summaryDetails?: {
    problem: string;
    solution: string;
    targetAudience: string;
    differentiator: string;
    marketPotential: string;
    nextSteps: string;
  };

  // Engajamento
  views: number;
  matches: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ===== MATCH (Conexão) =====

export interface MatchScoreBreakdown {
  segment: number;
  maturity: number;
  needs: number;
  location: number;
}

export interface MatchScoreResult {
  score: number;
  breakdown: MatchScoreBreakdown;
}

export interface Match {
  id: string;
  projectId: string;
  userId: string;

  // Score
  score: number;
  scoreBreakdown: MatchScoreBreakdown;
  classification:
    | "Alto potencial"
    | "Bom match"
    | "Possível match"
    | "Baixo match";

  // Status
  status: MatchStatus;

  // Engagement
  viewedAt?: Date;
  interactedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ===== INTEREST (Expressão de Interesse) =====

export interface Interest {
  id: string;
  projectId: string;
  userId: string;
  status: InterestStatus;
  message?: string;
  createdAt: Date;
}

// ===== FORM DATA (Para criação de project) =====

export interface CreateProjectFormData {
  profileType: StakeholderType | "";
  segment: string;
  patentStatus: "nao" | "pendente" | "concedida" | "";
  maturity: MaturityLevel | "";
  needs: StakeholderType[];
  locationCity: string;
  locationState: string;
  summaryMethod: "guiado" | "textoLivre" | "";
  problem: string;
  solution: string;
  targetAudience: string;
  differentiator: string;
  marketPotential: string;
  nextSteps: string;
  freeTextSummary: string;
}

// ===== PROFILE SELECTION =====

export interface ProfileOption {
  id: StakeholderType;
  label: string;
  description: string;
  icon: string; // FontAwesome icon name
  color: string; // Tailwind color
}
