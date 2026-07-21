export function calculateMatch(project: any, target: any) {
  let score = 0;

  const breakdown = {
    segment: 0,
    maturity: 0,
    readiness: 0,
    needs: 0,
    location: 0,
    semanticMatches: 0,
    semanticScore: 0
  };

  // 1. Afinidade de Segmento (Chamber / Industry) [Máx: 20]
  const projectSegment = project.segment || project.segmento;
  const targetSegments = target.segments || target.segmentosInteresse || (target.segment ? [target.segment] : []);
  const projectDNAIndustries = project.technologyDNA?.industry || [];

  if (projectSegment && targetSegments.includes(projectSegment)) {
    breakdown.segment = 20;
  } else if (targetSegments.some((seg: string) => projectDNAIndustries.includes(seg))) {
    breakdown.segment = 15;
  } else {
    breakdown.segment = 5;
  }

  // 2. Alinhamento de Maturidade (TRL Target) [Máx: 15]
  const trl = project.technologyDNA?.trl || project.maturity || project.trlScore || 1;
  const trlMin = target.trlMin !== undefined ? target.trlMin : (target.preferredTrl ? Math.max(1, target.preferredTrl - 1) : undefined);
  const trlMax = target.trlMax !== undefined ? target.trlMax : (target.preferredTrl ? Math.min(9, target.preferredTrl + 1) : undefined);

  let isTrlMatched = true;
  if (trlMin !== undefined && trlMax !== undefined) {
    if (trl >= trlMin && trl <= trlMax) {
      breakdown.maturity = 15;
    } else if (Math.abs(trl - trlMin) === 1 || Math.abs(trl - trlMax) === 1) {
      breakdown.maturity = 10;
    } else {
      breakdown.maturity = 0;
      isTrlMatched = false;
    }
  } else {
    breakdown.maturity = 15; // default
  }

  // 3. Ajuste Fino de Readiness por Papel (Role-based Fit) [Máx: 25]
  const scores = project.readinessScores;
  const targetRole = target.role || target.tipo;
  if (scores) {
    if (targetRole === "investor") {
      const commWeight = (scores.commercial || 0) * 0.3;
      const mktWeight = (scores.market || 0) * 0.3;
      const legalWeight = (scores.legal || 0) * 0.2;
      const overallWeight = (scores.overall || 0) * 0.2;
      breakdown.readiness = Math.round((commWeight + mktWeight + legalWeight + overallWeight) * 0.25);
    } else if (targetRole === "industry" || targetRole === "company") {
      const techWeight = (scores.technology || 0) * 0.3;
      const mfgWeight = (scores.manufacturing || 0) * 0.3;
      const regWeight = (scores.regulatory || 0) * 0.2;
      const overallWeight = (scores.overall || 0) * 0.2;
      breakdown.readiness = Math.round((techWeight + mfgWeight + regWeight + overallWeight) * 0.25);
    } else {
      breakdown.readiness = Math.round((scores.overall || 0) * 0.25);
    }
  } else {
    // Suporte a projetos legados
    const hasAuditedVdr = project.vdrStatus === "verified" || project.isVdrReady || (project.dueDiligenceProgress === 100);
    const irl = project.irlScore || project.irl || 0;
    let baseReadiness = irl * 1.5; // IRL na escala de 0-9
    if (hasAuditedVdr) baseReadiness += 6;
    breakdown.readiness = Math.round(baseReadiness);
  }

  // 4. Interseção Semântica (Technology DNA Keywords) [Máx: 25]
  const projectKeywords = project.technologyDNA?.keywords || [];
  const targetKeywords = target.keywords || target.segmentosInteresse || (target.segment ? [target.segment] : []);
  const thesisText = (target.innovationThesis || "").toLowerCase();

  let matchesCount = 0;
  let semanticScore = 0;

  if (projectKeywords.length > 0) {
    projectKeywords.forEach((kw: string) => {
      const kwLower = kw.toLowerCase();
      if (targetKeywords.some((tkw: string) => tkw.toLowerCase() === kwLower)) {
        matchesCount++;
      } else if (thesisText.includes(kwLower)) {
        matchesCount++;
      }
    });

    if (matchesCount >= 3) {
      semanticScore = 25;
    } else if (matchesCount === 2) {
      semanticScore = 17;
    } else if (matchesCount === 1) {
      semanticScore = 10;
    } else {
      const hasSegmentMatch = projectKeywords.some(
        (kw: string) => projectSegment && projectSegment.toLowerCase().includes(kw.toLowerCase())
      );
      semanticScore = hasSegmentMatch ? 10 : 5;
    }
  } else {
    // Cruzamento textual para legados
    const textToMatch = (
      (project.title || "") + " " + (project.summary || "") + " " + (project.description || "")
    ).toLowerCase();
    targetKeywords.forEach((tkw: string) => {
      if (textToMatch.includes(tkw.toLowerCase())) {
        matchesCount++;
      }
    });
    if (matchesCount >= 2) semanticScore = 20;
    else if (matchesCount === 1) semanticScore = 12;
    else semanticScore = 5;
  }

  breakdown.semanticMatches = matchesCount;
  breakdown.semanticScore = semanticScore;

  // 5. Complementaridade de Demandas & Região [Máx: 15]
  // Demandas (10 pts)
  const projNeeds = project.needs || {};
  const projPrecisa = project.precisa || [];
  const hasInvestmentNeed = projNeeds.investment || projPrecisa.includes("investor");
  const hasResearchNeed = projNeeds.research || projPrecisa.includes("ict");
  const hasIndustryNeed = projNeeds.industry || projPrecisa.includes("industry") || projPrecisa.includes("company");

  if (hasInvestmentNeed && targetRole === "investor") {
    breakdown.needs = 10;
  } else if (hasResearchNeed && targetRole === "ict") {
    breakdown.needs = 10;
  } else if (hasIndustryNeed && (targetRole === "industry" || targetRole === "company")) {
    breakdown.needs = 10;
  } else {
    breakdown.needs = 2;
  }

  // Localização (5 pts)
  const projRegion = project.location?.region || project.localizacao?.estado;
  const targetRegion = target.location?.region || target.localizacao?.estado;
  if (projRegion && targetRegion && projRegion.toLowerCase() === targetRegion.toLowerCase()) {
    breakdown.location = 5;
  } else {
    breakdown.location = 2;
  }

  score =
    breakdown.segment +
    breakdown.maturity +
    breakdown.readiness +
    semanticScore +
    breakdown.needs +
    breakdown.location;

  // 🚫 PUNIÇÕES NÃO-LINEARES (Red Flags & Gatilhos)
  // 1. TRL Desalinhado (Guilhotina TRL)
  if (!isTrlMatched) {
    score = score * 0.5;
  }

  // 2. Red Flag Regulatório
  const regulatoryScore = scores?.regulatory;
  const isHighRegSegment = [
    "Saúde",
    "Biotecnologia",
    "Alimentos e Bebidas",
    "Segurança e Saúde no Trabalho"
  ].includes(projectSegment || "");
  if (regulatoryScore !== undefined && regulatoryScore < 40 && isHighRegSegment) {
    score -= 30;
  }

  // 3. Restrição de Co-titularidade / Licenciamento
  const hasCoOwnership = project.technologyProtection?.hasCoOwnership;
  const hasLicensingRestrictions = !!project.technologyProtection?.licensingRestrictions;
  if ((hasCoOwnership || hasLicensingRestrictions) && (targetRole === "investor" || targetRole === "industry")) {
    score -= 15;
  }

  return {
    score: Math.max(0, Math.min(Math.round(score), 100)),
    breakdown,
  };
}

/**
 * Gera uma explicação textual humanizada do match baseado no breakdown de pontuação.
 * Diferencia as explicações por nível de score para evitar textos genéricos repetidos.
 */
export function explainMatch(breakdown: any): string {
  if (!breakdown) return "Compatibilidade identificada pelo algoritmo InovaHelix";

  const reasons: string[] = [];

  // Segmento
  if (breakdown.segment === 20) {
    reasons.push("atuação na mesma câmara FIESC");
  } else if (breakdown.segment === 15) {
    reasons.push("afinidade setorial no DNA do ativo");
  }

  // TRL / Maturity
  if (breakdown.maturity === 15) {
    reasons.push("TRL alinhado com a preferência corporativa");
  } else if (breakdown.maturity === 10) {
    reasons.push("estágio TRL com variação tolerável");
  }

  // Readiness / VDR
  if (breakdown.readiness >= 18) {
    reasons.push("excelentes scores de prontidão no Gêmeo Digital");
  } else if (breakdown.readiness >= 10) {
    reasons.push("maturidade de negócio (IRL) sólida");
  }

  // Semantic Keywords
  if (breakdown.semanticMatches >= 3) {
    reasons.push("forte afinidade no DNA tecnológico (3+ keywords coincidentes)");
  } else if (breakdown.semanticMatches === 2) {
    reasons.push("congruência em múltiplos termos da tese de inovação");
  } else if (breakdown.semanticMatches === 1) {
    reasons.push("coincidência em termo chave da tecnologia");
  }

  // Needs
  if (breakdown.needs === 10) {
    reasons.push("demandas de investimento/P&D correspondidas");
  }

  // Location
  if (breakdown.location === 5) {
    reasons.push("proximidade de ecossistema local");
  }

  if (reasons.length === 0) return "Potencial de parceria validado por múltiplos fatores de sinergia";

  const total =
    (breakdown.segment || 0) +
    (breakdown.maturity || 0) +
    (breakdown.readiness || 0) +
    (breakdown.semanticScore || 0) +
    (breakdown.needs || 0) +
    (breakdown.location || 0);

  if (total >= 75) {
    return `Compatibilidade excelente: ${reasons.slice(0, 3).join(", ")}.`;
  } else if (total >= 55) {
    return `Match sólido por ${reasons.slice(0, 3).join(" + ")}.`;
  } else {
    return `Sinergia identificada: ${reasons.slice(0, 2).join(" e ")}.`;
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
    industry: "Empresa",
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
  if (score >= 65) return "text-teal-400";
  if (score >= 50) return "text-amber-400";
  return "text-slate-400";
}
