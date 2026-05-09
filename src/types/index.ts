// ===== ENUMS =====

export type StakeholderType =
  | "inventor"  // Criador da ideia
  | "investidor" // Fornecedor de capital
  | "ict"       // Instituto Científico/Tecnológico
  | "industria" // Empresa executora
  | "juridico"; // Proteção legal

export type IdeaMaturidade =
  | "ideia"     // Conceito inicial
  | "prototipo" // Prova de conceito
  | "mvp"       // Produto mínimo viável
  | "produto";  // Produto maduro

export type InovaType =
  | "inovacao"  // Completamente novo
  | "melhoria"; // Melhoria incremental

export type ProjectStatus =
  | "rascunho"
  | "publicado"
  | "emmatching"
  | "combinado"
  | "arquivado";

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
  interessesMaturidade: IdeaMaturidade[];

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
  maturidade: IdeaMaturidade;
  tipo: InovaType;

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
  maturity: IdeaMaturidade | "";
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
