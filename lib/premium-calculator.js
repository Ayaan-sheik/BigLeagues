// Premium Calculator for Underwriting
import { connectToDatabase } from '@/lib/db-admin';

/**
 * Calculate recommended premium based on startup risk profile and product
 */
export async function calculateRecommendedPremium(application, startup, product) {
  if (!startup || !product) return 0;

  // Step 1: Get base premium from product
  let basePremium = product.basePrice || 15;

  // Step 2: Calculate coverage multiplier
  const coverageAmount = application.coverageAmount || 1000000;
  const baseCoverage = product.coverageMin || 100000;
  const coverageMultiplier = Math.max(1, coverageAmount / baseCoverage);

  // Step 3: Calculate risk multiplier based on risk score
  const riskScore = application.riskScore || startup.riskScore || 50;
  let riskMultiplier = 1.0;

  if (riskScore < 30) riskMultiplier = 0.8; // Low risk = discount
  else if (riskScore < 50) riskMultiplier = 1.0; // Medium risk = base
  else if (riskScore < 70) riskMultiplier = 1.3; // High risk = premium
  else riskMultiplier = 1.6; // Very high risk

  // Step 4: Industry multiplier
  const industryMultipliers = {
    'Hardware & IoT': 1.2,
    'D2C Electronics': 1.1,
    'SaaS': 0.9,
    'Logistics': 1.15,
    'E-commerce': 1.0,
    'FinTech': 1.3,
    'HealthTech': 1.25,
    'EdTech': 0.95,
  };
  const industryMultiplier = industryMultipliers[application.industry] || 1.0;

  // Step 5: Funding stage multiplier (better funded = lower risk)
  const fundingMultipliers = {
    'Pre-seed': 1.15,
    'Seed': 1.05,
    'Series A': 1.0,
    'Series B': 0.95,
    'Series C': 0.9,
    'Series D+': 0.85,
  };
  const fundingMultiplier = fundingMultipliers[startup.fundingStage] || 1.0;

  // Step 6: Calculate base premium with all multipliers
  let calculatedPremium = basePremium * coverageMultiplier * riskMultiplier * industryMultiplier * fundingMultiplier;

  // Step 7: Apply minimum and maximum limits
  const minPremium = 50; // Minimum ₹50
  const maxPremium = product.basePrice * 100; // Max is 100x base price

  calculatedPremium = Math.max(minPremium, Math.min(maxPremium, calculatedPremium));

  // Round to nearest 10
  return Math.round(calculatedPremium / 10) * 10;
}

/**
 * Get premium calculation breakdown for display
 */
export function getPremiumBreakdown(basePremium, riskScore, industry, fundingStage, coverageAmount, product) {
  const breakdown = {
    basePremium,
    multipliers: {
      risk: riskScore < 30 ? 0.8 : riskScore < 50 ? 1.0 : riskScore < 70 ? 1.3 : 1.6,
      industry: 1.0, // Simplified
      funding: 1.0, // Simplified
      coverage: Math.max(1, (coverageAmount || 1000000) / ((product?.coverageMin || 100000))),
    },
  };

  return breakdown;
}
