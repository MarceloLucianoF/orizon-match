export function calculateMatch(project: any, target: any) {
  let score = 0;

  const breakdown = {
    segment: 0,
    maturity: 0,
    readiness: 0,
    needs: 0,
    location: 0,
  };

  // SEGMENTO (30 pts)
  if (project.segment === target.segment) {
    breakdown.segment = 30;
  } else if (target.segments?.includes(project.segment)) {
    breakdown.segment = 30;
  } else {
    breakdown.segment = 5;
  }

  // MATURIDADE / TRL (20 pts)
  const trl = project.trlScore || project.maturity || 1;
  const targetTrl = target.preferredTrl || 6;
  const trlDiff = Math.abs(trl - targetTrl);
  breakdown.maturity = Math.max(0, 20 - trlDiff * 3);

  // READINESS / VDR (20 pts)
  const irl = project.irlScore || 0;
  const hasAuditedVdr = project.vdrStatus === 'verified' || project.isVdrReady;
  
  breakdown.readiness = (irl * 2); // 0-12 pts based on IRL
  if (hasAuditedVdr) breakdown.readiness += 8; // +8 pts for audited documents

  // NEEDS (20 pts)
  if (project.needs?.investment && (target.role === "company" || target.role === "investor")) breakdown.needs += 20;
  if (project.needs?.research && target.role === "ict") breakdown.needs += 20;

  // LOCATION (10 pts)
  if (project.location?.region === target.location?.region) {
    breakdown.location = 10;
  } else {
    breakdown.location = 5;
  }

  score =
    breakdown.segment +
    breakdown.maturity +
    breakdown.readiness +
    breakdown.needs +
    breakdown.location;

  return {
    score: Math.min(score, 100),
    breakdown,
  };
}

/**
 * Gera uma explicação textual humanizada do match baseado no breakdown de pontuação.
 * Diferencia as explicações por nível de score para evitar textos genéricos repetidos.
 */
export function explainMatch(breakdown: any): string {
  if (!breakdown) return "Compatibilidade identificada pelo algoritmo Orizon";
  
  const reasons: string[] = [];

  // Segmento
  if (breakdown.segment >= 25) {
    reasons.push("atuação no mesmo segmento industrial");
  } else if (breakdown.segment >= 10) {
    reasons.push("segmento relacionado");
  }

  // Readiness (VDR + IRL)
  if (breakdown.readiness >= 15) {
    reasons.push("documentação auditada no Data Room");
  } else if (breakdown.readiness >= 8) {
    reasons.push("maturidade de negócio (IRL) consolidada");
  } else if (breakdown.readiness >= 4) {
    reasons.push("indicadores iniciais de prontidão");
  }

  // TRL
  if (breakdown.maturity >= 17) {
    reasons.push("estágio tecnológico (TRL) altamente compatível");
  } else if (breakdown.maturity >= 12) {
    reasons.push("estágio tecnológico (TRL) compatível");
  } else if (breakdown.maturity >= 6) {
    reasons.push("proximidade tecnológica parcial");
  }

  // Needs
  if (breakdown.needs >= 15) {
    reasons.push("necessidade estratégica correspondida");
  }

  // Location
  if (breakdown.location >= 8) {
    reasons.push("localização na mesma região");
  }

  if (reasons.length === 0) return "Potencial de parceria validado por múltiplos fatores do algoritmo";

  // Monta frase final diferenciada por força do match
  const total = (breakdown.segment || 0) + (breakdown.maturity || 0) + (breakdown.readiness || 0) + (breakdown.needs || 0) + (breakdown.location || 0);
  
  if (total >= 75) {
    return `Compatibilidade alta: ${reasons.join(", ")}`;
  } else if (total >= 55) {
    return `Match sólido por ${reasons.join(" + ")}`;
  } else {
    return `Potencial identificado: ${reasons.join(", ")}`;
  }
}

/**
 * Retorna um label humanizado para o tipo de organização
 * em vez do genérico "Investidor Potencial"
 */
export function getMatchLabel(match: any): string {
  const role = match.targetRole || match.role;
  const segment = match.targetSegment || match.segment;
  
  const roleLabels: Record<string, string> = {
    company: "Empresa",
    investor: "Investidor",
    ict: "ICT / Universidade",
    legal: "Escritório Jurídico",
    provider: "Prestador de Serviço",
    inventor: "Inventor",
  };

  const baseLabel = roleLabels[role] || "Organização";
  
  if (segment) {
    return `${baseLabel} - ${segment}`;
  }
  
  return `${baseLabel} Potencial`;
}

/**
 * Retorna a classificação visual do match
 */
export function getMatchTier(score: number): { label: string; color: string; bgColor: string; borderColor: string } {
  if (score >= 80) {
    return { 
      label: "TOP FIT", 
      color: "text-amber-400", 
      bgColor: "bg-amber-500/10", 
      borderColor: "border-amber-500/20" 
    };
  } else if (score >= 65) {
    return { 
      label: "BOM FIT", 
      color: "text-emerald-400", 
      bgColor: "bg-emerald-500/10", 
      borderColor: "border-emerald-500/20" 
    };
  } else {
    return { 
      label: "", 
      color: "text-slate-400", 
      bgColor: "", 
      borderColor: "" 
    };
  }
}

/**
 * Retorna a cor do score baseada no valor
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-indigo-400";
  if (score >= 50) return "text-amber-400";
  return "text-slate-400";
}
