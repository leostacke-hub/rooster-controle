"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Clock, Film, Star, Sparkles, Shield, Award, Camera, Smile, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthorityCard {
  icon?: string;
  title: string;
  description: string;
  bg_image?: string;
  bgImage?: string;
  event_type?: string;
}

interface AuthorityProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialCards?: any[];
  initialTitle?: string;
  initialSubtitle?: string;
}

const getIcon = (iconName: string) => {
  const name = (iconName || '').toLowerCase().trim();
  switch (name) {
    case 'heart': return <Heart className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'eye': return <Eye className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'clock': return <Clock className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'film': return <Film className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'sparkles': return <Sparkles className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'shield': return <Shield className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'award': return <Award className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'star': return <Star className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'camera': return <Camera className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'smile': return <Smile className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    case 'video': return <Video className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
    default: return <Heart className="h-6 w-6 text-gold-300 stroke-[1.5]" />;
  }
};

export default function Authority({ eventType = 'casamento', initialCards, initialTitle, initialSubtitle }: AuthorityProps) {
  const defaultCards = [
    {
      icon: "heart",
      title: "Sentimos Cada História",
      description: "Mais do que filmar, buscamos compreender quem vocês são para registrar emoções verdadeiras.",
      display_order: 1,
      event_type: "casamento"
    },
    {
      icon: "film",
      title: "Narrativa Cinematográfica",
      description: "Cada filme é construído com ritmo, emoção e intenção artística.",
      display_order: 2,
      event_type: "casamento"
    },
    {
      icon: "eye",
      title: "Presença Discreta",
      description: "Registramos momentos autênticos sem interromper ou dirigir excessivamente o casal.",
      display_order: 3,
      event_type: "casamento"
    },
    {
      icon: "clock",
      title: "Memórias que Permanecem",
      description: "Criamos filmes que continuam emocionando mesmo muitos anos depois.",
      display_order: 4,
      event_type: "casamento"
    }
  ];

  const [cardsState, setCardsState] = useState<any[]>(() => {
    return initialCards && initialCards.length > 0 ? initialCards : [];
  });
  const [titleState, setTitleState] = useState(initialTitle || "A Excelência da Arte Cinematográfica");
  const [subtitleState, setSubtitleState] = useState(initialSubtitle || "A Beleza no Detalhe");

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const { data: settingsData } = await supabase.from('settings').select('*').eq('event_type', eventType).single();
        if (settingsData) {
          if (settingsData.authority_title) setTitleState(settingsData.authority_title);
          if (settingsData.authority_subtitle) setSubtitleState(settingsData.authority_subtitle);
        }

        const { data: featuresData } = await supabase.from('features')
          .select('*')
          .eq('event_type', eventType)
          .eq('active', true)
          .order('display_order', { ascending: true });

        if (featuresData && featuresData.length > 0) {
          setCardsState(featuresData);
        } else {
          setCardsState(defaultCards.filter(c => c.event_type === eventType || !c.event_type));
        }
      } catch (err) {
        console.error("Error loading features in Authority:", err);
      }
    };
    
    loadFeatures();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadFeatures);
      return () => window.removeEventListener('mock-database-update', loadFeatures);
    }
  }, [eventType]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section
      id="autoridade"
      className="relative py-24 md:py-32 bg-black border-y border-zinc-900 overflow-hidden"
    >
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold-500/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Subheading & Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4"
          >
            {titleState || "A Excelência da Arte Cinematográfica"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl font-light text-white leading-tight"
          >
            {subtitleState || "Por que confiar o dia mais importante da sua vida à Rooster Films?"}
          </motion.h2>
        </div>

        {/* 4 Cards Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {cardsState.map((card, idx) => (
            <motion.div
              key={card.id || idx}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 md:p-10 flex flex-col items-center text-center justify-between min-h-[210px] sm:min-h-[250px] md:min-h-[300px] transition-all duration-500 hover:border-gold-400/25"
            >
              {/* Backing image with a high density overlay */}
              <div className="absolute inset-0 z-0">
                {card.bg_image || card.bgImage ? (
                  <img
                    src={card.bg_image || card.bgImage}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-35 scale-100 group-hover:scale-110 group-hover:opacity-55 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-[#070709]" />
                )}
                {/* Vignette overlay to keep text completely readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />
              </div>

              {/* Card Content - Centered */}
              <div className="relative z-10 flex flex-col items-center gap-3 md:gap-6 h-full justify-center">
                {/* Gold Floating Icon */}
                <div className="h-11 w-11 md:h-14 md:w-14 rounded-full border border-gold-400/10 bg-gold-400/5 flex items-center justify-center text-gold-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-400 group-hover:text-black group-hover:border-transparent [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-6 md:[&_svg]:w-6">
                  {getIcon(card.icon)}
                </div>

                {/* Title */}
                <h3 className="font-serif text-base md:text-lg tracking-wider text-zinc-100 uppercase font-semibold">
                  {card.title}
                </h3>

                {/* Description Paragraph */}
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xs">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>


        
      </div>
    </section>
  );
}
