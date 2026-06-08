"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, Calendar, MapPin, User, Mail, Phone, FileText, CheckCircle2, Loader2, Sparkles, Star, X, MessageSquare, Globe, Share2, Info, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import confetti from "canvas-confetti";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface PricingItem {
  id: string;
  name: string;
  price: number;
  category: "pre_wedding" | "captacao" | "videos" | "extras";
  required?: boolean;
  description: string;
  bg_image?: string;
}

interface BudgetSimulatorProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
  initialServices?: any[];
  initialPackages?: any[];
  initialBenefits?: any[];
  initialSettings?: any;
}

const countries = [
  { code: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+1", flag: "🇺🇸", name: "EUA/Canadá" },
  { code: "+34", flag: "🇪🇸", name: "Espanha" },
  { code: "+33", flag: "🇫🇷", name: "França" },
  { code: "+39", flag: "🇮🇹", name: "Itália" },
  { code: "+44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+598", flag: "🇺🇾", name: "Uruguai" },
  { code: "+595", flag: "🇵🇾", name: "Paraguai" },
];

const defaultPricingItems: PricingItem[] = [
  {
    id: "pre_wedding_vid",
    name: "Pré Wedding",
    price: 1200,
    category: "pre_wedding",
    description: "Ensaio gravado antes do casamento em local à escolha dos noivos.",
  },
  {
    id: "captacao_cerimonia",
    name: "Cerimônia",
    price: 1800,
    category: "captacao",
    required: true,
    description: "Cobertura completa da cerimônia de casamento (obrigatório).",
  },
  {
    id: "captacao_making_of",
    name: "Making Of do Casal",
    price: 800,
    category: "captacao",
    description: "Registro poético e espontâneo dos preparativos dos noivos antes da cerimônia.",
  },
  {
    id: "captacao_festa",
    name: "Festa",
    price: 1200,
    category: "captacao",
    description: "Captação da recepção, brinde, valsa e os momentos mais animados da pista.",
  },
  {
    id: "video_teaser",
    name: "Teaser",
    price: 1000,
    category: "videos",
    required: true,
    description: "Vídeo compacto de 3 minutos com os melhores momentos (obrigatório).",
  },
  {
    id: "video_filme_6_10",
    name: "Filme 6-10 min",
    price: 1500,
    category: "videos",
    description: "Curta-metragem cinematográfico contando a história completa do dia.",
  },
  {
    id: "video_filme_12_18",
    name: "Filme 12-18 min",
    price: 2500,
    category: "videos",
    description: "Documentário cinematográfico estendido, ideal para registrar discursos e votos.",
  },
  {
    id: "extra_same_day",
    name: "Same Day Edit",
    price: 1700,
    category: "extras",
    description: "Vídeo de até 2 minutos editado no local do evento e transmitido na própria festa.",
  },
];

const defaultPackages = [
  { id: '1', name: 'Experiência Essencial', category: 'Sugestão', description: 'Para casais que desejam preservar os momentos mais importantes da cerimônia com elegância e sensibilidade.', inclusions: ['captacao_cerimonia', 'video_teaser'], base_price: 2800, promo_price: 2800, badge: null, highlight_color: null, display_order: 1, active: true, benefit_type: 'entrega_prioritaria', benefit_desc: 'Entrega Prioritária', enable_recommendations: true, recommendation_priority: 1 },
  { id: '2', name: 'Experiência Completa', category: 'Recomendada', description: 'Uma narrativa completa do seu dia, registrando desde a emoção dos preparativos até a celebração da festa.', inclusions: ['captacao_cerimonia', 'video_teaser', 'captacao_making_of', 'captacao_festa'], base_price: 4800, promo_price: 4500, badge: null, highlight_color: null, display_order: 2, active: true, benefit_type: 'desconto', benefit_desc: 'Economize R$ 300', enable_recommendations: true, recommendation_priority: 2 },
  { id: '3', name: 'Experiência Cinematográfica', category: 'Exclusiva', description: 'A experiência definitiva para quem deseja transformar o casamento em um verdadeiro filme.', inclusions: ['pre_wedding_vid', 'captacao_making_of', 'captacao_cerimonia', 'captacao_festa', 'video_teaser', 'video_filme_6_10'], base_price: 7500, promo_price: 7000, badge: 'MAIS ESCOLHIDA', highlight_color: 'gold', display_order: 3, active: true, benefit_type: 'desconto', benefit_desc: 'Economize R$ 500', enable_recommendations: true, recommendation_priority: 3 }
];

const parseInclusions = (inclusionsField: any): string[] => {
  if (Array.isArray(inclusionsField)) return inclusionsField;
  if (!inclusionsField) return [];
  try {
    const trimmed = String(inclusionsField).trim();
    if (trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  } catch (err) {
    console.error("Error parsing inclusions:", inclusionsField, err);
    return [];
  }
};

export default function BudgetSimulator({ eventType = 'casamento', initialServices, initialPackages, initialBenefits, initialSettings }: BudgetSimulatorProps) {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    location: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proposalDetails, setProposalDetails] = useState<any>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isReservaExpanded, setIsReservaExpanded] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+55");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  const [isSimulatorVisible, setIsSimulatorVisible] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // 2-Step Form Wizard States
  const [formStep, setFormStep] = useState(1);
  const [leadSource, setLeadSource] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isFormModalOpen) {
      setFormStep(1);
      setFormErrors({});
    }
  }, [isFormModalOpen]);

  useEffect(() => {
    const el = document.getElementById("simulador");
    if (!el) return;

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      // Element is visible if its top is above viewport bottom and its bottom is below viewport top
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsSimulatorVisible(isVisible);
    };

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);
    
    // Trigger immediately
    checkVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Fallback to bounding rect calculations for extra safety
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setIsSimulatorVisible(entry.isIntersecting || isVisible);
      },
      {
        root: null,
        rootMargin: "100px 0px 100px 0px",
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      observer.disconnect();
    };
  }, []);

  const formatPhoneDigits = (digits: string, code: string) => {
    if (code === "+55") {
      if (digits.length === 0) return "";
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    if (code === "+1") {
      if (digits.length === 0) return "";
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    // Generic grouping for other countries: e.g. space every 3 digits
    if (digits.length === 0) return "";
    const parts = [];
    for (let i = 0; i < digits.length; i += 3) {
      parts.push(digits.slice(i, i + 3));
    }
    return parts.join(" ");
  };

  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    
    // Get digits of current phone number
    const clean = formData.phone.replace(/\D/g, "");
    
    // Strip previous country code digits if it was there at the start
    let digits = clean;
    const oldCodeDigits = selectedCountryCode.replace(/\D/g, "");
    if (digits.startsWith(oldCodeDigits)) {
      digits = digits.slice(oldCodeDigits.length);
    }
    
    // Format with new code
    const formatted = formatPhoneDigits(digits, newCode);
    const newPhone = formatted ? `${newCode} ${formatted}` : "";
    setFormData(prev => ({ ...prev, phone: newPhone }));
  };

  // Budget Items State from Props or Defaults
  const [pricingItems, setPricingItems] = useState<PricingItem[]>(() => {
    const items = initialServices && initialServices.length > 0 ? initialServices : defaultPricingItems;
    return items.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      category: s.category as any,
      required: s.required,
      description: s.description,
      bg_image: s.bg_image,
    }));
  });

  // Packages list state
  const [packagesList, setPackagesList] = useState<any[]>(() => {
    return initialPackages && initialPackages.length > 0 ? initialPackages.filter((p) => p.active) : defaultPackages;
  });

  // Benefits list state
  const [benefitsList, setBenefitsList] = useState<any[]>(() => {
    const list = initialBenefits && initialBenefits.length > 0 ? initialBenefits.filter((b) => b.active) : [];
    return list.filter((b) => b.benefit_title !== 'Kit Premium');
  });

  // Settings state
  const [settingsState, setSettingsState] = useState<any>(initialSettings);

  const whatsappNumber = settingsState?.whatsapp_number || '5511999999999';

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
    const items = initialServices && initialServices.length > 0 ? initialServices : defaultPricingItems;
    return items.filter((i) => i.required).map((i) => i.id);
  });

  const areFilmsBlocked = useMemo(() => {
    return eventType === "casamento" &&
      selectedItemIds.includes("captacao_cerimonia") &&
      !selectedItemIds.includes("captacao_making_of") &&
      !selectedItemIds.includes("captacao_festa") &&
      !selectedItemIds.includes("pre_wedding_vid");
  }, [eventType, selectedItemIds]);

  useEffect(() => {
    if (areFilmsBlocked) {
      setSelectedItemIds((prev) => {
        if (prev.includes("video_filme_6_10") || prev.includes("video_filme_12_18")) {
          return prev.filter((id) => id !== "video_filme_6_10" && id !== "video_filme_12_18");
        }
        return prev;
      });
    }
  }, [areFilmsBlocked]);



  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          { data: services },
          { data: packages },
          { data: benefits },
          { data: settings }
        ] = await Promise.all([
          supabase.from('services').select('*').eq('event_type', eventType).order('display_order', { ascending: true }),
          supabase.from('packages').select('*').eq('event_type', eventType).order('display_order', { ascending: true }),
          supabase.from('benefits').select('*').eq('event_type', eventType).order('display_order', { ascending: true }),
          supabase.from('settings').select('*').eq('event_type', eventType).single()
        ]);

        if (services && services.length > 0) {
          setPricingItems(services.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: Number(s.price),
            category: s.category as any,
            required: s.required,
            description: s.description,
            bg_image: s.bg_image,
          })));
          
          setSelectedItemIds((prev) => {
            const requiredIds = services.filter((s: any) => s.required).map((s: any) => s.id);
            return Array.from(new Set([...prev, ...requiredIds]));
          });
        }
        if (packages && packages.length > 0) {
          const activePkgs = packages.filter((p: any) => p.active);
          if (activePkgs.length > 0) {
            setPackagesList(activePkgs);
          }
        }
        if (benefits && benefits.length > 0) setBenefitsList(benefits.filter((b: any) => b.active && b.benefit_title !== 'Kit Premium'));
        if (settings) setSettingsState(settings);
      } catch (err) {
        console.error("Error fetching simulator data on client:", err);
      }
    };

    loadData();

    if (typeof window !== 'undefined') {
      window.addEventListener('mock-database-update', loadData);
      return () => window.removeEventListener('mock-database-update', loadData);
    }
  }, [eventType]);



  const handleScrollToPackages = () => {
    const el = document.getElementById("experiencias-recomendadas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const topEl = document.getElementById("simulador");
      if (topEl) {
        topEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleToggleItem = (itemId: string) => {
    const item = pricingItems.find((i) => i.id === itemId);
    if (!item || item.required) return; // Prevent disabling required items

    if (areFilmsBlocked && (itemId === "video_filme_6_10" || itemId === "video_filme_12_18")) {
      setToastMessage("Para criar um filme de 6 a 18 minutos, precisamos registrar mais momentos além da cerimônia. Adicione Festa, Making Of ou Pré Wedding.");
      return;
    }

    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        let next = [...prev, itemId];
        if (itemId === "video_filme_6_10") {
          next = next.filter((id) => id !== "video_filme_12_18");
        } else if (itemId === "video_filme_12_18") {
          next = next.filter((id) => id !== "video_filme_6_10");
        }
        return next;
      }
    });
  };

  const applyPackage = (inclusions: string[]) => {
    const requiredIds = pricingItems.filter((i) => i.required).map((i) => i.id);
    const nextSelected = Array.from(new Set([...requiredIds, ...inclusions]));
    setSelectedItemIds(nextSelected);
    
    // Play light gold confetti to confirm selection
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ["#aa824f", "#c69f68"],
      origin: { y: 0.8 }
    });
  };

  // Calculations
  const selectedItems = pricingItems.filter((item) => selectedItemIds.includes(item.id));
  const basePrice = selectedItems.reduce((acc, item) => acc + item.price, 0);

  // Check if a package is currently fully selected
  const isPackageActive = (pkg: any) => {
    const pkgInclusions = parseInclusions(pkg.inclusions);
    const allInclusionsSelected = pkgInclusions.every((id: string) => selectedItemIds.includes(id));
    const requiredIds = pricingItems.filter((i) => i.required).map((i) => i.id);
    const expectedIds = Array.from(new Set([...requiredIds, ...pkgInclusions]));
    
    return selectedItemIds.length === expectedIds.length &&
      expectedIds.every((id) => selectedItemIds.includes(id));
  };

  // Determine discounts dynamically based on matching packages inside selection
  const matchingPackages = useMemo(() => {
    return packagesList.filter((pkg) => {
      const pkgInclusions = parseInclusions(pkg.inclusions);
      return pkgInclusions.every((id: string) => selectedItemIds.includes(id));
    });
  }, [packagesList, selectedItemIds]);

  const packageDeduction = useMemo(() => {
    if (matchingPackages.length > 0) {
      const sorted = [...matchingPackages].sort((a, b) => {
        const discountA = Number(a.base_price) - Number(a.promo_price);
        const discountB = Number(b.base_price) - Number(b.promo_price);
        return discountB - discountA;
      });
      return Number(sorted[0].base_price) - Number(sorted[0].promo_price);
    }
    return 0;
  }, [matchingPackages]);

  const totalPrice = basePrice - packageDeduction;

  const anyPackageActive = useMemo(() => {
    return packagesList.some((pkg) => isPackageActive(pkg));
  }, [packagesList, selectedItemIds]);



  // Emotional Alerts
  const activeAlerts = [];
  if (!selectedItemIds.includes("captacao_making_of")) {
    activeAlerts.push("Os momentos de preparação, ansiedade e emoção do casal antes da cerimônia não farão parte do filme final.");
  }
  if (!selectedItemIds.includes("captacao_festa")) {
    activeAlerts.push("A celebração, os abraços dos convidados e os momentos espontâneos da pista de dança não serão registrados.");
  }
  if (selectedItemIds.includes("video_teaser") && !selectedItemIds.includes("video_filme_6_10") && !selectedItemIds.includes("video_filme_12_18")) {
    activeAlerts.push("Seu filme será compacto e focado nos principais momentos do dia. Discursos, detalhes e acontecimentos secundários poderão ficar de fora da narrativa.");
  }
  if (!selectedItemIds.includes("pre_wedding_vid")) {
    activeAlerts.push("O filme contará apenas a história do dia do casamento, sem mostrar a conexão e a trajetória do casal antes do evento.");
  }

  // Coverage Profile logic
  const getCoverageProfile = () => {
    const hasPreWedding = selectedItemIds.includes("pre_wedding_vid");
    const hasMakingOf = selectedItemIds.includes("captacao_making_of");
    const hasCerimonia = selectedItemIds.includes("captacao_cerimonia");
    const hasFesta = selectedItemIds.includes("captacao_festa");
    const hasTeaser = selectedItemIds.includes("video_teaser");
    const hasFilme6to10 = selectedItemIds.includes("video_filme_6_10");
    const hasFilme12to18 = selectedItemIds.includes("video_filme_12_18");
    const hasSameDay = selectedItemIds.includes("extra_same_day");

    // Dynamic phrase helper
    const getPhrase = () => {
      if (hasSameDay) {
        return "Vocês reviverão parte do casamento ainda durante a festa.";
      }
      if (hasFilme12to18) {
        return "Mais espaço para falas, detalhes e emoções.";
      }
      if (hasPreWedding) {
        return "A história começa antes do casamento.";
      }
      if (hasFesta) {
        return "Sua celebração também fará parte da narrativa.";
      }
      return "Seu filme será focado nos momentos íntimos da cerimônia.";
    };

    const phrase = getPhrase();

    // 1. Première
    if (hasPreWedding && hasMakingOf && hasCerimonia && hasFesta && hasFilme12to18 && hasSameDay) {
      return {
        title: "Experiência Première",
        description: "Nosso nível máximo de cobertura. Uma experiência exclusiva que une narrativa cinematográfica, emoção instantânea e uma lembrança definitiva para toda a vida.",
        icon: "estrela",
        badge: "Experiência Máxima",
        phrase
      };
    }

    // 2. Assinatura Rooster
    if (hasPreWedding && hasMakingOf && hasCerimonia && hasFesta && hasFilme12to18) {
      return {
        title: "Assinatura Rooster",
        description: "A experiência que melhor representa nossa visão cinematográfica. Uma produção completa criada para contar a história de vocês do início ao fim.",
        icon: "rooster",
        badge: "Mais Recomendado",
        phrase
      };
    }

    // 3. Memória Eterna
    if (hasMakingOf && hasCerimonia && hasFesta && hasFilme12to18) {
      return {
        title: "Memória Eterna",
        description: "Uma reconstrução profunda do dia mais importante da vida de vocês, com espaço para detalhes, falas e momentos que normalmente passam despercebidos.",
        icon: "relogio",
        badge: null,
        phrase
      };
    }

    // 4. Experiência Cinematográfica
    if (hasMakingOf && hasCerimonia && hasFesta && hasFilme6to10) {
      return {
        title: "Experiência Cinematográfica",
        description: "Uma narrativa completa do casamento, construída para transportar vocês de volta a cada emoção vivida.",
        icon: "claquete",
        badge: null,
        phrase
      };
    }

    // 5. Love Story
    if (hasPreWedding && hasCerimonia && hasTeaser) {
      return {
        title: "Love Story",
        description: "Uma história que começa antes do casamento, mostrando a conexão e personalidade do casal além do grande dia.",
        icon: "coracao",
        badge: null,
        phrase
      };
    }

    // 6. História Completa
    if (hasMakingOf && hasCerimonia && hasTeaser) {
      return {
        title: "História Completa",
        description: "Seu filme começará antes mesmo da cerimônia, registrando expectativas, emoções e toda a preparação para o grande encontro.",
        icon: "livro",
        badge: null,
        phrase
      };
    }

    // 7. Experiência Celebração
    if (hasCerimonia && hasFesta && hasTeaser) {
      return {
        title: "Experiência Celebração",
        description: "Além da cerimônia, os momentos de alegria, abraços e comemoração também serão preservados para sempre.",
        icon: "tacas",
        badge: null,
        phrase
      };
    }

    // 8. Experiência Cerimônia (Fallback)
    return {
      title: "Experiência Cerimônia",
      description: "Uma cobertura elegante focada nos momentos mais importantes do compromisso de vocês, preservando a essência e emoção da cerimônia.",
      icon: "aliancas",
      badge: null,
      phrase
    };
  };

  const coverageProfile = getCoverageProfile();

  const getDynamicDescription = () => {
    const hasMakingOf = selectedItemIds.includes("captacao_making_of");
    const hasFesta = selectedItemIds.includes("captacao_festa");
    const hasCerimonia = selectedItemIds.includes("captacao_cerimonia");
    const hasTeaser = selectedItemIds.includes("video_teaser");
    const hasFilme6to10 = selectedItemIds.includes("video_filme_6_10");
    const hasFilme12to18 = selectedItemIds.includes("video_filme_12_18");

    // Case 1: All day coverage + long film
    if (hasMakingOf && hasCerimonia && hasFesta && hasFilme12to18) {
      return "Seu casamento será registrado desde os momentos de preparação até os últimos instantes da celebração, resultando em um filme cinematográfico completo e emocionante, contando toda a história do seu grande dia.";
    }

    // Case 2: Only ceremony + teaser
    const onlyCerimoniaAndTeaser = selectedItemIds.length === 2 && hasCerimonia && hasTeaser;
    if (onlyCerimoniaAndTeaser) {
      return "Seu filme será focado nos momentos mais marcantes da cerimônia, preservando a essência e emoção do compromisso de vocês.";
    }

    // Case 3: Ceremony + Festa + Filme de 6 a 10 min
    if (hasCerimonia && hasFesta && hasFilme6to10) {
      return "Seu filme contará os principais momentos da cerimônia e da celebração, criando uma narrativa dinâmica e emocionante para ser revivida sempre que desejarem.";
    }

    // Dynamic custom compilation
    let descriptionParts = "";
    const parts = [];
    if (hasMakingOf) {
      parts.push("a intimidade dos preparativos no making of do casal");
    }
    if (hasFesta) {
      parts.push("a alegria contagiante da festa");
    }
    if (selectedItemIds.includes("pre_wedding_vid")) {
      parts.push("a conexão genuína do seu ensaio pré-wedding");
    }
    
    if (parts.length > 0) {
      descriptionParts = `Seu filme registrará a emoção da cerimônia, unindo ${parts.join(" e ")}. `;
    } else {
      descriptionParts = "Seu filme será focado nos registros da cerimônia e momentos essenciais. ";
    }

    if (hasFilme12to18 || hasFilme6to10) {
      descriptionParts += "Toda essa história será estruturada em um documentário cinematográfico de narrativa envolvente.";
    } else {
      descriptionParts += "Os melhores instantes serão sintetizados em um teaser dinâmico e poético.";
    }

    return descriptionParts;
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nome é obrigatório.";
    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "E-mail inválido.";
    }
    if (!formData.phone.trim()) errors.phone = "Telefone é obrigatório.";
    if (!formData.eventDate) errors.eventDate = eventType === 'aniversario' ? "Data do aniversário é obrigatória." : eventType === 'revelacao' ? "Data da revelação é obrigatória." : "Data do casamento é obrigatória.";
    if (!formData.location.trim()) errors.location = eventType === 'aniversario' ? "Local do aniversário é obrigatório." : eventType === 'revelacao' ? "Local da revelação é obrigatório." : "Local do casamento é obrigatório.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!leadSource) {
      errors.leadSource = "Como conheceu a Rooster Films é obrigatório.";
    }
    if (leadSource === "Indicação" && !referredBy.trim()) {
      errors.referredBy = "Quem indicou a Rooster Films é obrigatório.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // PDF Generation Helper
  const generateProposalPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [170, 130, 79]; // #aa824f
    const darkColor = [20, 20, 22]; // #141416
    const textColor = [60, 60, 65];

    // Page styling & layout parameters
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Cover / Header Banner
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, 55, "F");

    // Luxury Header Title (Rooster Films)
    doc.setTextColor(255, 255, 255);
    doc.setFont("georgia", "bold");
    doc.setFontSize(26);
    doc.text("ROOSTER FILMS", margin, 24);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("WEDDINGS & CINEMATOGRAPHY", margin, 30);

    // Document Title - Align Right
    doc.setTextColor(255, 255, 255);
    doc.setFont("georgia", "italic");
    doc.setFontSize(14);
    doc.text("Solicitação de Orçamento", pageWidth - margin, 27, { align: "right" });

    // Line Decor
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Sub-header explanation text
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Este documento representa uma simulação realizada pelo cliente e serve como base para a elaboração da proposta comercial oficial.", margin, 61);

    // Client and Event Details Section
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DO CASAL & CASAMENTO", margin, 73);

    doc.setDrawColor(220, 220, 225);
    doc.line(margin, 76, pageWidth - margin, 76);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const formattedDate = new Date(formData.eventDate).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });

    const emissionDate = new Date().toLocaleDateString("pt-BR");

    const clientLabel = eventType === 'casamento' ? 'Noivos' : eventType === 'aniversario' ? 'Aniversariante' : 'Cliente';
    const dateLabel = eventType === 'casamento' ? 'Data do Casamento' : eventType === 'aniversario' ? 'Data do Aniversário' : 'Data da Revelação';

    doc.text(`${clientLabel}: ${formData.name}`, margin, 84);
    doc.text(`E-mail: ${formData.email}`, margin, 90);
    doc.text(`Telefone: ${formData.phone}`, margin, 96);
    doc.text(`${dateLabel}: ${formattedDate}`, pageWidth / 2 + 10, 84);
    doc.text(`Espaço / Local: ${formData.location}`, pageWidth / 2 + 10, 90);
    doc.text(`Data de Emissão: ${emissionDate}`, pageWidth / 2 + 10, 96);

    // Services Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("SERVIÇOS SELECIONADOS", margin, 112);
    doc.line(margin, 115, pageWidth - margin, 115);

    const tableRows = selectedItems.map((item) => [
      item.name,
      item.description,
      `R$ ${item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: 120,
      margin: { left: margin, right: margin },
      head: [["Serviço", "Descrição", "Valor"]],
      body: tableRows,
      headStyles: {
        fillColor: [170, 130, 79],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 65],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: "right" },
      },
      theme: "striped",
    });

    // Total Calculation Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    const boxHeight = packageDeduction > 0 ? 28 : 20;
    doc.setFillColor(250, 248, 245);
    doc.rect(pageWidth - margin - 80, finalY, 80, boxHeight, "F");
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(pageWidth - margin - 80, finalY, 80, boxHeight, "S");

    doc.setFont("helvetica", "bold");
    if (packageDeduction > 0) {
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("DESCONTO:", pageWidth - margin - 75, finalY + 6);
      
      doc.setFontSize(11);
      doc.setTextColor(180, 80, 80); // Reddish for discount
      doc.text(
        `- R$ ${packageDeduction.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        pageWidth - margin - 75,
        finalY + 11
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("INVESTIMENTO ESTIMADO:", pageWidth - margin - 75, finalY + 18);
      
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(
        `R$ ${totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        pageWidth - margin - 75,
        finalY + 24
      );
    } else {
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("INVESTIMENTO ESTIMADO:", pageWidth - margin - 75, finalY + 8);
      
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(
        `R$ ${totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        pageWidth - margin - 75,
        finalY + 15
      );
    }

    const conditionsY = finalY + boxHeight + 15;

    // Próximos Passos
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PRÓXIMOS PASSOS", margin, conditionsY);
    doc.line(margin, conditionsY + 3, pageWidth - margin, conditionsY + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("• Nossa equipe analisará a disponibilidade da data.", margin, conditionsY + 10);
    doc.text("• Caso o evento aconteça fora de Sinop-MT, serão calculados eventuais custos de deslocamento, hospedagem e logística.", margin, conditionsY + 16);
    doc.text("• Após a análise, será enviada uma proposta comercial oficial com os valores finais e condições de contratação.", margin, conditionsY + 22);

    // Rodapé
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 145);
    doc.text(
      "Documento gerado automaticamente pela plataforma Rooster Films. Esta simulação não caracteriza proposta comercial definitiva.",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );

    return doc;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setLoading(true);

    try {
      // 1. Generate Proposal PDF
      const doc = generateProposalPDF();
      
      // Get base64 string from pdf
      const pdfBase64 = doc.output("datauristring").split(",")[1];

      // Download PDF immediately for the client
      doc.save(`Proposta_Rooster_Films_${formData.name.replace(/\s+/g, "_")}.pdf`);

      // 2. Submit to backend API Route
      const payload = {
        eventType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventDate: formData.eventDate,
        location: formData.location,
        options: selectedItems.map((item) => ({ name: item.name, price: item.price })),
        totalPrice,
        pdfBase64,
        leadSource,
        referredBy: leadSource === "Indicação" ? referredBy : null,
        notes
      };

      console.log("Lead enviado", payload);

      // If mock mode, also save directly on client to persist in localStorage and sync CRM instantly
      let mockClientResult = null;
      if (!isSupabaseConfigured) {
        mockClientResult = await supabase.from('budgets').insert({
          event_type: eventType || 'casamento',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          event_date: formData.eventDate,
          location: formData.location,
          options: selectedItems.map((item) => ({ name: item.name, price: item.price })),
          total_price: totalPrice,
          status: 'pending',
          pdf_url: null,
          lead_source: leadSource,
          referred_by: leadSource === "Indicação" ? referredBy : null,
          notes: notes
        });
      }

      const response = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Lead salvo", result);
        setProposalDetails(result);
        setSuccess(true);
        setIsFormModalOpen(false);
        
        // Explode luxury gold confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          colors: ["#aa824f", "#c69f68", "#f6efe2", "#ffffff"],
          origin: { y: 0.6 }
        });
      } else {
        const errObj = result.error || result.dbError || "Erro ao salvar proposta";
        console.error("Erro ao salvar lead", errObj);
        throw new Error(errObj);
      }
    } catch (err: any) {
      console.error("Erro ao salvar lead", err.message || err);
      setToastMessage(`Ocorreu um problema ao enviar seu orçamento: ${err.message || err}. A proposta em PDF foi baixada no seu navegador.`);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProposal = async () => {
    try {
      const doc = generateProposalPDF();
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], `Proposta_Rooster_Films_${formData.name.replace(/\s+/g, "_")}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Proposta Rooster Films",
          text: `Olá! Aqui está a proposta personalizada da Rooster Films para o evento de ${formData.name}.`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Proposta Rooster Films",
          text: `Olá! Minha proposta do simulador da Rooster Films ficou no valor total de R$ ${totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
          url: window.location.href,
        });
      } else {
        doc.save(`Proposta_Rooster_Films_${formData.name.replace(/\s+/g, "_")}.pdf`);
        setToastMessage("A proposta em PDF foi baixada no seu dispositivo. Você pode compartilhá-la manualmente.");
      }
    } catch (err: any) {
      if (err && (err.name === "AbortError" || String(err).includes("AbortError") || String(err.message).includes("share"))) {
        console.log("Share operation was aborted/cancelled by the user.");
        return;
      }
      console.error("Error sharing:", err);
      try {
        const doc = generateProposalPDF();
        doc.save(`Proposta_Rooster_Films_${formData.name.replace(/\s+/g, "_")}.pdf`);
      } catch (pdfErr) {
        console.error("Error saving fallback pdf:", pdfErr);
      }
      setToastMessage("Não foi possível compartilhar automaticamente. O arquivo PDF foi baixado no seu dispositivo.");
    }
  };

  return (
    <section id="simulador" className="pt-36 pb-36 md:pt-48 md:pb-40 lg:pt-52 lg:pb-32 bg-zinc-950/60 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs tracking-[0.3em] text-gold-400 uppercase font-semibold block mb-4">
            Simulação Exclusiva
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white leading-tight">
            Desenhe Seu <span className="italic font-normal text-gold-200">Projeto</span>
          </h2>
          <p className="text-sm text-zinc-400 font-light mt-4 max-w-md mx-auto leading-relaxed">
            Selecione as opções ideais para o seu dia e visualize instantaneamente uma estimativa de investimento.
          </p>
        </div>



        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Options and Form columns */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            
            {/* Experiências Recomendadas Section */}
            <div id="experiencias-recomendadas" className="flex flex-col gap-6">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="font-serif text-2xl text-white font-light">
                  Experiências Recomendadas
                </h3>
                <p className="text-[11px] text-zinc-400 font-light mt-1">
                  Selecione uma de nossas sugestões com curadoria artística para facilitar sua escolha.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packagesList.map((pkg: any) => {
                  const pkgInclusions = parseInclusions(pkg.inclusions);
                  const isActive = isPackageActive(pkg);
                  const discount = Number(pkg.base_price) - Number(pkg.promo_price);
                  
                  let cardClass = "";
                  if (isActive) {
                    cardClass = "package-card-selected";
                  } else {
                    cardClass = "border-zinc-800 hover:border-gold-400/20";
                  }

                  let btnClass = "";
                  const isHighlighted = pkg.highlight_color === 'gold' || pkg.badge === 'MAIS ESCOLHIDA';
                  if (isActive) {
                    btnClass = "bg-gold-400 text-black border border-transparent shadow shadow-gold-500/10";
                  } else {
                    if (anyPackageActive) {
                      btnClass = "border border-zinc-850 hover:border-gold-400/30 hover:bg-gold-400/5 text-zinc-300 hover:text-gold-200 font-semibold";
                    } else {
                      if (isHighlighted) {
                        btnClass = "bg-gold-400/90 hover:bg-gold-400 text-black font-semibold shadow-md shadow-gold-500/10";
                      } else {
                        btnClass = "border border-zinc-850 hover:border-gold-400/30 hover:bg-gold-400/5 text-zinc-300 hover:text-gold-200 font-semibold";
                      }
                    }
                  }

                  const getDisplayBadge = (p: any) => {
                    const b = p.badge ? String(p.badge).toUpperCase() : "";
                    const c = p.category ? String(p.category).toUpperCase() : "";
                    
                    if (b.includes("ESCOLHIDA")) return "⭐ Mais Escolhida";
                    if (c.includes("EXCLUSIVA") || b.includes("EXCLUSIVA")) return "💎 Exclusiva";
                    if (c.includes("RECOMENDA") || b.includes("RECOMENDA")) return "✔ Recomendado";
                    if (c.includes("SUGESTÃO") || c.includes("SUGESTAO")) return "✔ Recomendado";
                    return p.badge || p.category;
                  };
                  const badgeText = getDisplayBadge(pkg);

                  return (
                    <div 
                      key={pkg.id}
                      className={`glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[350px] transition-all duration-300 relative text-left opacity-100 ${cardClass}`}
                    >
                      {badgeText && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#070708]/90 border border-gold-400/30 text-gold-300 text-[10px] font-medium px-3.5 py-0.5 rounded-full shadow-lg shadow-black/80 backdrop-blur-md flex items-center gap-1 whitespace-nowrap">
                          {badgeText}
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-serif text-base text-zinc-150 uppercase tracking-wide mb-1 pt-2">{pkg.name}</h4>
                        <span className="text-[10px] text-gold-400/80 tracking-wider font-light mb-3 block">
                          {pkgInclusions.length} {pkgInclusions.length === 1 ? 'serviço incluso' : 'serviços inclusos'}
                        </span>
                        
                        <p className="text-[11px] text-zinc-500 font-light leading-relaxed mb-4 italic">
                          "{pkg.description}"
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {pkgInclusions.map((incId: string) => {
                            const service = pricingItems.find((s) => s.id === incId);
                            if (!service) return null;
                            return (
                              <span key={incId} className="text-[9px] text-zinc-400 border border-zinc-800/80 bg-zinc-900/30 px-2.5 py-0.5 rounded-md tracking-wide font-light whitespace-nowrap">
                                {service.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-900/50">
                        <div className="text-[9px] tracking-widest text-zinc-500 uppercase mb-1">Investimento</div>
                        
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-2xl text-gold-300 font-light">
                            R$ {Number(pkg.promo_price).toLocaleString("pt-BR")}
                          </span>
                          {discount > 0 && (
                            <span className="font-serif text-sm text-zinc-655 line-through">
                              R$ {Number(pkg.base_price).toLocaleString("pt-BR")}
                            </span>
                          )}
                        </div>

                        {discount > 0 ? (
                          <div className="text-[10px] text-[#25D366] font-semibold mt-1">
                            Economia de R$ {discount.toLocaleString("pt-BR")}
                          </div>
                        ) : (
                          <div className="text-[10px] text-transparent select-none mt-1">Sem economia</div>
                        )}

                        <button
                          onClick={() => applyPackage(pkgInclusions)}
                          className={`w-full py-2.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer mt-4 ${btnClass}`}
                        >
                          {isActive ? "✓ Selecionado" : "Selecionar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Budget Selection Options */}
            <div className="flex flex-col gap-8">
              
              {/* Category: Pré Wedding */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 border-b border-zinc-900 pb-2">
                  Pré Wedding
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {pricingItems.filter((i) => i.category === "pre_wedding").map((item) => (
                    <OptionCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItemIds.includes(item.id)}
                      onToggle={handleToggleItem}
                    />
                  ))}
                </div>
              </div>

              {/* Category: Captação */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 border-b border-zinc-900 pb-2">
                  Captação (Gravação)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingItems.filter((i) => i.category === "captacao").map((item) => (
                    <OptionCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItemIds.includes(item.id)}
                      onToggle={handleToggleItem}
                    />
                  ))}
                </div>
              </div>

              {/* Category: Vídeos Editados */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 border-b border-zinc-900 pb-2">
                  Filmes Finalizados (Edição)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingItems.filter((i) => i.category === "videos").map((item) => {
                    const isBlocked = areFilmsBlocked && (item.id === "video_filme_6_10" || item.id === "video_filme_12_18");
                    return (
                      <OptionCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItemIds.includes(item.id)}
                        onToggle={handleToggleItem}
                        isBlocked={isBlocked}
                        badgeText="Requer mais cobertura"
                      />
                    );
                  })}
                </div>
                {areFilmsBlocked && (
                  <p className="text-xs text-zinc-500 mt-3 font-light text-left leading-relaxed">
                    Filmes de média e longa duração exigem mais momentos além da cerimônia para construir uma narrativa completa.
                  </p>
                )}
              </div>

              {/* Category: Extras */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 border-b border-zinc-900 pb-2">
                  Serviços Adicionais
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {pricingItems.filter((i) => i.category === "extras").map((item) => (
                    <OptionCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItemIds.includes(item.id)}
                      onToggle={handleToggleItem}
                    />
                  ))}
                </div>
              </div>

              {/* Intelligent Emotional Alerts Card */}
              {activeAlerts.length > 0 && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-red-500/10 rounded-2xl p-6 relative overflow-hidden mb-6 text-left"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.01] rounded-full filter blur-xl" />
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="h-4.5 w-4.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h4 className="font-serif text-sm tracking-widest text-zinc-300 uppercase font-semibold">
                      Momentos que não estarão presentes
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3 pl-3 text-xs text-zinc-400 font-light leading-relaxed">
                    {activeAlerts.map((alertText, idx) => (
                      <p key={idx} className="relative pl-3.5 before:absolute before:left-0 before:top-[6px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold-400/60">
                        {alertText}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}



              {/* Displacement Warning Card */}
              <div className="bg-black/35 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden text-left flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-[10px] tracking-widest text-gold-400 uppercase font-semibold mb-1">Logística & Deslocamento</h5>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    Os valores apresentados consideram eventos realizados em Sinop-MT. Caso o evento aconteça em outra cidade, poderão ser acrescentados custos de deslocamento, hospedagem e logística após análise da localização.
                  </p>
                </div>
              </div>

              {/* Mobile/Tablet Fixed Final Summary Section (lg:hidden) */}
              <div className="lg:hidden mt-8 p-6 rounded-2xl border border-gold-400/20 bg-gradient-to-b from-zinc-950 to-black text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/[0.02] rounded-full filter blur-xl" />
                
                <div className="mb-6">
                  <h4 className="font-serif text-xl text-white font-light">
                    Resumo da Sua Experiência
                  </h4>
                  <p className="text-[10px] text-zinc-450 font-light mt-1">
                    Confira os itens selecionados antes de solicitar sua proposta.
                  </p>
                </div>

                {/* Perfil da Cobertura */}
                {selectedItemIds.length > 0 && (
                  <div className="p-4 rounded-xl border border-gold-400/15 bg-gold-400/[0.02] flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 flex-shrink-0 font-light">
                      <ExperienceIcon name={coverageProfile.icon} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-[8px] tracking-widest text-gold-450 uppercase font-semibold block">Perfil de Cobertura</span>
                      <h4 className="font-serif text-sm text-zinc-100 font-medium truncate">
                        {coverageProfile.title}
                      </h4>
                    </div>
                    {coverageProfile.badge && (
                      <span className="bg-gold-400 text-black text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                        {coverageProfile.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Itens Selecionados */}
                <div className="text-left mb-6">
                  <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-semibold block mb-3">Itens Selecionados</span>
                  {selectedItemIds.length === 0 ? (
                    <p className="text-xs text-zinc-550 font-light italic">
                      Monte sua experiência para visualizar o investimento estimado.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-xs border-b border-zinc-900/40 pb-2 gap-3">
                          <span className="text-zinc-300 font-light flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-gold-400 flex-shrink-0" /> {item.name}
                          </span>
                          <span className="text-gold-300 font-medium flex-shrink-0">
                            R$ {item.price.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bônus do Pacote */}
                {packageDeduction > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-[#25D366] font-semibold uppercase tracking-wider bg-[#25D366]/5 p-3 rounded-lg border border-[#25D366]/10 mb-6 text-left">
                    <span>Bônus do Pacote</span>
                    <span>- R$ {packageDeduction.toLocaleString("pt-BR")}</span>
                  </div>
                )}

                {/* Benefícios Progressivos */}
                {benefitsList.length > 0 && selectedItemIds.length > 0 && (
                  <div className="mb-6 text-left border-t border-zinc-900/60 pt-4">
                    <h4 className="text-[9px] tracking-widest uppercase text-zinc-550 font-semibold mb-3">
                      Benefícios Progressivos
                    </h4>
                    <div className="flex flex-col gap-3">
                      {benefitsList.map((benefit: any) => {
                        const target = Number(benefit.target_price);
                        const isUnlocked = totalPrice >= target;
                        const missing = target - totalPrice;
                        const progress = Math.min((totalPrice / target) * 100, 100);
                        const missingText = benefit.missing_text.replace(
                          "{missing}",
                          missing.toLocaleString("pt-BR")
                        );

                        return (
                          <div key={benefit.id}>
                            <div className="flex justify-between items-start mb-1 text-[10px]">
                              <span className={`font-medium ${isUnlocked ? "text-[#25D366]" : "text-zinc-400"}`}>
                                {benefit.benefit_title}
                              </span>
                              <span className="text-[8.5px] text-zinc-500">
                                Meta: R$ {target.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-950/60 border border-zinc-900 h-1 rounded-full overflow-hidden mb-1">
                              <div 
                                className={`h-full transition-all duration-500 ${isUnlocked ? "bg-[#25D366]" : "bg-gold-400"}`} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-zinc-500 leading-relaxed font-light">
                              {isUnlocked ? (
                                <span className="text-[#25D366] flex items-center gap-1">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" /> {benefit.benefit_description}
                                </span>
                              ) : (
                                <span>{missingText}</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Valor Total */}
                <div className="border-t border-zinc-900/60 pt-5 pb-6 text-center">
                  <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-semibold block mb-1">Investimento Estimado</span>
                  <div className="flex justify-center items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl text-gold-300 font-light">
                      R$ {selectedItemIds.length === 0 ? "0,00" : totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {packageDeduction > 0 && selectedItemIds.length > 0 && (
                      <span className="font-serif text-sm text-zinc-650 line-through">
                        R$ {(totalPrice + packageDeduction).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Condições de Reserva */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsReservaExpanded(!isReservaExpanded)}
                    className="w-full flex items-center justify-between py-2 text-xs tracking-wider uppercase font-semibold text-zinc-400 hover:text-gold-300 transition-colors border-b border-zinc-900/60"
                  >
                    <span>{isReservaExpanded ? "Ocultar condições de reserva" : "Condições de reserva"}</span>
                    <svg
                      className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-300 ${isReservaExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isReservaExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="text-left py-3 text-[#A0A0A0] font-light">
                          <div className="text-sm sm:text-[13px] leading-relaxed text-[#A0A0A0] space-y-1">
                            <div>• 30% na assinatura do contrato</div>
                            <div>• 70% até 10 dias antes do evento</div>
                          </div>
                          <p className="text-[13px] sm:text-[12px] text-zinc-500 italic mt-3 leading-relaxed">
                            *Para eventos fora de Sinop-MT, custos de deslocamento e hospedagem poderão ser adicionados à proposta final.*
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botão Principal */}
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(true)}
                  className="w-full py-4 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/10 active:scale-95 animate-pulse"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-current animate-spin-slow" />
                  Gerar Proposta Comercial
                </button>
              </div>

            </div>
          </div>

          {/* Sticky / Fixed Summary Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 z-40">
            
            {/* Desktop Layout (lg and above) */}
            <div className="hidden lg:block glass-panel border-gold-400/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full filter blur-xl" />

              <h3 className="font-serif text-2xl text-white font-light border-b border-zinc-900 pb-4 mb-6">
                Resumo da Proposta
              </h3>

              <div className="flex flex-col gap-4">
                {/* Coverage Profile Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={coverageProfile.title}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-xl border border-gold-400/15 bg-gold-400/[0.03] relative overflow-hidden text-left"
                  >
                    {coverageProfile.badge && (
                      <div className="absolute top-3 right-3 bg-gold-400 text-black text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        {coverageProfile.badge}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="h-10 w-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 flex-shrink-0">
                        <ExperienceIcon name={coverageProfile.icon} />
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest text-gold-450 uppercase font-semibold block">Perfil de Cobertura</span>
                        <h4 className="font-serif text-base text-zinc-100 font-medium">
                          {coverageProfile.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 font-light leading-relaxed mt-3">
                      {coverageProfile.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full flex items-center justify-between py-2 text-xs tracking-wider uppercase font-semibold text-zinc-400 hover:text-gold-300 transition-colors border-b border-zinc-900/60"
                >
                  <span>{isDetailsExpanded ? "Ocultar detalhes" : "Ver detalhes da cobertura"}</span>
                  <svg
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Collapsible details section */}
                <AnimatePresence>
                  {isDetailsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 py-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-thin text-left">
                        {/* Event summary details */}
                        <div className="text-[11px] text-zinc-455 font-light flex flex-col gap-1 border-b border-zinc-900/40 pb-3">
                          {formData.name && (
                            <p><strong>Casal:</strong> <span className="text-zinc-200">{formData.name}</span></p>
                          )}
                          {formData.eventDate && (
                            <p><strong>Data:</strong> <span className="text-zinc-200">{new Date(formData.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span></p>
                          )}
                          {formData.location && (
                            <p><strong>Local:</strong> <span className="text-zinc-200">{formData.location}</span></p>
                          )}
                        </div>

                        {/* Selected List */}
                        <div className="flex flex-col gap-2.5 pb-2.5 border-b border-zinc-900/40">
                          <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-medium">Itens Selecionados</span>
                          {selectedItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-[11px] gap-3">
                              <span className="text-zinc-350 font-medium">{item.name}</span>
                              <span className="text-gold-300 font-semibold flex-shrink-0">
                                R$ {item.price.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Package Benefit Deduction */}
                        {packageDeduction > 0 && (
                          <div className="flex justify-between items-center text-[10px] text-[#25D366] font-semibold uppercase tracking-wider bg-[#25D366]/5 p-2 rounded border border-[#25D366]/10">
                            <span>Bônus do Pacote</span>
                            <span className="flex-shrink-0">- R$ {packageDeduction.toLocaleString("pt-BR")}</span>
                          </div>
                        )}

                        {/* Progressive Benefits Section */}
                        {benefitsList.length > 0 && (
                          <div className="pb-3 border-b border-zinc-900/40">
                            <h4 className="text-[9px] tracking-widest uppercase text-zinc-550 font-medium mb-2.5">
                              Benefícios Progressivos
                            </h4>
                            <div className="flex flex-col gap-3">
                              {benefitsList.map((benefit: any) => {
                                const target = Number(benefit.target_price);
                                const isUnlocked = totalPrice >= target;
                                const missing = target - totalPrice;
                                const progress = Math.min((totalPrice / target) * 100, 100);
                                const missingText = benefit.missing_text.replace(
                                  "{missing}",
                                  missing.toLocaleString("pt-BR")
                                );

                                return (
                                  <div key={benefit.id} className="text-left">
                                    <div className="flex justify-between items-start mb-1 text-[10px]">
                                      <span className={`font-medium ${isUnlocked ? "text-[#25D366]" : "text-zinc-400"}`}>
                                        {benefit.benefit_title}
                                      </span>
                                      <span className="text-[9px] text-zinc-500">
                                        Meta: R$ {target.toLocaleString("pt-BR")}
                                      </span>
                                    </div>
                                    
                                    <div className="w-full bg-zinc-950/60 border border-zinc-900 h-1 rounded-full overflow-hidden mb-1">
                                      <div 
                                        className={`h-full transition-all duration-500 ${isUnlocked ? "bg-[#25D366]" : "bg-gold-400"}`} 
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>

                                    <p className="text-[9px] text-zinc-500 leading-relaxed font-light">
                                      {isUnlocked ? (
                                        <span className="text-[#25D366] flex items-center gap-1">
                                          <Check className="h-2.5 w-2.5 stroke-[3]" /> {benefit.benefit_description}
                                        </span>
                                      ) : (
                                        <span>{missingText}</span>
                                      )}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Accordion Trigger for Reserva da Data */}
                <button
                  type="button"
                  onClick={() => setIsReservaExpanded(!isReservaExpanded)}
                  className="w-full flex items-center justify-between py-2 text-xs tracking-wider uppercase font-semibold text-zinc-400 hover:text-gold-300 transition-colors border-b border-zinc-900/60"
                >
                  <span>{isReservaExpanded ? "Ocultar condições de reserva" : "Condições de reserva"}</span>
                  <svg
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-300 ${isReservaExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Collapsible Reserva da Data section */}
                <AnimatePresence>
                  {isReservaExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="text-left py-3 text-[#A0A0A0] font-light">
                        <div className="text-sm sm:text-[13px] leading-relaxed text-[#A0A0A0] space-y-1">
                          <div>• 30% na assinatura do contrato</div>
                          <div>• 70% até 10 dias antes do evento</div>
                        </div>
                        <p className="text-[13px] sm:text-[12px] text-zinc-500 italic mt-3 leading-relaxed">
                          *Para eventos fora de Sinop-MT, custos de deslocamento e hospedagem poderão ser adicionados à proposta final.*
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Total Price Box */}
                <div className="border-t border-zinc-900/50 pt-4 mt-1 flex flex-col justify-center text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] tracking-widest uppercase text-zinc-455 font-medium">Investimento Estimado</span>
                    {packageDeduction > 0 && (
                      <span className="text-[9px] text-[#25D366] font-semibold uppercase tracking-wider bg-[#25D366]/10 px-1.5 py-0.5 rounded flex-shrink-0">
                        -R$ {packageDeduction.toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl xl:text-4xl text-gold-300 font-light whitespace-nowrap">
                      R$&nbsp;{totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {packageDeduction > 0 && (
                      <span className="font-serif text-sm text-zinc-650 line-through whitespace-nowrap">
                        R$&nbsp;{(totalPrice + packageDeduction).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA / Proposal Button */}
                <div>
                  <button
                    onClick={() => setIsFormModalOpen(true)}
                    className="w-full py-4 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/10 active:scale-95 animate-pulse"
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current animate-spin-slow" />
                    Gerar Proposta Comercial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Interactive Contact Bar - Placed after the entire budget simulator grid, right before the section end */}
        <div className="mt-32 border-t border-zinc-900/40 pt-20 pb-12 text-center">
          <h4 className="font-serif text-[11px] tracking-[0.25em] text-zinc-500 uppercase font-semibold mb-6">
            Canais de Atendimento
          </h4>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
            {/* Email (Auto-copy) */}
            <button
              onClick={() => {
                navigator.clipboard.writeText("produtoraroosterfils@gmail.com");
                setToastMessage("E-mail copiado para a área de transferência!");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-905 bg-zinc-950/40 hover:bg-zinc-900/40 text-[10px] md:text-[11px] uppercase tracking-wider text-zinc-350 hover:text-gold-200 transition-all duration-300 cursor-pointer group shadow-sm hover:border-gold-400/20"
              title="Clique para copiar o e-mail"
            >
              <Mail className="h-3.5 w-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>produtoraroosterfils@gmail.com</span>
              <span className="text-[8px] text-zinc-650 font-semibold group-hover:text-gold-300 ml-0.5">(Copiar)</span>
            </button>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5566996801085"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-905 bg-zinc-950/40 hover:bg-zinc-900/40 text-[10px] md:text-[11px] uppercase tracking-wider text-zinc-350 hover:text-gold-200 transition-all duration-300 cursor-pointer group shadow-sm hover:border-gold-400/20"
            >
              <MessageSquare className="h-3.5 w-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>(66) 9 9680-1085</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/rooster.films"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-905 bg-zinc-950/40 hover:bg-zinc-900/40 text-[10px] md:text-[11px] uppercase tracking-wider text-zinc-350 hover:text-gold-200 transition-all duration-300 cursor-pointer group shadow-sm hover:border-gold-400/20"
            >
              <svg className="h-3.5 w-3.5 text-gold-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@rooster.films</span>
            </a>

            {/* Site Oficial */}
            <a
              href="http://www.roosterfilms.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-905 bg-zinc-950/40 hover:bg-zinc-900/40 text-[10px] md:text-[11px] uppercase tracking-wider text-zinc-350 hover:text-gold-200 transition-all duration-300 cursor-pointer group shadow-sm hover:border-gold-400/20"
            >
              <Globe className="h-3.5 w-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>www.roosterfilms.com.br</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Fixed Floating Summary Bar (under lg) */}
      <AnimatePresence>
        {isSimulatorVisible && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/85 backdrop-blur-xl border-t border-gold-400/20 px-6 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl rounded-t-[24px] cursor-pointer"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left Side: Profile & Price */}
              <div className="text-left flex-1 min-w-0">
                <span className="text-[11px] tracking-wider uppercase text-zinc-400 block truncate">
                  {selectedItemIds.length === 0 
                    ? "Monte sua experiência" 
                    : `${coverageProfile.title} (${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'itens'})`}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <motion.span
                    key={totalPrice}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-serif text-xl sm:text-3xl text-gold-300 font-light block"
                  >
                    R$ {selectedItemIds.length === 0 ? "0,00" : totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </motion.span>
                  {packageDeduction > 0 && selectedItemIds.length > 0 && (
                    <span className="text-[10px] text-zinc-550 line-through">
                      R$&nbsp;{(totalPrice + packageDeduction).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Details Button */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="px-6 py-3 rounded-full border border-gold-400/30 text-gold-300 hover:text-black hover:bg-gold-400 text-xs sm:text-sm tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer flex-shrink-0"
              >
                Detalhes
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-up Details Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Dark Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm block lg:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] max-h-[85vh] z-50 bg-[#070709] border-t border-gold-400/20 rounded-t-[32px] p-6 shadow-2xl flex flex-col justify-between block lg:hidden text-left"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-4 flex-shrink-0" />
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h3 className="font-serif text-xl text-white font-light uppercase tracking-wider">
                  Resumo da Proposta
                </h3>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)} 
                  className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable details panel */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 pb-6 scrollbar-thin">
                
                {/* Coverage Profile */}
                <div className="p-4 rounded-xl border border-gold-400/15 bg-gold-400/[0.02] text-left">
                  <span className="text-[8px] tracking-widest text-gold-450 uppercase font-semibold block mb-1">
                    Perfil de Cobertura
                  </span>
                  <h4 className="font-serif text-base text-zinc-150 font-medium">
                    {selectedItemIds.length === 0 ? "Nenhum perfil" : coverageProfile.title}
                  </h4>
                  <p className="text-xs text-zinc-455 font-light mt-1.5 leading-relaxed">
                    {selectedItemIds.length === 0 ? "Selecione alguns serviços para visualizar o perfil sugerido." : coverageProfile.description}
                  </p>
                </div>

                {/* Selected Items */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-semibold block">
                    Itens Selecionados
                  </span>
                  <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-zinc-900">
                    {selectedItems.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-light italic">Nenhum item selecionado.</p>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-xs gap-3">
                          <span className="text-zinc-350 font-light">{item.name}</span>
                          <span className="text-gold-300 font-medium flex-shrink-0 font-mono">
                            R$ {item.price.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))
                    )}
                    {packageDeduction > 0 && selectedItems.length > 0 && (
                      <div className="flex justify-between items-center text-xs text-[#25D366] font-semibold bg-[#25D366]/5 p-2 rounded border border-[#25D366]/10 mt-2 uppercase tracking-wide">
                        <span>Bônus do Pacote</span>
                        <span className="flex-shrink-0 font-mono">- R$ {packageDeduction.toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progressive Benefits */}
                {benefitsList.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] tracking-widest uppercase text-zinc-550 font-semibold block">
                      Benefícios Progressivos
                    </span>
                    <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-zinc-900">
                      {benefitsList.map((benefit: any) => {
                        const target = Number(benefit.target_price);
                        const isUnlocked = totalPrice >= target;
                        const missing = target - totalPrice;
                        const progress = Math.min((totalPrice / target) * 100, 100);
                        const missingText = benefit.missing_text.replace(
                          "{missing}",
                          missing.toLocaleString("pt-BR")
                        );

                        return (
                          <div key={benefit.id} className="text-left">
                            <div className="flex justify-between items-start mb-1 text-xs">
                              <span className={`font-medium ${isUnlocked ? "text-[#25D366]" : "text-zinc-400"}`}>
                                {benefit.benefit_title}
                              </span>
                              <span className="text-[10px] text-zinc-550 font-mono">
                                Meta: R$ {target.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            
                            <div className="w-full bg-zinc-950/60 border border-zinc-900 h-1.5 rounded-full overflow-hidden mb-1">
                              <div 
                                className={`h-full transition-all duration-500 ${isUnlocked ? "bg-[#25D366]" : "bg-gold-400"}`} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <p className="text-[10px] text-zinc-550 leading-relaxed font-light">
                              {isUnlocked ? (
                                <span className="text-[#25D366] flex items-center gap-1">
                                  <Check className="h-3 w-3 stroke-[3]" /> {benefit.benefit_description}
                                </span>
                              ) : (
                                <span>{missingText}</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}



              </div>

              {/* Footer / CTA inside Drawer */}
              <div className="border-t border-zinc-900 pt-4 mt-auto flex flex-col gap-4 flex-shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase text-zinc-455 tracking-wider font-semibold">Total Estimado</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl text-gold-300 font-light font-mono">
                      R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsFormModalOpen(true);
                  }}
                  className="w-full py-4 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 animate-pulse"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-current animate-spin-slow" />
                  Gerar Proposta Comercial
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Elegant Form Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center overflow-y-auto p-4 md:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl glass-panel border-gold-400/20 rounded-2xl p-6 md:p-8 shadow-2xl z-10 my-8 overflow-hidden text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-white font-light mb-2 flex items-center gap-2">
                    <FileText className="h-5.5 w-5.5 text-gold-400" />
                    {formStep === 1 ? "Quase lá..." : "Só mais algumas informações"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {formStep === 1 
                      ? "Preencha os dados abaixo para gerar sua proposta personalizada." 
                      : "Esses dados nos ajudam a oferecer um atendimento mais personalizado."}
                  </p>
                </div>
                <div className="bg-gold-450/10 border border-gold-400/20 text-gold-300 px-3.5 py-1.5 rounded-lg text-[9px] font-bold tracking-widest uppercase flex-shrink-0">
                  Etapa {formStep} de 2
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (formStep === 1) {
                  if (validateStep1()) setFormStep(2);
                } else {
                  handleSubmit(e);
                }
              }} className="space-y-6">
                <AnimatePresence mode="wait">
                  {formStep === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Nome */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-xs uppercase tracking-widest text-zinc-400 font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gold-400/70" />
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-600 transition-colors ${
                            formErrors.name ? "border-red-500/50" : "border-zinc-800"
                          }`}
                        />
                        {formErrors.name && <span className="text-[10px] text-red-500">{formErrors.name}</span>}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-xs uppercase tracking-widest text-zinc-400 font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gold-400/70" />
                          E-mail
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="exemplo@email.com"
                          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-600 transition-colors ${
                            formErrors.email ? "border-red-500/50" : "border-zinc-800"
                          }`}
                        />
                        {formErrors.email && <span className="text-[10px] text-red-500">{formErrors.email}</span>}
                      </div>

                      {/* Telefone */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-xs uppercase tracking-widest text-zinc-400 font-medium flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gold-400/70" />
                          Telefone / WhatsApp
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-shrink-0">
                            <select
                              value={selectedCountryCode}
                              onChange={(e) => handleCountryChange(e.target.value)}
                              className="appearance-none h-full pl-3 pr-8 py-3 bg-black/40 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-gold-400 text-sm cursor-pointer transition-colors"
                            >
                              {countries.map((c) => (
                                <option key={c.code} value={c.code} className="bg-zinc-950 text-white">
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-zinc-500">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              const clean = val.replace(/\D/g, "");
                              let digits = clean;
                              const codeDigits = selectedCountryCode.replace(/\D/g, "");
                              if (digits.startsWith(codeDigits)) {
                                digits = digits.slice(codeDigits.length);
                              }
                              const formatted = formatPhoneDigits(digits, selectedCountryCode);
                              const fullPhone = formatted ? `${selectedCountryCode} ${formatted}` : "";
                              
                              setFormData((prev) => ({ ...prev, phone: fullPhone }));
                              if (formErrors.phone) {
                                setFormErrors((prev) => {
                                  const copy = { ...prev };
                                  delete copy.phone;
                                  return copy;
                                });
                              }
                            }}
                            placeholder={selectedCountryCode === "+55" ? "(XX) X XXXX-XXXX" : "(XXX) XXX-XXXX"}
                            className={`flex-1 min-w-0 px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-655 transition-colors ${
                              formErrors.phone ? "border-red-500/50" : "border-zinc-800"
                            }`}
                          />
                        </div>
                        {formErrors.phone && <span className="text-[10px] text-red-500">{formErrors.phone}</span>}
                      </div>

                      {/* Data */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="eventDate" className="text-xs uppercase tracking-widest text-zinc-400 font-medium flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gold-400/70" />
                          {eventType === 'aniversario' ? 'Data do Aniversário' : eventType === 'revelacao' ? 'Data da Revelação' : 'Data do Casamento'}
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white transition-colors [color-scheme:dark] ${
                            formErrors.eventDate ? "border-red-500/50" : "border-zinc-800"
                          }`}
                        />
                        {formErrors.eventDate && <span className="text-[10px] text-red-500">{formErrors.eventDate}</span>}
                      </div>

                      {/* Local */}
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label htmlFor="location" className="text-xs uppercase tracking-widest text-zinc-400 font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gold-400/70" />
                          Local do Casamento (Cidade / Espaço)
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Ex: Haras Albar, Campinas - SP"
                          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-655 transition-colors ${
                            formErrors.location ? "border-red-500/50" : "border-zinc-800"
                          }`}
                        />
                        {formErrors.location && <span className="text-[10px] text-red-500">{formErrors.location}</span>}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Como Conheceu */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                          Como conheceu a Rooster Films? *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-1">
                          {["Instagram", "YouTube", "Google", "Indicação", "Outro"].map((option) => (
                            <label
                              key={option}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border bg-black/25 cursor-pointer transition-all ${
                                leadSource === option
                                  ? "border-gold-400 bg-gold-400/[0.03] text-gold-200"
                                  : "border-zinc-850 hover:border-zinc-700 text-zinc-400"
                              }`}
                            >
                              <input
                                type="radio"
                                name="leadSource"
                                value={option}
                                checked={leadSource === option}
                                onChange={() => {
                                  setLeadSource(option);
                                  if (formErrors.leadSource) {
                                    setFormErrors((prev) => {
                                      const copy = { ...prev };
                                      delete copy.leadSource;
                                      return copy;
                                    });
                                  }
                                }}
                                className="sr-only"
                              />
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center mb-1.5 ${
                                leadSource === option ? "border-gold-400" : "border-zinc-650"
                              }`}>
                                {leadSource === option && <div className="h-2 w-2 rounded-full bg-gold-400" />}
                              </div>
                              <span className="text-xs font-light">{option}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors.leadSource && <span className="text-[10px] text-red-500 mt-1">{formErrors.leadSource}</span>}
                      </div>

                      {/* Quem Indicou */}
                      <AnimatePresence>
                        {leadSource === "Indicação" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-2 overflow-hidden text-left"
                          >
                            <label htmlFor="referredBy" className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                              Quem indicou a Rooster Films? *
                            </label>
                            <input
                              type="text"
                              id="referredBy"
                              value={referredBy}
                              onChange={(e) => {
                                setReferredBy(e.target.value);
                                if (formErrors.referredBy) {
                                  setFormErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.referredBy;
                                    return copy;
                                  });
                                }
                              }}
                              placeholder="Nome da pessoa"
                              className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-600 transition-colors ${
                                formErrors.referredBy ? "border-red-500/50" : "border-zinc-800"
                              }`}
                            />
                            {formErrors.referredBy && <span className="text-[10px] text-red-500">{formErrors.referredBy}</span>}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Observações */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-xs uppercase tracking-widest text-zinc-400 font-medium block">
                          Observações
                        </label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          placeholder="Conte um pouco sobre o evento, estilo desejado ou detalhes importantes que gostaria de compartilhar."
                          className="w-full px-4 py-3 bg-black/40 border border-zinc-850 rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-650 transition-colors resize-none custom-scrollbar-thin"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wizard Navigation Buttons */}
                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                  {formStep === 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsFormModalOpen(false)}
                        className="px-6 py-3 rounded-full border border-zinc-850 text-zinc-400 hover:text-white transition-all text-xs tracking-wider uppercase font-semibold cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black transition-all text-xs tracking-wider uppercase font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        Continuar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-6 py-3 rounded-full border border-zinc-850 text-zinc-400 hover:text-white transition-all text-xs tracking-wider uppercase font-semibold cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black transition-all text-xs tracking-wider uppercase font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 fill-current" />
                            Gerar e Baixar Proposta
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Confirmation Screen Modal */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black backdrop-blur-md overflow-y-auto p-4 md:p-12 flex justify-center items-start"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl glass-panel border-gold-400/20 rounded-2xl p-6 md:p-12 shadow-2xl z-10 my-8 overflow-hidden"
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold-400/5 rounded-full filter blur-[80px] pointer-events-none" />

              {/* Status Header */}
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="h-16 w-16 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-300 mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-3xl md:text-5xl text-white font-light mb-4">
                  Recebemos sua solicitação.
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Estamos animados para conhecer a história de vocês.
                </p>
                {proposalDetails?.mockMode && (
                  <div className="text-center mt-3">
                    <span className="inline-block text-gold-300 text-[10px] uppercase tracking-wider bg-gold-950/40 px-3 py-1.5 border border-gold-900/30 rounded-lg">
                      [Modo Desenvolvimento] E-mails gerados no console do terminal. O PDF foi baixado com sucesso.
                    </span>
                  </div>
                )}
              </div>

              {/* Grid content: Left columns for summary, Right column for timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-10">
                
                {/* Left Side: Summary Card */}
                <div className="bg-black/50 border border-zinc-900 rounded-xl p-6 flex flex-col justify-between gap-4 h-full">
                  <div>
                    <h4 className="font-serif text-base text-gold-200 tracking-wider font-semibold border-b border-zinc-900 pb-3 uppercase">
                      Resumo do Orçamento
                    </h4>
                    <div className="flex flex-col gap-3 text-xs text-zinc-400 mt-4">
                      <p className="flex justify-between border-b border-zinc-900/50 pb-2">
                        <strong>Cliente:</strong> <span className="text-zinc-200 font-medium">{formData.name}</span>
                      </p>
                      <p className="flex justify-between border-b border-zinc-900/50 pb-2">
                        <strong>Data:</strong> <span className="text-zinc-200 font-medium">{formData.eventDate ? new Date(formData.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : ""}</span>
                      </p>
                      <p className="flex justify-between border-b border-zinc-900/50 pb-2">
                        <strong>Local / Cidade:</strong> <span className="text-zinc-200 font-medium">{formData.location}</span>
                      </p>
                      <p className="flex justify-between border-b border-zinc-900/50 pb-2">
                        <strong>Experiência Escolhida:</strong> <span className="text-zinc-200 font-medium">{coverageProfile.title}</span>
                      </p>
                      <p className="flex justify-between border-b border-zinc-900/50 pb-2">
                        <strong>Itens Selecionados:</strong> <span className="text-zinc-200 font-medium">{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(true)}
                      className="w-full py-2.5 rounded-lg border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-350 hover:text-gold-200 text-[10px] tracking-widest uppercase font-semibold transition-all cursor-pointer"
                    >
                      Ver detalhes completos
                    </button>

                    <div className="border-t border-zinc-900 pt-4 flex justify-between items-baseline">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-450 font-medium">Total Estimado</span>
                      <span className="text-gold-300 font-medium text-2xl whitespace-nowrap">R$&nbsp;{totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Visual Timeline of Next Steps */}
                <div className="bg-black/20 border border-zinc-900/60 rounded-xl p-6">
                  <h4 className="font-serif text-base text-gold-200 tracking-wider font-semibold border-b border-zinc-900 pb-3 mb-6 uppercase">
                    Próximos Passos
                  </h4>

                  <div className="flex flex-col gap-5 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-[1px] before:bg-zinc-800">
                    {[
                      { step: 1, title: "Solicitação recebida", desc: "A proposta personalizada em PDF foi baixada e enviada para seu e-mail.", active: true },
                      { step: 2, title: "Análise da disponibilidade da data", desc: "Nossa equipe irá verificar se a data simulada está livre em nossa agenda exclusiva.", active: false },
                      { step: 3, title: "Contato via WhatsApp", desc: "Enviaremos uma mensagem para alinhar detalhes ou agendar uma chamada.", active: false },
                      { step: 4, title: "Apresentação da proposta final", desc: "Caso queira ajustes ou personalizações, validaremos os oficiais.", active: false },
                      { step: 5, title: "Reserva da data", desc: "Assinatura do contrato digital e quitação do sinal garantem sua data.", active: false }
                    ].map((stepItem) => (
                      <div key={stepItem.step} className="flex gap-4 relative z-10 text-left">
                        {/* Indicator Circle */}
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                          stepItem.active 
                            ? "bg-gold-400 text-black border-transparent shadow shadow-gold-500/20"
                            : "bg-zinc-950 border border-zinc-800 text-zinc-500"
                        }`}>
                          {stepItem.step}
                        </div>
                        <div>
                          <h5 className={`text-xs font-semibold uppercase tracking-wider ${stepItem.active ? "text-gold-200" : "text-zinc-400"}`}>
                            {stepItem.title}
                          </h5>
                          <p className="text-[10.5px] text-zinc-500 font-light mt-1 leading-relaxed">
                            {stepItem.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Displacement warning (Tela de Confirmação) */}
              <div className="bg-black/30 border border-zinc-900 rounded-xl p-5 mb-10 text-left flex items-start gap-3.5 max-w-3xl mx-auto">
                <div className="h-8 w-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 flex-shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-[10px] tracking-widest text-gold-400 uppercase font-semibold mb-1">Logística & Deslocamento</h5>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    Os valores apresentados consideram eventos realizados em Sinop-MT. Caso o evento aconteça em outra cidade, poderão ser acrescentados custos de deslocamento, hospedagem e logística após análise da localização.
                  </p>
                </div>
              </div>

              {/* Call-to-actions */}
              <div className="flex gap-3 items-center justify-center w-full max-w-md mx-auto">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "Olá, acabei de montar meu orçamento no site da Rooster Films e gostaria de conversar sobre meu casamento."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-semibold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/10 active:scale-95 text-center"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.579 1.886 14.11 .86 11.5 1.86c-5.45 0-9.88 4.372-9.884 9.802-.001 1.77.487 3.5 1.414 5.016l-1.01 3.687 3.837-.998c1.52.885 3.037 1.344 4.544 1.344h.001zm11.376-7.728c-.3-.15-1.774-.875-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.39-1.24-2.33-2.77-2.6-3.22-.275-.45-.03-.7.105-.835.12-.12.275-.3.415-.45.14-.15.19-.25.285-.45.09-.2.045-.375-.023-.525-.067-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.008-.567-.008-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.116 4.52 1.325.575 2.19.78 2.946.9 1.11.175 2.12.125 2.915.01.888-.13 1.774-.725 2.025-1.388.25-.663.25-1.23.175-1.388-.075-.15-.275-.25-.575-.4z"/>
                  </svg>
                  Conversar Agora
                </a>

                <button
                  type="button"
                  onClick={handleShareProposal}
                  title="Compartilhar PDF"
                  aria-label="Compartilhar PDF"
                  className="w-12 h-12 rounded-full border border-gold-400/40 hover:border-gold-400 bg-black hover:bg-gold-400/5 text-gold-300 hover:text-gold-200 transition-all duration-300 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFormData({ name: "", email: "", phone: "", eventDate: "", location: "" });
                    setSelectedCountryCode("+55");
                    setSelectedItemIds(pricingItems.filter((i) => i.required).map((i) => i.id));
                  }}
                  title="Voltar ao início"
                  aria-label="Voltar ao início"
                  className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-all duration-300 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal (Selected services) */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-6 shadow-2xl overflow-hidden text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h4 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-3 mb-4 uppercase tracking-wider">
                Serviços Selecionados
              </h4>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar-thin mb-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-xs gap-3">
                    <span className="text-zinc-350 font-medium">{item.name}</span>
                    <span className="text-gold-300 font-semibold flex-shrink-0">
                      R$ {item.price.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>

              {packageDeduction > 0 && (
                <div className="flex justify-between items-center text-xs text-[#25D366] font-semibold uppercase tracking-wider bg-[#25D366]/5 p-2 rounded border border-[#25D366]/10 mb-4">
                  <span>Bônus do Pacote</span>
                  <span className="flex-shrink-0">- R$ {packageDeduction.toLocaleString("pt-BR")}</span>
                </div>
              )}

              <div className="border-t border-zinc-900 pt-4 flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest text-zinc-455 font-medium">Investimento Estimado</span>
                <span className="text-gold-300 font-medium text-lg whitespace-nowrap">
                  R$&nbsp;{totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-6 py-2 rounded-full bg-gold-400 hover:bg-gold-500 text-black text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] max-w-sm w-full bg-zinc-950/90 border border-gold-400/30 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3 text-left"
          >
            <Info className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-light text-zinc-200 leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-zinc-550 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// OptionCard Component for Grid selections
function OptionCard({
  item,
  isSelected,
  onToggle,
  isBlocked,
  badgeText,
}: {
  item: PricingItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isBlocked?: boolean;
  badgeText?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Background images map
  const itemImages: Record<string, string> = {
    pre_wedding_vid: "/Fotos/pre wwedding.jpg",
    captacao_cerimonia: "/Fotos/cerimonia 1.jpg",
    captacao_making_of: "/Fotos/making of.jpg",
    captacao_festa: "/Fotos/festa casamento foto.png",
    video_teaser: "/Fotos/teaser.jpg",
    video_filme_6_10: "/Fotos/6 - 10 min.jpg",
    video_filme_12_18: "/Fotos/12- 20 min.jpg",
    extra_same_day: "/Fotos/same day.png",
  };

  const bgImage = item.bg_image || itemImages[item.id];

  return (
    <div
      onClick={() => onToggle(item.id)}
      onMouseEnter={() => !isBlocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-5 rounded-xl border flex flex-col justify-between min-h-[130px] transition-all duration-300 relative overflow-hidden select-none ${
        isBlocked
          ? "border-zinc-800 bg-black/10 opacity-40 cursor-not-allowed"
          : isSelected
            ? "border-gold-400/40 bg-gold-400/[0.03] shadow-md shadow-gold-500/5 cursor-pointer"
            : "border-zinc-800/80 bg-black/20 hover:border-zinc-700/80 cursor-pointer"
      } ${item.required ? "cursor-default" : ""}`}
    >
      {/* Background Image with opacity */}
      {bgImage && (
        <div
          className={`absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 pointer-events-none ${
            isBlocked
              ? "opacity-0 scale-100"
              : isSelected && isHovered
                ? (item.id === "extra_same_day" ? "opacity-60 scale-110" : "opacity-25 scale-110")
                : isSelected 
                  ? (item.id === "extra_same_day" ? "opacity-55 scale-105" : "opacity-25 scale-105")
                  : isHovered 
                    ? (item.id === "extra_same_day" ? "opacity-55 scale-105" : "opacity-25 scale-105")
                    : "opacity-0 scale-100"
          }`}
          style={{ backgroundImage: `url("${bgImage}")` }}
        />
      )}
      {/* Dark Overlay to keep text legible */}
      {bgImage && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none ${
            item.id === "extra_same_day" ? "bg-black/45" : "bg-black/60"
          } ${
            !isBlocked && (isHovered || isSelected) ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Selection checkbox indicator */}
      <div className="flex justify-between items-start gap-4 relative z-20">
        <div>
          <h5 className={`text-sm font-semibold tracking-wide transition-colors ${
            isSelected ? "text-gold-200" : "text-zinc-200"
          }`}>
            {item.name}
            {item.required && <span className="text-[10px] text-gold-400 ml-1.5 italic font-normal">(Obrigatório)</span>}
          </h5>
          <p className={`text-xs font-light mt-1.5 leading-relaxed pr-2 transition-colors duration-300 ${
            isSelected ? "text-white" : "text-zinc-500"
          }`}>
            {item.description}
          </p>
        </div>
        
        {/* Rounded Checkmark or Blocked Badge */}
        {isBlocked ? (
          <span className="px-2 py-1 rounded bg-gold-400/10 border border-gold-400/20 text-[9px] text-gold-300 font-medium tracking-wider uppercase select-none shrink-0 whitespace-nowrap">
            {badgeText || "Requer mais cobertura"}
          </span>
        ) : (
          <div
            className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
              isSelected
                ? "bg-gold-400 border-transparent text-black"
                : "border-zinc-800 text-transparent"
            }`}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Price tag */}
      <div className="mt-4 pt-3 border-t border-zinc-900/50 flex justify-between items-center relative z-20">
        <span className="text-[10px] tracking-widest text-zinc-500 uppercase">Investimento</span>
        <span className={`text-sm font-semibold tracking-wide ${
          isSelected ? "text-gold-300" : "text-zinc-400"
        }`}>
          R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

// ExperienceIcon Component for customized coverage profiles
function ExperienceIcon({ name }: { name: string }) {
  if (name === "aliancas") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="12" r="5" />
        <circle cx="15" cy="12" r="5" />
      </svg>
    );
  }
  if (name === "tacas") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 3h5v5c0 1.5-1 3.5-2.5 4.5" />
        <path d="M18 3h-5v5c0 1.5 1 3.5 2.5 4.5" />
        <path d="M12 12v8m-3 0h6" />
        <path d="M8 6h8" />
      </svg>
    );
  }
  if (name === "rooster") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6-3 2-3-2 3-6z" />
        <path d="M5 10c2 2 4 5 7 5s5-3 7-5" />
        <path d="M12 15v7M8 22h8" />
      </svg>
    );
  }
  if (name === "estrela") {
    return (
      <svg className="h-5 w-5 text-gold-400 fill-gold-400/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (name === "livro") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  if (name === "claquete") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16" />
        <path d="M4 14h16" />
        <path d="M4 10h16" />
        <path d="M4 6h16" />
        <path d="M4 22V2h16v20H4z" />
        <path d="M7 2v4M11 2v4M15 2v4" />
      </svg>
    );
  }
  if (name === "relogio") {
    return (
      <svg className="h-5 w-5 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (name === "coracao") {
    return (
      <svg className="h-5 w-5 text-gold-400 fill-gold-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }
  return null;
}
