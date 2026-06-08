"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, ShieldCheck, Film } from "lucide-react";
import AdminTabs from "./AdminTabs";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } catch (err) {
      console.error("Error checking auth session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session || { user: { email } });
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro desconhecido ao tentar autenticar.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center font-light">
        <Loader2 className="h-8 w-8 text-gold-400 animate-spin mb-4" />
        <span className="text-sm text-zinc-500 uppercase tracking-widest">Carregando painel administrativo...</span>
      </div>
    );
  }

  if (session) {
    return (
      <AdminTabs session={session} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex items-center justify-center p-4 relative overflow-hidden font-light">
      {/* Cinematic Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-500/[0.02] rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold-500/[0.01] rounded-full filter blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border-zinc-900 rounded-2xl p-8 relative z-10 shadow-2xl">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full border border-gold-400/20 bg-gold-400/5 flex items-center justify-center text-gold-300 mx-auto mb-4">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl tracking-widest text-white uppercase font-light">
            ROOSTER FILMS
          </h1>
          <p className="text-[10px] tracking-[0.25em] text-gold-450 uppercase font-semibold mt-1">
            Painel Administrativo
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 font-normal leading-relaxed">
              {authError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              E-mail do Administrador
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rooster.com"
              className="w-full px-4 py-3 bg-black/40 border border-zinc-850 rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-700 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              Senha de Acesso
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/40 border border-zinc-850 rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-700 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/5 active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Acessar Painel
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[9px] text-zinc-600 font-light text-center mt-6 uppercase tracking-wider">
          Acesso exclusivo para administradores da Rooster Films.
        </p>
      </div>
    </div>
  );
}
