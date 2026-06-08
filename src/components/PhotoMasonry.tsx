"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface PhotoItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
}

interface PhotoMasonryProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialPhotos?: any[];
}

export default function PhotoMasonry({ eventType = 'casamento', initialPhotos }: PhotoMasonryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const defaultPhotos: PhotoItem[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      alt: "O beijo sob o véu",
      caption: "Cenas repletas de poesia e sensibilidade no altar."
    }
  ];

  const [photosState, setPhotosState] = useState<any[]>(() => {
    return initialPhotos ? initialPhotos : defaultPhotos;
  });

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const { data } = await supabase.from('photos').select('*').eq('event_type', eventType).order('display_order', { ascending: true });
        if (data) {
          setPhotosState(data);
        }
      } catch (err) {
        console.error("Error loading photos in client:", err);
      }
    };
    loadPhotos();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadPhotos);
      return () => window.removeEventListener('mock-database-update', loadPhotos);
    }
  }, [eventType]);

  const photos: PhotoItem[] = photosState.map((p) => ({
    id: p.id,
    url: p.url || p.image_url,
    alt: p.alt || p.caption || "Fotografia",
    caption: p.caption || ""
  }));

  if (photos.length === 0) return null;

  return (
    <section id="galeria" className="py-24 md:py-32 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4">
            Fotogramas de Cinema
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white leading-tight">
            A Beleza no <span className="italic font-normal text-gold-200">Detalhe</span>
          </h2>
          <p className="text-sm text-zinc-400 font-light mt-4 max-w-md mx-auto leading-relaxed">
            Capturas estáticas extraídas diretamente dos nossos rolos de filme. A composição perfeita em cada quadro.
          </p>
        </div>

        {/* Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="break-inside-avoid relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900 group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Photo Image */}
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-auto object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <ZoomIn className="h-5 w-5 text-gold-300 mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                <h4 className="text-sm font-serif text-white uppercase tracking-wider font-semibold">
                  {photo.alt}
                </h4>
                <p className="text-[11px] text-zinc-300 font-light mt-1">
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Background Trigger to Close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedPhoto(null)} />

            {/* Modal Image Wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-4xl w-full z-10 flex flex-col gap-4"
            >
              {/* Image Frame */}
              <div className="relative rounded-xl overflow-hidden border border-gold-400/20 shadow-2xl bg-zinc-950">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.alt}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close image zoom"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Caption Card below Image */}
              <div className="text-center px-4">
                <h3 className="font-serif text-lg text-gold-200 tracking-wide font-medium">
                  {selectedPhoto.alt}
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  {selectedPhoto.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
