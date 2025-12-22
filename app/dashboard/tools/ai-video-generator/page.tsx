//app/dashboard/tools/ai-video-generator/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  ChevronDown, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VideoGenerationData {
  prompt: string;
  startingImage?: string;
  model: string;
  aspectRatio: string;
  duration: string;
  advancedSettings?: {
    creativityLevel: number;
  };
}

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
}

export default function AIVideoGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<string>('8');
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('veo-3-fast');
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const models = [
    { 
      id: 'sora-2', 
      name: 'Sora 2', 
      description: 'OpenAI Sora 2 - High quality (20 credits)',
      credits: 20,
      durations: ['4', '8', '12']
    },
    { 
      id: 'veo-3-fast', 
      name: 'Veo 3 Fast', 
      description: 'Google Veo 3 - Premium quality (50 credits)',
      credits: 50,
      durations: ['4', '6', '8']
    },
    { 
      id: 'wan-2.5', 
      name: 'Wan 2.5', 
      description: 'Fast generation - 720p only (10 credits)',
      credits: 10,
      durations: ['5', '10']
    },
  ];

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    
    const handleThemeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail.isDark);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  // Get current model's available durations
  const currentModel = models.find(m => m.id === selectedModel);
  const availableDurations = currentModel?.durations || ['4', '8', '12'];

  // Check if current model is Veo 3 Fast to show 16:9 format
  const isVeo3Fast = selectedModel === 'veo-3-fast';

  // Update duration when model changes if current duration is not available
  useEffect(() => {
    if (!availableDurations.includes(duration)) {
      setDuration(availableDurations[0]);
    }
  }, [selectedModel, availableDurations, duration]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save video to media library
  const saveToMediaLibrary = async (videoData: GeneratedVideo) => {
    try {
      const existingVideos = localStorage.getItem('generatedVideos');
      const videos = existingVideos ? JSON.parse(existingVideos) : [];
      videos.unshift(videoData);
      localStorage.setItem('generatedVideos', JSON.stringify(videos));
      console.log('Video saved to media library:', videoData);
    } catch (error) {
      console.error('Error saving to media library:', error);
    }
  };

  // Check video status
  const checkStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/video-status?jobId=${id}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📊 Status check:', data);

      if (data.status === 'completed') {
        console.log('✅ Video completed:', data.videoUrl);
        setGeneratedVideoUrl(data.videoUrl);
        setIsGenerating(false);
        setGenerationStatus('Video generated successfully!');
        stopPolling();

        // Save to media library
        const videoRecord: GeneratedVideo = {
          id: data.jobId || Date.now().toString(),
          url: data.videoUrl,
          prompt: prompt,
          model: currentModel?.name || 'Unknown',
          createdAt: new Date().toISOString(),
        };
        
        await saveToMediaLibrary(videoRecord);

        // Clear status after 3 seconds
        setTimeout(() => {
          setGenerationStatus('');
        }, 3000);

        return true;
      } else if (data.status === 'failed') {
        console.error('❌ Video generation failed:', data.error);
        setGenerationStatus(`Failed: ${data.error || 'Unknown error'}`);
        setIsGenerating(false);
        stopPolling();
        return true;
      } else {
        // Still processing
        setGenerationStatus(data.message || 'Processing your video...');
      }

      return false;
    } catch (err) {
      console.error('Error checking status:', err);
      return false;
    }
  };

  // Start polling for status
  const startPolling = (id: string) => {
    console.log('🔄 Starting to poll for job:', id);
    
    // Check immediately
    checkStatus(id);
    
    // Then check every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkStatus(id);
    }, 5000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setGenerationStatus('Preparing your request...');
    setGeneratedVideoUrl(null);
    setJobId(null);
    stopPolling();
    
    // Convert aspect ratio based on model
    let numericAspectRatio: string;
    if (isVeo3Fast) {
      numericAspectRatio = aspectRatio === 'landscape' ? '16:9' : '9:16';
    } else {
      numericAspectRatio = aspectRatio === 'landscape' ? '1920x1080' : '1080x1920';
    }
    
    const videoData: VideoGenerationData = {
      prompt,
      startingImage: uploadedImage || undefined,
      model: currentModel?.name || 'Veo 3 Fast',
      aspectRatio: numericAspectRatio,
      duration,
      advancedSettings: {
        creativityLevel: 50,
      },
    };

    try {
      setGenerationStatus('Sending request to AI...');
      
      console.log('🚀 Sending video generation request:', videoData);
      
      // Get Supabase session for auth
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call YOUR Next.js API with auth headers
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          }),
        },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ Video generation started:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start video generation');
      }

      // Store job ID and start polling
      setJobId(result.jobId);
      setGenerationStatus('Video generation started! This will take 1-2 minutes...');
      
      // Start polling for status
      startPolling(result.jobId);
      
    } catch (error) {
      console.error('❌ Error generating video:', error);
      setGenerationStatus('Failed to generate video. Please try again.');
      setIsGenerating(false);
      alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get aspect ratio display text based on model
  const getAspectRatioText = (orientation: 'landscape' | 'portrait') => {
    if (isVeo3Fast) {
      return orientation === 'landscape' ? '16:9' : '9:16';
    }
    return orientation === 'landscape' ? '1920x1080' : '1080x1920';
  };

  return (
    <div className={`max-w-[1400px] mx-auto px-6 py-6 ${isDarkMode ? '' : 'bg-gray-50 min-h-screen'}`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Video Generator</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Create stunning videos with AI using text prompts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Prompt */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none h-32 ${
                isDarkMode 
                  ? 'bg-[#1a1d29] border-gray-800 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Describe the video you want to create..."
              disabled={isGenerating}
            />
          </div>

          {/* Starting Image */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starting Image (optional)</label>
            <div className="grid grid-cols-1 gap-4 mb-5">
              <label className={`border px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer text-sm font-medium ${
                isDarkMode 
                  ? 'bg-[#1a1d29] hover:bg-[#1f2332] border-gray-800 text-white' 
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900'
              }`}>
                <Upload className="w-4 h-4" />
                Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden"
                  disabled={isGenerating}
                />
              </label>
              {/* <button className={`border px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition text-sm font-medium ${
                isDarkMode 
                  ? 'bg-[#1a1d29] hover:bg-[#1f2332] border-gray-800 text-white' 
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900'
              }`}>
                <ImageIcon className="w-4 h-4" />
                My Media
              </button> */}
            </div>
            
            {uploadedImage ? (
              <div className={`relative border rounded-lg p-3 ${isDarkMode ? 'bg-[#1a1d29] border-gray-800' : 'bg-white border-gray-300'}`}>
                <img src={uploadedImage} alt="Uploaded" className="w-full h-40 object-cover rounded" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-5 right-5 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold"
                  disabled={isGenerating}
                >
                  ×
                </button>
              </div>
            ) : (
              <label className={`border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#1a1d29] border-gray-800 hover:border-gray-700' 
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}>
                <Upload className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click to upload starting image</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden"
                  disabled={isGenerating}
                />
              </label>
            )}
          </div>

          {/* Model */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Model</label>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1a1d29] border-gray-800 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                disabled={isGenerating}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {models.find(m => m.id === selectedModel)?.description}
            </p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Aspect Ratio
              {isVeo3Fast && (
                <span className="ml-2 text-xs text-purple-400">(Veo 3 Fast format)</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAspectRatio('landscape')}
                disabled={isGenerating}
                className={`px-4 py-3 rounded-lg font-medium transition text-center ${
                  aspectRatio === 'landscape'
                    ? 'bg-purple-600 text-white'
                    : isDarkMode 
                      ? 'bg-[#1a1d29] border border-gray-800 text-gray-300 hover:bg-[#1f2332]' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs opacity-70 mt-0.5">
                  {getAspectRatioText('landscape')}
                </div>
              </button>
              <button
                onClick={() => setAspectRatio('portrait')}
                disabled={isGenerating}
                className={`px-4 py-3 rounded-lg font-medium transition text-center ${
                  aspectRatio === 'portrait'
                    ? 'bg-purple-600 text-white'
                    : isDarkMode 
                      ? 'bg-[#1a1d29] border border-gray-800 text-gray-300 hover:bg-[#1f2332]' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs opacity-70 mt-0.5">
                  {getAspectRatioText('portrait')}
                </div>
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Duration</label>
            <div className={`grid gap-3 ${availableDurations.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {availableDurations.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setDuration(sec)}
                  disabled={isGenerating}
                  className={`px-4 py-2.5 rounded-lg font-medium transition ${
                    duration === sec
                      ? 'bg-purple-600 text-white'
                      : isDarkMode 
                        ? 'bg-[#1a1d29] border border-gray-800 text-gray-300 hover:bg-[#1f2332]' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sec} seconds
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <details className={`border rounded-lg overflow-hidden group ${
            isDarkMode 
              ? 'bg-[#1a1d29] border-gray-800' 
              : 'bg-white border-gray-300'
          }`}>
            <summary className={`flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition list-none ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-700 hover:text-gray-900'
            }`}>
              <Settings className="w-4 h-4" />
              Advanced Settings
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
            </summary>
            <div className={`px-4 pb-4 pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Creativity Level</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="50" 
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                disabled={isGenerating}
              />
            </div>
          </details>

          {/* Generate Button */}
          <button 
            onClick={handleGenerateVideo}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Generating...' : `Generate Video (${models.find(m => m.id === selectedModel)?.credits || 50} credits)`}
          </button>

          {/* Job ID Display */}
          {jobId && (
            <div className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Job ID: {jobId}
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div>
            <h3 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Generated Video</h3>
            <div className={`border rounded-lg aspect-video flex items-center justify-center overflow-hidden ${
              isDarkMode 
                ? 'bg-[#1a1d29] border-gray-800' 
                : 'bg-white border-gray-300'
            }`}>
              {generatedVideoUrl ? (
                <video 
                  src={generatedVideoUrl} 
                  controls 
                  className="w-full h-full"
                  autoPlay
                />
              ) : (
                <div className="text-center p-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isDarkMode ? 'bg-[#252938]' : 'bg-gray-100'
                  }`}>
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    ) : (
                      <Video className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isGenerating ? generationStatus || 'Generating your video...' : 'No video generated yet'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {isGenerating ? 'Checking status every 5 seconds...' : 'Your AI-generated video will appear here'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Status Message */}
            {generationStatus && !isGenerating && generatedVideoUrl && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">{generationStatus}</p>
              </div>
            )}

            {/* Error Message */}
            {generationStatus && !isGenerating && !generatedVideoUrl && generationStatus.includes('Failed') && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{generationStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}