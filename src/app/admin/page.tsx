"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, ShieldCheck, Mail, ArrowLeft, Key } from "lucide-react";
import AdminTabs from "./AdminTabs";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot Password / Recovery States
  const [mode, setMode] = useState<"login" | "forgot" | "recovery">("login");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkSession();

    // Listen for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
    setSuccessMessage("");

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/admin",
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSuccessMessage("Link de recuperação enviado com sucesso! Verifique seu e-mail.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro ao tentar enviar o link de recuperação.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setSuccessMessage("");

    if (newPassword !== confirmNewPassword) {
      setAuthError("As senhas não coincidem.");
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSuccessMessage("Senha atualizada com sucesso!");
        // Wait 3 seconds and switch to login
        setTimeout(() => {
          setMode("login");
          setNewPassword("");
          setConfirmNewPassword("");
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro ao tentar atualizar a senha.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setMode("login");
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

  // If logged in and NOT in recovery mode, show dashboard
  if (session && mode !== "recovery") {
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
            {mode === "login" && <Lock className="h-5 w-5" />}
            {mode === "forgot" && <Mail className="h-5 w-5" />}
            {mode === "recovery" && <Key className="h-5 w-5" />}
          </div>
          <h1 className="font-serif text-2xl tracking-widest text-white uppercase font-light">
            ROOSTER FILMS
          </h1>
          <p className="text-[10px] tracking-[0.25em] text-gold-450 uppercase font-semibold mt-1">
            {mode === "login" && "Painel Administrativo"}
            {mode === "forgot" && "Recuperação de Senha"}
            {mode === "recovery" && "Definir Nova Senha"}
          </p>
        </div>

        {/* Auth status messages */}
        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 font-normal leading-relaxed mb-5 text-left">
            {authError}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400 font-normal leading-relaxed mb-5 text-left">
            {successMessage}
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5 text-left">
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
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setAuthError("");
                    setSuccessMessage("");
                  }}
                  className="text-[9px] uppercase tracking-wider text-gold-400 hover:text-gold-500 transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
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
        )}

        {/* 2. FORGOT PASSWORD MODE */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5 text-left">
            <p className="text-xs text-zinc-400 leading-relaxed font-light mb-2">
              Digite seu e-mail de administrador abaixo. Enviaremos um link para redefinir sua senha de acesso.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="resetEmail" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                E-mail do Administrador
              </label>
              <input
                type="email"
                id="resetEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rooster.com"
                className="w-full px-4 py-3 bg-black/40 border border-zinc-850 rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-700 transition-colors"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/5 active:scale-[0.98] disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Enviando link...
                  </>
                ) : (
                  "Enviar Link de Recuperação"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError("");
                  setSuccessMessage("");
                }}
                className="w-full py-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para o Login
              </button>
            </div>
          </form>
        )}

        {/* 3. RECOVERY MODE (PASSWORD RESET) */}
        {mode === "recovery" && (
          <form onSubmit={handleResetPassword} className="space-y-5 text-left">
            <p className="text-xs text-zinc-400 leading-relaxed font-light mb-2">
              Por favor, defina e confirme sua nova senha de acesso administrativo abaixo.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-black/40 border border-zinc-850 rounded-lg focus:outline-none focus:border-gold-400 text-sm text-white placeholder-zinc-700 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmNewPassword" className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                    Salvando senha...
                  </>
                ) : (
                  "Salvar Nova Senha"
                )}
              </button>
            </div>
          </form>
        )}

        <p className="text-[9px] text-zinc-600 font-light text-center mt-6 uppercase tracking-wider">
          Acesso exclusivo para administradores da Rooster Films.
        </p>
      </div>
    </div>
  );
}

