
// // app/dashboard/media/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Video, Trash2, Download, Calendar, Sparkles, X } from 'lucide-react';
// import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';

// interface GeneratedVideo {
//   id: string;
//   video_url: string;
//   thumbnail_url: string | null;
//   prompt: string;
//   model_used: string;
//   status: string;
//   created_at: string;
//   credits_used: number;
// }

// export default function MediaLibraryPage() {
//   const [videos, setVideos] = useState<GeneratedVideo[]>([]);
//   const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const supabase = createClient();

//   // Load videos from Supabase
//   useEffect(() => {
//     loadVideos();

//     // Subscribe to real-time updates
//     const channel = supabase
//       .channel('video-updates')
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'generated_videos',
//         },
//         (payload) => {
//           console.log('Video updated!', payload);
//           loadVideos(); // Reload videos on any change
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const loadVideos = async () => {
//     try {
//       // Get current user
//       const { data: { user }, error: authError } = await supabase.auth.getUser();
      
//       if (authError || !user) {
//         router.push('/login');
//         return;
//       }

//       // Fetch user's videos from Supabase
//       const { data: videosData, error: videosError } = await supabase
//         .from('generated_videos')
//         .select('id, video_url, thumbnail_url, prompt, model_used, status, created_at, credits_used')
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false });

//       if (videosError) {
//         console.error('Error loading videos:', videosError);
//         return;
//       }

//       setVideos(videosData || []);
//     } catch (error) {
//       console.error('Error loading videos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (videoId: string) => {
//     if (!confirm('Are you sure you want to delete this video?')) {
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('generated_videos')
//         .delete()
//         .eq('id', videoId);

//       if (error) {
//         console.error('Error deleting video:', error);
//         alert('Failed to delete video');
//         return;
//       }

//       // Update local state
//       setVideos(videos.filter(v => v.id !== videoId));
      
//       if (selectedVideo?.id === videoId) {
//         setSelectedVideo(null);
//       }
//     } catch (error) {
//       console.error('Error deleting video:', error);
//       alert('Failed to delete video');
//     }
//   };

//   const handleDownload = (videoUrl: string, videoId: string) => {
//     if (!videoUrl || videoUrl === 'EMPTY') {
//       alert('Video URL is not available yet. Please wait for generation to complete.');
//       return;
//     }

//     try {
//       const link = document.createElement('a');
//       link.href = videoUrl;
//       link.download = `video_${videoId}.mp4`;
//       link.target = '_blank';
//       link.rel = 'noopener noreferrer';
      
//       document.body.appendChild(link);
//       link.click();
      
//       setTimeout(() => {
//         document.body.removeChild(link);
//       }, 100);
//     } catch (error) {
//       console.error('Error downloading video:', error);
//       window.open(videoUrl, '_blank');
//     }
//   };

//   const handleClose = () => {
//     setSelectedVideo(null);
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-600/20 text-green-400';
//       case 'generating':
//         return 'bg-yellow-600/20 text-yellow-400';
//       case 'failed':
//         return 'bg-red-600/20 text-red-400';
//       default:
//         return 'bg-gray-600/20 text-gray-400';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-[1400px] mx-auto px-6 py-6">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
//           <p className="text-gray-400">View and manage your AI-generated videos</p>
//         </div>
//         <div className="bg-[#1a1d29] border border-gray-800 rounded-lg p-12 text-center">
//           <div className="animate-pulse">
//             <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4"></div>
//             <div className="h-6 bg-gray-800 rounded w-48 mx-auto mb-2"></div>
//             <div className="h-4 bg-gray-800 rounded w-64 mx-auto"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-[1400px] mx-auto px-6 py-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
//         <p className="text-gray-400">View and manage your AI-generated videos</p>
//       </div>

//       {videos.length === 0 ? (
//         <div className="bg-[#1a1d29] border border-gray-800 rounded-lg p-12 text-center">
//           <div className="w-20 h-20 bg-[#252938] rounded-full flex items-center justify-center mx-auto mb-4">
//             <Video className="w-10 h-10 text-gray-600" />
//           </div>
//           <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
//           <p className="text-gray-400 mb-6">Generate your first AI video to see it here</p>
//           <a 
//             href="/dashboard/tools/ai-video-generator"
//             className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
//           >
//             <Sparkles className="w-5 h-5" />
//             Generate Video
//           </a>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Grid */}
//           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {videos.map((video) => (
//               <div
//                 key={video.id}
//                 className={`bg-[#1a1d29] border rounded-lg overflow-hidden cursor-pointer transition ${
//                   selectedVideo?.id === video.id
//                     ? 'border-purple-500 ring-2 ring-purple-500/20'
//                     : 'border-gray-800 hover:border-gray-700'
//                 }`}
//                 onClick={() => setSelectedVideo(video)}
//               >
//                 <div className="aspect-video bg-[#252938] relative group">
//                   {video.video_url && video.video_url !== 'EMPTY' ? (
//                     <>
//                       <video
//                         src={video.video_url}
//                         className="w-full h-full object-cover"
//                         muted
//                       />
//                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
//                         <Video className="w-12 h-12 text-white" />
//                       </div>
//                     </>
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <div className="text-center">
//                         <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
//                         <p className="text-xs text-gray-500">
//                           {video.status === 'generating' ? 'Generating...' : 'Processing...'}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-3">
//                   <p className="text-sm text-white font-medium truncate mb-1">
//                     {video.prompt.substring(0, 50)}
//                     {video.prompt.length > 50 ? '...' : ''}
//                   </p>
//                   <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
//                     <span className="flex items-center gap-1">
//                       <Sparkles className="w-3 h-3" />
//                       {video.model_used}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Calendar className="w-3 h-3" />
//                       {formatDate(video.created_at)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(video.status)}`}>
//                       {video.status}
//                     </span>
//                     {video.credits_used && (
//                       <span className="text-xs text-gray-500">
//                         {video.credits_used} credits
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Video Details Panel */}
//           <div className="lg:sticky lg:top-6 h-fit">
//             {selectedVideo ? (
//               <div className="bg-[#1a1d29] border border-gray-800 rounded-lg overflow-hidden">
//                 {/* Close Button */}
//                 <div className="relative">
//                   <button
//                     onClick={handleClose}
//                     className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
//                     aria-label="Close"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
                  
//                   <div className="aspect-video bg-black">
//                     {selectedVideo.video_url && selectedVideo.video_url !== 'EMPTY' ? (
//                       <video
//                         src={selectedVideo.video_url}
//                         controls
//                         className="w-full h-full"
//                         autoPlay
//                       />
//                     ) : (
//                       <div className="flex items-center justify-center h-full">
//                         <div className="text-center">
//                           <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
//                           <p className="text-sm text-gray-400">
//                             {selectedVideo.status === 'generating' 
//                               ? 'Video is being generated...' 
//                               : 'Video not available yet'}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-4">
//                   <div>
//                     <label className="text-xs text-gray-500 uppercase tracking-wide">Prompt</label>
//                     <p className="text-sm text-white mt-1">{selectedVideo.prompt}</p>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs text-gray-500 uppercase tracking-wide">Model</label>
//                       <p className="text-sm text-white mt-1">{selectedVideo.model_used}</p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 uppercase tracking-wide">Created</label>
//                       <p className="text-sm text-white mt-1">{formatDate(selectedVideo.created_at)}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
//                       <p className={`text-sm mt-1 inline-block px-2 py-1 rounded ${getStatusColor(selectedVideo.status)}`}>
//                         {selectedVideo.status}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 uppercase tracking-wide">Credits Used</label>
//                       <p className="text-sm text-white mt-1">{selectedVideo.credits_used || 0}</p>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <button
//                       onClick={() => handleDownload(selectedVideo.video_url, selectedVideo.id)}
//                       disabled={!selectedVideo.video_url || selectedVideo.video_url === 'EMPTY'}
//                       className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
//                     >
//                       <Download className="w-4 h-4" />
//                       Download
//                     </button>
//                     <button
//                       onClick={() => handleDelete(selectedVideo.id)}
//                       className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-[#1a1d29] border border-gray-800 rounded-lg p-8 text-center">
//                 <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
//                 <p className="text-sm text-gray-400">Select a video to view details</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/dashboard/media/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Video, Trash2, Download, Calendar, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface GeneratedVideo {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  prompt: string;
  model_used: string;
  status: string;
  created_at: string;
  credits_used: number;
}

export default function MediaLibraryPage() {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

  // Load videos from Supabase
  useEffect(() => {
    loadVideos();

    const channel = supabase
      .channel('video-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_videos',
        },
        (payload) => {
          console.log('Video updated!', payload);
          loadVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadVideos = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data: videosData, error: videosError } = await supabase
        .from('generated_videos')
        .select('id, video_url, thumbnail_url, prompt, model_used, status, created_at, credits_used')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('Error loading videos:', videosError);
        return;
      }

      setVideos(videosData || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
        return;
      }

      setVideos(videos.filter(v => v.id !== videoId));
      
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleDownload = (videoUrl: string, videoId: string) => {
    if (!videoUrl || videoUrl === 'EMPTY') {
      alert('Video URL is not available yet. Please wait for generation to complete.');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video_${videoId}.mp4`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Error downloading video:', error);
      window.open(videoUrl, '_blank');
    }
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400';
      case 'generating':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`max-w-[1400px] mx-auto px-6 py-6 ${isDarkMode ? '' : 'bg-gray-50'}`}>
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Media Library</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>View and manage your AI-generated videos</p>
        </div>
        <div className={`border rounded-lg p-12 text-center ${isDarkMode ? 'bg-[#1a1d29] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="animate-pulse">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-6 rounded w-48 mx-auto mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-64 mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto px-6 py-6 ${isDarkMode ? '' : 'bg-gray-50 min-h-screen'}`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Media Library</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>View and manage your AI-generated videos</p>
      </div>

      {videos.length === 0 ? (
        <div className={`border rounded-lg p-12 text-center ${isDarkMode ? 'bg-[#1a1d29] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-[#252938]' : 'bg-gray-100'}`}>
            <Video className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No videos yet</h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generate your first AI video to see it here</p>
          <a 
            href="/dashboard/tools/ai-video-generator"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Sparkles className="w-5 h-5" />
            Generate Video
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition ${
                  selectedVideo?.id === video.id
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : isDarkMode ? 'bg-[#1a1d29] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
                } ${isDarkMode ? 'bg-[#1a1d29]' : 'bg-white'}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className={`aspect-video relative group ${isDarkMode ? 'bg-[#252938]' : 'bg-gray-100'}`}>
                  {video.video_url && video.video_url !== 'EMPTY' ? (
                    <>
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Video className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {video.status === 'generating' ? 'Generating...' : 'Processing...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className={`text-sm font-medium truncate mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {video.prompt.substring(0, 50)}
                    {video.prompt.length > 50 ? '...' : ''}
                  </p>
                  <div className={`flex items-center justify-between text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {video.model_used}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(video.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                    {video.credits_used && (
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {video.credits_used} credits
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Details Panel */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedVideo ? (
              <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'bg-[#1a1d29] border-gray-800' : 'bg-white border-gray-200'}`}>
                {/* Close Button */}
                <div className="relative">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="aspect-video bg-black">
                    {selectedVideo.video_url && selectedVideo.video_url !== 'EMPTY' ? (
                      <video
                        src={selectedVideo.video_url}
                        controls
                        className="w-full h-full"
                        autoPlay
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">
                            {selectedVideo.status === 'generating' 
                              ? 'Video is being generated...' 
                              : 'Video not available yet'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Prompt</label>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedVideo.prompt}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Model</label>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedVideo.model_used}</p>
                    </div>
                    <div>
                      <label className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Created</label>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedVideo.created_at)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Status</label>
                      <p className={`text-sm mt-1 inline-block px-2 py-1 rounded ${getStatusColor(selectedVideo.status)}`}>
                        {selectedVideo.status}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Credits Used</label>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedVideo.credits_used || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(selectedVideo.video_url, selectedVideo.id)}
                      disabled={!selectedVideo.video_url || selectedVideo.video_url === 'EMPTY'}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(selectedVideo.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border rounded-lg p-8 text-center ${isDarkMode ? 'bg-[#1a1d29] border-gray-800' : 'bg-white border-gray-200'}`}>
                <Video className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a video to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}