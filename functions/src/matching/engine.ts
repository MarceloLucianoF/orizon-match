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
  breakdown.segment = (b.segments && b.segments.includes(a.segment)) ? 30 : 10;

  // 🎯 MATURIDADE (peso 20)
  let isTrlMatched = true;
  if (b.trlMin !== undefined && b.trlMax !== undefined) {
    if (a.maturity < b.trlMin || a.maturity > b.trlMax) {
      isTrlMatched = false;
      breakdown.maturity = 0;
    } else {
      breakdown.maturity = 20;
    }
  } else {
    breakdown.maturity = 20; // Default se a org não definiu range
  }

  // 🎯 COMPLEMENTARIDADE
  let hasNeeds = a.needs?.investment || a.needs?.research || a.needs?.industry;
  let matchedNeeds = 0;

  if (a.needs?.investment && b.interests?.investment) { breakdown.needs += 20; matchedNeeds++; }
  if (a.needs?.research && b.interests?.research) { breakdown.needs += 20; matchedNeeds++; }
  if (a.needs?.industry && b.interests?.industry) { breakdown.needs += 20; matchedNeeds++; }

  // 🎯 LOCALIZAÇÃO
  breakdown.location =
    (a.location?.region && b.location?.region && a.location.region === b.location.region) ? 10 : 5;

  score =
    breakdown.segment +
    breakdown.maturity +
    breakdown.needs +
    breakdown.location;

  // 🔴 PUNIÇÃO NÃO-LINEAR: Complementaridade
  // Se o projeto exigia algo específico e a empresa não atendeu a NENHUMA exigência
  if (hasNeeds && matchedNeeds === 0) {
    score -= 50; // Guilhotina do match: afunda o score
  }

  // 🔴 PUNIÇÃO NÃO-LINEAR: TRL Fora do Alvo
  // Corta o score radicalmente (multiplicador) preservando a granularidade baixa
  if (!isTrlMatched) {
    score = score * 0.2; 
  }

  return {
    score: Math.max(0, Math.min(Math.round(score), 100)),
    breakdown,
  };
}
