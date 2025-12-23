// app/api/deduct-credits/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// Define credit costs for each model
const MODEL_CREDITS: Record<string, { credits: number; name: string }> = {
  'sora-2': { credits: 20, name: 'OpenAI Sora 2 - High quality' },
  'veo-3': { credits: 50, name: 'Google Veo 3 - Premium quality' },
  'fast': { credits: 10, name: 'Fast generation - 720p' },
};

export async function POST(request: Request) {
  try {
    const { userId, model, videoId, prompt } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'Missing model' }, { status: 400 });
    }

    // Get model credit cost
    const modelConfig = MODEL_CREDITS[model];
    if (!modelConfig) {
      return NextResponse.json({ 
        error: 'Invalid model', 
        valid_models: Object.keys(MODEL_CREDITS) 
      }, { status: 400 });
    }

    const creditsToDeduct = modelConfig.credits;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Get current user balance
    const getUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=credit_balance,email`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });

    if (!getUserResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }

    const users = await getUserResponse.json();
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = users[0].credit_balance || 0;

    // 2. Check if user has enough credits
    if (currentBalance < creditsToDeduct) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditsToDeduct,
        available: currentBalance,
        model: modelConfig.name,
      }, { status: 402 }); // 402 Payment Required
    }

    // 3. Deduct credits
    const newBalance = currentBalance - creditsToDeduct;

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        credit_balance: newBalance,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Deduct credits failed:', errorText);
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    // 4. Record transaction
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        transaction_type: 'usage',
        amount: -creditsToDeduct, // Negative for deduction
        balance_after: newBalance,
        description: `Video generation - ${modelConfig.name}`,
        metadata: {
          model: model,
          model_name: modelConfig.name,
          video_id: videoId || null,
          prompt: prompt || null,
        },
      }),
    });

    let transactionId = null;
    if (transactionResponse.ok) {
      const transactionData = await transactionResponse.json();
      transactionId = Array.isArray(transactionData) ? transactionData[0]?.id : transactionData?.id;
    }

    console.log('Credits deducted:', {
      userId,
      model,
      creditsDeducted: creditsToDeduct,
      previousBalance: currentBalance,
      newBalance,
    });

    return NextResponse.json({
      success: true,
      credits_deducted: creditsToDeduct,
      previous_balance: currentBalance,
      new_balance: newBalance,
      model: modelConfig.name,
      transaction_id: transactionId,
    });

  } catch (err: any) {
    console.error('Deduct credits error:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error' 
    }, { status: 500 });
  }
}

// GET endpoint to check credit cost for a model
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model');

  if (model) {
    const modelConfig = MODEL_CREDITS[model];
    if (!modelConfig) {
      return NextResponse.json({ 
        error: 'Invalid model',
        valid_models: Object.keys(MODEL_CREDITS),
      }, { status: 400 });
    }
    return NextResponse.json({
      model,
      credits: modelConfig.credits,
      name: modelConfig.name,
    });
  }

  // Return all models and their costs
  return NextResponse.json({
    models: Object.entries(MODEL_CREDITS).map(([key, value]) => ({
      id: key,
      credits: value.credits,
      name: value.name,
    })),
  });
}