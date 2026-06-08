"use client";

import { useState, useEffect } from "react";
import { Film, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  eventType?: 'casamento' | 'aniversario' | 'revelacao';
}

export default function Header({ eventType = 'casamento' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Início", href: "#inicio" },
    { name: "Experiência", href: "#autoridade" },
    { name: "Portfólio", href: "#filmes" },
    { name: "Galeria", href: "#galeria" },
    { name: "O Processo", href: "#processo" },
    { name: "Depoimentos", href: "#depoimentos" },
    { name: "FAQ", href: "#faq" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Header height
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

  const getSubLabel = () => {
    if (eventType === 'aniversario') return 'Celebrations';
    if (eventType === 'revelacao') return 'Revelação';
    return 'Weddings';
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md py-4 border-b border-gold-400/10 shadow-lg shadow-black/20"
            : "bg-transparent py-6 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <img
              src="/Fotos/logotipo rooster weddings S FUNDO.png"
              alt="Rooster Weddings"
              className="h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-[0.25em] font-semibold text-gold-100 group-hover:text-gold-300 transition-colors">
                ROOSTER FILMS
              </span>
              <span className="text-[9px] tracking-[0.4em] text-gold-400 uppercase -mt-1">
                {getSubLabel()}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleScrollTo(e, item.href)}
                className="text-xs tracking-widest text-zinc-400 hover:text-gold-200 transition-colors uppercase font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <a
              href="#simulador"
              onClick={(e) => handleScrollTo(e, "#simulador")}
              className="inline-flex px-6 py-2.5 rounded-full border border-gold-400/30 text-gold-200 hover:text-black text-xs uppercase tracking-widest font-semibold bg-gold-400/5 hover:bg-gold-400 transition-all duration-300 shadow-md shadow-gold-500/5"
            >
              Simular Orçamento
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-zinc-400 hover:text-gold-300 p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 pt-28 px-6 lg:hidden flex flex-col justify-between pb-12"
          >
            <nav className="flex flex-col gap-6 items-center">
              {navItems.map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleScrollTo(e, item.href)}
                  className="text-base tracking-widest text-zinc-300 hover:text-gold-300 transition-colors uppercase font-medium"
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <a
                href="#simulador"
                onClick={(e) => handleScrollTo(e, "#simulador")}
                className="w-full max-w-xs text-center py-3.5 rounded-full bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs tracking-widest uppercase transition-colors shadow-lg shadow-gold-500/20"
              >
                Simular Orçamento
              </a>
              <span className="text-[10px] tracking-widest text-zinc-500 uppercase">
                contato@roosterfilms.com.br
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
