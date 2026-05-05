export function calculateMatch(a: any, b: any) {
  let score = 0;

  const breakdown = {
    segment: 0,
    maturity: 0,
    needs: 0,
    location: 0,
  };

  // 🎯 SEGMENTO
  if (a.segment === b.segment) {
    breakdown.segment = 30;
  } else {
    breakdown.segment = 10;
  }

  // 🎯 MATURIDADE
  const maturityDiff = Math.abs(a.maturity - b.maturity);
  breakdown.maturity = Math.max(0, 20 - maturityDiff * 5);

  // 🎯 NEEDS (complementaridade)
  if (a.needs?.investment && b.type === "company") breakdown.needs += 20;
  if (a.needs?.research && b.type === "ict") breakdown.needs += 20;
  if (a.needs?.industry && b.type === "company") breakdown.needs += 20;

  // 🎯 LOCATION
  if (a.location?.region === b.location?.region) {
    breakdown.location = 10;
  } else {
    breakdown.location = 5;
  }

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

export function explainMatch(breakdown: any) {
  if (!breakdown) return "Match promissor identificado";
  
  const reasons = [];

  if (breakdown.segment > 20) {
    reasons.push("mesma área de atuação");
  }

  if (breakdown.needs > 20) {
    reasons.push("necessidade estratégica correspondida");
  }

  if (breakdown.location > 5) {
    reasons.push("proximidade geográfica");
  }

  if (breakdown.maturity > 15) {
    reasons.push("estágio de maturidade compatível");
  }

  if (reasons.length === 0) return "Potencial de parceria validado";

  return `Match forte por ${reasons.join(" + ")}`;
}
