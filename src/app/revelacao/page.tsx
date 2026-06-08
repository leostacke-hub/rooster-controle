import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Authority from "@/components/Authority";
import VideoGallery from "@/components/VideoGallery";
import PhotoMasonry from "@/components/PhotoMasonry";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CoverageInclusions from "@/components/CoverageInclusions";
import BudgetSimulator from "@/components/BudgetSimulator";
import { supabase } from "@/lib/supabase";

const EVENT_TYPE = 'revelacao';

async function getLandingPageData() {
  try {
    const [
      { data: settings },
      { data: portfolio },
      { data: photos },
      { data: packages },
      { data: services },
      { data: benefits },
      { data: features }
    ] = await Promise.all([
      supabase.from('settings').select('*').eq('event_type', EVENT_TYPE).single(),
      supabase.from('portfolio').select('*').eq('event_type', EVENT_TYPE).order('display_order', { ascending: true }),
      supabase.from('photos').select('*').eq('event_type', EVENT_TYPE).order('display_order', { ascending: true }),
      supabase.from('packages').select('*').eq('event_type', EVENT_TYPE).order('display_order', { ascending: true }),
      supabase.from('services').select('*').eq('event_type', EVENT_TYPE).order('display_order', { ascending: true }),
      supabase.from('benefits').select('*').eq('event_type', EVENT_TYPE).order('display_order', { ascending: true }),
      supabase.from('features').select('*').eq('event_type', EVENT_TYPE).eq('active', true).order('display_order', { ascending: true }),
    ]);

    return {
      settings: settings || null,
      portfolio: portfolio || [],
      photos: photos || [],
      packages: packages || [],
      services: services || [],
      benefits: benefits || [],
      features: features || [],
    };
  } catch (error) {
    console.error("Error loading dynamic landing page data:", error);
    return {
      settings: null,
      portfolio: [],
      photos: [],
      packages: [],
      services: [],
      benefits: [],
      features: [],
    };
  }
}

export default async function RevelacaoPage() {
  const data = await getLandingPageData();
  const settings = data.settings;

  return (
    <>
      <Header eventType={EVENT_TYPE} />
      <main className="flex-1">
        <Hero eventType={EVENT_TYPE} />
        
        <Authority 
          eventType={EVENT_TYPE}
          initialCards={data.features}
          initialTitle={settings?.authority_title}
          initialSubtitle={settings?.authority_subtitle}
        />
        
        <VideoGallery eventType={EVENT_TYPE} initialVideos={data.portfolio} />
        
        <PhotoMasonry eventType={EVENT_TYPE} initialPhotos={data.photos} />
        
        <Testimonials eventType={EVENT_TYPE} initialTestimonials={settings?.testimonials} />
        
        <CoverageInclusions eventType={EVENT_TYPE} initialInclusions={settings?.coverage_inclusions} />
        
        <BudgetSimulator 
          eventType={EVENT_TYPE}
          initialServices={data.services}
          initialPackages={data.packages}
          initialBenefits={data.benefits}
          initialSettings={settings}
        />

        <FAQ eventType={EVENT_TYPE} initialFaqs={settings?.faq_items} />
      </main>
      
      <footer className="bg-black py-20 border-t border-zinc-900 text-center text-xs tracking-widest text-zinc-600 uppercase font-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>{settings?.footer_text || `© ${new Date().getFullYear()} Rooster Films. Todos os direitos reservados.`}</p>
          <div className="flex gap-6">
            <a
              href="https://roosterfilms.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-400 transition-colors"
            >
              Website Oficial
            </a>
            <span className="text-zinc-800">|</span>
            <a href="#inicio" className="hover:text-gold-400 transition-colors">
              Voltar ao Topo
            </a>
            <span className="text-zinc-800">|</span>
            <a href="/admin" className="hover:text-gold-400 transition-colors">
              Painel do Administrador
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
