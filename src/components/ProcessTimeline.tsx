"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Camera, Film, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProcessStep {
  title: string;
  text: string;
  icon: any; // Can be string or React Component
}

interface ProcessTimelineProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialSteps?: any[];
}

const getProcessIcon = (iconName: string) => {
  const name = String(iconName).toLowerCase();
  if (name.includes("heart") || name.includes("coração")) return Heart;
  if (name.includes("camera") || name.includes("câmera")) return Camera;
  if (name.includes("film") || name.includes("filme")) return Film;
  if (name.includes("play") || name.includes("vídeo")) return Play;
  return Heart;
};

export default function ProcessTimeline({ eventType = 'casamento', initialSteps }: ProcessTimelineProps) {
  const defaultSteps: ProcessStep[] = [
    {
      icon: Heart,
      title: "Conhecemos sua história",
      text: "Entendemos o que torna o relacionamento de vocês único.",
    },
    {
      icon: Camera,
      title: "Registramos com discrição",
      text: "Capturamos emoções reais sem interferir nos momentos.",
    },
    {
      icon: Film,
      title: "Criamos seu filme",
      text: "Transformamos cada detalhe em uma narrativa cinematográfica.",
    },
    {
      icon: Play,
      title: "Reviva para sempre",
      text: "Um filme criado para emocionar hoje e daqui a muitos anos.",
    },
  ];

  const [stepsState, setStepsState] = useState<any[]>(() => {
    return initialSteps && initialSteps.length > 0 ? initialSteps : defaultSteps;
  });

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('event_type', eventType).single();
        if (data?.process_steps && data.process_steps.length > 0) {
          setStepsState(data.process_steps);
        }
      } catch (err) {
        console.error("Error loading process steps in client:", err);
      }
    };
    loadSteps();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadSteps);
      return () => window.removeEventListener('mock-database-update', loadSteps);
    }
  }, [eventType]);

  const cards = stepsState.map((step) => ({
    title: step.title,
    text: step.text || step.description,
    icon: typeof step.icon === "string" ? getProcessIcon(step.icon) : step.icon || Heart
  }));

  return (
    <section id="processo" className="py-20 md:py-24 bg-zinc-950/40 border-t border-zinc-900/60 relative overflow-hidden">
      {/* Decorative subtle background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gold-500/[0.02] rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4">
            Como transformamos momentos em memórias
          </span>
          <h2 className="font-serif text-2xl md:text-4xl font-light text-white leading-tight">
            Uma experiência pensada para que vocês <span className="italic font-normal text-gold-200">vivam intensamente</span> cada instante.
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 font-light mt-4 max-w-2xl mx-auto leading-relaxed">
            Enquanto vocês aproveitam o grande dia, nossa equipe registra emoções, detalhes e histórias que se transformam em um filme para toda a vida.
          </p>
        </div>

        {/* Layout: Grid responsive (1 col on mobile, 2 cols on tablet, 4 cols on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                className="glass-panel rounded-xl p-6 md:p-8 border border-zinc-900 hover:border-gold-400/20 transition-all duration-300 group hover:scale-[1.01]"
              >
                {/* Icon Container */}
                <div className="h-10 w-10 rounded-full border border-gold-400/15 bg-gold-400/[0.02] text-gold-450 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
                </div>

                {/* Title and text */}
                <h3 className="font-serif text-lg text-gold-100 font-light tracking-wide group-hover:text-gold-200 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed mt-2.5">
                  {card.text}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
