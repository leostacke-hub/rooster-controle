"use client";

import { useState, useEffect } from "react";
import { Play, X, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface VideoItem {
  id: string;
  title: string;
  couple: string;
  location: string;
  duration: string;
  coverImage: string;
  videoUrl: string; // Direct MP4 or Vimeo/YouTube Embed
}

interface VideoGalleryProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialVideos?: any[];
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } {
  if (!url) return { type: 'direct', embedUrl: '' };

  // YouTube checks
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  // Vimeo checks
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  return { type: 'direct', embedUrl: url };
}

export default function VideoGallery({ eventType = 'casamento', initialVideos }: VideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const defaultVideos: VideoItem[] = [
    {
      id: "1",
      title: "O Amor sob a Luz da Toscana",
      couple: "Isabella & Alessandro",
      location: "Val d'Orcia, Toscana - Itália",
      duration: "4:15",
      coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-walking-in-a-field-44339-large.mp4"
    }
  ];

  const [videosState, setVideosState] = useState<any[]>(() => {
    return initialVideos ? initialVideos : defaultVideos;
  });
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const { data } = await supabase.from('portfolio').select('*').eq('event_type', eventType).order('display_order', { ascending: true });
        if (data) {
          setVideosState(data);
        }
      } catch (err) {
        console.error("Error loading portfolio videos in client:", err);
      }
    };
    loadVideos();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadVideos);
      return () => window.removeEventListener('mock-database-update', loadVideos);
    }
  }, [eventType]);

  const videos: VideoItem[] = videosState.map((v) => ({
    id: v.id,
    title: v.title,
    couple: v.couple,
    location: v.location,
    duration: v.duration,
    coverImage: v.cover_image || v.coverImage,
    videoUrl: v.video_url || v.videoUrl
  }));

  if (videos.length === 0) return null;

  return (
    <section id="filmes" className="py-24 md:py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4">
              Nossa Cinematografia
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
              Histórias Reais, <span className="italic font-normal text-gold-200">Sentimentos</span> Eternizados
            </h2>
          </div>
          <p className="text-sm text-zinc-400 font-light max-w-sm leading-relaxed">
            Cada filme é uma obra de autoria única. Conheça alguns de nossos registros mais recentes e sinta a atmosfera criada para cada casal.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative cursor-pointer"
              onClick={() => setActiveVideo(video)}
            >
              {/* Image Frame Wrapper */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80 transition-all duration-500 group-hover:border-gold-400/30">
                {/* Cover Image */}
                <img
                  src={video.coverImage}
                  alt={video.couple}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 scale-100 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Animated Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-sm border border-gold-400/30 text-gold-300 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-gold-400 group-hover:text-black group-hover:border-transparent transition-all duration-300">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Tag */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-zinc-800 px-2.5 py-1 rounded-md text-[10px] tracking-widest text-zinc-300 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gold-400" />
                  {video.duration}
                </div>
              </div>

              {/* Title & Metadata Card */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-400 uppercase font-semibold mb-2">
                  <MapPin className="h-3 w-3" />
                  {video.location}
                </div>
                <h3 className="font-serif text-xl font-light text-zinc-100 group-hover:text-gold-200 transition-colors">
                  {video.couple}
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-1.5 italic">
                  "{video.title}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            {/* Modal Close Event Trigger Layer */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveVideo(null)} />

            {/* Video Container Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl aspect-video bg-zinc-950 border border-gold-400/20 rounded-xl overflow-hidden shadow-2xl z-10"
            >
              {/* Header inside modal */}
              <div className="absolute top-4 left-6 z-20 pointer-events-none">
                <span className="text-[10px] tracking-widest text-gold-400 uppercase font-semibold">
                  {activeVideo.location}
                </span>
                <h3 className="font-serif text-lg text-white">
                  {activeVideo.couple}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close video player"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Conditional Video Embed / HTML5 Video Player */}
              {(() => {
                const videoInfo = getEmbedUrl(activeVideo.videoUrl);
                if (videoInfo.type !== 'direct') {
                  return (
                    <iframe
                      src={videoInfo.embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0 rounded-xl"
                    />
                  );
                }
                return (
                  <video
                    src={activeVideo.videoUrl}
                    autoPlay
                    controls
                    className="w-full h-full object-contain rounded-xl"
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
