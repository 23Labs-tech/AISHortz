// lib/model-credits.ts

/**
 * Get the credit cost for a specific AI model
 */
export function getModelCreditCost(modelName: string): number {
  const normalizedModel = modelName.toLowerCase().trim();
  
  // Model credit pricing
  if (normalizedModel.includes('sora 2') || normalizedModel.includes('sora-2')) {
    return 20;
  }
  
  if (normalizedModel.includes('wan 2.5') || normalizedModel.includes('wan-2.5') || normalizedModel.includes('wan2.5')) {
    return 10;
  }
  
  if (normalizedModel.includes('veo 3.1') || normalizedModel.includes('veo-3.1') || normalizedModel.includes('veo3.1')) {
    return 50;
  }
  
  // Default fallback (in case of unknown model)
  return 10;
}

/**
 * Validate if user has enough credits for a model
 */
export function hasEnoughCredits(userBalance: number, modelName: string): boolean {
  const requiredCredits = getModelCreditCost(modelName);
  return userBalance >= requiredCredits;
}

/**
 * Get all model credit information
 */
export const MODEL_CREDITS = {
  'Sora 2': 20,
  'Wan 2.5': 10,
  'Veo 3.1': 50,
} as const;