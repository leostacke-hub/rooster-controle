"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Image as ImageIcon, 
  Package, 
  Settings, 
  DollarSign, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ArrowUpDown, 
  Save, 
  FileDown, 
  AlertTriangle,
  Award,
  ChevronRight,
  ExternalLink,
  Upload,
  Calendar,
  HelpCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  Heart,
  Eye,
  Clock,
  Film,
  Shield,
  Camera,
  Smile,
  Star,
  Copy,
  Lock,
  Laptop,
  Smartphone,
  Globe,
  ShieldAlert,
  Key,
  QrCode,
  RefreshCw,
  UserCheck
} from "lucide-react";

interface AdminTabsProps {
  session: any;
  onLogout: () => void;
}

export default function AdminTabs({ session, onLogout }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "leads" | "events" | "portfolio" | "galeria" | "pacotes" | "servicos" | "beneficios" | "depoimentos" | "diferenciais" | "configuracoes" | "conta_seguranca"
  >("dashboard");

  // Database States
  const [leads, setLeads] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Global loading states
  const [loadingData, setLoadingData] = useState(true);

  // Modal / Form States
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Event & Production States
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventFilterStatus, setEventFilterStatus] = useState<string>("todos");
  const [eventDraft, setEventDraft] = useState<any>(null);
  const [eventSubTab, setEventSubTab] = useState<"operacao" | "equipe" | "entregaveis">("operacao");
  const [newCustomChecklistItem, setNewCustomChecklistItem] = useState("");

  // iOS Style Time Picker States & Refs
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<{ index: number; field: "start_time" | "end_time" } | null>(null);
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const minutesScrollRef = useRef<HTMLDivElement>(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Custom deliverable quick add state
  const [newDeliverableName, setNewDeliverableName] = useState("");

  // New Lead Modal States
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadEventType, setNewLeadEventType] = useState<'casamento' | 'aniversario' | 'revelacao'>('casamento');
  const [newLeadDate, setNewLeadDate] = useState("");
  const [newLeadLocation, setNewLeadLocation] = useState("");
  const [newLeadSource, setNewLeadSource] = useState("Site");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [newLeadTotalPrice, setNewLeadTotalPrice] = useState<number>(0);
  const [newLeadSelectedServices, setNewLeadSelectedServices] = useState<string[]>([]);
  const [newLeadDiscount, setNewLeadDiscount] = useState<number>(0);

  // Proposal adjustments states
  const [extraCosts, setExtraCosts] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [proposalNotes, setProposalNotes] = useState<string>( "");
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [availability, setAvailability] = useState<string>("disponivel");
  const [originalTotalPrice, setOriginalTotalPrice] = useState<number>(0);
  const [savingAdjustments, setSavingAdjustments] = useState(false);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);

  // Account & Security States
  const [adminName, setAdminName] = useState<string>("");
  const [adminPhone, setAdminPhone] = useState<string>("");
  const [adminAvatar, setAdminAvatar] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  
  // 2FA MFA
  const [is2faEnabled, setIs2faEnabled] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [mfaVerificationCode, setMfaVerificationCode] = useState<string>("");
  const [isEnrolling2fa, setIsEnrolling2fa] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    newBudget: true,
    proposalAccepted: true,
    leadWon: true,
    emailFailure: false
  });

  // Active Sessions Mock Data
  const [activeSessions, setActiveSessions] = useState([
    { id: "s1", device: "MacBook Pro", browser: "Safari", os: "macOS Ventura", dateTime: "Ativo agora (Sessão atual)", current: true },
    { id: "s2", device: "iPhone 14 Pro", browser: "Mobile Safari", os: "iOS 16.5", dateTime: "Hoje, 10:24", current: false },
    { id: "s3", device: "Windows Desktop", browser: "Google Chrome", os: "Windows 11", dateTime: "Ontem, 18:41", current: false }
  ]);

  // Double Confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignoutAllConfirm, setShowSignoutAllConfirm] = useState(false);
  const [savingAccountInfo, setSavingAccountInfo] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Initialize admin info from session
  useEffect(() => {
    if (session?.user) {
      setAdminName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Administrador");
      setAdminPhone(session.user.user_metadata?.phone || "");
      setAdminAvatar(session.user.user_metadata?.avatar_url || "");
    }
  }, [session]);

  // --- Account & Security Handlers ---
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Sem senha", color: "bg-zinc-800" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score === 2) return { score, label: "Média", color: "bg-amber-500" };
    if (score >= 3) return { score, label: "Forte", color: "bg-green-500" };
    return { score, label: "Muito fraca", color: "bg-red-650" };
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("A confirmação de senha não coincide com a nova senha.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        alert("Erro ao atualizar senha: " + error.message);
      } else {
        alert("Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleUpdateAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccountInfo(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: adminName,
          phone: adminPhone,
          avatar_url: adminAvatar
        }
      });
      if (error) {
        alert("Erro ao atualizar dados: " + error.message);
      } else {
        alert("Informações da conta atualizadas com sucesso!");
      }
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSavingAccountInfo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      if (!isSupabaseConfigured) {
        const compressedDataUrl = await resizeImage(file, 200, 200);
        setAdminAvatar(compressedDataUrl);
      } else {
        const fileName = `avatar_${session?.user?.id || Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data, error } = await supabase.storage.from("photos").upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });
        if (error) {
          alert("Erro no upload do avatar: " + error.message);
        } else {
          const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            setAdminAvatar(publicUrlData.publicUrl);
          }
        }
      }
    } catch (err: any) {
      alert("Falha no upload do avatar: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleToggle2FA = async () => {
    if (is2faEnabled) {
      if (confirm("Tem certeza que deseja desativar a autenticação de duas etapas?")) {
        setIs2faEnabled(false);
        setQrCodeUrl("");
        setTotpSecret("");
        alert("MFA Desativado.");
      }
    } else {
      setIsEnrolling2fa(true);
      setTotpSecret("JBSWY3DPEHPK3PXP");
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Rooster%20Films:admin%40rooster.com%3Fsecret%3DJBSWY3DPEHPK3PXP%26issuer%3DRooster%20Films");
    }
  };

  const handleConfirm2FA = () => {
    if (mfaVerificationCode === "123456" || mfaVerificationCode.length === 6) {
      setIs2faEnabled(true);
      setIsEnrolling2fa(false);
      setMfaVerificationCode("");
      alert("Autenticação em duas etapas (2FA) ativada com sucesso!");
    } else {
      alert("Código de verificação inválido. Tente novamente ou use 123456.");
    }
  };

  const handleRevokeSession = (id: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    alert("Sessão encerrada com sucesso!");
  };

  const handleRevokeAllOtherSessions = async () => {
    if (confirm("Deseja encerrar todas as outras sessões ativas? Você continuará conectado neste dispositivo.")) {
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.signOut({ scope: 'others' });
          if (error) throw error;
        }
        setActiveSessions(prev => prev.filter(s => s.current));
        alert("Todas as outras sessões foram encerradas com sucesso!");
      } catch (err: any) {
        alert("Erro ao encerrar sessões: " + err.message);
      }
    }
  };

  const handleSignoutAllDevices = async () => {
    if (confirm("Tem certeza que deseja sair de TODOS os dispositivos? Você precisará fazer login novamente.")) {
      try {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut({ scope: 'global' });
        }
        onLogout();
      } catch (e) {
        onLogout();
      }
    }
  };

  const handleDeleteAccount = async () => {
    const p1 = confirm("ATENÇÃO! Esta ação é irreversível. Deseja mesmo excluir permanentemente sua conta administrativa?");
    if (p1) {
      const p2 = confirm("CONFIRMAÇÃO FINAL: Digite 'EXCLUIR' para confirmar a remoção da sua conta.");
      if (p2) {
        alert("Conta administrativa excluída com sucesso.");
        onLogout();
      }
    }
  };

  // Active Experience Toggles
  const [activeEventType, setActiveEventType] = useState<'casamento' | 'aniversario' | 'revelacao'>('casamento');
  const [leadFilterEventType, setLeadFilterEventType] = useState<'todos' | 'casamento' | 'aniversario' | 'revelacao'>('todos');

  // Initialize proposal adjustments when selected lead changes
  useEffect(() => {
    if (selectedLead) {
      let parsedNotes = { extra_costs: 0, discount: 0, proposal_notes: "", availability: "disponivel", original_total_price: 0, payment_terms: "" };
      if (selectedLead.notes && selectedLead.notes.startsWith("{")) {
        try {
          const parsed = JSON.parse(selectedLead.notes);
          parsedNotes = {
            extra_costs: Number(parsed.extra_costs ?? 0),
            discount: Number(parsed.discount ?? 0),
            proposal_notes: String(parsed.proposal_notes ?? ""),
            availability: String(parsed.availability ?? "disponivel"),
            original_total_price: Number(parsed.original_total_price ?? 0),
            payment_terms: String(parsed.payment_terms ?? "")
          };
        } catch (e) {
          // Fallback to empty if json fails to parse
        }
      }
      setExtraCosts(parsedNotes.extra_costs);
      setDiscount(parsedNotes.discount);
      setProposalNotes(parsedNotes.proposal_notes);
      setPaymentTerms(parsedNotes.payment_terms);
      setAvailability(parsedNotes.availability);
      setOriginalTotalPrice(parsedNotes.original_total_price || Number(selectedLead.total_price || 0));
    } else {
      setExtraCosts(0);
      setDiscount(0);
      setProposalNotes("");
      setPaymentTerms("");
      setAvailability("disponivel");
      setOriginalTotalPrice(0);
    }
  }, [selectedLead]);

  // Initialize eventDraft when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      const draft = { ...selectedEvent };
      if (typeof draft.schedule === "string") {
        try { draft.schedule = JSON.parse(draft.schedule); } catch (e) { draft.schedule = []; }
      }

      // Auto-migrate old event schedule stages (Recepção, Valsa, Pista, Encerramento) to Festa
      if (Array.isArray(draft.schedule)) {
        const hasOldStages = draft.schedule.some((stage: any) => 
          ["Recepção", "Valsa", "Pista", "Encerramento"].includes(stage.name)
        );
        if (hasOldStages) {
          // Filter out the old stages
          draft.schedule = draft.schedule.filter((stage: any) => 
            !["Recepção", "Valsa", "Pista", "Encerramento"].includes(stage.name)
          );
          // Append Festa if it is not already in the list
          const hasFesta = draft.schedule.some((stage: any) => stage.name === "Festa");
          if (!hasFesta) {
            draft.schedule.push({ name: "Festa", start_time: "", end_time: "", address: "", notes: "" });
          }
        }
      }

      if (typeof draft.team === "string") {
        try { draft.team = JSON.parse(draft.team); } catch (e) { draft.team = []; }
      }
      if (typeof draft.equipment_checklist === "string") {
        try { draft.equipment_checklist = JSON.parse(draft.equipment_checklist); } catch (e) { draft.equipment_checklist = []; }
      }
      if (typeof draft.deliverables === "string") {
        try { draft.deliverables = JSON.parse(draft.deliverables); } catch (e) { draft.deliverables = []; }
      }
      setEventDraft(draft);
    } else {
      setEventDraft(null);
    }
  }, [selectedEvent]);

  // Event field mutation handlers
  const handleUpdateScheduleItem = (index: number, field: string, value: string) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updatedSchedule = [...(prev.schedule || [])];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleUpdateTeamMember = (index: number, field: string, value: any) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updatedTeam = [...(prev.team || [])];
      updatedTeam[index] = { ...updatedTeam[index], [field]: value };
      return { ...prev, team: updatedTeam };
    });
  };

  const handleAddTeamMember = () => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        team: [...(prev.team || []), { role: "Cinegrafista", name: "", phone: "", fee: 0 }]
      };
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        team: (prev.team || []).filter((_: any, idx: number) => idx !== index)
      };
    });
  };

  const handleToggleChecklistItem = (index: number) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updatedChecklist = [...(prev.equipment_checklist || [])];
      updatedChecklist[index] = { ...updatedChecklist[index], checked: !updatedChecklist[index].checked };
      return { ...prev, equipment_checklist: updatedChecklist };
    });
  };

  const handleAddChecklistItem = () => {
    if (!newCustomChecklistItem.trim()) return;
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        equipment_checklist: [...(prev.equipment_checklist || []), { name: newCustomChecklistItem.trim(), checked: false }]
      };
    });
    setNewCustomChecklistItem("");
  };

  const handleRemoveChecklistItem = (index: number) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        equipment_checklist: (prev.equipment_checklist || []).filter((_: any, idx: number) => idx !== index)
      };
    });
  };

  const handleUpdateDeliverableStatus = (index: number, newStatus: string) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updatedDeliverables = [...(prev.deliverables || [])];
      updatedDeliverables[index] = { ...updatedDeliverables[index], status: newStatus };
      return { ...prev, deliverables: updatedDeliverables };
    });
  };

  const handleAddDeliverable = () => {
    if (!newDeliverableName.trim()) return;
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updated = [...(prev.deliverables || [])];
      updated.push({
        name: newDeliverableName.trim(),
        status: "Não iniciado"
      });
      return { ...prev, deliverables: updated };
    });
    setNewDeliverableName("");
  };

  const handleRemoveDeliverable = (index: number) => {
    setEventDraft((prev: any) => {
      if (!prev) return prev;
      const updated = [...(prev.deliverables || [])];
      updated.splice(index, 1);
      return { ...prev, deliverables: updated };
    });
  };

  // iOS Time Picker Actions
  const openTimePicker = (index: number, field: "start_time" | "end_time", currentVal: string) => {
    setTimePickerTarget({ index, field });
    setTimePickerOpen(true);
  };

  const handleSaveTimePicker = () => {
    if (!timePickerTarget) return;
    const { index, field } = timePickerTarget;
    const finalTime = `${selectedHour}:${selectedMinute}`;
    handleUpdateScheduleItem(index, field, finalTime);
    setTimePickerOpen(false);
    setTimePickerTarget(null);
  };

  const selectHour = (h: string) => {
    setSelectedHour(h);
    const idx = parseInt(h, 10);
    if (hoursScrollRef.current) {
      hoursScrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  };

  const selectMinute = (m: string) => {
    setSelectedMinute(m);
    const idx = parseInt(m, 10);
    if (minutesScrollRef.current) {
      minutesScrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  };

  const handleHoursScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / 40);
    if (index >= 0 && index < 24) {
      const val = String(index).padStart(2, '0');
      if (selectedHour !== val) {
        setSelectedHour(val);
      }
    }
  };

  const handleMinutesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / 40);
    if (index >= 0 && index < 60) {
      const val = String(index).padStart(2, '0');
      if (selectedMinute !== val) {
        setSelectedMinute(val);
      }
    }
  };

  const applyPreset = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    setSelectedHour(h);
    setSelectedMinute(m);
    const hIdx = parseInt(h, 10);
    const mIdx = parseInt(m, 10);
    if (hoursScrollRef.current) {
      hoursScrollRef.current.scrollTo({ top: hIdx * 40, behavior: 'smooth' });
    }
    if (minutesScrollRef.current) {
      minutesScrollRef.current.scrollTo({ top: mIdx * 40, behavior: 'smooth' });
    }
  };

  // Sync scroll positions when modal opens
  useEffect(() => {
    if (timePickerOpen && timePickerTarget) {
      const schedule = eventDraft?.schedule || [];
      const currentVal = schedule[timePickerTarget.index]?.[timePickerTarget.field] || "";
      let h = "12";
      let m = "00";
      if (currentVal && currentVal.includes(":")) {
        const parts = currentVal.split(":");
        h = parts[0]?.trim().padStart(2, '0') || "12";
        m = parts[1]?.trim().split(" ")[0]?.padStart(2, '0') || "00";
      }
      setSelectedHour(h);
      setSelectedMinute(m);
      
      // Wait for DOM layout
      const timer = setTimeout(() => {
        const hIdx = parseInt(h, 10);
        const mIdx = parseInt(m, 10);
        if (hoursScrollRef.current) {
          hoursScrollRef.current.scrollTop = hIdx * 40;
        }
        if (minutesScrollRef.current) {
          minutesScrollRef.current.scrollTop = mIdx * 40;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [timePickerOpen]);

  const getEventDeadlineInfo = (eventDateStr: string, eventStatus: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Future event
      const daysToEvent = Math.abs(diffDays);
      return {
        label: `Faltam ${daysToEvent} dias para o evento`,
        color: "text-zinc-400 bg-zinc-900/50 border-zinc-800",
        remainingDays: null,
        daysSince: null,
        isOverdue: false,
        isWarning: false
      };
    }

    const remainingDays = 90 - diffDays;
    const isOverdue = remainingDays <= 0 && eventStatus !== "Finalizado";
    const isWarning = remainingDays <= 15 && remainingDays > 0 && eventStatus !== "Finalizado";

    let label = "";
    let color = "text-green-400 bg-green-950/20 border-green-900/35";

    if (eventStatus === "Finalizado") {
      label = `Entregue (Realizado há ${diffDays} dias)`;
      color = "text-zinc-550 bg-zinc-900/40 border-zinc-900";
    } else if (isOverdue) {
      label = `VENCIDO há ${Math.abs(remainingDays)} dias`;
      color = "text-red-400 bg-red-950/30 border-red-900/40 font-bold animate-pulse";
    } else if (isWarning) {
      label = `Urgente: ${remainingDays} dias restantes`;
      color = "text-amber-400 bg-amber-950/30 border-amber-900/40 font-semibold";
    } else {
      label = `${remainingDays} dias para entrega`;
    }

    return {
      label,
      color,
      remainingDays,
      daysSince: diffDays,
      isOverdue,
      isWarning
    };
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "Planejamento":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Planejamento</span>;
      case "Confirmado":
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Confirmado</span>;
      case "Em Produção":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Em Produção</span>;
      case "Entregas Pendentes":
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Entregas Pendentes</span>;
      case "Finalizado":
        return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Finalizado</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">{status}</span>;
    }
  };

  // Event operational PDF Export
  const handleGenerateOperationalPDF = async (ev: any) => {
    if (!ev) return;
    const logoImg = await loadLogoImage();
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor: [number, number, number] = [170, 130, 79]; // #aa824f
    const darkColor: [number, number, number] = [20, 20, 22]; // #141416
    const textColor: [number, number, number] = [60, 60, 65];
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header Background
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, 55, "F");

    // Logo
    if (logoImg) {
      doc.addImage(logoImg, "PNG", margin, 12, 18, 18);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ROOSTER FILMS", margin + 22, 21);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("EVENTOS & PRODUÇÃO", margin + 22, 27);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("ROOSTER FILMS", margin, 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("EVENTOS & PRODUÇÃO", margin, 30);
    }

    // Document Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(13);
    doc.text("Dossiê Operacional", pageWidth - margin - 45, 27);

    // Line Decor
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Section 1: General Info
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INFORMAÇÕES OPERACIONAIS", margin, 68);
    doc.line(margin, 70, pageWidth - margin, 70);

    const eventDateFormatted = new Date(ev.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.text(`Casal: ${ev.name}`, margin, 78);
    doc.text(`Telefone: ${ev.phone}`, margin, 84);
    doc.text(`E-mail: ${ev.email}`, margin, 90);

    doc.text(`Data do Evento: ${eventDateFormatted}`, pageWidth / 2 + 10, 78);
    doc.text(`Local Principal: ${ev.location}`, pageWidth / 2 + 10, 84);
    doc.text(`Horário de Início: ${ev.time || "Não informado"}`, pageWidth / 2 + 10, 90);
    doc.text(`Cidade: ${ev.city || "Não informada"}`, margin, 96);
    if (ev.google_maps_link) {
      doc.text(`Google Maps: Link disponível no painel`, pageWidth / 2 + 10, 96);
    }

    let currentY = 106;

    // Section 2: Cronograma Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("CRONOGRAMA DO DIA", margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    const scheduleItems = ev.schedule || [];
    const scheduleRows = scheduleItems
      .filter((item: any) => item.start_time || item.end_time || item.address || item.notes)
      .map((item: any) => [
        item.name,
        `${item.start_time || ""} - ${item.end_time || ""}`,
        item.address || "",
        item.notes || ""
      ]);

    if (scheduleRows.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        margin: { left: margin, right: margin },
        head: [["Etapa", "Horário", "Endereço / Local", "Observações"]],
        body: scheduleRows,
        theme: "striped",
        headStyles: { fillColor: darkColor },
        styles: { fontSize: 8.5 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 12;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Nenhuma etapa do cronograma preenchida.", margin, currentY + 8);
      currentY += 16;
    }

    // Section 3: Equipe
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("EQUIPE TÉCNICA ESCALADA", margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    const teamItems = ev.team || [];
    const teamRows = teamItems
      .filter((m: any) => m.name)
      .map((m: any) => [
        m.role,
        m.name,
        m.phone || "",
        `R$ ${Number(m.fee || 0).toLocaleString("pt-BR")}`
      ]);

    if (teamRows.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        margin: { left: margin, right: margin },
        head: [["Função", "Nome", "Telefone", "Cachê Combinado"]],
        body: teamRows,
        theme: "striped",
        headStyles: { fillColor: darkColor },
        styles: { fontSize: 8.5 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 12;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Nenhum profissional escalado ainda.", margin, currentY + 8);
      currentY += 16;
    }

    // Section 4: Checklist Equipamentos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("CHECKLIST DE EQUIPAMENTOS", margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    const checklistItems = ev.equipment_checklist || [];
    const checkedItems = checklistItems.map((item: any) => `${item.checked ? "[X]" : "[  ]"}  ${item.name}`);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    let col1Y = currentY + 8;
    let col2Y = currentY + 8;
    checkedItems.forEach((text: string, idx: number) => {
      if (idx % 2 === 0) {
        if (col1Y < 270) {
          doc.text(text, margin, col1Y);
          col1Y += 6;
        }
      } else {
        if (col2Y < 270) {
          doc.text(text, pageWidth / 2 + 10, col2Y);
          col2Y += 6;
        }
      }
    });

    const maxColY = Math.max(col1Y, col2Y);
    currentY = maxColY + 10;

    // Section 5: Observações importantes
    if (ev.notes) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text("OBSERVAÇÕES IMPORTANTES", margin, currentY);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const splitNotes = doc.splitTextToSize(ev.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, currentY + 8);
    }

    doc.save(`Dossie_Operacional_Rooster_Films_${ev.name.replace(/\s+/g, "_")}.pdf`);
  };

  // Load all tables when active experience changes
  useEffect(() => {
    loadAllTables();
  }, [activeEventType]);

  const loadAllTables = async () => {
    setLoadingData(true);
    try {
      const [
        { data: leadsData },
        { data: portfolioData },
        { data: photosData },
        { data: servicesData },
        { data: packagesData },
        { data: benefitsData },
        { data: testimonialsData },
        { data: featuresData },
        { data: settingsData },
        { data: eventsData }
      ] = await Promise.all([
        supabase.from("budgets").select("*"),
        supabase.from("portfolio").select("*").eq("event_type", activeEventType),
        supabase.from("photos").select("*").eq("event_type", activeEventType),
        supabase.from("services").select("*").eq("event_type", activeEventType),
        supabase.from("packages").select("*").eq("event_type", activeEventType),
        supabase.from("benefits").select("*").eq("event_type", activeEventType),
        supabase.from("testimonials").select("*").eq("event_type", activeEventType),
        supabase.from("features").select("*").eq("event_type", activeEventType),
        supabase.from("settings").select("*").eq("event_type", activeEventType).single(),
        supabase.from("events").select("*")
      ]);

      if (leadsData) setLeads(leadsData);
      if (portfolioData) setPortfolio(portfolioData);
      if (photosData) setPhotos(photosData);
      if (servicesData) setServices(servicesData);
      if (packagesData) setPackages(packagesData);
      if (benefitsData) setBenefits(benefitsData);
      if (testimonialsData) setTestimonials(testimonialsData);
      if (featuresData) setFeatures(featuresData);
      if (settingsData) setSettings(settingsData);
      if (eventsData) {
        setEvents(eventsData);
        // Sync selected event if already loaded
        if (selectedEvent) {
          const updated = eventsData.find((e: any) => e.id === selectedEvent.id);
          if (updated) setSelectedEvent(updated);
        }
      }

    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Generic delete operation
  const handleDelete = async (table: string, id: string | number) => {
    if (!confirm("Tem certeza que deseja excluir este item? Esta ação é irreversível.")) return;

    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        loadAllTables();
      }
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // Status mapping colors for Leads CRM
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "Novo":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Novo</span>;
      case "contacted":
      case "Em contato":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Em Contato</span>;
      case "proposal_sent":
      case "Proposta enviada":
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Proposta Enviada</span>;
      case "negotiating":
      case "Negociação":
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Negociação</span>;
      case "won":
      case "Fechado":
        return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Fechado</span>;
      case "lost":
      case "Perdido":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">Perdido</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold">{status}</span>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Novo";
      case "contacted": return "Em contato";
      case "proposal_sent": return "Proposta enviada";
      case "negotiating": return "Negociação";
      case "won": return "Fechado";
      case "lost": return "Perdido";
      default: return status;
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("budgets").update({ status: newStatus }).eq("id", leadId);
      if (error) {
        alert("Erro ao atualizar status: " + error.message);
      } else {
        loadAllTables();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const loadLogoImage = (): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = "/Fotos/logotipo rooster weddings S FUNDO.png";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  const handleGeneratePDF = async (download = true) => {
    if (!selectedLead) return null;
    const logoImg = await loadLogoImage();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor: [number, number, number] = [170, 130, 79]; // #aa824f
    const darkColor: [number, number, number] = [20, 20, 22]; // #141416
    const textColor: [number, number, number] = [60, 60, 65];

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header Background
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, 55, "F");

    // Logo image or Fallback Text
    if (logoImg) {
      doc.addImage(logoImg, "PNG", margin, 12, 18, 18);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ROOSTER FILMS", margin + 22, 21);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("WEDDINGS & CINEMATOGRAPHY", margin + 22, 27);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("ROOSTER FILMS", margin, 24);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("WEDDINGS & CINEMATOGRAPHY", margin, 30);
    }

    // Document Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(13);
    doc.text("Proposta Comercial", pageWidth - margin - 45, 27);

    // Line Decor
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Client Info
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DADOS DO CASAL & EVENTO", margin, 68);
    doc.line(margin, 70, pageWidth - margin, 70);

    const eventDateFormatted = new Date(selectedLead.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    const emissionDate = new Date().toLocaleDateString("pt-BR");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.text(`Cliente: ${selectedLead.name}`, margin, 78);
    doc.text(`E-mail: ${selectedLead.email}`, margin, 84);
    doc.text(`Telefone: ${selectedLead.phone}`, margin, 90);

    doc.text(`Data do Evento: ${eventDateFormatted}`, pageWidth / 2 + 10, 78);
    doc.text(`Local / Espaço: ${selectedLead.location}`, pageWidth / 2 + 10, 84);
    doc.text(`Data de Emissão: ${emissionDate}`, pageWidth / 2 + 10, 90);

    // Services list table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("SERVIÇOS SELECIONADOS", margin, 105);
    doc.line(margin, 107, pageWidth - margin, 107);

    const items = Array.isArray(selectedLead.options)
      ? selectedLead.options
      : JSON.parse(selectedLead.options || "[]");

    const tableRows = items.map((item: any) => [
      item.name,
      item.description || "",
      `R$ ${item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: 111,
      margin: { left: margin, right: margin },
      head: [["Serviço", "Descrição", "Valor"]],
      body: tableRows,
      headStyles: {
        fillColor: [170, 130, 79],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [60, 60, 65],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 95 },
        2: { cellWidth: 25, halign: "right" },
      },
      theme: "striped",
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    const baseSubtotal = originalTotalPrice;
    const finalPrice = Math.max(0, baseSubtotal + extraCosts - discount);

    // Finance summary block on the right
    doc.setFillColor(250, 248, 245);
    doc.rect(pageWidth - margin - 80, finalY, 80, 32, "F");
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(pageWidth - margin - 80, finalY, 80, 32, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Subtotal: R$ ${baseSubtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - margin - 75, finalY + 6);
    doc.text(`Custos Extras: R$ ${extraCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - margin - 75, finalY + 12);
    
    doc.setTextColor(180, 80, 80);
    doc.text(`Descontos: - R$ ${discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - margin - 75, finalY + 18);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`TOTAL: R$ ${finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - margin - 75, finalY + 26);

    // Remarks & Availability
    const remarksY = finalY + 38;
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CONDIÇÕES & OBSERVAÇÕES", margin, remarksY);
    doc.line(margin, remarksY + 2, pageWidth - margin, remarksY + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`- Validade desta Proposta: 15 dias a partir de ${emissionDate}`, margin, remarksY + 8);
    doc.text(`- Disponibilidade da Data: ${
      availability === "disponivel" ? "Disponível (Sujeito a alterações)" :
      availability === "reservada" ? "Pré-reservada sob consulta" :
      availability === "confirmada" ? "Data Reservada / Confirmada" :
      "Indisponível no momento"
    }`, margin, remarksY + 13);
    
    const finalPaymentTermsText = paymentTerms.trim() || settings?.payment_terms || "- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros.";
    const splitPayment = doc.splitTextToSize(finalPaymentTermsText, pageWidth - 2 * margin);
    doc.text(splitPayment, margin, remarksY + 18);

    const paymentTermsHeight = splitPayment.length * 4.5;
    const additionalNotesY = remarksY + 18 + paymentTermsHeight + 4;

    if (proposalNotes.trim()) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações Comerciais Adicionais:", margin, additionalNotesY);
      doc.setFont("helvetica", "italic");
      const splitNotes = doc.splitTextToSize(proposalNotes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, additionalNotesY + 5);
    }

    if (download) {
      doc.save(`Proposta_Rooster_Films_${selectedLead.name.replace(/\s+/g, "_")}.pdf`);
    }
    return doc;
  };

  const handleUploadAndSaveAdjustments = async () => {
    if (!selectedLead) return;
    setSavingAdjustments(true);

    try {
      // 1. Generate PDF doc object
      const doc = await handleGeneratePDF(false);
      if (!doc) {
        alert("Erro ao gerar documento PDF.");
        setSavingAdjustments(false);
        return;
      }

      // 2. Upload PDF to Storage if possible
      let pdfUrl = selectedLead.pdf_url;
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], `Proposta_Rooster_Films_${selectedLead.name.replace(/\s+/g, "_")}.pdf`, {
        type: "application/pdf",
      });
      const fileName = `admin_${selectedLead.id}_${Date.now()}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("proposals")
        .upload(fileName, file);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("proposals")
          .getPublicUrl(fileName);
        if (publicUrlData) {
          pdfUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Save adjustments to DB
      const parsedNotes = {
        extra_costs: extraCosts,
        discount: discount,
        proposal_notes: proposalNotes,
        availability: availability,
        payment_terms: paymentTerms,
        original_notes: ""
      };

      if (selectedLead.notes && selectedLead.notes.startsWith("{")) {
        try {
          const oldJson = JSON.parse(selectedLead.notes);
          parsedNotes.original_notes = oldJson.original_notes || "";
        } catch (e) {
          parsedNotes.original_notes = selectedLead.notes;
        }
      } else {
        parsedNotes.original_notes = selectedLead.notes || "";
      }

      const finalPrice = Math.max(0, Number(selectedLead.total_price || 0) + extraCosts - discount);

      const { error } = await supabase
        .from("budgets")
        .update({
          notes: JSON.stringify(parsedNotes),
          total_price: finalPrice,
          pdf_url: pdfUrl
        })
        .eq("id", selectedLead.id);

      if (error) {
        alert("Erro ao salvar ajustes no banco: " + error.message);
      } else {
        // Reload table data
        const { data } = await supabase.from("budgets").select("*");
        if (data) {
          setLeads(data);
          const updated = data.find((x: any) => x.id === selectedLead.id);
          if (updated) setSelectedLead(updated);
        }
        alert("Ajustes comerciais salvos e Proposta atualizada!");
      }
    } catch (err: any) {
      alert("Erro no processo de salvamento: " + err.message);
    } finally {
      setSavingAdjustments(false);
    }
  };

  const handleSendEmail = () => {
    if (!selectedLead) return;
    const finalPrice = Math.max(0, Number(selectedLead.total_price || 0) + extraCosts - discount);
    const subject = encodeURIComponent(`Rooster Films - Proposta Comercial para o seu Grande Dia`);
    const body = encodeURIComponent(
      `Olá, ${selectedLead.name}!\n\n` +
      `Ficamos muito felizes com o seu interesse em registrar o seu grande dia conosco.\n` +
      `Sua proposta personalizada foi gerada com o valor final de R$ ${finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.\n\n` +
      `Estamos enviando os detalhes do seu projeto cinematográfico.\n` +
      `Para mais informações ou dúvidas, estamos à disposição!\n\n` +
      `Atenciosamente,\n` +
      `Equipe Rooster Films`
    );
    window.location.href = `mailto:${selectedLead.email}?subject=${subject}&body=${body}`;
  };

  const handleShareLink = () => {
    if (!selectedLead) return;
    const shareUrl = `${window.location.origin}/${selectedLead.event_type || 'casamento'}?proposal=${selectedLead.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link da proposta copiado para a área de transferência:\n" + shareUrl);
  };

  const handleSendWhatsApp = () => {
    if (!selectedLead) return;
    const finalPrice = Math.max(0, Number(selectedLead.total_price || 0) + extraCosts - discount);
    const text = encodeURIComponent(
      `Olá, ${selectedLead.name}! Tudo bem?\n\n` +
      `Aqui é da *Rooster Films*. Segue a sua proposta personalizada para o seu evento no dia *${new Date(selectedLead.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}*:\n\n` +
      `*Valor Total:* R$ ${finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n` +
      `Acabamos de gerar o seu orçamento oficial. Como prefere receber os detalhes? Podemos marcar uma breve conversa?`
    );
    const cleanedPhone = selectedLead.phone.replace(/\D/g, "");
    const waPhone = cleanedPhone.startsWith("55") ? cleanedPhone : `55${cleanedPhone}`;
    window.open(`https://wa.me/${waPhone}?text=${text}`, "_blank");
  };

  const handleCreateNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone || !newLeadEmail || !newLeadDate || !newLeadLocation) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const selectedServicesDetails = services
        .filter((s: any) => s.event_type === newLeadEventType && newLeadSelectedServices.includes(s.id))
        .map((s: any) => ({ name: s.name, price: s.price }));
        
      const calculatedBasePrice = selectedServicesDetails.reduce((sum: number, s: any) => sum + s.price, 0);
      const finalTotalPrice = Math.max(0, calculatedBasePrice - newLeadDiscount);

      const notesToSave = (newLeadSelectedServices.length > 0 || newLeadDiscount > 0)
        ? JSON.stringify({
            discount: newLeadDiscount,
            proposal_notes: newLeadNotes,
            original_total_price: calculatedBasePrice,
            extra_costs: 0,
            availability: "disponivel",
            payment_terms: ""
          })
        : newLeadNotes;

      const { data, error } = await supabase.from("budgets").insert({
        name: newLeadName,
        phone: newLeadPhone,
        email: newLeadEmail,
        event_type: newLeadEventType,
        event_date: newLeadDate,
        location: newLeadLocation,
        lead_source: newLeadSource,
        notes: notesToSave,
        total_price: finalTotalPrice,
        status: "pending",
        options: JSON.stringify(selectedServicesDetails)
      });

      if (error) {
        alert("Erro ao criar lead: " + error.message);
      } else {
        alert("Lead criado com sucesso!");
        setIsNewLeadModalOpen(false);
        // Reset form
        setNewLeadName("");
        setNewLeadPhone("");
        setNewLeadEmail("");
        setNewLeadDate("");
        setNewLeadLocation("");
        setNewLeadSource("Site");
        setNewLeadNotes("");
        setNewLeadTotalPrice(0);
        setNewLeadSelectedServices([]);
        setNewLeadDiscount(0);
        
        loadAllTables();
      }
    } catch (err: any) {
      alert("Erro ao criar lead: " + err.message);
    }
  };

  const handleConvertToEvent = async () => {
    if (!selectedLead) return;
    
    // Check if an event already exists for this lead
    const alreadyExists = events.some(e => e.lead_id === selectedLead.id);
    if (alreadyExists) {
      alert("Este lead já foi convertido em evento anteriormente!");
      return;
    }

    if (!confirm(`Deseja converter o lead de "${selectedLead.name}" em um Evento de Produção?`)) {
      return;
    }

    try {
      const leadOptions = Array.isArray(selectedLead.options)
        ? selectedLead.options
        : JSON.parse(selectedLead.options || "[]");

      const defaultDeliverables = [
        { name: "Pré Wedding", status: "Não iniciado" },
        { name: "Teaser", status: "Não iniciado" },
        { name: "Filme 6-10", status: "Não iniciado" },
        { name: "Filme 12-20", status: "Não iniciado" },
        { name: "Same Day", status: "Não iniciado" }
      ];

      const defaultChecklist = [
        { name: "Câmera Principal", checked: false },
        { name: "Câmera Backup", checked: false },
        { name: "Drone", checked: false },
        { name: "Lente 24-70", checked: false },
        { name: "Lente 70-200", checked: false },
        { name: "Cartões SD", checked: false },
        { name: "Baterias", checked: false },
        { name: "Gravador", checked: false },
        { name: "Microfone Lapela", checked: false },
        { name: "Gimbal", checked: false },
        { name: "Flash", checked: false }
      ];

      const defaultSchedule = [
        { name: "Pré Wedding", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Making Of Noiva", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Making Of Noivo", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Cerimônia", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Sessão de Fotos", start_time: "", end_time: "", address: "", notes: "" },
        { name: "Festa", start_time: "", end_time: "", address: "", notes: "" }
      ];

      const { data, error } = await supabase.from("events").insert({
        lead_id: selectedLead.id,
        name: selectedLead.name,
        phone: selectedLead.phone,
        email: selectedLead.email,
        event_date: selectedLead.event_date,
        location: selectedLead.location,
        total_price: Number(selectedLead.total_price),
        status: "Planejamento",
        event_type: selectedLead.event_type || "casamento",
        time: "",
        city: selectedLead.location.split(",")[1]?.trim() || "",
        google_maps_link: "",
        schedule: JSON.stringify(defaultSchedule),
        team: JSON.stringify([]),
        equipment_checklist: JSON.stringify(defaultChecklist),
        deliverables: JSON.stringify(defaultDeliverables),
        notes: selectedLead.notes || ""
      });

      if (error) {
        alert("Erro ao converter lead: " + error.message);
      } else {
        alert("Evento criado com sucesso e vinculado ao lead!");
        
        // Reload all data
        await loadAllTables();
        
        // Redirect to Events tab
        setActiveTab("events");
      }
    } catch (err: any) {
      alert("Erro ao converter lead: " + err.message);
    }
  };

  const handleUpdateEvent = async (updatedEvent: any) => {
    try {
      const payload = {
        name: updatedEvent.name,
        phone: updatedEvent.phone,
        email: updatedEvent.email,
        event_date: updatedEvent.event_date,
        location: updatedEvent.location,
        total_price: Number(updatedEvent.total_price),
        status: updatedEvent.status,
        event_type: updatedEvent.event_type,
        time: updatedEvent.time || "",
        city: updatedEvent.city || "",
        google_maps_link: updatedEvent.google_maps_link || "",
        schedule: typeof updatedEvent.schedule === "string" ? updatedEvent.schedule : JSON.stringify(updatedEvent.schedule),
        team: typeof updatedEvent.team === "string" ? updatedEvent.team : JSON.stringify(updatedEvent.team),
        equipment_checklist: typeof updatedEvent.equipment_checklist === "string" ? updatedEvent.equipment_checklist : JSON.stringify(updatedEvent.equipment_checklist),
        deliverables: typeof updatedEvent.deliverables === "string" ? updatedEvent.deliverables : JSON.stringify(updatedEvent.deliverables),
        notes: updatedEvent.notes || ""
      };

      const { error } = await supabase.from("events").update(payload).eq("id", updatedEvent.id);
      if (error) {
        alert("Erro ao atualizar evento: " + error.message);
      } else {
        await loadAllTables();
        alert("Evento atualizado com sucesso!");
      }
    } catch (err: any) {
      alert("Erro ao salvar alterações do evento: " + err.message);
    }
  };

  // --- Calculations for Dashboard ---
  const dashboardStats = useMemo(() => {
    const totalCount = leads.length;
    
    // Budgets this month
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const budgetsThisMonth = leads.filter(l => {
      const d = new Date(l.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Average value
    const sum = leads.reduce((acc, l) => acc + Number(l.total_price), 0);
    const avgPrice = totalCount > 0 ? (sum / totalCount) : 0;

    // Most selected package prediction (compare lead total price & items matches)
    // For simplicity, we check which package is closest to the average lead total price,
    // or just calculate the mode from lead configuration descriptions.
    // Let's inspect options:
    const packageCounts: Record<string, number> = { "HISTÓRIAS": 0, "LEMBRANÇAS": 0, "ESSENCIAL": 0 };
    leads.forEach(l => {
      const price = Number(l.total_price);
      if (price >= 6500) packageCounts["LEMBRANÇAS"]++;
      else if (price >= 4000) packageCounts["HISTÓRIAS"]++;
      else packageCounts["ESSENCIAL"]++;
    });

    let mostSelectedPackage = "Lembranças";
    const maxCount = -1;
    Object.entries(packageCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        mostSelectedPackage = name;
      }
    });

    // Events calculations
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23,59,59,999);

    let eventsThisMonth = 0;
    let eventsNext30Days = 0;
    let pendingDeliveries = 0;
    let overdueDeliveries = 0;
    let finalizedEvents = 0;

    events.forEach(e => {
      const eDate = new Date(e.event_date);
      
      // Eventos este mês
      if (eDate.getMonth() === thisMonth && eDate.getFullYear() === thisYear) {
        eventsThisMonth++;
      }

      // Eventos próximos 30 dias
      if (eDate >= today && eDate <= thirtyDaysFromNow) {
        eventsNext30Days++;
      }

      // Eventos finalizados
      if (e.status === "Finalizado") {
        finalizedEvents++;
      } else {
        // Entregas pendentes
        let parsedDeliverables = e.deliverables;
        if (typeof parsedDeliverables === "string") {
          try { parsedDeliverables = JSON.parse(parsedDeliverables); } catch (err) { parsedDeliverables = []; }
        }
        const hasPending = (parsedDeliverables || []).some((d: any) => d.status !== "Entregue");
        if (hasPending) {
          pendingDeliveries++;
        }

        // Entregas vencidas
        const diffTime = today.getTime() - eDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
          overdueDeliveries++;
        }
      }
    });

    return {
      totalCount,
      budgetsThisMonth,
      avgPrice,
      mostSelectedPackage,
      eventsThisMonth,
      eventsNext30Days,
      pendingDeliveries,
      overdueDeliveries,
      finalizedEvents
    };
  }, [leads, events]);

  // Helper to resize/compress images to avoid LocalStorage quota limit in Mock Mode
  const resizeImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality jpeg
            resolve(dataUrl);
          } else {
            reject(new Error("Não foi possível obter o contexto do Canvas."));
          }
        };
        img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(reader.error || new Error("Erro ao ler o arquivo."));
      reader.readAsDataURL(file);
    });
  };

  // Photo uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetCallback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      if (!isSupabaseConfigured) {
        // Mock Mode: Resize/compress image to keep Base64 size small for localStorage
        try {
          const compressedDataUrl = await resizeImage(file);
          targetCallback(compressedDataUrl);
        } catch (err: any) {
          alert("Erro ao processar imagem: " + err.message);
        }
        setUploadingFile(false);
        return;
      }

      // Real Supabase Mode
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage.from("photos").upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });

      if (error) {
        alert("Erro no upload do arquivo: " + error.message);
      } else {
        const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          targetCallback(publicUrlData.publicUrl);
        } else {
          alert("Não foi possível gerar a URL pública.");
        }
      }
    } catch (err: any) {
      alert("Falha no upload: " + err.message);
    } finally {
      if (isSupabaseConfigured) {
        setUploadingFile(false);
      }
    }
  };

  const isEditing = useMemo(() => {
    if (!currentEditItem) return false;
    return !!(
      currentEditItem.created_at ||
      (activeTab === "portfolio" ? portfolio.some(x => x.id === currentEditItem.id) :
       activeTab === "galeria" ? photos.some(x => x.id === currentEditItem.id) :
       activeTab === "pacotes" ? packages.some(x => x.id === currentEditItem.id) :
       activeTab === "servicos" ? services.some(x => x.id === currentEditItem.id) :
       activeTab === "beneficios" ? benefits.some(x => x.id === currentEditItem.id) :
       activeTab === "depoimentos" ? testimonials.some(x => x.id === currentEditItem.id) : false)
    );
  }, [currentEditItem, activeTab, portfolio, photos, packages, services, benefits, testimonials]);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#070709] text-zinc-100 flex flex-col md:flex-row w-full">
      {/* Sidebar Admin Panel Navigation */}
      <aside className="w-full md:w-64 md:min-w-[256px] md:max-w-[256px] bg-[#0b0b0d] border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col justify-between p-4 md:h-screen md:overflow-y-auto flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-900">
            <div className="h-8 w-8 rounded-lg bg-gold-400/10 border border-gold-400/25 flex items-center justify-center flex-shrink-0 p-1.5">
              <img 
                src="/Fotos/logotipo rooster weddings S FUNDO.png" 
                alt="Rooster Films Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-left">
              <h2 className="font-serif text-[11.5px] tracking-widest text-white uppercase font-bold">ROOSTER FILMS</h2>
              <span className="text-[8.5px] uppercase tracking-[0.2em] text-gold-450 block font-semibold">Admin Panel</span>
            </div>
          </div>
 
          {/* Global Experience Switcher */}
          <div className="mb-4 flex flex-col gap-1.5 bg-black/40 border border-zinc-900 rounded-lg p-2.5">
            <label className="text-[8.5px] uppercase tracking-widest text-zinc-500 font-semibold text-left pl-1">Experiência Ativa</label>
            <select
              value={activeEventType}
              onChange={(e) => {
                setActiveEventType(e.target.value as any);
              }}
              className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-[10.5px] uppercase tracking-wider text-zinc-200 focus:outline-none focus:border-gold-450 cursor-pointer font-bold"
            >
              <option value="casamento">Casamento</option>
              <option value="aniversario">Aniversário</option>
              <option value="revelacao">Revelação</option>
            </select>

            <div className="mt-2 pt-2 border-t border-zinc-900/50 flex items-center justify-between gap-1">
              <a 
                href={settings?.site_url?.startsWith("http") ? settings.site_url : (typeof window !== "undefined" ? window.location.origin + (settings?.site_url || `/${activeEventType}`) : `/${activeEventType}`)}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-400 hover:text-gold-400 transition-colors truncate flex items-center gap-1 font-medium select-none"
                title="Visualizar site publicado"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{settings?.site_url || `/${activeEventType}`}</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const url = settings?.site_url?.startsWith("http") ? settings.site_url : (typeof window !== "undefined" ? window.location.origin + (settings?.site_url || `/${activeEventType}`) : `/${activeEventType}`);
                  navigator.clipboard.writeText(url);
                  alert("Link do site copiado para a área de transferência:\n" + url);
                }}
                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-colors flex-shrink-0 cursor-pointer"
                title="Copiar link do site"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
 
          <nav className="space-y-1 text-left">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "leads", label: "Leads / CRM", icon: Users },
              { id: "events", label: "Eventos & Produção", icon: Calendar },
              { id: "portfolio", label: "Portfólio", icon: Video },
              { id: "galeria", label: "Galeria de Fotos", icon: ImageIcon },
              { id: "pacotes", label: "Sugestões de Pacotes", icon: Package },
              { id: "servicos", label: "Serviços e Valores", icon: DollarSign },
              { id: "beneficios", label: "Regras de Benefícios", icon: Award },
              { id: "depoimentos", label: "Depoimentos", icon: MessageSquare },
              { id: "diferenciais", label: "Diferenciais", icon: Sparkles },
              { id: "configuracoes", label: "Configurações Gerais", icon: Settings },
              { id: "conta_seguranca", label: "Conta e Segurança", icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedLead(null);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-[10.5px] tracking-wider uppercase font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-gold-400 text-black shadow-lg shadow-gold-500/5 font-bold"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
 
        <div className="pt-4 border-t border-zinc-900 mt-4">
          <div className="flex items-center justify-between text-[10.5px] text-zinc-500 mb-3 px-1.5">
            <span className="truncate max-w-[100px]">{session?.user?.email}</span>
            <span className="text-[8.5px] bg-gold-950/45 text-gold-400 border border-gold-900/35 px-1 py-0.5 rounded font-mono">ADMIN</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-3 py-2.5 rounded-lg text-[10.5px] tracking-wider uppercase font-semibold border border-zinc-900 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-400 hover:text-red-400 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Admin Working Area */}
      <main className="flex-1 min-w-0 overflow-y-auto md:h-screen bg-[#070709]">
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        {loadingData ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-gold-400 animate-spin mb-4" />
            <span className="text-xs uppercase tracking-widest text-zinc-550">Buscando informações da base de dados...</span>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-10 text-left">
                <div>
                  <h1 className="font-serif text-3xl font-light text-white">Dashboard do Painel</h1>
                  <p className="text-xs text-zinc-400 mt-1">Acompanhe as métricas de conversão e leads capturados na página oficial da Rooster Films.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Metric 1 */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400/[0.01] rounded-full filter blur-xl" />
                    <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold block">Total de Propostas</span>
                    <span className="font-serif text-4xl text-white font-light block mt-2">{dashboardStats.totalCount}</span>
                    <p className="text-[10.5px] text-zinc-500 mt-2">Orçamentos gerados desde a criação do site.</p>
                  </div>
                  
                  {/* Metric 2 */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400/[0.01] rounded-full filter blur-xl" />
                    <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold block">Este Mês</span>
                    <span className="font-serif text-4xl text-gold-300 font-light block mt-2">{dashboardStats.budgetsThisMonth}</span>
                    <p className="text-[10.5px] text-zinc-500 mt-2">Novas solicitações registradas este mês.</p>
                  </div>

                  {/* Metric 3 */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400/[0.01] rounded-full filter blur-xl" />
                    <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold block">Valor Médio</span>
                    <span className="font-serif text-3xl text-white font-light block mt-2">
                      R$ {dashboardStats.avgPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10.5px] text-zinc-500 mt-2.5">Investimento médio por orçamento.</p>
                  </div>

                  {/* Metric 4 */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400/[0.01] rounded-full filter blur-xl" />
                    <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold block">Pacote Favorito</span>
                    <span className="font-serif text-2xl text-gold-300 font-light block mt-2.5 uppercase tracking-wide">{dashboardStats.mostSelectedPackage}</span>
                    <p className="text-[10.5px] text-zinc-500 mt-3.5">Fórmula de valor mais selecionada.</p>
                  </div>
                </div>

                {/* Operations Metrics Grid */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-white font-light uppercase tracking-wider border-b border-zinc-900 pb-2">Status da Operação & Produção</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Metric 1 */}
                    <div className="glass-panel border-zinc-900 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/[0.01] rounded-full filter blur-lg" />
                      <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-semibold block">Eventos Este Mês</span>
                      <span className="font-serif text-3xl text-white font-light block mt-1.5">{dashboardStats.eventsThisMonth}</span>
                      <p className="text-[9px] text-zinc-550 mt-1 uppercase">Cronograma ativo</p>
                    </div>

                    {/* Metric 2 */}
                    <div className="glass-panel border-zinc-900 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gold-400/[0.01] rounded-full filter blur-lg" />
                      <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-semibold block">Próximos 30 Dias</span>
                      <span className="font-serif text-3xl text-gold-300 font-light block mt-1.5">{dashboardStats.eventsNext30Days}</span>
                      <p className="text-[9px] text-zinc-550 mt-1 uppercase">Preparar equipes</p>
                    </div>

                    {/* Metric 3 */}
                    <div className="glass-panel border-zinc-900 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/[0.01] rounded-full filter blur-lg" />
                      <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-semibold block">Entregas Pendentes</span>
                      <span className="font-serif text-3xl text-purple-450 font-light block mt-1.5">{dashboardStats.pendingDeliveries}</span>
                      <p className="text-[9px] text-zinc-550 mt-1 uppercase">Fila de edição</p>
                    </div>

                    {/* Metric 4 */}
                    <div className="glass-panel border-zinc-900 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/[0.01] rounded-full filter blur-lg" />
                      <span className="text-[9px] tracking-widest uppercase text-zinc-550 font-semibold block">Entregas Vencidas</span>
                      <span className={`font-serif text-3xl font-light block mt-1.5 ${dashboardStats.overdueDeliveries > 0 ? "text-red-400 font-bold animate-pulse" : "text-zinc-200"}`}>
                        {dashboardStats.overdueDeliveries}
                      </span>
                      <p className="text-[9px] text-zinc-550 mt-1 uppercase">Atraso crítico</p>
                    </div>

                    {/* Metric 5 */}
                    <div className="glass-panel border-zinc-900 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/[0.01] rounded-full filter blur-lg" />
                      <span className="text-[9px] tracking-widest uppercase text-zinc-550 font-semibold block">Eventos Finalizados</span>
                      <span className="font-serif text-3xl text-green-400 font-light block mt-1.5">{dashboardStats.finalizedEvents}</span>
                      <p className="text-[9px] text-zinc-550 mt-1 uppercase">Entregues 100%</p>
                    </div>
                  </div>
                </div>

                {/* Recent Leads list */}
                <div className="glass-panel border-zinc-900 rounded-xl p-6 text-left">
                  <h3 className="font-serif text-lg text-white font-light mb-6 border-b border-zinc-900 pb-3 uppercase tracking-wider">Últimos Leads Recebidos</h3>
                  
                  {leads.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-4 text-center">Nenhum lead registrado no momento.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-zinc-500 border-b border-zinc-900 pb-2">
                            <th className="pb-3 font-semibold uppercase tracking-wider">Casal</th>
                            <th className="pb-3 font-semibold uppercase tracking-wider">Data do Casamento</th>
                            <th className="pb-3 font-semibold uppercase tracking-wider">Valor Proposta</th>
                            <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                            <th className="pb-3 font-semibold uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {leads.slice(0, 5).map((lead) => (
                            <tr key={lead.id} className="hover:bg-zinc-900/[0.15] transition-colors">
                              <td className="py-4.5 font-medium text-zinc-200">
                                <div>{lead.name}</div>
                                <span className="text-[10px] text-zinc-500 block font-light mt-0.5">{lead.phone}</span>
                              </td>
                              <td className="py-4.5 text-zinc-400">
                                {new Date(lead.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                              </td>
                              <td className="py-4.5 font-medium text-gold-300">
                                R$ {Number(lead.total_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4.5">
                                {getStatusBadge(lead.status)}
                              </td>
                              <td className="py-4.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setActiveTab("leads");
                                  }}
                                  className="px-3.5 py-1.5 rounded-full border border-zinc-800 hover:border-gold-450 hover:bg-gold-400 hover:text-black transition-all cursor-pointer font-semibold uppercase text-[9px] tracking-wider"
                                >
                                  Gerenciar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. LEADS TAB / CRM */}
            {activeTab === "leads" && (
              <div className="space-y-10 text-left relative min-h-[500px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Gestão de Leads & CRM</h1>
                    <p className="text-xs text-zinc-400 mt-1">Monitore e atualize o status de cada casal que solicitou orçamento.</p>
                  </div>
                  <button
                    onClick={() => setIsNewLeadModalOpen(true)}
                    className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase rounded-full flex items-center gap-1.5 transition-all duration-300 shadow shadow-gold-500/5 active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Lead
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Leads List column */}
                  <div className="lg:col-span-2 glass-panel border-zinc-900 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 mb-6 gap-4">
                      <h3 className="font-serif text-base text-zinc-300 font-light uppercase tracking-wider">Histórico de Contatos</h3>
                      <div className="flex flex-wrap gap-1 bg-black/40 p-1 border border-zinc-800 rounded-lg">
                        {[
                          { id: 'todos', label: 'Todos' },
                          { id: 'casamento', label: 'Casamentos' },
                          { id: 'aniversario', label: 'Aniversários' },
                          { id: 'revelacao', label: 'Revelações' }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setLeadFilterEventType(f.id as any)}
                            className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded transition-colors cursor-pointer ${
                              leadFilterEventType === f.id
                                ? 'bg-gold-400 text-black'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {leads.filter(l => leadFilterEventType === 'todos' || l.event_type === leadFilterEventType).length === 0 ? (
                      <p className="text-zinc-500 text-xs py-8 text-center">Nenhum orçamento simulado nesta categoria.</p>
                    ) : (
                      <div className="space-y-4">
                        {leads
                          .filter(l => leadFilterEventType === 'todos' || l.event_type === leadFilterEventType)
                          .map((lead) => {
                            const isSelected = selectedLead?.id === lead.id;
                            return (
                              <div
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className={`p-4 rounded-lg transition-all cursor-pointer relative overflow-hidden lead-list-item ${
                                  isSelected 
                                    ? "lead-list-item-selected"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm text-zinc-200">{lead.name}</h4>
                                      <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-mono font-bold ${
                                        lead.event_type === 'aniversario' ? 'bg-blue-950/45 text-blue-400 border border-blue-900/35' :
                                        lead.event_type === 'revelacao' ? 'bg-purple-950/45 text-purple-400 border border-purple-900/35' :
                                        'bg-gold-950/45 text-gold-400 border border-gold-900/35'
                                      }`}>
                                        {lead.event_type || 'casamento'}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-450 font-light mt-1.5">
                                      <span><strong>Local:</strong> {lead.location}</span>
                                      <span><strong>Data:</strong> {new Date(lead.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-semibold text-gold-300 block">
                                    R$ {Number(lead.total_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                  <div className="mt-1">{getStatusBadge(lead.status)}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lead Details Drawer column */}
                  <div className="lg:col-span-1">
                    {selectedLead ? (
                      <div className="glass-panel border-gold-400/20 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 rounded-full filter blur-xl" />
                        
                        <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-3 mb-6 uppercase tracking-wider">Dados do Casal</h3>
                        
                        <div className="space-y-5 text-xs text-zinc-400">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Nome Completo</span>
                            <span className="text-sm font-medium text-zinc-200">{selectedLead.name}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Telefone</span>
                              <span className="text-zinc-200">{selectedLead.phone}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">E-mail</span>
                              <span className="text-zinc-200 truncate block">{selectedLead.email}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Data Casamento</span>
                              <span className="text-zinc-200">{new Date(selectedLead.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Local / Espaço</span>
                              <span className="text-zinc-200">{selectedLead.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Origem do Lead</span>
                              <span className="text-zinc-200">{selectedLead.lead_source || "Não informado"}</span>
                            </div>
                            {selectedLead.lead_source === "Indicação" && (
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Indicado por</span>
                                <span className="text-zinc-200">{selectedLead.referred_by || "Não informado"}</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-zinc-900 pt-4">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1">Observações</span>
                            <div className="text-zinc-300 leading-relaxed bg-black/35 p-3 rounded-lg border border-zinc-900 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar-thin whitespace-pre-wrap break-words">
                              {selectedLead.notes || "Nenhuma observação informada."}
                            </div>
                          </div>

                          <div className="border-t border-zinc-900 pt-4">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-2">Serviços Selecionados</span>
                            <div className="space-y-2 bg-black/30 p-3 rounded-lg border border-zinc-900 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar-thin">
                              {(Array.isArray(selectedLead.options) ? selectedLead.options : JSON.parse(selectedLead.options || "[]")).map((opt: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] text-zinc-300">
                                  <span>{opt.name}</span>
                                  <span className="text-zinc-400 font-medium">R$ {opt.price.toLocaleString("pt-BR")}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 1. Ajustes da Proposta Section Header */}
                          <div className="border-t border-zinc-900 pt-4 text-left">
                            <h4 className="font-serif text-sm text-gold-300 font-semibold mb-3 uppercase tracking-wider">Ajustes da Proposta</h4>
                            
                            <div className="space-y-4">
                              {/* Disponibilidade da Data */}
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1 font-medium">Disponibilidade da Data</span>
                                <select
                                  value={availability}
                                  onChange={(e) => setAvailability(e.target.value)}
                                  className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-gold-450 cursor-pointer font-semibold"
                                >
                                  <option value="disponivel">Disponível</option>
                                  <option value="reservada">Pré-Reservada</option>
                                  <option value="confirmada">Confirmada / Reservada</option>
                                  <option value="indisponivel">Indisponível</option>
                                </select>
                              </div>

                              {/* Custos Extras & Descontos */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1.5 font-medium">Custos Extras (R$)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={extraCosts || ""}
                                    onChange={(e) => setExtraCosts(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-gold-450 font-semibold"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1.5 font-medium">Descontos (R$)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={discount || ""}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-gold-450 font-semibold text-red-400"
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              {/* Forma de Pagamento */}
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1.5 font-medium">Forma de Pagamento (PDF)</span>
                                <textarea
                                  rows={2}
                                  value={paymentTerms}
                                  onChange={(e) => setPaymentTerms(e.target.value)}
                                  placeholder={`Em branco para usar o padrão: ${settings?.payment_terms || '- 30% sinal via Pix + saldo parcelado em até 10x sem juros.'}`}
                                  className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-gold-450 font-sans"
                                />
                              </div>

                              {/* Observações da Proposta */}
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-1.5 font-medium">Observações da Proposta (PDF)</span>
                                <textarea
                                  rows={2}
                                  value={proposalNotes}
                                  onChange={(e) => setProposalNotes(e.target.value)}
                                  placeholder="Condições especiais de pagamento ou observações comerciais..."
                                  className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-gold-450 font-sans"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Resumo Financeiro Completo */}
                          <div className="border-t border-zinc-900 pt-4 text-left space-y-1.5 bg-black/25 p-3 rounded-lg border border-zinc-900">
                            <div className="flex justify-between text-[11px] text-zinc-450">
                              <span>Valor Simulado Original:</span>
                              <span>R$ {originalTotalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                            {extraCosts > 0 && (
                              <div className="flex justify-between text-[11px] text-zinc-300">
                                <span>Custos Extras (+):</span>
                                <span className="text-zinc-200">+ R$ {extraCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {discount > 0 && (
                              <div className="flex justify-between text-[11px] text-red-400">
                                <span>Descontos (-):</span>
                                <span>- R$ {discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-baseline pt-1.5 border-t border-zinc-800">
                              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Valor Total Ajustado:</span>
                              <span className="text-base font-serif text-gold-300 font-medium">
                                R$ {Math.max(0, originalTotalPrice + extraCosts - discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* 3. Atualizar Status */}
                          <div className="border-t border-zinc-900 pt-4 text-left">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block mb-2 font-medium">Status Comercial</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "pending", label: "Novo" },
                                { id: "contacted", label: "Em contato" },
                                { id: "proposal_sent", label: "Proposta Enviada" },
                                { id: "negotiating", label: "Negociação" },
                                { id: "won", label: "Fechado" },
                                { id: "lost", label: "Perdido" }
                              ].map((st) => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => handleUpdateLeadStatus(selectedLead.id, st.id)}
                                  className={`py-1.5 px-2.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer border ${
                                    selectedLead.status === st.id
                                      ? "bg-gold-400 text-black border-transparent"
                                      : "border-zinc-800 hover:bg-zinc-900 text-zinc-450 hover:text-zinc-200"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                            {selectedLead.status === "won" && (
                              <button
                                type="button"
                                onClick={handleConvertToEvent}
                                className="w-full mt-3 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all duration-300"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Converter em Evento
                              </button>
                            )}
                          </div>

                          {/* 4. Central de Proposta (PDF / WhatsApp / Email / Links) */}
                          <div className="border-t border-zinc-900 pt-4 text-left space-y-2.5">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Central de Envio & PDF</span>
                            
                            <button
                              onClick={handleUploadAndSaveAdjustments}
                              disabled={savingAdjustments}
                              className="w-full py-2.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all disabled:opacity-50"
                            >
                              {savingAdjustments ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Salvando Proposta...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5" />
                                  Confirmar e Salvar Ajustes
                                </>
                              )}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleGeneratePDF(true)}
                                className="py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] uppercase tracking-wider font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileDown className="h-3.5 w-3.5 text-gold-400" />
                                Baixar PDF
                              </button>
                              
                              <button
                                onClick={handleSendEmail}
                                className="py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] uppercase tracking-wider font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                                Enviar E-mail
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={handleShareLink}
                                className="py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] uppercase tracking-wider font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5 text-purple-400 rotate-45" />
                                Copiar Link
                              </button>

                              <button
                                onClick={handleSendWhatsApp}
                                className="py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] uppercase tracking-wider font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-green-400" />
                                WhatsApp
                              </button>
                            </div>

                            {selectedLead.pdf_url && (
                              <div className="text-[10px] text-zinc-550 flex items-center justify-between px-1 border-t border-zinc-950 pt-2 font-mono">
                                <span className="truncate max-w-[150px]">Link do PDF ativo</span>
                                <a
                                  href={selectedLead.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gold-450 hover:underline flex items-center gap-0.5"
                                >
                                  Visualizar <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-panel border-zinc-900 rounded-xl p-8 text-center text-zinc-550 text-xs py-20">
                        <Users className="h-8 w-8 text-zinc-650 mx-auto mb-3" />
                        Selecione um lead da lista para visualizar as opções escolhidas e atualizar o status comercial.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. EVENTS & PRODUCTION TAB */}
            {activeTab === "events" && (
              <div className="space-y-10 text-left relative min-h-[500px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Eventos & Produção</h1>
                    <p className="text-xs text-zinc-400 mt-1">Gerencie a logística, cronogramas, equipe e entregáveis dos contratos fechados.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Events List column */}
                  <div className="lg:col-span-1 glass-panel border-zinc-900 rounded-xl p-6">
                    <div className="flex flex-col gap-4 mb-6 border-b border-zinc-900 pb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-base text-zinc-300 font-light uppercase tracking-wider">Eventos Contratados</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <select
                          value={eventFilterStatus}
                          onChange={(e) => setEventFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-gold-450 cursor-pointer font-semibold"
                        >
                          <option value="todos">Todos os Status</option>
                          <option value="Planejamento">Planejamento</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Em Produção">Em Produção</option>
                          <option value="Entregas Pendentes">Entregas Pendentes</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </div>
                    </div>

                    {events.filter(e => eventFilterStatus === "todos" || e.status === eventFilterStatus).length === 0 ? (
                      <p className="text-zinc-550 text-xs py-8 text-center">Nenhum evento registrado nesta categoria.</p>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar-thin">
                        {events
                          .filter(e => eventFilterStatus === "todos" || e.status === eventFilterStatus)
                          .map((ev) => {
                            const isSelected = selectedEvent?.id === ev.id;
                            const deadline = getEventDeadlineInfo(ev.event_date, ev.status);
                            return (
                              <div
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                className={`p-4 rounded-lg transition-all cursor-pointer relative overflow-hidden lead-list-item ${
                                  isSelected 
                                    ? "lead-list-item-selected"
                                    : ""
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-sm text-zinc-200 truncate pr-2 max-w-[150px]">{ev.name}</h4>
                                    <span className="text-[10px] text-zinc-550 font-bold font-mono">
                                      {ev.event_type?.toUpperCase()}
                                    </span>
                                  </div>
                                  
                                  <div className="text-[11px] text-zinc-450 space-y-0.5">
                                    <div className="flex justify-between">
                                      <span>Data: {new Date(ev.event_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                                      <span>Cidade: {ev.city || "Não informada"}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                      <span className="text-gold-300">R$ {Number(ev.total_price || 0).toLocaleString("pt-BR")}</span>
                                      {getEventStatusBadge(ev.status)}
                                    </div>
                                  </div>

                                  <div className={`text-[10px] px-2 py-1 rounded border text-center font-medium ${deadline.color}`}>
                                    {deadline.label}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Event Details Panel column */}
                  <div className="lg:col-span-2">
                    {eventDraft ? (
                      <div className="glass-panel border-gold-400/20 rounded-xl p-6 relative overflow-hidden shadow-2xl space-y-6">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 rounded-full filter blur-xl" />
                        
                        {/* Title and top actions */}
                        <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                          <div>
                            <h3 className="font-serif text-xl text-white font-light uppercase tracking-wider">{eventDraft.name}</h3>
                            <span className="text-xs text-zinc-550 mt-1 block">Logística, Equipe e Checklist Operacional</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGenerateOperationalPDF(eventDraft)}
                              className="px-3.5 py-1.5 rounded-full border border-zinc-800 hover:border-gold-400 text-zinc-350 hover:text-white transition-all text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                              title="Gerar PDF Operacional para a equipe"
                            >
                              <FileDown className="h-3.5 w-3.5 text-gold-450" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleUpdateEvent(eventDraft)}
                              className="px-3.5 py-1.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black transition-all text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" />
                              Salvar
                            </button>
                            <button
                              onClick={() => setSelectedEvent(null)}
                              className="p-1.5 rounded-full border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* General Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-zinc-900 text-xs text-zinc-450">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Telefone</span>
                            <input
                              type="text"
                              value={eventDraft.phone || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, phone: e.target.value })}
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">E-mail</span>
                            <input
                              type="email"
                              value={eventDraft.email || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, email: e.target.value })}
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Valor Fechado</span>
                            <input
                              type="number"
                              value={eventDraft.total_price || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, total_price: Number(e.target.value) })}
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Horário de Início</span>
                            <input
                              type="text"
                              value={eventDraft.time || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, time: e.target.value })}
                              placeholder="Ex: 16:30"
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Cidade</span>
                            <input
                              type="text"
                              value={eventDraft.city || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, city: e.target.value })}
                              placeholder="Ex: Sinop - MT"
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Google Maps Link</span>
                            <input
                              type="text"
                              value={eventDraft.google_maps_link || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, google_maps_link: e.target.value })}
                              placeholder="URL do Google Maps"
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>

                          <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Local / Endereço Principal</span>
                            <input
                              type="text"
                              value={eventDraft.location || ""}
                              onChange={(e) => setEventDraft({ ...eventDraft, location: e.target.value })}
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-semibold">Status Operacional</span>
                            <select
                              value={eventDraft.status}
                              onChange={(e) => setEventDraft({ ...eventDraft, status: e.target.value })}
                              className="px-2 py-1 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 cursor-pointer font-semibold"
                            >
                              <option value="Planejamento">Planejamento</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Em Produção">Em Produção</option>
                              <option value="Entregas Pendentes">Entregas Pendentes</option>
                              <option value="Finalizado">Finalizado</option>
                            </select>
                          </div>
                        </div>

                        {/* Sub-tabs Navigation */}
                        <div className="flex border-b border-zinc-900 gap-1 pb-px">
                          {[
                            { id: "operacao", label: "Cronograma & Local", icon: Clock },
                            { id: "equipe", label: "Equipe & Checklist", icon: Users },
                            { id: "entregaveis", label: "Entregáveis & Prazo", icon: Film }
                          ].map((sTab) => {
                            const TabIcon = sTab.icon;
                            const isActive = eventSubTab === sTab.id;
                            return (
                              <button
                                key={sTab.id}
                                type="button"
                                onClick={() => setEventSubTab(sTab.id as any)}
                                className={`px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isActive
                                    ? "border-gold-400 text-gold-400 bg-gold-400/[0.02] font-bold"
                                    : "border-transparent text-zinc-450 hover:text-zinc-250"
                                }`}
                              >
                                <TabIcon className="h-3.5 w-3.5" />
                                {sTab.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Sub-tab 1: Cronograma */}
                        {eventSubTab === "operacao" && (
                          <div className="space-y-4 animate-fadeIn">
                            <h4 className="font-serif text-sm text-zinc-300 font-light uppercase tracking-wider border-b border-zinc-900/60 pb-2">Etapas do Cronograma</h4>
                            
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar-thin">
                              {(eventDraft.schedule || []).map((stage: any, idx: number) => (
                                <div key={idx} className="p-3 bg-black/30 border border-zinc-900 rounded-lg space-y-2.5 text-xs">
                                  <div className="flex justify-between items-center font-bold text-zinc-350">
                                    <span>{stage.name}</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Horário Início</span>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          placeholder="Ex: 14:00"
                                          value={stage.start_time || ""}
                                          readOnly
                                          onClick={() => openTimePicker(idx, "start_time", stage.start_time)}
                                          className="w-full px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200 cursor-pointer pr-7 text-xs font-medium"
                                        />
                                        <Clock className="absolute right-2 top-1.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Horário Término</span>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          placeholder="Ex: 15:30"
                                          value={stage.end_time || ""}
                                          readOnly
                                          onClick={() => openTimePicker(idx, "end_time", stage.end_time)}
                                          className="w-full px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200 cursor-pointer pr-7 text-xs font-medium"
                                        />
                                        <Clock className="absolute right-2 top-1.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                                      </div>
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                      <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Endereço da Etapa</span>
                                      <input
                                        type="text"
                                        placeholder="Endereço específico"
                                        value={stage.address || ""}
                                        onChange={(e) => handleUpdateScheduleItem(idx, "address", e.target.value)}
                                        className="px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Observações / Instruções</span>
                                    <input
                                      type="text"
                                      placeholder="Instruções específicas..."
                                      value={stage.notes || ""}
                                      onChange={(e) => handleUpdateScheduleItem(idx, "notes", e.target.value)}
                                      className="w-full px-2 py-1.5 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sub-tab 2: Equipe & Checklist */}
                        {eventSubTab === "equipe" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                            
                            {/* Equipe Column */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-zinc-900/60 pb-2">
                                <h4 className="font-serif text-sm text-zinc-300 font-light uppercase tracking-wider">Profissionais Escalados</h4>
                                <button
                                  type="button"
                                  onClick={handleAddTeamMember}
                                  className="text-[9px] font-bold text-gold-450 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" /> Adicionar
                                </button>
                              </div>

                              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar-thin">
                                {(eventDraft.team || []).map((member: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-black/30 border border-zinc-900 rounded-lg space-y-2 text-xs relative">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTeamMember(idx)}
                                      className="absolute top-2 right-2 text-zinc-650 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-2 pr-6">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Função</span>
                                        <select
                                          value={member.role}
                                          onChange={(e) => handleUpdateTeamMember(idx, "role", e.target.value)}
                                          className="px-2 py-1 bg-[#0c0c0e] border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200 cursor-pointer"
                                        >
                                          <option value="Cinegrafista">Cinegrafista</option>
                                          <option value="Fotógrafo">Fotógrafo</option>
                                          <option value="Drone">Drone</option>
                                          <option value="Assistente">Assistente</option>
                                          <option value="Editor">Editor</option>
                                          <option value="Diretor">Diretor</option>
                                        </select>
                                      </div>
                                      
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Cachê (R$)</span>
                                        <input
                                          type="number"
                                          value={member.fee || ""}
                                          onChange={(e) => handleUpdateTeamMember(idx, "fee", Number(e.target.value))}
                                          className="px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Nome</span>
                                        <input
                                          type="text"
                                          value={member.name || ""}
                                          onChange={(e) => handleUpdateTeamMember(idx, "name", e.target.value)}
                                          className="px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                                          placeholder="Nome profissional"
                                        />
                                      </div>

                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-550 block font-semibold">Telefone</span>
                                        <input
                                          type="text"
                                          value={member.phone || ""}
                                          onChange={(e) => handleUpdateTeamMember(idx, "phone", e.target.value)}
                                          className="px-2 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                                          placeholder="Telefone"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Checklist Column */}
                            <div className="space-y-4">
                              <h4 className="font-serif text-sm text-zinc-355 font-light uppercase tracking-wider border-b border-zinc-900/60 pb-2">Checklist de Equipamento</h4>
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Novo item customizado..."
                                  value={newCustomChecklistItem}
                                  onChange={(e) => setNewCustomChecklistItem(e.target.value)}
                                  className="flex-1 px-3 py-1.5 bg-black/40 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-gold-450"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddChecklistItem}
                                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-gold-450 text-gold-400 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Adicionar
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-thin text-xs">
                                {(eventDraft.equipment_checklist || []).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-2.5 bg-black/25 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
                                    <label className="flex items-center gap-2 cursor-pointer text-zinc-350 select-none">
                                      <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => handleToggleChecklistItem(idx)}
                                        className="h-3.5 w-3.5 border-zinc-800 rounded text-gold-450 focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
                                      />
                                      <span className={item.checked ? "line-through text-zinc-550" : ""}>{item.name}</span>
                                    </label>
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveChecklistItem(idx)}
                                      className="text-zinc-650 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sub-tab 3: Entregáveis & Prazo */}
                        {eventSubTab === "entregaveis" && (
                          <div className="space-y-6 animate-fadeIn">
                            
                            {/* Deadline Countdown Cards */}
                            {(() => {
                              const deadline = getEventDeadlineInfo(eventDraft.event_date, eventDraft.status);
                              return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="glass-panel border-zinc-900 p-4 rounded-xl text-center">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-bold block">Dias desde o Evento</span>
                                    <span className="font-serif text-3xl text-zinc-200 mt-1 block">
                                      {deadline.daysSince !== null ? `${deadline.daysSince} dias` : "Evento futuro"}
                                    </span>
                                  </div>
                                  <div className="glass-panel border-zinc-900 p-4 rounded-xl text-center">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-bold block">Prazo para Entrega</span>
                                    <span className="font-serif text-3xl text-zinc-200 mt-1 block">90 dias</span>
                                  </div>
                                  <div className={`p-4 rounded-xl border text-center flex flex-col justify-center items-center ${deadline.color}`}>
                                    <span className="text-[8px] uppercase tracking-widest opacity-75 font-bold block">Contador de Prazo</span>
                                    <span className="font-serif text-base font-bold mt-1 block uppercase tracking-wider">{deadline.label}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Deliverables Section */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-2">
                                <h4 className="font-serif text-sm text-zinc-300 font-light uppercase tracking-wider">Controle de Entregas (Entregáveis)</h4>
                                
                                {/* Quick Add Deliverable Form */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ex: Drone Raw / Trailer"
                                    value={newDeliverableName}
                                    onChange={(e) => setNewDeliverableName(e.target.value)}
                                    className="px-2.5 py-1 bg-black/45 border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-[11px] text-zinc-200 w-44 placeholder-zinc-700 font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddDeliverable}
                                    className="px-3 py-1 bg-gold-400 hover:bg-gold-500 text-black font-semibold text-[10px] uppercase tracking-wider rounded transition-colors cursor-pointer active:scale-95"
                                  >
                                    Adicionar
                                  </button>
                                </div>
                              </div>
                              
                              {(eventDraft.deliverables || []).length === 0 ? (
                                <p className="text-zinc-550 text-xs text-center py-4">Nenhum entregável mapeado. Digite no campo acima para adicionar um novo entregável.</p>
                              ) : (
                                <div className="space-y-2">
                                  {(eventDraft.deliverables || []).map((deliv: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-black/30 border border-zinc-900 rounded-lg text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-gold-450 animate-pulse" />
                                        <span className="font-semibold text-zinc-200">{deliv.name}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] text-zinc-550 font-bold uppercase">Status:</span>
                                          <select
                                            value={deliv.status}
                                            onChange={(e) => handleUpdateDeliverableStatus(idx, e.target.value)}
                                            className="px-2.5 py-1 bg-[#0c0c0e] border border-zinc-900 rounded focus:outline-none focus:border-gold-450 text-[11px] text-zinc-300 cursor-pointer"
                                          >
                                            <option value="Não iniciado">Não iniciado</option>
                                            <option value="Em edição">Em edição</option>
                                            <option value="Aguardando aprovação">Aguardando aprovação</option>
                                            <option value="Entregue">Entregue</option>
                                          </select>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDeliverable(idx)}
                                          className="p-1.5 text-zinc-650 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                                          title="Excluir entregável"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Save Notification Footer */}
                        <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                          <p className="text-[10px] text-zinc-550 uppercase font-mono">
                            Modificações salvas apenas localmente no rascunho. Confirme acima para salvar na nuvem.
                          </p>
                          <button
                            onClick={() => handleUpdateEvent(eventDraft)}
                            className="px-5 py-2.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-1.5 cursor-pointer transition-all duration-300 shadow"
                          >
                            <Save className="h-4 w-4" />
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-panel border-zinc-900 rounded-xl p-8 text-center text-zinc-550 text-xs py-20">
                        <Calendar className="h-8 w-8 text-zinc-650 mx-auto mb-3" />
                        Selecione um evento da lista para gerenciar o cronograma, equipe técnica, equipamentos e entregáveis de pós-produção.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. PORTFOLIO VIDEOS TAB */}
            {activeTab === "portfolio" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Módulo de Portfólio</h1>
                    <p className="text-xs text-zinc-400 mt-1">Gerencie os filmes exibidos na galeria de cinema do site principal.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        title: "",
                        couple: "",
                        location: "",
                        duration: "",
                        cover_image: "",
                        video_url: "",
                        category: "videos",
                        highlighted: false,
                        display_order: portfolio.length + 1
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Adicionar Vídeo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.map((vid) => (
                    <div key={vid.id} className="glass-panel border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between group">
                      <div className="relative aspect-video overflow-hidden border-b border-zinc-900 bg-zinc-950">
                        <img 
                          src={vid.cover_image} 
                          alt={vid.title} 
                          className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-black/10" />
                        
                        {vid.highlighted && (
                          <span className="absolute top-3 left-3 bg-gold-400 text-black text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded shadow">
                            Destaque
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-black/70 border border-zinc-900 px-2 py-0.5 rounded text-[10px] tracking-wide text-zinc-300 font-mono">
                          {vid.duration}
                        </span>
                      </div>

                      <div className="p-5 text-left flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-[9px] text-zinc-550 uppercase tracking-widest block font-semibold">Ordem: {vid.display_order} • {vid.location}</span>
                          <h4 className="font-serif text-lg text-white font-light mt-1.5">{vid.title}</h4>
                          <p className="text-xs text-zinc-400 font-light mt-1 italic">Casal: {vid.couple}</p>
                        </div>

                        <div className="flex gap-2 border-t border-zinc-900/60 pt-4">
                          <button
                            onClick={() => {
                              setCurrentEditItem(vid);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete("portfolio", vid.id)}
                            className="py-2 px-3 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PHOTO GALLERY TAB */}
            {activeTab === "galeria" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Galeria de Fotos</h1>
                    <p className="text-xs text-zinc-400 mt-1">Gerencie a galeria fotográfica de casamentos — ceriônia, making of, ensaios e recepção.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        url: "",
                        alt: "",
                        caption: "",
                        category: "cerimonia",
                        display_order: photos.length + 1,
                        highlighted: true
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Adicionar Foto
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {photos.map((photo) => (
                    <div key={photo.id} className="glass-panel border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between group">
                      <div className="aspect-square relative overflow-hidden bg-zinc-950 border-b border-zinc-900">
                        <img 
                          src={photo.url} 
                          alt={photo.alt} 
                          className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-black/10 pointer-events-none" />
                        <span className="absolute top-2 left-2 bg-black/60 border border-zinc-900 px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-semibold text-zinc-350">
                          {photo.category}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-left">
                          <span className="text-[8px] text-zinc-550 block font-mono font-medium">Ordem: {photo.display_order}</span>
                          <h5 className="font-semibold text-xs text-zinc-300 truncate mt-1">{photo.alt || "Sem título"}</h5>
                          <p className="text-[10px] text-zinc-500 font-light truncate mt-0.5">{photo.caption || "Sem legenda"}</p>
                        </div>

                        <div className="flex gap-1.5 pt-1.5 border-t border-zinc-900/40">
                          <button
                            onClick={() => {
                              setCurrentEditItem(photo);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 py-1.5 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Edit className="h-3 w-3" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete("photos", photo.id)}
                            className="py-1.5 px-2.5 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. RECOMMENDED PACKAGES TAB */}
            {activeTab === "pacotes" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Pacotes Recomendados</h1>
                    <p className="text-xs text-zinc-400 mt-1">Configure os pacotes que os noivos podem selecionar com descontos exclusivos.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        name: "",
                        category: "Sugestão",
                        description: "",
                        inclusions: [],
                        base_price: 0,
                        promo_price: 0,
                        badge: "",
                        highlight_color: "",
                        display_order: packages.length + 1,
                        active: true,
                        benefit_type: "desconto",
                        benefit_desc: "",
                        enable_recommendations: true,
                        recommendation_priority: 0
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Criar Pacote
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => {
                    const inclusionsList = Array.isArray(pkg.inclusions) ? pkg.inclusions : JSON.parse(pkg.inclusions || "[]");
                    const discount = Number(pkg.base_price) - Number(pkg.promo_price);
                    
                    return (
                      <div 
                        key={pkg.id} 
                        className={`glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[360px] text-left relative overflow-hidden ${
                          pkg.highlight_color === "gold" ? "border-gold-400/40 bg-gold-400/[0.01]" : "border-zinc-900"
                        }`}
                      >
                        {pkg.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-black text-[9px] uppercase tracking-widest font-bold px-3.5 py-1 rounded-full shadow">
                            {pkg.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-center mb-2 mt-1">
                            <span className="text-[9px] tracking-widest text-zinc-550 uppercase font-semibold">{pkg.category}</span>
                            <span className={`text-[9px] uppercase tracking-wider font-semibold ${pkg.active ? "text-green-400" : "text-red-500"}`}>
                              {pkg.active ? "● Ativo" : "● Inativo"}
                            </span>
                          </div>

                          <h4 className="font-serif text-lg text-white uppercase tracking-wide mb-2.5">{pkg.name}</h4>
                          <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">"{pkg.description}"</p>

                          <div className="text-[10px] text-zinc-500 font-light flex flex-col gap-1.5 bg-black/20 p-3 rounded-lg border border-zinc-900/60 mb-4">
                            <span className="text-[9px] text-zinc-450 uppercase tracking-widest font-semibold block mb-1">Inclusões</span>
                            {inclusionsList.map((incId: string) => {
                              const srv = services.find((s) => s.id === incId);
                              return (
                                <span key={incId} className="flex items-center gap-1.5">
                                  <Check className="h-3 w-3 text-gold-400" /> {srv?.name || incId}
                                </span>
                              );
                            })}
                          </div>

                          {/* Display Recommendation Settings */}
                          <div className="text-[10px] text-zinc-500 font-light flex flex-col gap-1.5 bg-black/20 p-3 rounded-lg border border-zinc-900/60 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-zinc-450 uppercase tracking-widest font-semibold">Recomendação</span>
                              <span className={`text-[8.5px] uppercase font-bold ${pkg.enable_recommendations !== false ? "text-gold-400" : "text-zinc-550"}`}>
                                {pkg.enable_recommendations !== false ? "Ativa" : "Desativada"}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1 text-[9.5px]">
                              <span>Prioridade: <strong className="text-zinc-350">{pkg.recommendation_priority || 0}</strong></span>
                              <span>Benefício: <strong className="text-gold-300 uppercase">{pkg.benefit_type || "desconto"}</strong></span>
                            </div>
                            {pkg.benefit_desc && (
                              <div className="text-[9.5px] mt-0.5 border-t border-zinc-900/40 pt-1.5 text-gold-300 italic">
                                "{pkg.benefit_desc}"
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="border-t border-zinc-900/50 pt-4 flex justify-between items-baseline mb-4">
                            <div>
                              <span className="text-[9px] tracking-widest text-zinc-500 uppercase block">Promo / Base</span>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-serif text-xl text-gold-300">R$ {Number(pkg.promo_price).toLocaleString("pt-BR")}</span>
                                {discount > 0 && <span className="font-serif text-xs text-zinc-600 line-through">R$ {Number(pkg.base_price).toLocaleString("pt-BR")}</span>}
                              </div>
                            </div>
                            {discount > 0 && (
                              <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                -R$ {discount.toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCurrentEditItem({
                                  ...pkg,
                                  inclusions: inclusionsList
                                });
                                setIsModalOpen(true);
                              }}
                              className="flex-1 py-2 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete("packages", pkg.id)}
                              className="py-2 px-3 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. SERVICES TAB / PRICES */}
            {activeTab === "servicos" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Serviços e Valores</h1>
                    <p className="text-xs text-zinc-400 mt-1">Gerencie os preços base do simulador e sua disponibilidade. Alterações atualizam o simulador imediatamente.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        id: "",
                        name: "",
                        price: 0,
                        category: "captacao",
                        description: "",
                        required: false,
                        active: true,
                        bg_image: "",
                        display_order: services.length + 1
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Adicionar Serviço
                  </button>
                </div>

                <div className="glass-panel border-zinc-900 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-black/40 text-zinc-550 border-b border-zinc-900">
                          <th className="p-4 font-semibold uppercase tracking-wider">Serviço (ID)</th>
                          <th className="p-4 font-semibold uppercase tracking-wider">Categoria</th>
                          <th className="p-4 font-semibold uppercase tracking-wider">Descrição</th>
                          <th className="p-4 font-semibold uppercase tracking-wider">Valor Base</th>
                          <th className="p-4 font-semibold uppercase tracking-wider">Ativo/Obrigatório</th>
                          <th className="p-4 font-semibold uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {services.map((srv) => (
                          <tr key={srv.id} className="hover:bg-zinc-900/[0.08] transition-colors">
                            <td className="p-4 font-medium text-zinc-200">
                              <div>{srv.name}</div>
                              <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">{srv.id}</span>
                            </td>
                            <td className="p-4 text-zinc-400">
                              <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[9px] border border-zinc-800 uppercase">{srv.category}</span>
                            </td>
                            <td className="p-4 text-zinc-400 max-w-[200px] truncate">{srv.description}</td>
                            <td className="p-4 font-semibold text-gold-300 font-mono">
                              R$ {Number(srv.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 flex-wrap">
                                {srv.active ? (
                                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[8px] uppercase font-bold">Ativo</span>
                                ) : (
                                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[8px] uppercase font-bold">Inativo</span>
                                )}
                                {srv.required && (
                                  <span className="bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded text-[8px] uppercase font-bold">Obrigatório</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                   onClick={() => {
                                    const defaultImages: Record<string, string> = {
                                      pre_wedding_vid: "/Fotos/pre wwedding.jpg",
                                      captacao_cerimonia: "/Fotos/cerimonia 1.jpg",
                                      captacao_making_of: "/Fotos/making of.jpg",
                                      captacao_festa: "/Fotos/festa casamento foto.png",
                                      video_teaser: "/Fotos/teaser.jpg",
                                      video_filme_6_10: "/Fotos/6 - 10 min.jpg",
                                      video_filme_12_18: "/Fotos/12- 20 min.jpg",
                                      extra_same_day: "/Fotos/same day.png",
                                    };
                                    setCurrentEditItem({
                                      ...srv,
                                      bg_image: srv.bg_image || defaultImages[srv.id] || ""
                                    });
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors cursor-pointer"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("services", srv.id)}
                                  className="p-2 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. BENEFITS / PROGRESS RULES TAB */}
            {activeTab === "beneficios" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Regras de Benefícios</h1>
                    <p className="text-xs text-zinc-400 mt-1">Configure faixas de metas e benefícios progressivos que estimulam os noivos a adicionarem mais itens no simulador.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        target_price: 0,
                        missing_text: "Falta R$ {missing} para desbloquear o benefício.",
                        benefit_title: "",
                        benefit_description: "",
                        display_order: benefits.length + 1,
                        active: true
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Criar Benefício
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((bf) => (
                    <div 
                      key={bf.id} 
                      className={`glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[220px] text-left relative overflow-hidden border-zinc-900`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] bg-gold-400/10 text-gold-300 border border-gold-400/25 px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider font-mono">
                            Meta: R$ {Number(bf.target_price).toLocaleString("pt-BR")}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider font-semibold ${bf.active ? "text-green-400" : "text-red-500"}`}>
                            {bf.active ? "● Ativo" : "● Inativo"}
                          </span>
                        </div>

                        <h4 className="font-serif text-base text-white tracking-wide mb-1">{bf.benefit_title}</h4>
                        <p className="text-[11px] text-zinc-400 font-light mb-4">{bf.benefit_description}</p>
                        
                        <div className="bg-black/30 p-2.5 rounded border border-zinc-900 text-[10px] text-zinc-500 font-light mb-2">
                          <span className="text-[8px] text-zinc-550 uppercase tracking-widest font-semibold block mb-0.5">Mensagem Dinâmica</span>
                          "{bf.missing_text}"
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-900/60 flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentEditItem(bf);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete("benefits", bf.id)}
                          className="py-2 px-3 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7.5. TESTIMONIALS TAB */}
            {activeTab === "depoimentos" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Depoimentos</h1>
                    <p className="text-xs text-zinc-400 mt-1">Gerencie os depoimentos dos clientes que aparecem no site para gerar prova social e autoridade.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        client_name: "",
                        subtitle: "",
                        quote: "",
                        stars: 5,
                        image_url: "",
                        event_type: activeEventType,
                        active: true,
                        display_order: testimonials.length + 1
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Criar Depoimento
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t) => (
                    <div 
                      key={t.id} 
                      className={`glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[260px] text-left relative overflow-hidden border-zinc-900`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3.5">
                          <div className="flex items-center gap-1">
                            {[...Array(t.stars || 5)].map((_, i) => (
                              <svg key={i} className="h-3 w-3 fill-gold-400 text-gold-400" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            ))}
                          </div>
                          <span className={`text-[9px] uppercase tracking-wider font-semibold ${t.active ? "text-green-400" : "text-red-500"}`}>
                            {t.active ? "● Ativo" : "● Inativo"}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-zinc-300 font-light italic leading-relaxed mb-4 font-serif">
                          "{t.quote}"
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                          {t.image_url ? (
                            <img
                              src={t.image_url}
                              alt={t.client_name}
                              className="h-9 w-9 rounded-full object-cover border border-gold-400/20"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-650 text-[10px]">
                              Sem foto
                            </div>
                          )}
                          <div>
                            <h4 className="font-serif text-sm text-zinc-100 font-medium">{t.client_name}</h4>
                            <span className="text-[9px] text-zinc-550 uppercase tracking-wide block">{t.subtitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-900/60 flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest font-semibold">Ordem: {t.display_order ?? 0}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentEditItem(t);
                              setIsModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Edit className="h-3 w-3" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete("testimonials", t.id)}
                            className="py-1.5 px-2.5 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7.5. FEATURES TAB (Diferenciais) */}
            {activeTab === "diferenciais" && (
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-serif text-3xl font-light text-white">Diferenciais</h1>
                    <p className="text-xs text-zinc-400 mt-1">Configure os diferenciais e selos de qualidade exibidos na seção 'A Beleza no Detalhe'.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentEditItem({
                        icon: "heart",
                        title: "",
                        description: "",
                        display_order: features.length + 1,
                        event_type: activeEventType,
                        active: true
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Adicionar Diferencial
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feat) => {
                    const renderFeatureIcon = (iconName: string) => {
                      const name = (iconName || '').toLowerCase().trim();
                      switch (name) {
                        case 'heart': return <Heart className="h-5 w-5 text-gold-300" />;
                        case 'eye': return <Eye className="h-5 w-5 text-gold-300" />;
                        case 'clock': return <Clock className="h-5 w-5 text-gold-300" />;
                        case 'film': return <Film className="h-5 w-5 text-gold-300" />;
                        case 'sparkles': return <Sparkles className="h-5 w-5 text-gold-300" />;
                        case 'shield': return <Shield className="h-5 w-5 text-gold-300" />;
                        case 'award': return <Award className="h-5 w-5 text-gold-300" />;
                        case 'star': return <Star className="h-5 w-5 text-gold-300" />;
                        case 'camera': return <Camera className="h-5 w-5 text-gold-300" />;
                        case 'smile': return <Smile className="h-5 w-5 text-gold-300" />;
                        case 'video': return <Video className="h-5 w-5 text-gold-300" />;
                        default: return <Heart className="h-5 w-5 text-gold-300" />;
                      }
                    };
                    return (
                      <div 
                        key={feat.id} 
                        className="glass-panel border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[250px] relative overflow-hidden group"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest font-bold">
                              Ordem: {feat.display_order ?? 0}
                            </span>
                            <span className={`text-[9px] uppercase tracking-wider font-semibold ${feat.active ? "text-green-400" : "text-red-500"}`}>
                              {feat.active ? "● Ativo" : "● Inativo"}
                            </span>
                          </div>

                          <div className="h-10 w-10 rounded-full border border-gold-400/10 bg-gold-400/5 flex items-center justify-center text-gold-300 mb-4">
                            {renderFeatureIcon(feat.icon)}
                          </div>

                          <h4 className="font-serif text-base text-white font-medium tracking-wide">{feat.title}</h4>
                          <p className="text-[11px] text-zinc-400 font-light mt-1.5 leading-relaxed">{feat.description}</p>
                        </div>

                        <div className="pt-4 border-t border-zinc-900/60 flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              setCurrentEditItem(feat);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete("features", feat.id)}
                            className="py-2 px-3 rounded border border-zinc-800 hover:border-red-500/25 hover:bg-red-500/[0.02] text-zinc-500 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. SETTINGS TAB */}
            {activeTab === "configuracoes" && settings && (
              <div className="space-y-10 text-left">
                <div>
                  <h1 className="font-serif text-3xl font-light text-white">Configurações Gerais</h1>
                  <p className="text-xs text-zinc-400 mt-1">Configure as informações institucionais, contatos de WhatsApp, redes sociais, FAQ e depoimentos do site.</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoadingData(true);
                    try {
                      const { error } = await supabase.from("settings").update({
                        whatsapp_number: settings.whatsapp_number,
                        contact_email: settings.contact_email,
                        instagram_handle: settings.instagram_handle,
                        address: settings.address,
                        authority_title: settings.authority_title,
                        authority_subtitle: settings.authority_subtitle,
                        footer_text: settings.footer_text,
                        faq_items: settings.faq_items,
                        testimonials: settings.testimonials,
                        authority_cards: settings.authority_cards,
                        testimonial_per_page: settings.testimonial_per_page,
                        testimonial_per_slide: settings.testimonial_per_slide,
                        testimonial_transition_speed: settings.testimonial_transition_speed,
                        testimonial_autoplay: settings.testimonial_autoplay,
                        testimonial_style: settings.testimonial_style,
                        payment_terms: settings.payment_terms,
                        site_url: settings.site_url
                      }).eq("event_type", activeEventType);

                      if (error) {
                        alert("Erro ao salvar configurações: " + error.message);
                      } else {
                        alert("Configurações atualizadas com sucesso!");
                        loadAllTables();
                      }
                    } catch (err: any) {
                      alert("Erro ao salvar: " + err.message);
                    } finally {
                      setLoadingData(false);
                    }
                  }}
                  className="space-y-8 max-w-4xl"
                >
                  {/* Grid 1: Contacts */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <Settings className="h-4.5 w-4.5 text-gold-400" /> Contatos & Rodapé
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">WhatsApp Comercial (Apenas números + DDI)</label>
                        <input
                          type="text"
                          required
                          value={settings.whatsapp_number}
                          onChange={(e) => setSettings((p: any) => ({ ...p, whatsapp_number: e.target.value }))}
                          placeholder="5511999999999"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">E-mail Administrativo</label>
                        <input
                          type="email"
                          required
                          value={settings.contact_email}
                          onChange={(e) => setSettings((p: any) => ({ ...p, contact_email: e.target.value }))}
                          placeholder="contato@roosterfilms.com"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-550 font-semibold">Instagram Handle</label>
                        <input
                          type="text"
                          required
                          value={settings.instagram_handle}
                          onChange={(e) => setSettings((p: any) => ({ ...p, instagram_handle: e.target.value }))}
                          placeholder="@roosterfilms"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-550 font-semibold">Endereço Principal / Sede</label>
                        <input
                          type="text"
                          required
                          value={settings.address}
                          onChange={(e) => setSettings((p: any) => ({ ...p, address: e.target.value }))}
                          placeholder="São Paulo, SP"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-550 font-semibold">Texto do Rodapé</label>
                        <input
                          type="text"
                          required
                          value={settings.footer_text}
                          onChange={(e) => setSettings((p: any) => ({ ...p, footer_text: e.target.value }))}
                          placeholder="© Rooster Films. Todos os direitos reservados."
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-550 font-semibold">Forma de Pagamento Padrão (Exibida no PDF de Proposta)</label>
                        <textarea
                          rows={2}
                          required
                          value={settings.payment_terms || ""}
                          onChange={(e) => setSettings((p: any) => ({ ...p, payment_terms: e.target.value }))}
                          placeholder="- Forma de pagamento padrão: 30% sinal via Pix + saldo parcelado em até 10x sem juros."
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-550 font-semibold">URL / Link do Site (Ex: /casamento ou https://roosterweddings.com/casamento)</label>
                        <input
                          type="text"
                          required
                          value={settings.site_url || ""}
                          onChange={(e) => setSettings((p: any) => ({ ...p, site_url: e.target.value }))}
                          placeholder="/casamento"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Authority Copy */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <Award className="h-4.5 w-4.5 text-gold-400" /> Copys e Textos da Seção de Confiança
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Título Pequeno superior</label>
                        <input
                          type="text"
                          required
                          value={settings.authority_title}
                          onChange={(e) => setSettings((p: any) => ({ ...p, authority_title: e.target.value }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Título Principal Subtítulo</label>
                        <textarea
                          rows={3}
                          required
                          value={settings.authority_subtitle}
                          onChange={(e) => setSettings((p: any) => ({ ...p, authority_subtitle: e.target.value }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FAQ JSON Manager */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                      <h3 className="font-serif text-lg text-white font-light uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle className="h-4.5 w-4.5 text-gold-400" /> Perguntas Frequentes (FAQ)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const items = Array.isArray(settings.faq_items) ? [...settings.faq_items] : [];
                          items.push({ question: "Nova Pergunta", answer: "Nova Resposta" });
                          setSettings((p: any) => ({ ...p, faq_items: items }));
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-gold-450/40 hover:bg-gold-400 hover:text-black transition-all text-[9px] uppercase tracking-wider font-bold cursor-pointer"
                      >
                        + Adicionar FAQ
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar-thin">
                      {(Array.isArray(settings.faq_items) ? settings.faq_items : []).map((faq: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg bg-black/35 border border-zinc-800 space-y-3 relative text-left">
                          <button
                            type="button"
                            onClick={() => {
                              const items = settings.faq_items.filter((_: any, i: number) => i !== idx);
                              setSettings((p: any) => ({ ...p, faq_items: items }));
                            }}
                            className="absolute top-2 right-2 text-zinc-550 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold">Pergunta</span>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const items = [...settings.faq_items];
                                items[idx].question = e.target.value;
                                setSettings((p: any) => ({ ...p, faq_items: items }));
                              }}
                              className="px-3.5 py-2 bg-black/40 border border-zinc-700 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold">Resposta</span>
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const items = [...settings.faq_items];
                                items[idx].answer = e.target.value;
                                setSettings((p: any) => ({ ...p, faq_items: items }));
                              }}
                              className="px-3.5 py-2 bg-black/40 border border-zinc-700 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grid 3: Testimonials Settings */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-gold-400" /> Configurações dos Depoimentos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Quantidade de depoimentos exibidos por página (limite total)</label>
                        <select
                          value={settings.testimonial_per_page ?? 4}
                          onChange={(e) => setSettings((p: any) => ({ ...p, testimonial_per_page: Number(e.target.value) }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        >
                          <option value={1}>1 depoimento</option>
                          <option value={2}>2 depoimentos</option>
                          <option value={3}>3 depoimentos</option>
                          <option value={4}>4 depoimentos</option>
                          <option value={6}>6 depoimentos</option>
                          <option value={8}>8 depoimentos</option>
                          <option value={10}>10 depoimentos</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Quantidade de depoimentos por slide (layout grid)</label>
                        <select
                          value={settings.testimonial_per_slide ?? 1}
                          onChange={(e) => setSettings((p: any) => ({ ...p, testimonial_per_slide: Number(e.target.value) }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        >
                          <option value={1}>1 por vez</option>
                          <option value={2}>2 por vez</option>
                          <option value={3}>3 por vez</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Velocidade de transição (em ms)</label>
                        <input
                          type="number"
                          required
                          value={settings.testimonial_transition_speed ?? 3000}
                          onChange={(e) => setSettings((p: any) => ({ ...p, testimonial_transition_speed: Number(e.target.value) }))}
                          placeholder="3000"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Auto play</label>
                        <select
                          value={settings.testimonial_autoplay ? "true" : "false"}
                          onChange={(e) => setSettings((p: any) => ({ ...p, testimonial_autoplay: e.target.value === "true" }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Estilo da Seção de Depoimentos</label>
                        <select
                          value={settings.testimonial_style ?? "classico"}
                          onChange={(e) => setSettings((p: any) => ({ ...p, testimonial_style: e.target.value }))}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        >
                          <option value="classico">Clássico</option>
                          <option value="centralizado">Card Centralizado</option>
                          <option value="grid">Grid de Depoimentos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                      Salvar Todas as Configurações
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "conta_seguranca" && (
              <div className="space-y-10 text-left">
                <div>
                  <h1 className="font-serif text-3xl font-light text-white flex items-center gap-3">
                    <Lock className="h-7 w-7 text-gold-450" /> Conta & Segurança
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">Gerencie suas credenciais de acesso, sessões ativas, segurança da conta administrativa e autenticação multifator.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                  {/* SEÇÃO 1: INFORMAÇÕES DA CONTA */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="h-4.5 w-4.5 text-gold-400" /> Informações da Conta
                    </h3>
                    <form onSubmit={handleUpdateAccountInfo} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {adminAvatar ? (
                            <img src={adminAvatar} alt="Admin Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl font-serif text-gold-400">{adminName ? adminName[0].toUpperCase() : "A"}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold cursor-pointer px-3 py-1.5 rounded border border-zinc-700 bg-black/20 hover:bg-zinc-900 text-zinc-355 hover:text-white transition-colors">
                            Alterar Foto
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          </label>
                          <span className="text-[9px] text-zinc-500">Recomendado: 200x200px (JPG/PNG).</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Nome do Administrador</label>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">E-mail de Login (Somente Leitura)</label>
                        <input
                          type="email"
                          disabled
                          value={session?.user?.email || "admin@rooster.com"}
                          className="px-4 py-3 bg-black/20 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed select-none font-medium"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Telefone / Contato</label>
                        <input
                          type="text"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="+55 (11) 99999-9999"
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingAccountInfo}
                        className="w-full py-3 rounded-lg bg-gold-400 hover:bg-gold-505 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {savingAccountInfo ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Alterações
                      </button>
                    </form>
                  </div>

                  {/* SEÇÃO 2: ALTERAR SENHA */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <Key className="h-4.5 w-4.5 text-gold-400" /> Alterar Senha
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Senha Atual</label>
                        <input
                          type="password"
                          required={!!newPassword}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Nova Senha</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      {/* Password strength indicator */}
                      {newPassword && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] uppercase tracking-wider text-zinc-550 font-semibold">
                            <span>Força da Senha:</span>
                            <span className={
                              getPasswordStrength(newPassword).score >= 3 ? "text-green-400" :
                              getPasswordStrength(newPassword).score === 2 ? "text-amber-400" : "text-red-400"
                            }>
                              {getPasswordStrength(newPassword).label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                            <div className={`h-full flex-1 transition-all ${getPasswordStrength(newPassword).score >= 1 ? getPasswordStrength(newPassword).color : 'bg-zinc-800'}`} />
                            <div className={`h-full flex-1 transition-all ${getPasswordStrength(newPassword).score >= 2 ? getPasswordStrength(newPassword).color : 'bg-zinc-800'}`} />
                            <div className={`h-full flex-1 transition-all ${getPasswordStrength(newPassword).score >= 3 ? getPasswordStrength(newPassword).color : 'bg-zinc-800'}`} />
                            <div className={`h-full flex-1 transition-all ${getPasswordStrength(newPassword).score >= 4 ? getPasswordStrength(newPassword).color : 'bg-zinc-800'}`} />
                          </div>
                          <p className="text-[9px] text-zinc-500 leading-relaxed">Dica: Use pelo menos 8 caracteres, incluindo letras maiúsculas, números e caracteres especiais.</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="px-4 py-3 bg-black/40 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-450 text-zinc-200"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full py-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-750 hover:border-zinc-650 font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {updatingPassword ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Atualizar Senha
                      </button>
                    </form>
                  </div>

                  {/* SEÇÃO 3: SEGURANÇA */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-gold-400" /> Auditoria de Segurança
                    </h3>
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="flex justify-between py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Data de Criação da Conta</span>
                        <span className="text-zinc-300 font-mono">{session?.user?.created_at ? new Date(session.user.created_at).toLocaleString("pt-BR") : new Date().toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Último Acesso</span>
                        <span className="text-zinc-300 font-mono">{session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Último IP Utilizado</span>
                        <span className="text-zinc-300 font-mono">189.120.45.12</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Status da Conta</span>
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider">Ativa</span>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 4: SESSÕES ATIVAS */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                      <h3 className="font-serif text-lg text-white font-light uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4.5 w-4.5 text-gold-400" /> Sessões Ativas
                      </h3>
                      {activeSessions.length > 1 && (
                        <button
                          type="button"
                          onClick={handleRevokeAllOtherSessions}
                          className="text-[9px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors border border-red-500/30 hover:border-red-500/60 px-3 py-1.5 rounded-full cursor-pointer bg-red-950/10"
                        >
                          Encerrar Outras
                        </button>
                      )}
                    </div>
                    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar-thin">
                      {activeSessions.map((sess) => (
                        <div key={sess.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-3">
                            {sess.device.includes("iPhone") ? (
                              <Smartphone className="h-5 w-5 text-zinc-500" />
                            ) : (
                              <Laptop className="h-5 w-5 text-zinc-500" />
                            )}
                            <div className="text-left">
                              <span className="text-xs font-semibold text-zinc-200 block">{sess.device} • {sess.browser}</span>
                              <span className="text-[9px] text-zinc-500 block font-mono">{sess.os} • {sess.dateTime}</span>
                            </div>
                          </div>
                          {!sess.current && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(sess.id)}
                              className="text-[9px] font-bold text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/25 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Encerrar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEÇÃO 5: AUTENTICAÇÃO EM DUAS ETAPAS (2FA) */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <QrCode className="h-4.5 w-4.5 text-gold-400" /> Autenticação em Duas Etapas (2FA)
                    </h3>
                    
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-zinc-800">
                      <div className="text-left space-y-1">
                        <span className="text-xs font-semibold text-zinc-200 block">Ativar autenticação de dois fatores</span>
                        <span className="text-[10px] text-zinc-500 block leading-relaxed max-w-[280px]">Exigir um código de verificação temporário ao realizar o login no painel de administração.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={is2faEnabled}
                          onChange={handleToggle2FA}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-450 peer-checked:after:bg-black" />
                      </label>
                    </div>

                    {isEnrolling2fa && (
                      <div className="bg-black/35 p-5 rounded-lg border border-zinc-700/50 space-y-4 text-center">
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">Escaneie o código QR abaixo com seu aplicativo autenticador (Google Authenticator ou Microsoft Authenticator) e insira o código gerado de 6 dígitos.</p>
                        
                        {qrCodeUrl && (
                          <div className="h-36 w-36 bg-white p-2.5 rounded-lg mx-auto flex items-center justify-center border border-zinc-700">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="h-full w-full object-contain" />
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5 text-xs text-left max-w-[200px] mx-auto">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Código Verificador</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={mfaVerificationCode}
                              onChange={(e) => setMfaVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="123456"
                              className="px-3 py-2 bg-black/40 border border-zinc-700 rounded text-center text-zinc-200 tracking-widest font-mono text-sm focus:outline-none focus:border-gold-450 flex-1"
                            />
                            <button
                              type="button"
                              onClick={handleConfirm2FA}
                              className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-black font-bold text-xs uppercase rounded cursor-pointer transition-colors"
                            >
                              Ativar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 6: NOTIFICAÇÕES */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-6">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-gold-400" /> Preferências de Notificações
                    </h3>
                    <div className="space-y-4 text-left">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Receber e-mail quando:</p>
                      
                      {[
                        { key: "newBudget", label: "Novo orçamento recebido pelo site" },
                        { key: "proposalAccepted", label: "Nova proposta comercial aceita pelo cliente" },
                        { key: "leadWon", label: "Lead mudar para status FECHADO (Ganho)" },
                        { key: "emailFailure", label: "Falha na tentativa de envio de e-mail ao cliente" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 text-xs text-zinc-300 hover:text-white cursor-pointer select-none font-semibold">
                          <input
                            type="checkbox"
                            checked={(notifications as any)[item.key]}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="rounded border-zinc-700 text-gold-450 bg-black/40 h-4.5 w-4.5 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-gold-400"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SEÇÃO 7: DADOS DE ACESSO SUPABASE */}
                  <div className="glass-panel border-zinc-900 rounded-xl p-6 space-y-4 lg:col-span-2">
                    <h3 className="font-serif text-lg text-white font-light border-b border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-gold-400" /> Dados de Acesso Supabase (Somente Leitura)
                    </h3>
                    
                    <div className="bg-black/35 p-4 rounded-lg border border-zinc-800 font-mono text-[10.5px] text-zinc-450 space-y-2 select-all overflow-x-auto text-left">
                      <div><span className="text-zinc-600 font-semibold">Usuário Atual:</span> {session?.user?.email || "stackeleonardo@gmail.com"}</div>
                      <div><span className="text-zinc-600 font-semibold">Role:</span> {session?.user?.role || "authenticated"}</div>
                      <div><span className="text-zinc-600 font-semibold">UID:</span> {session?.user?.id || "mock-admin-uid-999-888-777"}</div>
                    </div>
                  </div>

                  {/* SEÇÃO 8: ZONA DE PERIGO (DANGER ZONE) */}
                  <div className="glass-panel border-red-500/20 rounded-xl p-6 space-y-6 lg:col-span-2 bg-red-950/[0.01]">
                    <h3 className="font-serif text-lg text-red-400 font-light border-b border-red-950/40 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500" /> Zona de Perigo
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="text-left space-y-1">
                        <span className="text-xs font-semibold text-zinc-200 block">Sair de todos os dispositivos</span>
                        <span className="text-[10px] text-zinc-500 block leading-relaxed">Encerrar todas as conexões ativas associadas a este usuário na nuvem Supabase.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignoutAllDevices}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-red-500/20 hover:border-red-500/50 text-red-400 text-xs uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Sair globalmente
                      </button>
                    </div>

                    <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="text-left space-y-1">
                        <span className="text-xs font-semibold text-red-400 block">Excluir conta administrativa</span>
                        <span className="text-[10px] text-zinc-500 block leading-relaxed">Deleta permanentemente esta conta e as permissões de acesso ao painel do administrador.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-5 py-2.5 bg-red-650/10 hover:bg-red-655/25 border border-red-500/30 hover:border-red-500 text-red-500 text-xs uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Excluir Conta Admin
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {/* --- ADD / EDIT GLOBAL MODAL --- */}
      {isModalOpen && currentEditItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-panel border-zinc-800 rounded-xl p-6 md:p-8 relative my-8 text-left">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setCurrentEditItem(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-xl text-white font-light mb-6 border-b border-zinc-900 pb-3 uppercase tracking-wider">
              {isEditing ? "Editar Registro" : "Adicionar Registro"}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoadingData(true);
                
                try {
                  const table = activeTab === "portfolio" ? "portfolio" :
                                activeTab === "galeria" ? "photos" :
                                activeTab === "pacotes" ? "packages" :
                                activeTab === "servicos" ? "services" :
                                activeTab === "beneficios" ? "benefits" :
                                activeTab === "depoimentos" ? "testimonials" :
                                activeTab === "diferenciais" ? "features" : "";

                  if (!table) return;

                  let res;
                  const isNewItem = !isEditing;

                  if (!isNewItem) {
                    res = await supabase.from(table).update(currentEditItem).eq("id", currentEditItem.id);
                  } else {
                    if (table === "services") {
                      // Keep ID for services since it has a user-entered text primary key
                      const { id, ...insertData } = currentEditItem;
                      res = await supabase.from(table).insert({ id: id.trim(), ...insertData, event_type: activeEventType });
                    } else if (table === "testimonials") {
                      const { id, ...insertData } = currentEditItem;
                      res = await supabase.from(table).insert({ 
                        ...insertData, 
                        event_type: currentEditItem.event_type || activeEventType 
                      });
                    } else {
                      const { id, ...insertData } = currentEditItem;
                      res = await supabase.from(table).insert({ ...insertData, event_type: activeEventType });
                    }
                  }

                  if (res.error) {
                    alert("Erro ao salvar: " + res.error.message);
                  } else {
                    setIsModalOpen(false);
                    setCurrentEditItem(null);
                    loadAllTables();
                  }
                } catch (err: any) {
                  alert("Erro ao executar operação: " + err.message);
                } finally {
                  setLoadingData(false);
                }
              }}
              className="space-y-4"
            >
              {/* PORTFOLIO MODAL FIELDS */}
              {activeTab === "portfolio" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Título do Filme</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.title}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, title: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Casal</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.couple}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, couple: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Cidade / Espaço</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.location}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, location: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Duração (Ex: 4:15)</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.duration}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, duration: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Link do Vídeo (Vimeo ou YouTube)</label>
                    <input
                      type="url"
                      required
                      value={currentEditItem.video_url}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, video_url: e.target.value }))}
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">URL da Thumbnail / Capa</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={currentEditItem.cover_image}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, cover_image: e.target.value }))}
                        className="flex-1 px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                      <label className="px-4 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, (url) => setCurrentEditItem((p: any) => ({ ...p, cover_image: url })))}
                        />
                        {uploadingFile ? "Subindo..." : "Upload"}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Ordem</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Categoria</label>
                      <select
                        value={currentEditItem.category}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, category: e.target.value }))}
                        className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="videos">Vídeos</option>
                        <option value="teaser">Teaser</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="highlighted"
                        checked={currentEditItem.highlighted}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, highlighted: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="highlighted" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Destaque</label>
                    </div>
                  </div>
                </>
              )}

              {/* PHOTO GALLERY MODAL FIELDS */}
              {activeTab === "galeria" && (
                <>
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Carregar Imagem</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={currentEditItem.url}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, url: e.target.value }))}
                        placeholder="Link direto ou clique em Upload"
                        className="flex-1 px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                      />
                      <label className="px-4 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, (url) => setCurrentEditItem((p: any) => ({ ...p, url })))}
                        />
                        {uploadingFile ? "Subindo..." : "Upload"}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Texto Alternativo (Alt)</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.alt}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, alt: e.target.value }))}
                        placeholder="Ex: O beijo sob o véu"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Legenda Descritiva</label>
                      <input
                        type="text"
                        value={currentEditItem.caption || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, caption: e.target.value }))}
                        placeholder="Ex: Retrato poético do casal"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ordem</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Categoria</label>
                      <select
                        value={currentEditItem.category}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, category: e.target.value }))}
                        className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="cerimonia">Cerimônia</option>
                        <option value="making_of">Making Of</option>
                        <option value="ensaio">Ensaio Pré-Wedding</option>
                        <option value="recepcao">Recepção / Festa</option>
                        <option value="detalhes">Detalhes</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="photo_highlighted"
                        checked={currentEditItem.highlighted}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, highlighted: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="photo_highlighted" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Destaque</label>
                    </div>
                  </div>
                </>
              )}

              {/* RECOMMENDED PACKAGES MODAL FIELDS */}
              {activeTab === "pacotes" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Nome do Pacote</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.name}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Histórias"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Categoria / Sugestão</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.category}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, category: e.target.value }))}
                        placeholder="Ex: Recomendada"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Descrição Curta</label>
                    <textarea
                      rows={2}
                      required
                      value={currentEditItem.description}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, description: e.target.value }))}
                      placeholder="Descrição poética sobre a cobertura..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  {/* Multi select Inclusions */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold block mb-1">Itens Inclusos no Combo</label>
                    <div className="grid grid-cols-2 gap-2 bg-black/35 p-3 rounded-lg border border-zinc-900 max-h-[150px] overflow-y-auto custom-scrollbar-thin">
                      {services.map((srv) => {
                        const isChecked = currentEditItem.inclusions?.includes(srv.id);
                        return (
                          <div key={srv.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`chk_inc_${srv.id}`}
                              checked={isChecked}
                              onChange={(e) => {
                                const inclusions = currentEditItem.inclusions || [];
                                if (e.target.checked) {
                                  setCurrentEditItem((p: any) => ({ ...p, inclusions: [...inclusions, srv.id] }));
                                } else {
                                  setCurrentEditItem((p: any) => ({ ...p, inclusions: inclusions.filter((id: string) => id !== srv.id) }));
                                }
                              }}
                              className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                            />
                            <label htmlFor={`chk_inc_${srv.id}`} className="text-[11px] text-zinc-350 select-none cursor-pointer truncate block">{srv.name}</label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Preço Base (Sem desconto)</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.base_price}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, base_price: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Preço Promocional</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.promo_price}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, promo_price: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Badge Superior</label>
                      <input
                        type="text"
                        value={currentEditItem.badge || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, badge: e.target.value }))}
                        placeholder="Ex: MAIS ESCOLHIDA"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Destaque Cor</label>
                      <select
                        value={currentEditItem.highlight_color || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, highlight_color: e.target.value }))}
                        className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="">Nenhum</option>
                        <option value="gold">Glow de Ouro</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="pkg_active"
                        checked={currentEditItem.active}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="pkg_active" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativo</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Benefício Principal</label>
                      <select
                        value={currentEditItem.benefit_type || "desconto"}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, benefit_type: e.target.value }))}
                        className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="desconto">Desconto</option>
                        <option value="brinde">Brinde</option>
                        <option value="entrega_prioritaria">Entrega Prioritária</option>
                        <option value="upgrade">Upgrade</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Descrição do Benefício</label>
                      <input
                        type="text"
                        value={currentEditItem.benefit_desc || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, benefit_desc: e.target.value }))}
                        placeholder="Ex: Economize R$ 300"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Prioridade de Recomendação</label>
                      <input
                        type="number"
                        value={currentEditItem.recommendation_priority || 0}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, recommendation_priority: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="pkg_recommend"
                        checked={currentEditItem.enable_recommendations !== false}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, enable_recommendations: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="pkg_recommend" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativar Recomendações</label>
                    </div>
                  </div>
                </>
              )}

              {/* SERVICES MODAL FIELDS */}
              {activeTab === "servicos" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">ID do Serviço (Sem espaços)</label>
                      <input
                        type="text"
                        required
                        disabled={isEditing} // Prevent modifying ID of existing items to prevent breaking combo relationships
                        value={currentEditItem.id}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                        placeholder="Ex: captacao_festa"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-mono disabled:opacity-50"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Nome de Exibição</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.name}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Cobertura da Festa"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Descrição</label>
                    <textarea
                      rows={2}
                      required
                      value={currentEditItem.description}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, description: e.target.value }))}
                      placeholder="Descrição clara e de valor percebido..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Valor Base (R$)</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.price}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, price: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Categoria</label>
                      <select
                        value={currentEditItem.category}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, category: e.target.value }))}
                        className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="pre_wedding">Pré Wedding</option>
                        <option value="captacao">Captação</option>
                        <option value="videos">Edição / Filmes</option>
                        <option value="extras">Serviço Adicional</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Imagem de Fundo (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentEditItem.bg_image || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, bg_image: e.target.value }))}
                        placeholder="Link da imagem de fundo ou faça upload..."
                        className="flex-1 px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                      />
                      <label className="px-4 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-gold-450 hover:bg-gold-400/5 text-zinc-400 hover:text-gold-200 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, (url) => setCurrentEditItem((p: any) => ({ ...p, bg_image: url })))}
                        />
                        {uploadingFile ? "Subindo..." : "Upload"}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ordem Exibição</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="srv_required"
                        checked={currentEditItem.required}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, required: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="srv_required" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Obrigatório</label>
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="srv_active"
                        checked={currentEditItem.active}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="srv_active" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativo</label>
                    </div>
                  </div>
                </>
              )}

              {/* BENEFITS MODAL FIELDS */}
              {activeTab === "beneficios" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Título do Benefício</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.benefit_title}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, benefit_title: e.target.value }))}
                        placeholder="Ex: Entrega Prioritária"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Valor Meta Alvo (R$)</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.target_price}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, target_price: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Descrição do Benefício (Ao desbloquear)</label>
                    <textarea
                      rows={2}
                      required
                      value={currentEditItem.benefit_description}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, benefit_description: e.target.value }))}
                      placeholder="Descrição sobre o brinde ou bônus que será ganho..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Mensagem de Bloqueio (Use {"{missing}"} para valor faltante)</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.missing_text}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, missing_text: e.target.value }))}
                      placeholder="Falta R$ {missing} para desbloquear..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ordem</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="benefit_active"
                        checked={currentEditItem.active}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="benefit_active" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativo</label>
                    </div>
                  </div>
                </>
              )}

              {/* TESTIMONIALS MODAL FIELDS */}
              {activeTab === "depoimentos" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Nome do Cliente</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.client_name || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, client_name: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Subtítulo (Local / Detalhe)</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.subtitle || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, subtitle: e.target.value }))}
                        placeholder="Ex: Fazenda Vila Rica, Itatiba - SP"
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Depoimento</label>
                    <textarea
                      rows={4}
                      required
                      value={currentEditItem.quote || ""}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, quote: e.target.value }))}
                      placeholder="Texto completo do feedback..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Estrelas (1 a 5)</label>
                      <select
                        value={currentEditItem.stars || 5}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, stars: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value={5}>5 Estrelas</option>
                        <option value={4}>4 Estrelas</option>
                        <option value={3}>3 Estrelas</option>
                        <option value={2}>2 Estrelas</option>
                        <option value={1}>1 Estrela</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Experiência</label>
                      <select
                        value={currentEditItem.event_type || activeEventType}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, event_type: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="casamento">Casamento</option>
                        <option value="aniversario">Aniversário</option>
                        <option value="revelacao">Revelação</option>
                      </select>
                    </div>
                  </div>

                  {/* FOTO DO CLIENTE UPLOAD */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Foto do Cliente</label>
                    <div className="flex gap-4 items-center">
                      {currentEditItem.image_url ? (
                        <img
                          src={currentEditItem.image_url}
                          alt="Previsualização"
                          className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-650 text-xs">
                          Sem foto
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] tracking-wider uppercase font-semibold text-zinc-350 cursor-pointer transition-colors inline-flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingFile ? "Carregando..." : "Selecionar Foto"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingFile}
                            onChange={(e) => handlePhotoUpload(e, (url) => setCurrentEditItem((p: any) => ({ ...p, image_url: url })))}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[9px] text-zinc-500 mt-1">Upload via Supabase Storage</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ordem de Exibição</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order ?? 0}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="testimonial_active"
                        checked={currentEditItem.active ?? true}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="testimonial_active" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativo</label>
                    </div>
                  </div>
                </>
              )}

              {/* FEATURES (DIFERENCIAIS) MODAL FIELDS */}
              {activeTab === "diferenciais" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Título</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.title || ""}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, title: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                        placeholder="Ex: Sentimos Cada História"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ícone</label>
                      <select
                        value={currentEditItem.icon || "heart"}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, icon: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="heart">Coração (Heart)</option>
                        <option value="film">Filme (Film)</option>
                        <option value="eye">Olho (Eye)</option>
                        <option value="clock">Relógio (Clock)</option>
                        <option value="sparkles">Brilho (Sparkles)</option>
                        <option value="shield">Escudo (Shield)</option>
                        <option value="award">Prêmio (Award)</option>
                        <option value="star">Estrela (Star)</option>
                        <option value="camera">Câmera (Camera)</option>
                        <option value="smile">Sorriso (Smile)</option>
                        <option value="video">Vídeo (Video)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Descrição</label>
                    <textarea
                      rows={3}
                      required
                      value={currentEditItem.description || ""}
                      onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, description: e.target.value }))}
                      placeholder="Descreva o diferencial em poucas palavras..."
                      className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Ordem</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.display_order ?? 0}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, display_order: Number(e.target.value) }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-550 font-semibold">Experiência</label>
                      <select
                        value={currentEditItem.event_type || activeEventType}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, event_type: e.target.value }))}
                        className="px-3.5 py-2.5 bg-black/40 border border-zinc-800 rounded focus:outline-none focus:border-gold-450 text-zinc-200"
                      >
                        <option value="casamento">Casamento</option>
                        <option value="aniversario">Aniversário</option>
                        <option value="revelacao">Revelação</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 h-full pt-4 pl-2">
                      <input
                        type="checkbox"
                        id="feat_active"
                        checked={currentEditItem.active ?? true}
                        onChange={(e) => setCurrentEditItem((p: any) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-zinc-800 text-gold-400 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <label htmlFor="feat_active" className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold cursor-pointer">Ativo</label>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentEditItem(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs tracking-wider uppercase font-semibold cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-500 text-black text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4.5 w-4.5" />
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewLeadModalOpen && (() => {
        const leadCalculatedTotal = services
          .filter((s: any) => s.event_type === newLeadEventType && newLeadSelectedServices.includes(s.id))
          .reduce((sum: number, s: any) => sum + (s.price || 0), 0);
        const leadFinalTotal = Math.max(0, leadCalculatedTotal - newLeadDiscount);

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-white font-sans">
            <div className="w-full max-w-lg bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar-thin">
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-zinc-550 hover:text-zinc-250 hover:bg-zinc-900 rounded transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="font-serif text-xl text-white uppercase tracking-widest">Adicionar Novo Lead</h3>
                <p className="text-xs text-zinc-550 mt-1">Insira manualmente os dados do novo cliente/lead.</p>
              </div>
              
              <form onSubmit={handleCreateNewLead} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700"
                      placeholder="Ex: Amanda & Lucas"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700"
                      placeholder="Ex: 5511999999999"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Tipo de Evento</label>
                    <select
                      value={newLeadEventType}
                      onChange={(e) => {
                        setNewLeadEventType(e.target.value as any);
                        setNewLeadSelectedServices([]);
                      }}
                      className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white cursor-pointer"
                    >
                      <option value="casamento">Casamento</option>
                      <option value="aniversario">Aniversário</option>
                      <option value="revelacao">Chá Revelação</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Data do Evento *</label>
                    <input
                      type="date"
                      required
                      value={newLeadDate}
                      onChange={(e) => setNewLeadDate(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Local do Evento *</label>
                    <input
                      type="text"
                      required
                      value={newLeadLocation}
                      onChange={(e) => setNewLeadLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700"
                      placeholder="Espaço, Cidade - UF"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Origem do Lead</label>
                    <select
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white cursor-pointer"
                    >
                      <option value="Site">Site / Simulador</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Indicação">Indicação</option>
                      <option value="WhatsApp">WhatsApp Direto</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* Chosen Services Section */}
                  <div className="col-span-2 flex flex-col gap-1.5 border-t border-zinc-900/60 pt-3 mt-1">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold block mb-1">
                      Serviços Escolhidos
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/35 p-3 rounded-lg border border-zinc-900 max-h-[160px] overflow-y-auto custom-scrollbar-thin">
                      {services
                        .filter((s: any) => s.event_type === newLeadEventType && s.active)
                        .map((s: any) => {
                          const isChecked = newLeadSelectedServices.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 text-[11px] text-zinc-350 hover:text-zinc-200 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setNewLeadSelectedServices(prev => 
                                    isChecked ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className="rounded border-zinc-800 text-gold-450 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 bg-black cursor-pointer"
                              />
                              <span>{s.name} <span className="text-gold-455 font-medium font-mono">({s.price ? `R$ ${s.price.toLocaleString("pt-BR")}` : "Grátis"})</span></span>
                            </label>
                          );
                        })}
                      {services.filter((s: any) => s.event_type === newLeadEventType && s.active).length === 0 && (
                        <span className="text-[10px] text-zinc-650 col-span-2 italic text-center py-2">Nenhum serviço ativo encontrado para este tipo de evento.</span>
                      )}
                    </div>
                  </div>

                  {/* Discount and Calculated Total */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Desconto (R$)</label>
                    <input
                      type="number"
                      min="0"
                      value={newLeadDiscount || ""}
                      onChange={(e) => setNewLeadDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700 font-mono"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Valor Fechado (R$)</label>
                    <div className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-gold-400 font-bold flex items-center h-[34px] font-mono select-none">
                      R$ {leadFinalTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-semibold">Observações / Detalhes</label>
                    <textarea
                      rows={2}
                      value={newLeadNotes}
                      onChange={(e) => setNewLeadNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-zinc-900 rounded-lg focus:outline-none focus:border-gold-450 text-xs text-white placeholder-zinc-700"
                      placeholder="Notas adicionais sobre o contato..."
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-900/60">
                  <button
                    type="button"
                    onClick={() => setIsNewLeadModalOpen(false)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white rounded-full text-xs font-semibold tracking-wider text-zinc-450 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs tracking-wider uppercase rounded-full cursor-pointer shadow shadow-gold-500/5 active:scale-95 transition-all"
                  >
                    Criar Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {timePickerOpen && timePickerTarget && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[99] animate-fadeIn text-white">
          <style dangerouslySetInnerHTML={{__html: `
            .wheel-container::-webkit-scrollbar {
              display: none;
            }
            .wheel-container {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
          
          <div className="w-full max-w-[320px] bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative shadow-2xl flex flex-col gap-4 text-center font-sans">
            <div>
              <span className="text-[9px] tracking-[0.2em] text-gold-400 uppercase font-bold block">Seletor de Horário</span>
              <h3 className="font-serif text-base text-zinc-100 uppercase tracking-widest mt-1">
                {timePickerTarget.field === "start_time" ? "Horário de Início" : "Horário de Término"}
              </h3>
            </div>
            
            {/* iOS style wheel container */}
            <div className="relative h-[200px] border border-zinc-900/60 bg-[#070708] rounded-xl flex items-center justify-center overflow-hidden">
              {/* Highlight pill in the center */}
              <div className="absolute left-0 right-0 top-[80px] h-10 bg-gold-400/[0.05] border-y border-gold-400/20 pointer-events-none z-0" />
              
              {/* iOS style gradients for fade-out effect */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#070708] via-[#070708]/70 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#070708] via-[#070708]/70 to-transparent pointer-events-none z-10" />
              
              {/* Columns */}
              <div className="flex w-full px-6 relative z-10 justify-center gap-6 h-full items-stretch">
                
                {/* Hours Wheel */}
                <div 
                  ref={hoursScrollRef}
                  onScroll={handleHoursScroll}
                  className="wheel-container w-14 overflow-y-auto snap-y snap-mandatory h-full py-[80px] text-center"
                >
                  {hoursList.map((h) => (
                    <div
                      key={h}
                      onClick={() => selectHour(h)}
                      className={`h-10 flex items-center justify-center snap-center text-lg transition-all duration-200 cursor-pointer select-none ${
                        selectedHour === h ? "text-gold-400 font-bold scale-110" : "text-zinc-500 hover:text-zinc-350"
                      }`}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                
                {/* Separator */}
                <div className="flex items-center text-gold-400/40 text-xl font-bold h-10 mt-[80px] select-none">
                  :
                </div>
                
                {/* Minutes Wheel */}
                <div 
                  ref={minutesScrollRef}
                  onScroll={handleMinutesScroll}
                  className="wheel-container w-14 overflow-y-auto snap-y snap-mandatory h-full py-[80px] text-center"
                >
                  {minutesList.map((m) => (
                    <div
                      key={m}
                      onClick={() => selectMinute(m)}
                      className={`h-10 flex items-center justify-center snap-center text-lg transition-all duration-200 cursor-pointer select-none ${
                        selectedMinute === m ? "text-gold-400 font-bold scale-110" : "text-zinc-500 hover:text-zinc-350"
                      }`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
                
              </div>
            </div>

            {/* Presets Grid */}
            <div className="text-left mt-1">
              <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-bold block mb-2">Sugestões (Presets)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {["08:00", "09:30", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`py-1 border rounded text-[10px] font-medium transition-all cursor-pointer ${
                      (selectedHour + ":" + selectedMinute) === preset
                        ? "border-gold-400 bg-gold-400/10 text-gold-400"
                        : "border-zinc-900 bg-black/40 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-900/60">
              <button
                type="button"
                onClick={() => setTimePickerOpen(false)}
                className="py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-full text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSaveTimePicker}
                className="py-2 bg-gold-400 hover:bg-gold-500 text-black rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-gold-500/5 active:scale-95 transition-all"
              >
                Concluído
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
