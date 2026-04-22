// src/lib/commissions.ts

export interface CommissionBreakdown {
  grossAmountDinar: number;      // what company actually pays (priceDinar + 10%)
  platformFeeCompany: number;    // 10% added on top of priceDinar
  platformFeeInfluencer: number; // 5% deducted from influencer payout
  netAmountInfluencer: number;   // what influencer receives (priceDinar - 5%)
}

export function calcCommissions(priceDinar: number): CommissionBreakdown {
  if (!Number.isFinite(priceDinar) || priceDinar <= 0) {
    throw new RangeError(`priceDinar must be a positive finite number, got ${priceDinar}`);
  }
  const platformFeeCompany = Math.round(priceDinar * 0.10);
  const platformFeeInfluencer = Math.round(priceDinar * 0.05);
  const grossAmountDinar = priceDinar + platformFeeCompany;
  const netAmountInfluencer = priceDinar - platformFeeInfluencer;
  return { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer };
}
