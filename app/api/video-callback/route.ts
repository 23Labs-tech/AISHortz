// app/api/video-callback/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from '@/lib/job-store';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Full callback received:', JSON.stringify(body, null, 2));
    
    // Extract fields
    const jobId = body.jobId;
    const status = body.status || 'completed';
    const videoUrl = body.videoUrl;
    const error = body.error;
    
    console.log('Extracted values:', { jobId, status, videoUrl, error });
    
    if (!jobId) {
      console.error('❌ No jobId in callback');
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }
    
    if (!videoUrl) {
      console.error('❌ No videoUrl found!');
      console.error('Body structure:', body);
    }
    
    // Store in job store for immediate polling
    const jobData = {
      jobId,
      status: error ? 'failed' : status,
      videoUrl: videoUrl || null,
      error,
      completedAt: new Date().toISOString(),
    };
    
    jobStore.set(jobId, jobData);
    
    console.log('✅ Job stored successfully:', jobId);
    console.log('   Status:', jobData.status);
    console.log('   Video URL:', videoUrl || 'NULL');
    
    // ✅ UPDATE EXISTING SUPABASE RECORD (NOT INSERT!)
    if (videoUrl) {
      try {
        console.log('🔄 Updating Supabase record:', jobId);
        
        const { data: updateData, error: updateError } = await supabase
          .from('generated_videos')
          .update({
            video_url: videoUrl,
            status: error ? 'failed' : 'completed',
          })
          .eq('id', jobId)
          .select();
        
        if (updateError) {
          console.error('❌ Error updating Supabase:', updateError);
        } else {
          console.log('✅ Supabase record updated successfully!');
          console.log('   Updated records:', updateData);
          
          if (!updateData || updateData.length === 0) {
            console.warn('⚠️  No rows were updated. Record might not exist:', jobId);
          }
        }
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
      }
    } else {
      console.warn('⚠️  Skipping Supabase update - no videoUrl provided');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Callback received successfully',
      jobId,
      videoUrl,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('❌ Error processing callback:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process callback', 
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}