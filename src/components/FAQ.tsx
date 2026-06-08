"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialFaqs?: FAQItem[];
}

export default function FAQ({ eventType = 'casamento', initialFaqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const defaultFaqs: FAQItem[] = [
    {
      question: "Com quanta antecedência devemos reservar nossa data?",
      answer: "Recomendamos reservar assim que a data e o local estiverem definidos. Como atendemos um número limitado de eventos por período, algumas datas podem ser preenchidas com vários meses de antecedência."
    },
    {
      question: "Vocês atendem casamentos fora de Sinop ou em outros estados?",
      answer: "Sim. Realizamos casamentos em diversas cidades e regiões do Brasil. Caso o evento aconteça fora de Sinop - MT, os custos de deslocamento, hospedagem e logística serão calculados separadamente e apresentados de forma transparente na proposta final."
    },
    {
      question: "O que acontece após enviarmos a solicitação de orçamento?",
      answer: "Após recebermos sua solicitação, verificamos a disponibilidade da data e entramos em contato para alinhar detalhes do evento. Em seguida, enviamos a proposta oficial e orientamos todo o processo de reserva."
    },
    {
      question: "Como funciona a reserva da data?",
      answer: "A data é garantida mediante assinatura do contrato e pagamento do sinal de reserva. Até a formalização da contratação, a data permanece disponível para outros casais."
    },
    {
      question: "Vocês captam o áudio dos votos e da cerimônia?",
      answer: "Sim. Utilizamos sistemas profissionais de captação para registrar os votos, falas do celebrante e momentos importantes da cerimônia, garantindo uma experiência muito mais emocionante no filme final."
    },
    {
      question: "Qual é o prazo de entrega dos filmes?",
      answer: "O prazo médio de entrega é de até 90 dias úteis após o evento. Cada filme passa por um processo cuidadoso de curadoria, edição, tratamento de cor, design de som e finalização artística."
    },
    {
      question: "Podemos escolher as músicas do filme?",
      answer: "Sempre buscamos entender o estilo e a personalidade de cada casal. Quando possível, levamos as preferências musicais em consideração, respeitando também questões de licenciamento e a proposta cinematográfica do filme."
    },
    {
      question: "Se chover ou houver mudanças no cronograma, isso afeta a cobertura?",
      answer: "Não. Estamos preparados para lidar com imprevistos e adaptações de roteiro. Nosso foco é registrar a essência do dia independentemente das condições ou mudanças de programação."
    },
    {
      question: "O pré-wedding é obrigatório?",
      answer: "Não. O pré-wedding é opcional e pode ser incluído para enriquecer ainda mais a narrativa do filme, criando uma conexão emocional entre a história do casal e o grande dia."
    },
    {
      question: "Como sabemos qual experiência escolher?",
      answer: "Você pode montar sua própria experiência ou selecionar um dos pacotes recomendados. Durante o processo, nosso sistema sugere combinações que oferecem a melhor narrativa e o melhor aproveitamento do investimento."
    }
  ];

  const [faqsState, setFaqsState] = useState<FAQItem[]>(() => {
    return initialFaqs && initialFaqs.length > 0 ? initialFaqs : defaultFaqs;
  });

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('event_type', eventType).single();
        if (data?.faq_items && data.faq_items.length > 0) {
          setFaqsState(data.faq_items);
        }
      } catch (err) {
        console.error("Error loading FAQs in client:", err);
      }
    };
    loadFaqs();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadFaqs);
      return () => window.removeEventListener('mock-database-update', loadFaqs);
    }
  }, [eventType]);

  const faqs = faqsState;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-black relative">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4">
            Dúvidas Frequentes
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
            Perguntas & <span className="italic font-normal text-gold-200">Respostas</span>
          </h2>
        </div>

        {/* Accordions list */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all duration-300 ${
                  isOpen ? "border-gold-400/30 bg-zinc-950" : "border-zinc-800 bg-zinc-950/40"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left py-6 px-6 md:px-8 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif text-base md:text-lg text-zinc-100 hover:text-gold-200 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 h-6 w-6 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 transition-colors ${
                    isOpen ? "border-gold-400/30 text-gold-300" : ""
                  }`}>
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>

                {/* Accordion Expandable Content wrapper */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 text-sm text-zinc-400 font-light leading-relaxed border-t border-zinc-900 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
