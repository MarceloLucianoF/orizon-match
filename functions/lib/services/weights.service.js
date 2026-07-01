"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDUSTRY_WEIGHTS = void 0;
exports.mapSegmentToIndustryKey = mapSegmentToIndustryKey;
exports.calculateOverallReadiness = calculateOverallReadiness;
exports.INDUSTRY_WEIGHTS = {
    software: {
        technology: 0.15,
        commercial: 0.35,
        legal: 0.15,
        market: 0.20,
        transfer: 0.15,
        regulatory: 0.00,
        manufacturing: 0.00,
        investment: 0.00,
    },
    biotech: {
        technology: 0.20,
        commercial: 0.10,
        legal: 0.25,
        market: 0.10,
        transfer: 0.10,
        regulatory: 0.25,
        manufacturing: 0.00,
        investment: 0.00,
    },
    medical: {
        technology: 0.20,
        commercial: 0.10,
        legal: 0.25,
        market: 0.10,
        transfer: 0.10,
        regulatory: 0.25,
        manufacturing: 0.00,
        investment: 0.00,
    },
    chemical: {
        technology: 0.25,
        commercial: 0.15,
        legal: 0.20,
        market: 0.15,
        transfer: 0.10,
        regulatory: 0.15,
        manufacturing: 0.00,
        investment: 0.00,
    },
    energy: {
        technology: 0.30,
        commercial: 0.15,
        legal: 0.15,
        market: 0.15,
        transfer: 0.10,
        regulatory: 0.15,
        manufacturing: 0.00,
        investment: 0.00,
    },
    agribusiness: {
        technology: 0.25,
        commercial: 0.20,
        legal: 0.15,
        market: 0.15,
        transfer: 0.10,
        regulatory: 0.15,
        manufacturing: 0.00,
        investment: 0.00,
    },
    default: {
        technology: 0.25,
        commercial: 0.25,
        legal: 0.25,
        market: 0.25,
        transfer: 0.00,
        regulatory: 0.00,
        manufacturing: 0.00,
        investment: 0.00,
    }
};
function mapSegmentToIndustryKey(segment) {
    if (!segment)
        return "default";
    const seg = segment.toLowerCase();
    if (seg.includes("software") || seg.includes("tecnologia") || seg.includes("inovação"))
        return "software";
    if (seg.includes("biomed") || seg.includes("saúde") || seg.includes("fármaco"))
        return "biotech";
    if (seg.includes("médic"))
        return "medical";
    if (seg.includes("químic") || seg.includes("materiais"))
        return "chemical";
    if (seg.includes("energia") || seg.includes("elétr"))
        return "energy";
    if (seg.includes("agro") || seg.includes("alimento") || seg.includes("bebida"))
        return "agribusiness";
    return "default";
}
function calculateOverallReadiness(scores, industry) {
    const weights = exports.INDUSTRY_WEIGHTS[industry] || exports.INDUSTRY_WEIGHTS.default;
    let totalScore = 0;
    let totalWeight = 0;
    Object.keys(weights).forEach((key) => {
        var _a;
        const weight = weights[key];
        if (weight > 0) {
            const score = (_a = scores[key]) !== null && _a !== void 0 ? _a : 0;
            totalScore += score * weight;
            totalWeight += weight;
        }
    });
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
//# sourceMappingURL=weights.service.js.map