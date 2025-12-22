// hooks/useCredits.ts
import { useState } from 'react';

export const MODEL_CREDITS = {
  'sora-2': { credits: 20, name: 'OpenAI Sora 2 - High quality' },
  'veo-3': { credits: 50, name: 'Google Veo 3 - Premium quality' },
  'fast': { credits: 10, name: 'Fast generation - 720p' },
} as const;

export type ModelType = keyof typeof MODEL_CREDITS;

interface DeductCreditsResponse {
  success: boolean;
  credits_deducted?: number;
  previous_balance?: number;
  new_balance?: number;
  model?: string;
  error?: string;
  required?: number;
  available?: number;
}

export function useCredits() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deductCredits = async (
    userId: string,
    model: ModelType,
    videoId?: string,
    prompt?: string
  ): Promise<DeductCreditsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/deduct-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          model,
          videoId,
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to deduct credits');
        return { success: false, ...data };
      }

      return { success: true, ...data };
    } catch (err: any) {
      const errorMsg = err.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const checkSufficientCredits = (userBalance: number, model: ModelType): boolean => {
    const modelConfig = MODEL_CREDITS[model];
    return userBalance >= modelConfig.credits;
  };

  const getModelCost = (model: ModelType): number => {
    return MODEL_CREDITS[model].credits;
  };

  const getModelName = (model: ModelType): string => {
    return MODEL_CREDITS[model].name;
  };

  return {
    deductCredits,
    checkSufficientCredits,
    getModelCost,
    getModelName,
    loading,
    error,
    MODEL_CREDITS,
  };
}