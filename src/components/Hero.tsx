"use client";

import { motion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";

interface HeroProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
}

export default function Hero({ eventType = 'casamento' }: HeroProps) {
  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const getHeroData = () => {
    if (eventType === 'aniversario') {
      return {
        preHeader: "Filmes de Aniversário & 15 Anos de Luxo",
        title: <>Eternizando a <span className="italic font-normal text-gold-200">alegria</span> e os<br />marcos da sua jornada.</>,
        subtitle: "Registros espontâneos e cheios de vida para celebrar cada aniversário como uma obra de arte digna de cinema.",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-beautiful-dress-having-fun-at-a-party-41662-large.mp4",
        posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80"
      };
    }
    if (eventType === 'revelacao') {
      return {
        preHeader: "Filmes de Chá Revelação & Maternidade",
        title: <>O suspense, o <span className="italic font-normal text-gold-200">amor</span> e o<br />momento da descoberta.</>,
        subtitle: "Vídeos carregados de emoção para que a revelação do seu bebê e a expectativa da família fiquem eternizadas para sempre.",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-gender-reveal-powder-explosion-celebration-45120-large.mp4",
        posterUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1920&q=80"
      };
    }
    return {
      preHeader: "Filmes de Casamento",
      title: <>Capturando a <span className="italic font-normal text-gold-200">poesia</span> e a<br className="hidden md:inline" /> emoção do seu dia mais bonito.</>,
      subtitle: "Registros cinematográficos únicos com a sensibilidade de quem entende que cada detalhe, cada olhar e cada lágrima constituem uma obra de arte viva.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-under-the-veil-44338-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
    };
  };

  const hero = getHeroData();

  return (
    <section
      id="inicio"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background Video */}
      <video
        key={hero.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        poster={hero.posterUrl}
      >
        <source
          src={hero.videoUrl}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Luxury Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 mix-blend-multiply" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center h-full">
        {/* Subtle Pre-header */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-xs md:text-sm tracking-[0.4em] text-gold-400 uppercase font-semibold mb-6"
        >
          {hero.preHeader}
        </motion.span>

        {/* Emotion-driven Serif Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="font-serif text-4xl md:text-7xl font-extralight tracking-tight text-white mb-8 max-w-4xl leading-[1.15]"
        >
          {hero.title}
        </motion.h1>

        {/* Subtitle / Promise */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-sm md:text-lg tracking-wide text-zinc-300 font-light max-w-2xl mb-12 leading-relaxed"
        >
          {hero.subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
        >
          <button
            onClick={() => handleScrollTo("#simulador")}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 active:scale-95"
          >
            Simular Orçamento
          </button>
          
          <button
            onClick={() => handleScrollTo("#filmes")}
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-500/50 hover:border-gold-300 hover:bg-white/5 text-zinc-200 hover:text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Assistir Filmes
          </button>
        </motion.div>
      </div>

      {/* Down arrow */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <span className="text-[9px] tracking-[0.45em] text-zinc-500 uppercase mb-2">Deslize</span>
        <motion.button
          onClick={() => handleScrollTo("#autoridade")}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-gold-400 hover:text-gold-300 p-1"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.button>
      </div>
    </section>
  );
}
