// lib/credits.ts
import { createClient } from '@/lib/supabase/client';

export interface CreditTransaction {
  success: boolean;
  newBalance?: number;
  error?: string;
}

/**
 * Deduct credits from user account
 * @param userId - User's UUID
 * @param amount - Number of credits to deduct (positive number)
 * @param description - Description of the transaction
 * @param metadata - Optional metadata (e.g., video_id, prompt, etc.)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, any>
): Promise<CreditTransaction> {
  const supabase = createClient();

  try {
    // 1. Get current balance
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'User not found' };
    }

    // 2. Check if user has enough credits
    if (user.credit_balance < amount) {
      return { 
        success: false, 
        error: `Insufficient credits. You have ${user.credit_balance} credits but need ${amount}.` 
      };
    }

    const newBalance = user.credit_balance - amount;

    // 3. Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credit_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to update balance' };
    }

    // 4. Create transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'usage',
        amount: -amount, // Negative for deduction
        balance_after: newBalance,
        description,
        metadata: metadata || {}
      });

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError);
      // Don't fail the whole operation if just the transaction record fails
    }

    return { success: true, newBalance };

  } catch (error: any) {
    console.error('Deduct credits error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Add credits to user account (for purchases, bonuses, refunds)
 * @param userId - User's UUID
 * @param amount - Number of credits to add (positive number)
 * @param type - Transaction type: 'purchase', 'bonus', or 'refund'
 * @param description - Description of the transaction
 * @param metadata - Optional metadata
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund',
  description: string,
  metadata?: Record<string, any>
): Promise<CreditTransaction> {
  const supabase = createClient();

  try {
    // 1. Get current balance
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credit_balance, total_credits_purchased')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'User not found' };
    }

    const newBalance = user.credit_balance + amount;
    const updateData: any = { 
      credit_balance: newBalance,
      updated_at: new Date().toISOString()
    };

    // Update total_credits_purchased only for purchases
    if (type === 'purchase') {
      updateData.total_credits_purchased = (user.total_credits_purchased || 0) + amount;
    }

    // 2. Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to update balance' };
    }

    // 3. Create transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: type,
        amount: amount,
        balance_after: newBalance,
        description,
        metadata: metadata || {}
      });

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError);
    }

    return { success: true, newBalance };

  } catch (error: any) {
    console.error('Add credits error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<number | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.credit_balance;
  } catch (error) {
    console.error('Get credit balance error:', error);
    return null;
  }
}