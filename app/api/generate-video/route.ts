// // app/api/generate-video/route.ts
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const N8N_WEBHOOK_URL = 'https://cypk23.app.n8n.cloud/webhook/2826d8d6-4579-4b6a-994e-322e4611b349';

// export const maxDuration = 600;

// // Initialize Supabase with service role for server-side operations
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Get current user from auth header
//     const authHeader = request.headers.get('Authorization');
//     const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
//       global: {
//         headers: authHeader ? { Authorization: authHeader } : {},
//       },
//     });
    
//     const { data: { user }, error: authError } = await supabase.auth.getUser();
    
//     if (authError || !user) {
//       console.error('Auth error:', authError);
//       return NextResponse.json(
//         { success: false, error: 'Unauthorized - Please log in' },
//         { status: 401 }
//       );
//     }
    
//     console.log('✅ User authenticated:', user.id);
    
//     // Calculate credits based on model
//     const modelCredits: { [key: string]: number } = {
//       'Sora 2': 20,
//       'Veo 3 Fast': 50,
//       'Veo 3.1': 60,
//       'Wan 2.5': 10,
//     };
//     const credits = modelCredits[body.model] || 50;
    
//     // ✅ CHECK USER CREDIT BALANCE
//     const { data: userProfile, error: profileError } = await supabaseAdmin
//       .from('users')
//       .select('credit_balance')
//       .eq('id', user.id)
//       .single();
    
//     if (profileError) {
//       console.error('❌ Error fetching user profile:', profileError);
//       return NextResponse.json(
//         { success: false, error: 'Failed to fetch user profile' },
//         { status: 500 }
//       );
//     }
    
//     const currentBalance = userProfile.credit_balance || 0;
    
//     console.log('💰 Credit check:', { currentBalance, required: credits });
    
//     // Check if user has enough credits
//     if (currentBalance < credits) {
//       console.error('❌ Insufficient credits:', { has: currentBalance, needs: credits });
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Insufficient credits',
//           details: `You need ${credits} credits but only have ${currentBalance}`
//         },
//         { status: 402 } // Payment Required
//       );
//     }
    
//     // ✅ DEDUCT CREDITS FROM USER BALANCE
//     const newBalance = currentBalance - credits;
    
//     const { error: updateBalanceError } = await supabaseAdmin
//       .from('users')
//       .update({ credit_balance: newBalance })
//       .eq('id', user.id);
    
//     if (updateBalanceError) {
//       console.error('❌ Error updating credit balance:', updateBalanceError);
//       return NextResponse.json(
//         { success: false, error: 'Failed to deduct credits' },
//         { status: 500 }
//       );
//     }
    
//     console.log('✅ Credits deducted:', { 
//       previous: currentBalance, 
//       deducted: credits, 
//       new: newBalance 
//     });
    
//     // Generate unique job ID
//     const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Get base URL for callback
//     const protocol = request.headers.get('x-forwarded-proto') || 'http';
//     const host = request.headers.get('host');
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
//     const callbackUrl = `${baseUrl}/api/video-callback`;
    
//     console.log('🚀 Starting video generation:', { 
//       jobId, 
//       callbackUrl,
//       userId: user.id,
//       model: body.model,
//       aspectRatio: body.aspectRatio,
//       credits,
//       newBalance
//     });
    
//     // ✅ CREATE SUPABASE RECORD FIRST (with status "generating")
//     try {
//       const { data: insertData, error: insertError } = await supabaseAdmin
//         .from('generated_videos')
//         .insert({
//           id: jobId,
//           user_id: user.id,
//           video_url: 'EMPTY', // Placeholder, will be updated by callback
//           thumbnail_url: null,
//           prompt: body.prompt,
//           model_used: body.model,
//           status: 'generating',
//           credits_used: credits,
//         })
//         .select()
//         .single();
      
//       if (insertError) {
//         // ❌ REFUND CREDITS IF DATABASE INSERT FAILS
//         await supabaseAdmin
//           .from('users')
//           .update({ credit_balance: currentBalance })
//           .eq('id', user.id);
        
//         console.error('❌ Error creating Supabase record (credits refunded):', insertError);
//         throw new Error(`Database error: ${insertError.message}`);
//       }
      
//       console.log('✅ Supabase record created:', jobId);
//     } catch (dbError) {
//       console.error('❌ Database error:', dbError);
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Failed to create video record in database',
//           details: dbError instanceof Error ? dbError.message : 'Unknown error'
//         },
//         { status: 500 }
//       );
//     }
    
//     // ✅ Send to n8n with correct field names (aspect_ratio with underscore)
//     const n8nPayload = {
//       prompt: body.prompt,
//       model: body.model,
//       aspect_ratio: body.aspectRatio,  // ← CRITICAL: Convert camelCase to snake_case for n8n API
//       duration: body.duration,
//       startingImage: body.startingImage,
//       advancedSettings: body.advancedSettings,
//       jobId,
//       callbackUrl,
//     };
    
//     console.log('📤 Sending to n8n:', n8nPayload);
    
//     // Send request but DON'T wait for video generation
//     fetch(N8N_WEBHOOK_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(n8nPayload),
//     }).catch(error => {
//       console.error('❌ Error sending to n8n:', error);
//       // Note: Credits already deducted, would need separate refund logic here
//     });
    
//     console.log('✅ Job started, returning immediately:', jobId);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Video generation started',
//       jobId,
//       status: 'generating',
//       estimatedTime: '4-5 minutes',
//       creditsDeducted: credits,
//       newBalance: newBalance,
//     }, {
//       status: 202,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       },
//     });
    
//   } catch (error) {
//     console.error('❌ Error starting video generation:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: 'Failed to start video generation', 
//         details: error instanceof Error ? error.message : 'Unknown error' 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS(request: NextRequest) {
//   return NextResponse.json({}, {
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     },
//   });
// }

// // app/api/generate-video/route.ts
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// // Use environment variable first, fallback to hardcoded
// const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://cypk23.app.n8n.cloud/webhook/2826d8d6-4579-4b6a-994e-322e4611b349';

// export const maxDuration = 600;

// // Initialize Supabase with service role for server-side operations
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Get current user from auth header
//     const authHeader = request.headers.get('Authorization');
//     const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
//       global: {
//         headers: authHeader ? { Authorization: authHeader } : {},
//       },
//     });
    
//     const { data: { user }, error: authError } = await supabase.auth.getUser();
    
//     if (authError || !user) {
//       console.error('Auth error:', authError);
//       return NextResponse.json(
//         { success: false, error: 'Unauthorized - Please log in' },
//         { status: 401 }
//       );
//     }
    
//     console.log('✅ User authenticated:', user.id);
    
//     // Calculate credits based on model
//     const modelCredits: { [key: string]: number } = {
//       'Sora 2': 20,
//       'Veo 3 Fast': 50,
//       'Veo 3.1': 60,
//       'Wan 2.5': 10,
//     };
//     const credits = modelCredits[body.model] || 50;
    
//     // ✅ CHECK USER CREDIT BALANCE
//     const { data: userProfile, error: profileError } = await supabaseAdmin
//       .from('users')
//       .select('credit_balance')
//       .eq('id', user.id)
//       .single();
    
//     if (profileError) {
//       console.error('❌ Error fetching user profile:', profileError);
//       return NextResponse.json(
//         { success: false, error: 'Failed to fetch user profile' },
//         { status: 500 }
//       );
//     }
    
//     const currentBalance = userProfile.credit_balance || 0;
    
//     console.log('💰 Credit check:', { currentBalance, required: credits });
    
//     // Check if user has enough credits
//     if (currentBalance < credits) {
//       console.error('❌ Insufficient credits:', { has: currentBalance, needs: credits });
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Insufficient credits',
//           details: `You need ${credits} credits but only have ${currentBalance}`
//         },
//         { status: 402 } // Payment Required
//       );
//     }
    
//     // ✅ DEDUCT CREDITS FROM USER BALANCE
//     const newBalance = currentBalance - credits;
    
//     const { error: updateBalanceError } = await supabaseAdmin
//       .from('users')
//       .update({ credit_balance: newBalance })
//       .eq('id', user.id);
    
//     if (updateBalanceError) {
//       console.error('❌ Error updating credit balance:', updateBalanceError);
//       return NextResponse.json(
//         { success: false, error: 'Failed to deduct credits' },
//         { status: 500 }
//       );
//     }
    
//     console.log('✅ Credits deducted:', { 
//       previous: currentBalance, 
//       deducted: credits, 
//       new: newBalance 
//     });
    
//     // Generate unique job ID
//     const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Get base URL for callback
//     const protocol = request.headers.get('x-forwarded-proto') || 'https';
//     const host = request.headers.get('host');
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
//     const callbackUrl = `${baseUrl}/api/video-callback`;
    
//     console.log('🚀 Starting video generation:', { 
//       jobId, 
//       callbackUrl,
//       userId: user.id,
//       model: body.model,
//       aspectRatio: body.aspectRatio,
//       credits,
//       newBalance
//     });
    
//     // ✅ CREATE SUPABASE RECORD FIRST (with status "generating")
//     try {
//       const { data: insertData, error: insertError } = await supabaseAdmin
//         .from('generated_videos')
//         .insert({
//           id: jobId,
//           user_id: user.id,
//           video_url: 'EMPTY', // Placeholder, will be updated by callback
//           thumbnail_url: null,
//           prompt: body.prompt,
//           model_used: body.model,
//           status: 'generating',
//           credits_used: credits,
//         })
//         .select()
//         .single();
      
//       if (insertError) {
//         // ❌ REFUND CREDITS IF DATABASE INSERT FAILS
//         await supabaseAdmin
//           .from('users')
//           .update({ credit_balance: currentBalance })
//           .eq('id', user.id);
        
//         console.error('❌ Error creating Supabase record (credits refunded):', insertError);
//         throw new Error(`Database error: ${insertError.message}`);
//       }
      
//       console.log('✅ Supabase record created:', jobId);
//     } catch (dbError) {
//       console.error('❌ Database error:', dbError);
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Failed to create video record in database',
//           details: dbError instanceof Error ? dbError.message : 'Unknown error'
//         },
//         { status: 500 }
//       );
//     }
    
//     // ✅ Send to n8n with correct field names
//     const n8nPayload = {
//       prompt: body.prompt,
//       model: body.model,
//       aspect_ratio: body.aspectRatio,
//       duration: body.duration,
//       startingImage: body.startingImage,
//       advancedSettings: body.advancedSettings,
//       jobId,
//       callbackUrl,
//       userId: user.id, // Add userId for tracking
//     };
    
//     console.log('📤 Sending to n8n webhook:', N8N_WEBHOOK_URL);
//     console.log('📤 Payload:', JSON.stringify(n8nPayload, null, 2));
    
//     // Send request but DON'T wait for video generation (fire and forget)
//     fetch(N8N_WEBHOOK_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(n8nPayload),
//     })
//     .then(response => {
//       console.log('✅ n8n webhook response status:', response.status);
//       return response.text();
//     })
//     .then(text => {
//       console.log('✅ n8n webhook response body:', text);
//     })
//     .catch(error => {
//       console.error('❌ Error sending to n8n webhook:', error);
//       console.error('❌ Webhook URL used:', N8N_WEBHOOK_URL);
      
//       // Update database to failed status
//       supabaseAdmin
//         .from('generated_videos')
//         .update({ status: 'failed', video_url: 'ERROR' })
//         .eq('id', jobId)
//         .then(() => console.log('✅ Updated video status to failed'));
      
//       // Refund credits
//       supabaseAdmin
//         .from('users')
//         .update({ credit_balance: currentBalance })
//         .eq('id', user.id)
//         .then(() => console.log('✅ Credits refunded'));
//     });
    
//     console.log('✅ Job started, returning immediately:', jobId);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Video generation started',
//       jobId,
//       status: 'generating',
//       estimatedTime: '4-5 minutes',
//       creditsDeducted: credits,
//       newBalance: newBalance,
//     }, {
//       status: 202,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       },
//     });
    
//   } catch (error) {
//     console.error('❌ Error starting video generation:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: 'Failed to start video generation', 
//         details: error instanceof Error ? error.message : 'Unknown error' 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS(request: NextRequest) {
//   return NextResponse.json({}, {
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     },
//   });
// }

// app/api/generate-video/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// n8n API configuration (more reliable than webhook)
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://cypk23.app.n8n.cloud';
const N8N_WORKFLOW_ID = process.env.N8N_WORKFLOW_ID || 'MlwVEJOpcxl3NkoA';
const N8N_API_KEY = process.env.N8N_API_KEY;

export const maxDuration = 600;

// Initialize Supabase with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get current user from auth header
    const authHeader = request.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Calculate credits based on model
    const modelCredits: { [key: string]: number } = {
      'Sora 2': 20,
      'Veo 3 Fast': 50,
      'Veo 3.1': 60,
      'Wan 2.5': 10,
    };
    const credits = modelCredits[body.model] || 50;
    
    // ✅ CHECK USER CREDIT BALANCE
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('credit_balance')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
    
    const currentBalance = userProfile.credit_balance || 0;
    
    console.log('💰 Credit check:', { currentBalance, required: credits });
    
    // Check if user has enough credits
    if (currentBalance < credits) {
      console.error('❌ Insufficient credits:', { has: currentBalance, needs: credits });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient credits',
          details: `You need ${credits} credits but only have ${currentBalance}`
        },
        { status: 402 } // Payment Required
      );
    }
    
    // ✅ DEDUCT CREDITS FROM USER BALANCE
    const newBalance = currentBalance - credits;
    
    const { error: updateBalanceError } = await supabaseAdmin
      .from('users')
      .update({ credit_balance: newBalance })
      .eq('id', user.id);
    
    if (updateBalanceError) {
      console.error('❌ Error updating credit balance:', updateBalanceError);
      return NextResponse.json(
        { success: false, error: 'Failed to deduct credits' },
        { status: 500 }
      );
    }
    
    console.log('✅ Credits deducted:', { 
      previous: currentBalance, 
      deducted: credits, 
      new: newBalance 
    });
    
    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get base URL for callback
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const callbackUrl = `${baseUrl}/api/video-callback`;
    
    console.log('🚀 Starting video generation:', { 
      jobId, 
      callbackUrl,
      userId: user.id,
      model: body.model,
      aspectRatio: body.aspectRatio,
      credits,
      newBalance
    });
    
    // ✅ CREATE SUPABASE RECORD FIRST (with status "generating")
    try {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('generated_videos')
        .insert({
          id: jobId,
          user_id: user.id,
          video_url: 'EMPTY', // Placeholder, will be updated by callback
          thumbnail_url: null,
          prompt: body.prompt,
          model_used: body.model,
          status: 'generating',
          credits_used: credits,
        })
        .select()
        .single();
      
      if (insertError) {
        // ❌ REFUND CREDITS IF DATABASE INSERT FAILS
        await supabaseAdmin
          .from('users')
          .update({ credit_balance: currentBalance })
          .eq('id', user.id);
        
        console.error('❌ Error creating Supabase record (credits refunded):', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      console.log('✅ Supabase record created:', jobId);
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create video record in database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    // ✅ Prepare payload for n8n
    const n8nPayload = {
      prompt: body.prompt,
      model: body.model,
      aspect_ratio: body.aspectRatio,
      duration: body.duration,
      startingImage: body.startingImage,
      advancedSettings: body.advancedSettings,
      jobId,
      callbackUrl,
      userId: user.id,
    };
    
    // ============================================
    // SEND TO N8N USING API (more reliable than webhook)
    // ============================================
    if (!N8N_API_KEY || !N8N_WORKFLOW_ID) {
      console.error('❌ Missing N8N_API_KEY or N8N_WORKFLOW_ID environment variables');
      
      // Update to failed status
      await supabaseAdmin
        .from('generated_videos')
        .update({ status: 'failed', video_url: 'ERROR: n8n not configured' })
        .eq('id', jobId);
      
      // Refund credits
      await supabaseAdmin
        .from('users')
        .update({ credit_balance: currentBalance })
        .eq('id', user.id);
        
      return NextResponse.json({
        success: false,
        error: 'Video generation service not configured',
      }, { status: 500 });
    }
    
    const n8nApiUrl = `${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}/execute`;
    
    console.log('📤 Sending to n8n API:', n8nApiUrl);
    console.log('📤 Workflow ID:', N8N_WORKFLOW_ID);
    console.log('📤 Payload:', JSON.stringify(n8nPayload, null, 2));
    
    // Send request but DON'T wait for video generation (fire and forget)
    fetch(n8nApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify(n8nPayload),
    })
    .then(async response => {
      console.log('✅ n8n API response status:', response.status);
      const text = await response.text();
      console.log('✅ n8n API response body:', text);
      
      if (!response.ok) {
        throw new Error(`n8n API returned ${response.status}: ${text}`);
      }
    })
    .catch(async error => {
      console.error('❌ Error sending to n8n API:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ API URL used:', n8nApiUrl);
      
      // Update database to failed status
      await supabaseAdmin
        .from('generated_videos')
        .update({ status: 'failed', video_url: 'ERROR: Could not connect to n8n API' })
        .eq('id', jobId);
      
      // Refund credits
      await supabaseAdmin
        .from('users')
        .update({ credit_balance: currentBalance })
        .eq('id', user.id);
        
      console.log('✅ Credits refunded due to n8n API error');
    });
    
    console.log('✅ Job started, returning immediately:', jobId);
    
    return NextResponse.json({
      success: true,
      message: 'Video generation started',
      jobId,
      status: 'generating',
      estimatedTime: '4-5 minutes',
      creditsDeducted: credits,
      newBalance: newBalance,
    }, {
      status: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Error starting video generation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to start video generation', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}