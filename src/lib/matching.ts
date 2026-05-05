import type { Project, User, MatchScoreBreakdown, MatchScoreResult } from "../types";

const SEGMENT_WEIGHT = 40;
const MATURITY_WEIGHT = 25;
const NEEDS_WEIGHT = 25;
const LOCATION_WEIGHT = 10;

const MATURITY_RANK: Record<Project["maturidade"], number> = {
  ideia: 0,
  prototipo: 1,
  mvp: 2,
  produto: 3,
};

const LOCATION_MATCH_BY_SCOPE = {
  sameCity: LOCATION_WEIGHT,
  sameState: Math.round(LOCATION_WEIGHT * 0.8),
  sameCountry: Math.round(LOCATION_WEIGHT * 0.5),
  remote: Math.round(LOCATION_WEIGHT * 0.3),
} as const;

export function getScoreTone(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function scoreSegment(project: Project, user: User): number {
  if (user.segmentosInteresse.includes(project.segmento)) {
    return SEGMENT_WEIGHT;
  }

  const partialMatch = user.segmentosInteresse.some((segment) =>
    segment.toLowerCase().includes(project.segmento.toLowerCase()) ||
    project.segmento.toLowerCase().includes(segment.toLowerCase()),
  );

  return partialMatch ? Math.round(SEGMENT_WEIGHT * 0.6) : Math.round(SEGMENT_WEIGHT * 0.2);
}

function scoreMaturity(project: Project, user: User): number {
  if (user.interessesMaturidade.includes(project.maturidade)) {
    return MATURITY_WEIGHT;
  }

  const userPreferenceIndex = user.interessesMaturidade
    .map((value) => MATURITY_RANK[value])
    .sort((a, b) => a - b)[0];

  const maturityIndex = MATURITY_RANK[project.maturidade];
  const distance = Math.abs((userPreferenceIndex ?? maturityIndex) - maturityIndex);

  return Math.max(0, MATURITY_WEIGHT - distance * 7);
}

function scoreNeeds(project: Project, user: User): number {
  const needsMap: Record<User["tipo"], boolean> = {
    inventor: project.precisa.includes("inventor"),
    investidor: project.precisa.includes("investidor"),
    ict: project.precisa.includes("ict"),
    industria: project.precisa.includes("industria"),
    juridico: project.precisa.includes("juridico"),
  };

  const directNeed = needsMap[user.tipo];

  if (directNeed) {
    return NEEDS_WEIGHT;
  }

  const complementaryBonus =
    (user.tipo === "investidor" && project.maturidade !== "ideia") ||
    (user.tipo === "ict" && project.tipo === "inovacao") ||
    (user.tipo === "industria" && project.precisa.includes("industria"));

  return complementaryBonus ? Math.round(NEEDS_WEIGHT * 0.55) : Math.round(NEEDS_WEIGHT * 0.15);
}

function scoreLocation(project: Project, user: User): number {
  if (project.localizacao.cidade === user.localizacao.cidade) {
    return LOCATION_MATCH_BY_SCOPE.sameCity;
  }

  if (project.localizacao.estado === user.localizacao.estado) {
    return LOCATION_MATCH_BY_SCOPE.sameState;
  }

  if (project.localizacao.coords && user.localizacao.coords) {
    return LOCATION_MATCH_BY_SCOPE.sameCountry;
  }

  return LOCATION_MATCH_BY_SCOPE.remote;
}

export function calculateMatchScore(project: Project, user: User): MatchScoreResult {
  const breakdown: MatchScoreBreakdown = {
    segment: scoreSegment(project, user),
    maturity: scoreMaturity(project, user),
    needs: scoreNeeds(project, user),
    location: scoreLocation(project, user),
  };

  const score = Math.min(
    100,
    breakdown.segment + breakdown.maturity + breakdown.needs + breakdown.location,
  );

  return {
    score,
    breakdown,
  };
}

export function classifyMatch(score: number): string {
  if (score >= 80) return "🔥 Alto potencial";
  if (score >= 60) return "👍 Bom match";
  if (score >= 40) return "🤔 Possível match";
  return "❌ Baixo match";
}

export function getMatchColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (score >= 60) return "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-200";
  if (score >= 40) return "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200";
}

export interface UserMatchResult {
  user: User;
  score: number;
  breakdown: MatchScoreBreakdown;
  classification: string;
  color: string;
}

export function preFilterUsers(users: User[], project: Project): User[] {
  return users.filter((user) =>
    project.precisa.includes(user.tipo) ||
    user.segmentosInteresse.includes(project.segmento),
  );
}

export function rankMatches(project: Project, users: User[]): UserMatchResult[] {
  return preFilterUsers(users, project)
    .map((user) => {
      const result = calculateMatchScore(project, user);

      return {
        user,
        score: result.score,
        breakdown: result.breakdown,
        classification: classifyMatch(result.score),
        color: getMatchColor(result.score),
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function generateMatchExplanation(
  result: MatchScoreResult,
  project: Project,
  user: User,
): string[] {
  const reasons: string[] = [];

  if (result.breakdown.segment >= 30) {
    reasons.push(`Segmento alinhado com ${project.segmento}.`);
  }

  if (result.breakdown.needs >= 18) {
    reasons.push(`Necessidade compatível com o perfil ${user.tipo}.`);
  }

  if (result.breakdown.maturity >= 18) {
    reasons.push(`Maturidade ${project.maturidade} conversa com a intenção do perfil.`);
  }

  if (result.breakdown.location >= 8) {
    reasons.push(`Proximidade geográfica favorece a execução.`);
  }

  if (reasons.length === 0) {
    reasons.push("Há sinergia suficiente para explorar a conexão com mais contexto.");
  }

  return reasons;
}
