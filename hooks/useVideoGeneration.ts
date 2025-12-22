// hooks/useVideoGeneration.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface VideoGenerationOptions {
  prompt: string;
  model: string;
  aspectRatio: string;
  duration: string;
  advancedSettings?: {
    creativityLevel?: number;
  };
  [key: string]: any;
}

interface VideoGenerationResult {
  jobId: string | null;
  videoUrl: string | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error: string | null;
  isLoading: boolean;
  progress?: string;
}

export function useVideoGeneration() {
  const [result, setResult] = useState<VideoGenerationResult>({
    jobId: null,
    videoUrl: null,
    status: 'idle',
    error: null,
    isLoading: false,
    progress: undefined,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const checkStatus = useCallback(async (jobId: string) => {
    try {
      pollCountRef.current++;
      const response = await fetch(`/api/video-status?jobId=${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`📊 Status check #${pollCountRef.current}:`, data.status);

      // Update progress message based on polling count
      let progress = 'Generating your video...';
      if (pollCountRef.current > 12) { // 1 minute
        progress = 'Almost done... (This usually takes 1-2 minutes)';
      } else if (pollCountRef.current > 24) { // 2 minutes
        progress = 'Taking longer than usual... Please wait...';
      }

      if (data.status === 'completed') {
        setResult(prev => ({
          ...prev,
          status: 'completed',
          videoUrl: data.videoUrl,
          isLoading: false,
          progress: 'Video ready!',
        }));
        stopPolling();
        return true;
      } else if (data.status === 'failed') {
        setResult(prev => ({
          ...prev,
          status: 'failed',
          error: data.error || 'Video generation failed',
          isLoading: false,
          progress: undefined,
        }));
        stopPolling();
        return true;
      } else {
        // Still processing
        setResult(prev => ({
          ...prev,
          progress,
        }));
      }

      return false;
    } catch (error) {
      console.error('❌ Status check error:', error);
      // Don't stop polling on error, might be temporary network issue
      return false;
    }
  }, [stopPolling]);

  const startPolling = useCallback((jobId: string) => {
    console.log('🔄 Starting to poll for job:', jobId);
    
    // Check immediately
    checkStatus(jobId);
    
    // Then check every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkStatus(jobId);
    }, 5000);

    // Safety timeout: stop after 10 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        stopPolling();
        setResult(prev => ({
          ...prev,
          status: 'failed',
          error: 'Video generation timed out. Please try again.',
          isLoading: false,
        }));
      }
    }, 600000); // 10 minutes
  }, [checkStatus, stopPolling]);

  const generate = useCallback(async (options: VideoGenerationOptions) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopPolling();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setResult({
      jobId: null,
      videoUrl: null,
      status: 'processing',
      error: null,
      isLoading: true,
      progress: 'Starting video generation...',
    });

    try {
      console.log('🚀 Starting video generation with options:', {
        prompt: options.prompt?.substring(0, 50),
        model: options.model,
      });

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      console.log('✅ Video generation started:', data.jobId);

      setResult(prev => ({
        ...prev,
        jobId: data.jobId,
        progress: 'Video queued for processing...',
      }));

      // Start polling for status
      startPolling(data.jobId);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Request cancelled');
        return;
      }

      console.error('❌ Video generation error:', error);
      setResult({
        jobId: null,
        videoUrl: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to generate video',
        isLoading: false,
        progress: undefined,
      });
    }
  }, [startPolling, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResult({
      jobId: null,
      videoUrl: null,
      status: 'idle',
      error: null,
      isLoading: false,
      progress: undefined,
    });
  }, [stopPolling]);

  return {
    ...result,
    generate,
    reset,
  };
}