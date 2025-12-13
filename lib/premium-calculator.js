// Premium Calculator for Underwriting
import { connectToDatabase } from '@/lib/db-admin';

/**
 * Calculate recommended premium based on startup risk profile and product
 * Premium is capped at productPrice and should be 1-5% for good risk scores
 */
export async function calculateRecommendedPremium(application, startup, product) {
  if (!startup || !product) return 0;

  const productPrice = application.productPrice || 10000; // Default ₹10,000 if not provided

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
  const fundingMultiplier = fundingMultipliers[startup?.fundingStage] || 1.0;

  // Step 6: Calculate base premium with all multipliers
  let calculatedPremium = basePremium * coverageMultiplier * riskMultiplier * industryMultiplier * fundingMultiplier;

  // Step 7: Apply product price constraints
  // For good risk scores (<30), premium should be 1-5% of product price
  if (riskScore < 30) {
    const minPremium = productPrice * 0.01; // 1%
    const maxPremium = productPrice * 0.05; // 5%
    calculatedPremium = Math.max(minPremium, Math.min(maxPremium, calculatedPremium));
  } 
  // For medium risk (30-50), cap at 8%
  else if (riskScore < 50) {
    const maxPremium = productPrice * 0.08; // 8%
    calculatedPremium = Math.min(maxPremium, calculatedPremium);
  }
  // For high risk (50+), cap at 12%
  else {
    const maxPremium = productPrice * 0.12; // 12%
    calculatedPremium = Math.min(maxPremium, calculatedPremium);
  }

  // Step 8: Apply absolute minimum and maximum limits
  const absoluteMin = 50; // Minimum ₹50
  const absoluteMax = productPrice; // NEVER exceed product price

  calculatedPremium = Math.max(absoluteMin, Math.min(absoluteMax, calculatedPremium));

  // Round to nearest 10
  return Math.round(calculatedPremium / 10) * 10;
}

/**
 * Validate that premium doesn't exceed product price
 */
export function validatePremium(premium, productPrice) {
  if (!productPrice) {
    return { valid: false, error: 'Product price is required' };
  }

  if (premium > productPrice) {
    return { valid: false, error: `Premium (₹${premium}) cannot exceed product price (₹${productPrice})` };
  }

  if (premium < 0) {
    return { valid: false, error: 'Premium must be positive' };
  }

  return { valid: true };
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
