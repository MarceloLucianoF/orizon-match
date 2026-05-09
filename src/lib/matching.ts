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
  // Empresas geralmente buscam TRL 5+ ou um match próximo da sua tese
  const trl = project.trlScore || project.maturity || 1;
  const targetTrl = target.preferredTrl || 6; // Default to seeking higher maturity
  const trlDiff = Math.abs(trl - targetTrl);
  breakdown.maturity = Math.max(0, 20 - trlDiff * 3);

  // READINESS / VDR (20 pts)
  // Projetos com VDR auditado e IRL alto ganham bônus
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

export function explainMatch(breakdown: any) {
  if (!breakdown) return "Match promissor identificado";
  
  const reasons = [];

  if (breakdown.segment >= 25) {
    reasons.push("mesma área de atuação");
  }

  if (breakdown.readiness >= 15) {
    reasons.push("documentação jurídica validada");
  } else if (breakdown.readiness >= 8) {
    reasons.push("maturidade de negócio (IRL)");
  }

  if (breakdown.maturity >= 15) {
    reasons.push("estágio tecnológico (TRL) compatível");
  }

  if (breakdown.needs >= 15) {
    reasons.push("necessidade estratégica correspondida");
  }

  if (reasons.length === 0) return "Potencial de parceria validado por múltiplos fatores";

  return `Match forte por ${reasons.join(" + ")}`;
}
