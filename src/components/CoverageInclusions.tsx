"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Mic, Palette, Cloud, HeartHandshake, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface InclusionItem {
  icon: any;
  title: string;
  description: string;
}

interface CoverageInclusionsProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialInclusions?: any[];
}

const getInclusionIcon = (iconName: string) => {
  const name = String(iconName).toLowerCase();
  if (name.includes("camera") || name.includes("câmera")) return Camera;
  if (name.includes("mic") || name.includes("microfone") || name.includes("áudio") || name.includes("audio")) return Mic;
  if (name.includes("palette") || name.includes("paleta") || name.includes("cor")) return Palette;
  if (name.includes("cloud") || name.includes("nuvem") || name.includes("entrega")) return Cloud;
  if (name.includes("heart") || name.includes("handshake") || name.includes("atendimento") || name.includes("suporte")) return HeartHandshake;
  if (name.includes("play") || name.includes("filme") || name.includes("video")) return Play;
  return Camera;
};

export default function CoverageInclusions({ eventType = 'casamento', initialInclusions }: CoverageInclusionsProps) {
  const defaultInclusions: InclusionItem[] = [
    {
      icon: Camera,
      title: "Captação em Alta Resolução",
      description: "Cada momento é registrado com câmeras e lentes profissionais de alta qualidade, garantindo imagens nítidas, elegantes e preparadas para atravessar gerações.",
    },
    {
      icon: Mic,
      title: "Áudio Profissional Sincronizado",
      description: "Todos os momentos mais importantes são captados com clareza, incluindo a cerimônia, os votos e as palavras que tornam o dia ainda mais especial.",
    },
    {
      icon: Palette,
      title: "Colorização e Edição Rítmica",
      description: "Tratamento de cor cena a cena (color grading) e edição focada no ritmo e tom emocional do casamento, criando uma atmosfera verdadeiramente cinematográfica.",
    },
    {
      icon: Cloud,
      title: "Entrega Digital Exclusiva",
      description: "Acesso a uma galeria online privativa para visualização em alta definição e download de todos os filmes finalizados para compartilhar com a família.",
    },
    {
      icon: HeartHandshake,
      title: "Atendimento Personalizado",
      description: "Reuniões de alinhamento antes do grande dia e suporte pós-entrega para garantir que cada detalhe atenda às expectativas do casal.",
    },
    {
      icon: Play,
      title: "Filmes que fazem sentir novamente",
      description: "Mais do que registrar acontecimentos, criamos filmes que transportam vocês de volta às emoções, olhares e sentimentos vividos naquele dia.",
    },
  ];

  const [inclusionsState, setInclusionsState] = useState<any[]>(() => {
    return initialInclusions && initialInclusions.length > 0 ? initialInclusions : defaultInclusions;
  });

  useEffect(() => {
    const loadInclusions = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('event_type', eventType).single();
        if (data?.coverage_inclusions && data.coverage_inclusions.length > 0) {
          setInclusionsState(data.coverage_inclusions);
        }
      } catch (err) {
        console.error("Error loading coverage inclusions in client:", err);
      }
    };
    loadInclusions();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadInclusions);
      return () => window.removeEventListener('mock-database-update', loadInclusions);
    }
  }, [eventType]);

  const inclusions: InclusionItem[] = inclusionsState.map((inc) => ({
    title: inc.title,
    description: inc.description || inc.desc,
    icon: typeof inc.icon === "string" ? getInclusionIcon(inc.icon) : inc.icon || Camera
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <section className="py-24 md:py-32 bg-zinc-950/30 border-t border-zinc-900 relative">
      {/* Decorative Radial glow behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-400/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4"
          >
            Padrão de Excelência Rooster
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl font-light text-white leading-tight"
          >
            Mais do que um vídeo. <br className="sm:hidden" />
            Uma <span className="italic font-normal text-gold-200">experiência</span> cinematográfica.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-zinc-400 font-light mt-6 max-w-xl mx-auto leading-relaxed"
          >
            Independentemente das opções selecionadas no simulador abaixo, todos os casamentos recebem a mesma dedicação técnica e padrão estético Rooster Films.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {inclusions.map((inclusion, idx) => {
            const Icon = inclusion.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group p-6 rounded-xl glass-panel relative overflow-hidden transition-all duration-300 hover:border-gold-400/25 flex flex-col justify-between min-h-[180px] hover:-translate-y-1"
              >
                {/* Background gold lighting on card hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div>
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-full border border-gold-400/10 bg-gold-400/5 flex items-center justify-center text-gold-300 mb-5 group-hover:scale-110 group-hover:bg-gold-400 group-hover:text-black group-hover:border-transparent transition-all duration-300">
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase mb-2">
                    {inclusion.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {inclusion.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
