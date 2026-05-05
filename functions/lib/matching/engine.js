"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPair = isValidPair;
exports.calculateMatch = calculateMatch;
function isValidPair(a, b) {
    if (a.type === "inventor" && b.type === "inventor")
        return false;
    if (a.type === "company" && b.type === "company")
        return false;
    return true;
}
function calculateMatch(a, b) {
    let score = 0;
    const breakdown = {
        segment: 0,
        maturity: 0,
        needs: 0,
        location: 0,
    };
    // 🎯 SEGMENTO (peso alto)
    breakdown.segment = a.segment === b.segment ? 30 : 10;
    // 🎯 MATURIDADE
    const diff = Math.abs(a.maturity - b.maturity);
    breakdown.maturity = Math.max(0, 20 - diff * 5);
    // 🎯 COMPLEMENTARIDADE
    if (a.needs.investment && b.type === "company")
        breakdown.needs += 20;
    if (a.needs.research && b.type === "ict")
        breakdown.needs += 20;
    if (a.needs.industry && b.type === "company")
        breakdown.needs += 20;
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
//# sourceMappingURL=engine.js.map