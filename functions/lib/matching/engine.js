"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPair = isValidPair;
exports.calculateMatch = calculateMatch;
function isValidPair(a, b) {
    // Apenas uma sanity check, pois agora as coleções são separadas
    return true;
}
function calculateMatch(a, b) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
        }
        else {
            breakdown.maturity = 20;
        }
    }
    else {
        breakdown.maturity = 20; // Default se a org não definiu range
    }
    // 🎯 COMPLEMENTARIDADE
    let hasNeeds = ((_a = a.needs) === null || _a === void 0 ? void 0 : _a.investment) || ((_b = a.needs) === null || _b === void 0 ? void 0 : _b.research) || ((_c = a.needs) === null || _c === void 0 ? void 0 : _c.industry);
    let matchedNeeds = 0;
    if (((_d = a.needs) === null || _d === void 0 ? void 0 : _d.investment) && ((_e = b.interests) === null || _e === void 0 ? void 0 : _e.investment)) {
        breakdown.needs += 20;
        matchedNeeds++;
    }
    if (((_f = a.needs) === null || _f === void 0 ? void 0 : _f.research) && ((_g = b.interests) === null || _g === void 0 ? void 0 : _g.research)) {
        breakdown.needs += 20;
        matchedNeeds++;
    }
    if (((_h = a.needs) === null || _h === void 0 ? void 0 : _h.industry) && ((_j = b.interests) === null || _j === void 0 ? void 0 : _j.industry)) {
        breakdown.needs += 20;
        matchedNeeds++;
    }
    // 🎯 LOCALIZAÇÃO
    breakdown.location =
        (((_k = a.location) === null || _k === void 0 ? void 0 : _k.region) && ((_l = b.location) === null || _l === void 0 ? void 0 : _l.region) && a.location.region === b.location.region) ? 10 : 5;
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
//# sourceMappingURL=engine.js.map