import { Project, Organization } from "../types/project";

export function isValidPair(a: Project, b: Organization): boolean {
  // Apenas uma sanity check, pois agora as coleções são separadas
  return true;
}

export function calculateMatch(a: Project, b: Organization) {
  let score = 0;

  const breakdown = {
    segment: 0,
    maturity: 0,
    needs: 0,
    location: 0,
  };

  // 🎯 SEGMENTO (peso alto)
  breakdown.segment = b.segments.includes(a.segment) ? 30 : 10;

  // 🎯 MATURIDADE (peso 20)
  // Como organizations não tem maturidade, podemos assumir peso máximo ou usar outro critério.
  // Vamos dar 20 pontos de base para empresas que buscam inovação no estágio do projeto.
  breakdown.maturity = 20;

  // 🎯 COMPLEMENTARIDADE
  if (a.needs.investment && b.interests.investment) breakdown.needs += 20;
  if (a.needs.research && b.interests.research) breakdown.needs += 20;
  if (a.needs.industry && b.interests.industry) breakdown.needs += 20;

  // 🎯 LOCALIZAÇÃO
  breakdown.location =
    a.location.region === b.location.region ? 10 : 5;

  score =
    breakdown.segment +
    breakdown.maturity +
    breakdown.needs +
    breakdown.location;

  return {
    score: Math.min(score, 100),
    breakdown,
  };
}
