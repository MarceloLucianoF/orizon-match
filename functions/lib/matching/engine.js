"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPair = isValidPair;
exports.calculateMatch = calculateMatch;
function isValidPair(a, b) {
    // Apenas uma sanity check, pois agora as coleções são separadas
    return true;
}
function calculateMatch(project, target) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    let score = 0;
    const breakdown = {
        segment: 0,
        maturity: 0,
        readiness: 0,
        needs: 0,
        location: 0,
    };
    // 1. Afinidade de Segmento (Chamber / Industry) [Máx: 20]
    const projectSegment = project.segment || project.segmento;
    const targetSegments = target.segments || target.segmentosInteresse || (target.segment ? [target.segment] : []);
    const projectDNAIndustries = ((_a = project.technologyDNA) === null || _a === void 0 ? void 0 : _a.industry) || [];
    if (projectSegment && targetSegments.includes(projectSegment)) {
        breakdown.segment = 20;
    }
    else if (targetSegments.some((seg) => projectDNAIndustries.includes(seg))) {
        breakdown.segment = 15;
    }
    else {
        breakdown.segment = 5;
    }
    // 2. Alinhamento de Maturidade (TRL Target) [Máx: 15]
    const trl = ((_b = project.technologyDNA) === null || _b === void 0 ? void 0 : _b.trl) || project.maturity || project.trlScore || 1;
    const trlMin = target.trlMin !== undefined ? target.trlMin : (target.preferredTrl ? Math.max(1, target.preferredTrl - 1) : undefined);
    const trlMax = target.trlMax !== undefined ? target.trlMax : (target.preferredTrl ? Math.min(9, target.preferredTrl + 1) : undefined);
    let isTrlMatched = true;
    if (trlMin !== undefined && trlMax !== undefined) {
        if (trl >= trlMin && trl <= trlMax) {
            breakdown.maturity = 15;
        }
        else if (Math.abs(trl - trlMin) === 1 || Math.abs(trl - trlMax) === 1) {
            breakdown.maturity = 10;
        }
        else {
            breakdown.maturity = 0;
            isTrlMatched = false;
        }
    }
    else {
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
        }
        else if (targetRole === "industry" || targetRole === "company") {
            const techWeight = (scores.technology || 0) * 0.3;
            const mfgWeight = (scores.manufacturing || 0) * 0.3;
            const regWeight = (scores.regulatory || 0) * 0.2;
            const overallWeight = (scores.overall || 0) * 0.2;
            breakdown.readiness = Math.round((techWeight + mfgWeight + regWeight + overallWeight) * 0.25);
        }
        else {
            breakdown.readiness = Math.round((scores.overall || 0) * 0.25);
        }
    }
    else {
        // Suporte a projetos legados
        const hasAuditedVdr = project.vdrStatus === "verified" || project.isVdrReady || (project.dueDiligenceProgress === 100);
        const irl = project.irlScore || project.irl || 0;
        let baseReadiness = irl * 1.5; // IRL na escala de 0-9
        if (hasAuditedVdr)
            baseReadiness += 6;
        breakdown.readiness = Math.round(baseReadiness);
    }
    // 4. Interseção Semântica (Technology DNA Keywords) [Máx: 25]
    const projectKeywords = ((_c = project.technologyDNA) === null || _c === void 0 ? void 0 : _c.keywords) || [];
    const targetKeywords = target.keywords || target.segmentosInteresse || (target.segment ? [target.segment] : []);
    const thesisText = (target.innovationThesis || "").toLowerCase();
    let matchesCount = 0;
    let semanticScore = 0;
    if (projectKeywords.length > 0) {
        projectKeywords.forEach((kw) => {
            const kwLower = kw.toLowerCase();
            if (targetKeywords.some((tkw) => tkw.toLowerCase() === kwLower)) {
                matchesCount++;
            }
            else if (thesisText.includes(kwLower)) {
                matchesCount++;
            }
        });
        if (matchesCount >= 3) {
            semanticScore = 25;
        }
        else if (matchesCount === 2) {
            semanticScore = 17;
        }
        else if (matchesCount === 1) {
            semanticScore = 10;
        }
        else {
            const hasSegmentMatch = projectKeywords.some((kw) => projectSegment && projectSegment.toLowerCase().includes(kw.toLowerCase()));
            semanticScore = hasSegmentMatch ? 10 : 5;
        }
    }
    else {
        // Cruzamento textual para legados
        const textToMatch = ((project.title || "") + " " + (project.summary || "") + " " + (project.description || "")).toLowerCase();
        targetKeywords.forEach((tkw) => {
            if (textToMatch.includes(tkw.toLowerCase())) {
                matchesCount++;
            }
        });
        if (matchesCount >= 2)
            semanticScore = 20;
        else if (matchesCount === 1)
            semanticScore = 12;
        else
            semanticScore = 5;
    }
    // 5. Complementaridade de Demandas & Região [Máx: 15]
    // Demandas (10 pts)
    const projNeeds = project.needs || {};
    const projPrecisa = project.precisa || [];
    const hasInvestmentNeed = projNeeds.investment || projPrecisa.includes("investor");
    const hasResearchNeed = projNeeds.research || projPrecisa.includes("ict");
    const hasIndustryNeed = projNeeds.industry || projPrecisa.includes("industry") || projPrecisa.includes("company");
    if (hasInvestmentNeed && targetRole === "investor") {
        breakdown.needs = 10;
    }
    else if (hasResearchNeed && targetRole === "ict") {
        breakdown.needs = 10;
    }
    else if (hasIndustryNeed && (targetRole === "industry" || targetRole === "company")) {
        breakdown.needs = 10;
    }
    else {
        breakdown.needs = 2;
    }
    // Localização (5 pts)
    const projRegion = ((_d = project.location) === null || _d === void 0 ? void 0 : _d.region) || ((_e = project.localizacao) === null || _e === void 0 ? void 0 : _e.estado);
    const targetRegion = ((_f = target.location) === null || _f === void 0 ? void 0 : _f.region) || ((_g = target.localizacao) === null || _g === void 0 ? void 0 : _g.estado);
    if (projRegion && targetRegion && projRegion.toLowerCase() === targetRegion.toLowerCase()) {
        breakdown.location = 5;
    }
    else {
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
    const regulatoryScore = scores === null || scores === void 0 ? void 0 : scores.regulatory;
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
    const hasCoOwnership = (_h = project.technologyProtection) === null || _h === void 0 ? void 0 : _h.hasCoOwnership;
    const hasLicensingRestrictions = !!((_j = project.technologyProtection) === null || _j === void 0 ? void 0 : _j.licensingRestrictions);
    if ((hasCoOwnership || hasLicensingRestrictions) && (targetRole === "investor" || targetRole === "industry")) {
        score -= 15;
    }
    return {
        score: Math.max(0, Math.min(Math.round(score), 100)),
        breakdown,
    };
}
//# sourceMappingURL=engine.js.map