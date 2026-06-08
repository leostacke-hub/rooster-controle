"use client";

import { useState, useEffect } from "react";
import { Quote, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Testimonial {
  id: string | number;
  couple: string;
  location: string;
  quote: string;
  image: string;
  stars: number;
}

interface TestimonialsProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialTestimonials?: Testimonial[];
}

export default function Testimonials({ eventType = 'casamento', initialTestimonials }: TestimonialsProps) {
  const [current, setCurrent] = useState(0);

  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      couple: "Julia & Ricardo",
      location: "Fazenda Vila Rica, Itatiba - SP",
      quote: "Não temos palavras para descrever o que foi assistir ao nosso filme pela primeira vez. A equipe da Rooster Films conseguiu capturar a essência da nossa emoção de uma forma inexplicável. Parece que estamos revivendo aquele dia a cada segundo do vídeo. É, sem dúvida, a nossa maior jóia de família.",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&h=150&q=80",
      stars: 5
    }
  ];

  const [testimonialsState, setTestimonialsState] = useState<Testimonial[]>(() => {
    const initial = initialTestimonials;
    if (initial) {
      return initial.map((t: any) => ({
        id: t.id || Math.random().toString(),
        couple: t.client_name || t.couple || "",
        location: t.subtitle || t.location || "",
        quote: t.quote || "",
        image: t.image_url || t.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        stars: t.stars || 5
      }));
    }
    return defaultTestimonials;
  });
  const [sliderSettings, setSliderSettings] = useState({
    testimonial_per_page: 4,
    testimonial_per_slide: 1,
    testimonial_transition_speed: 3000,
    testimonial_autoplay: true,
    testimonial_style: 'classico'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch settings for slide configs
        const { data: settingsData } = await supabase
          .from('settings')
          .select('testimonial_per_page, testimonial_per_slide, testimonial_transition_speed, testimonial_autoplay, testimonial_style')
          .eq('event_type', eventType)
          .single();

        const perPage = settingsData?.testimonial_per_page ?? 4;
        const perSlide = settingsData?.testimonial_per_slide ?? 1;
        const transitionSpeed = settingsData?.testimonial_transition_speed ?? 3000;
        const autoplay = settingsData?.testimonial_autoplay ?? true;
        const style = settingsData?.testimonial_style ?? 'classico';

        setSliderSettings({
          testimonial_per_page: perPage,
          testimonial_per_slide: perSlide,
          testimonial_transition_speed: transitionSpeed,
          testimonial_autoplay: autoplay,
          testimonial_style: style
        });

        // 2. Fetch testimonials
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('event_type', eventType)
          .eq('active', true)
          .order('display_order', { ascending: true })
          .limit(perPage);

        if (testimonialsData) {
          const formatted = testimonialsData.map((t: any) => ({
            id: t.id,
            couple: t.client_name,
            location: t.subtitle,
            quote: t.quote,
            image: t.image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
            stars: t.stars || 5
          }));
          setTestimonialsState(formatted);
        } else {
          setTestimonialsState(initialTestimonials ? initialTestimonials.map((t: any) => ({
            id: t.id || Math.random().toString(),
            couple: t.client_name || t.couple || "",
            location: t.subtitle || t.location || "",
            quote: t.quote || "",
            image: t.image_url || t.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
            stars: t.stars || 5
          })) : defaultTestimonials);
        }
      } catch (err) {
        console.error("Error loading testimonials in client:", err);
      }
    };
    loadData();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadData);
      return () => window.removeEventListener('mock-database-update', loadData);
    }
  }, [eventType]);

  // Group testimonials into slides
  const chunkArray = (arr: Testimonial[], size: number) => {
    const chunked: Testimonial[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked;
  };

  const slides = chunkArray(testimonialsState, sliderSettings.testimonial_per_slide);

  // Autoplay Effect
  useEffect(() => {
    if (!sliderSettings.testimonial_autoplay || slides.length <= 1 || sliderSettings.testimonial_style === 'grid') return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, sliderSettings.testimonial_transition_speed);

    return () => clearInterval(interval);
  }, [slides.length, sliderSettings.testimonial_autoplay, sliderSettings.testimonial_transition_speed, sliderSettings.testimonial_style]);

  const next = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Adjust current slide if slides length shrinks
  useEffect(() => {
    if (current >= slides.length && slides.length > 0) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  if (testimonialsState.length === 0) return null;

  const isGrid = sliderSettings.testimonial_style === 'grid';
  const isCentered = sliderSettings.testimonial_style === 'centralizado';

  return (
    <section id="depoimentos" className="py-20 md:py-28 bg-zinc-950 border-y border-zinc-900 relative">
      {/* Decorative Golden Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-gold-400/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-3">
            Palavras de Amor
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
            Histórias que nos <span className="italic font-normal text-gold-200">Emocionam</span>
          </h2>
        </div>

        {isGrid ? (
          /* GRID LAYOUT: Display all testimonials directly in a dynamic grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsState.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="relative glass-panel rounded-2xl p-6 md:p-8 flex flex-col justify-between border border-gold-400/10 hover:border-gold-400/20 transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-gold-400 opacity-[0.015] pointer-events-none">
                  <Quote className="h-16 w-16 stroke-[1.5]" />
                </div>

                <div>
                  {/* Ratings */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.stars || 5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-[15px] font-light text-zinc-200 leading-relaxed font-serif italic mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zinc-900/60">
                  <img
                    src={testimonial.image}
                    alt={testimonial.couple}
                    className="h-11 w-11 rounded-full object-cover border border-gold-400/20 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-xs font-medium text-gold-100">
                      {testimonial.couple}
                    </h4>
                    <span className="text-[8.5px] tracking-widest text-zinc-500 uppercase block mt-0.5">
                      {testimonial.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* SLIDER CAROUSEL LAYOUTS (Classic or Centered) */
          <div className={`mx-auto ${isCentered ? 'max-w-3xl' : 'max-w-5xl'}`}>
            <div className="relative glass-panel rounded-2xl p-6 md:p-8 flex flex-col overflow-hidden">
              
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-gold-400 opacity-[0.015] pointer-events-none">
                <Quote className="h-20 w-20 stroke-[1.5]" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full"
                >
                  <div className={`grid gap-6 ${
                    sliderSettings.testimonial_per_slide === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    sliderSettings.testimonial_per_slide === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    'grid-cols-1'
                  }`}>
                    {slides[current]?.map((testimonial) => (
                      <div 
                        key={testimonial.id} 
                        className={`flex flex-col flex-1 ${isCentered ? 'items-center text-center' : 'items-start text-left'}`}
                      >
                        {/* Ratings */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(testimonial.stars || 5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                          ))}
                        </div>

                        {/* Text */}
                        <p className="text-[15px] md:text-[17.5px] font-light text-zinc-200 leading-relaxed font-serif italic mb-4 relative z-10">
                          "{testimonial.quote}"
                        </p>

                        {/* Client Info Grid */}
                        <div className={`flex items-center gap-3 mt-1 ${isCentered ? 'flex-col justify-center' : 'flex-row'}`}>
                          <img
                            src={testimonial.image}
                            alt={testimonial.couple}
                            className="h-12 w-12 rounded-full object-cover border border-gold-400/20 flex-shrink-0"
                          />
                          <div className={isCentered ? 'text-center' : 'text-left'}>
                            <h4 className="font-serif text-sm font-medium text-gold-100">
                              {testimonial.couple}
                            </h4>
                            <span className="text-[9px] tracking-widest text-zinc-550 uppercase block mt-0.5">
                              {testimonial.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls (Only if multiple slides exist) */}
              {slides.length > 1 && (
                <div className={`flex items-center mt-6 pt-4 border-t border-zinc-900/40 ${
                  isCentered ? 'justify-center gap-6' : 'justify-between'
                }`}>
                  {/* Dots */}
                  <div className="flex items-center gap-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-1.5 transition-all duration-300 rounded-full ${
                          idx === current ? "w-6 bg-gold-400" : "w-1.5 bg-zinc-700"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Arrow Buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={prev}
                      className="h-8 w-8 rounded-full border border-zinc-800 hover:border-gold-400/30 text-zinc-400 hover:text-gold-200 flex items-center justify-center transition-colors hover:bg-gold-400/5 active:scale-95 cursor-pointer"
                      aria-label="Previous testimonial"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={next}
                      className="h-8 w-8 rounded-full border border-zinc-800 hover:border-gold-400/30 text-zinc-400 hover:text-gold-200 flex items-center justify-center transition-colors hover:bg-gold-400/5 active:scale-95 cursor-pointer"
                      aria-label="Next testimonial"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
