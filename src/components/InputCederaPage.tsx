import { useEffect, useState, useCallback, useMemo } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { Menu, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { ModalRingkasanData, LaporanData } from "./ModalRingkasanData";

interface InputCederaPageProps {
  onNavigate: (page: string) => void;
  userRole?: "coach" | "regional" | "national"; // masih dipakai utk UI pilihan activity
  userName?: string;
  onLogout?: () => void;
}

interface InjuryDetail {
  location: string;
  injuryType: string;
  mechanism: string;
}

interface InjuryFormData {
  // Step 1: Event Information
  athleteName: string;
  gender: string;
  age: string;
  injuryDate: string;
  activityType: string;
  activityTypeOther: string; // For "Lainnya" option
  activityContext: string;
  activityContextOther: string; // For "Lainnya" option

  // Step 2: Injury Information
  injuryCount: number;
  injuries: InjuryDetail[];

  // Step 3: Initial Assessment
  movementAbility: string;
  painLevel: string;
  redFlags: string[];
}

export function InputCederaPage({
  onNavigate,
  userRole = "coach",
  onLogout,
}: Omit<InputCederaPageProps, "userName">): React.ReactElement {
  const { user, loadingProfile } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // kalau sedang edit draft existing
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);

  // status UI: Simpan Draft -> 'draft', Ajukan -> 'submitted'
  const [reportStatus, setReportStatus] = useState<"draft" | "submitted">("draft");

  const [formData, setFormData] = useState<InjuryFormData>({
    athleteName: "",
    gender: "",
    age: "",
    injuryDate: new Date().toISOString().split("T")[0],
    activityType: "",
    activityTypeOther: "",
    activityContext: "",
    activityContextOther: "",
    injuryCount: 1,
    injuries: [{ location: "", injuryType: "", mechanism: "" }],
    movementAbility: "",
    painLevel: "",
    redFlags: [],
  });

  // ✅ Modal Ringkasan (dipakai di Step 4 sebagai modal, bukan inline)
  const [showRingkasanModal, setShowRingkasanModal] = useState(false);

  // Map userRole to format expected by PrivateSidebar
  const mappedRole = userRole === "coach" ? "pelatih" : userRole === "regional" ? "admin_daerah" : "admin_nasional";

  const handleLogout = () => {
    // ✅ biar aman: keluar = reset mode edit draft
    sessionStorage.removeItem("iss_edit_draft_id");
    sessionStorage.removeItem("iss_edit_draft_mode");
    if (onLogout) onLogout();
    else onNavigate("logout");
  };

  // Activity types based on role (UI)
  const activityTypes = {
    coach: [
      { value: "latihan", label: "Latihan" },
      { value: "kejadian_lain", label: "Kejadian lain" },
    ],
    regional: [
      { value: "pertandingan", label: "Pertandingan/Kejuaraan" },
      { value: "ujian_tingkat", label: "Ujian Kenaikan Tingkat" },
      { value: "training_camp", label: "Training Camp Daerah" },
      { value: "lainnya", label: "Lainnya" },
      { value: "kejadian_lain", label: "Kejadian lain" },
    ],
  };

  // Activity contexts based on role (UI)
  const activityContexts = {
    coach: [
      { value: "latihan_teknik", label: "Latihan teknik" },
      { value: "latihan_fisik", label: "Latihan kondisi fisik" },
      { value: "sparring", label: "Latih tanding/Sparring" },
      { value: "lainnya", label: "Lainnya" },
    ],
    regional: [
      { value: "pemanasan_pendinginan", label: "Pemanasan/Pendinginan" },
      { value: "pertandingan", label: "Pertandingan" },
      { value: "lainnya", label: "Lainnya" },
    ],
  };

  // Injury location options
  const locationOptions = [
    "Kepala",
    "Wajah",
    "Leher",
    "Bahu",
    "Siku",
    "Pergelangan tangan",
    "Tangan dan jari",
    "Punggung",
    "Dada",
    "Perut",
    "Pinggul",
    "Lutut",
    "Pergelangan kaki",
    "Kaki dan jari",
    "Lainnya",
  ];

  // Injury type options
  const injuryTypeOptions = [
    "Tarikan ligamen",
    "Tarikan otot",
    "Memar",
    "Lecet",
    "Dislokasi",
    "Patah tulang",
    "Dugaan gegar otak",
    "Lainnya",
  ];

  // Mechanism options
  const mechanismOptions = ["Jatuh", "Benturan dengan lawan", "Kuncian", "Penggunaan berulang", "Kelelahan", "Lainnya"];

  // Decision tree calculation
  const calculateSeverityAndRecommendations = () => {
    const { movementAbility, painLevel, redFlags } = formData;

    if (redFlags.length > 0 || movementAbility === "unable_to_move" || painLevel === "severe") {
      return {
        severity: "BERAT",
        recommendations: [
          "STOP latihan (wajib)",
          "Jangan memaksakan gerak",
          "Prioritaskan keselamatan atlet",
          "Rujuk/koordinasi penanganan lanjutan",
          "Catat di ISS",
        ],
      };
    }

    return {
      severity: "RINGAN-SEDANG",
      recommendations: [
        "Latihan boleh dilanjutkan terbatas",
        "Intensitas diturunkan",
        "Hindari teknik berisiko",
        "Pantau kondisi atlet",
        "Rujuk bila tidak membaik",
        "Tetap dicatat di ISS",
      ],
    };
  };

  const resetFormToBlank = useCallback(() => {
    setEditingDraftId(null);
    setReportStatus("draft");
    setCurrentStep(1);
    setFormData({
      athleteName: "",
      gender: "",
      age: "",
      injuryDate: new Date().toISOString().split("T")[0],
      activityType: "",
      activityTypeOther: "",
      activityContext: "",
      activityContextOther: "",
      injuryCount: 1,
      injuries: [{ location: "", injuryType: "", mechanism: "" }],
      movementAbility: "",
      painLevel: "",
      redFlags: [],
    });
  }, []);

  const handleChange = (field: keyof InjuryFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value as InjuryFormData[typeof field] }));
  };

  const handleInjuryCountChange = (count: number) => {
    const newCount = Math.min(Math.max(1, count), 3);
    const newInjuries = Array(newCount)
      .fill(null)
      .map((_, index) => formData.injuries[index] || { location: "", injuryType: "", mechanism: "" });
    setFormData((prev) => ({ ...prev, injuryCount: newCount, injuries: newInjuries }));
  };

  const handleInjuryChange = (index: number, field: keyof InjuryDetail, value: string) => {
    const newInjuries = [...formData.injuries];
    newInjuries[index] = { ...newInjuries[index], [field]: value };
    setFormData((prev) => ({ ...prev, injuries: newInjuries }));
  };

  const handleRedFlagChange = (flag: string) => {
    setFormData((prev) => ({
      ...prev,
      redFlags: prev.redFlags.includes(flag) ? prev.redFlags.filter((f) => f !== flag) : [...prev.redFlags, flag],
    }));
  };

  // ================
  // VALIDATION
  // ================
  const needsActivityTypeOther = useMemo(() => {
    return formData.activityType === "kejadian_lain" || formData.activityType === "lainnya";
  }, [formData.activityType]);

  const needsActivityContextOther = useMemo(() => {
    return formData.activityContext === "lainnya";
  }, [formData.activityContext]);

  // untuk Next per-step
  const canProceed = () => {
    if (currentStep === 1) {
      return (
        !!formData.athleteName.trim() &&
        !!formData.gender &&
        !!formData.age &&
        !!formData.injuryDate &&
        !!formData.activityType &&
        (!needsActivityTypeOther || !!formData.activityTypeOther.trim()) &&
        !!formData.activityContext &&
        (!needsActivityContextOther || !!formData.activityContextOther.trim())
      );
    }
    if (currentStep === 2) {
      return formData.injuries.every((injury) => injury.location && injury.injuryType && injury.mechanism);
    }
    if (currentStep === 3) {
      return !!formData.movementAbility && !!formData.painLevel;
    }
    return true;
  };

  // ✅ untuk tombol Simpan Draft: hanya muncul kalau SEMUA wajib sudah lengkap (step 1–3)
  const canSaveDraft = useMemo(() => {
    const step1ok =
      !!formData.athleteName.trim() &&
      !!formData.gender &&
      !!formData.age &&
      !!formData.injuryDate &&
      !!formData.activityType &&
      (!needsActivityTypeOther || !!formData.activityTypeOther.trim()) &&
      !!formData.activityContext &&
      (!needsActivityContextOther || !!formData.activityContextOther.trim());

    const step2ok = formData.injuries.every((injury) => injury.location && injury.injuryType && injury.mechanism);
    const step3ok = !!formData.movementAbility && !!formData.painLevel;

    return step1ok && step2ok && step3ok;
  }, [formData, needsActivityTypeOther, needsActivityContextOther]);

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // =========================
  // BACKEND: Save Draft / Submit
  // =========================
  const buildPayload = useCallback(
    (status: "draft" | "submitted") => {
      if (!user?.id) throw new Error("Anda belum login.");

      return {
        user_id: user.id,
        athlete_name: formData.athleteName.trim(),
        gender: formData.gender,
        age: Number(formData.age),
        injury_date: formData.injuryDate,
        activity_type: formData.activityType,
        activity_type_other: formData.activityTypeOther?.trim() || null,
        activity_context: formData.activityContext,
        activity_context_other: formData.activityContextOther?.trim() || null,
        injury_count: formData.injuryCount,
        injuries: formData.injuries,
        movement_ability: formData.movementAbility,
        pain_level: formData.painLevel,
        red_flags: formData.redFlags,
        status,
        updated_at: new Date().toISOString(),
      };
    },
    [user?.id, formData]
  );

  const upsertReport = useCallback(
    async (status: "draft" | "submitted") => {
      setSaving(true);
      setErrorMsg(null);

      try {
        const payload = buildPayload(status);

        // update existing draft
        if (editingDraftId) {
          const { data: existing, error: fetchErr } = await supabase
            .from("injury_reports")
            .select("status")
            .eq("id", editingDraftId)
            .maybeSingle();

          if (fetchErr) throw fetchErr;

          if (existing?.status && existing.status !== "draft") {
            throw new Error("Laporan ini sudah diajukan dan tidak bisa diubah. Buat laporan baru jika diperlukan.");
          }

          const { error } = await supabase.from("injury_reports").update(payload).eq("id", editingDraftId);
          if (error) throw error;

          setReportStatus(status);
          return editingDraftId;
        }

        // insert new
        const { data, error } = await supabase.from("injury_reports").insert(payload).select("id").single();
        if (error) throw error;

        const newId = data?.id as number;
        setEditingDraftId(newId);
        setReportStatus(status);
        return newId;
      } catch (err) {
        if (err instanceof Error) setErrorMsg(err.message ?? "Gagal menyimpan laporan.");
        else setErrorMsg("Gagal menyimpan laporan.");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [buildPayload, editingDraftId]
  );

  // =========================
  // LOAD DRAFT (hanya kalau user klik "Lanjutkan" dari DraftPage)
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const rawId = sessionStorage.getItem("iss_edit_draft_id");
    const rawMode = sessionStorage.getItem("iss_edit_draft_mode"); // ✅ flag dari DraftPage
    const draftId = rawId ? Number(rawId) : null;

    // ✅ kalau bukan mode edit draft -> harus blank
    if (!rawMode || rawMode !== "1" || !draftId || Number.isNaN(draftId)) {
      resetFormToBlank();
      return;
    }

    (async () => {
      setLoadingDraft(true);
      setErrorMsg(null);

      try {
        const { data, error } = await supabase.from("injury_reports").select("*").eq("id", draftId).maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Draft tidak ditemukan.");
        if (data.user_id !== user.id) throw new Error("Anda tidak punya akses ke draft ini.");

        if (data.status && data.status !== "draft") {
          // ✅ sudah bukan draft, jangan load
          sessionStorage.removeItem("iss_edit_draft_id");
          sessionStorage.removeItem("iss_edit_draft_mode");
          resetFormToBlank();
          throw new Error("Laporan ini sudah diajukan dan tidak bisa diedit. Silakan buat laporan baru.");
        }

        setEditingDraftId(data.id);
        setReportStatus("draft");

        setFormData({
          athleteName: data.athlete_name ?? "",
          gender: data.gender ?? "",
          age: String(data.age ?? ""),
          injuryDate: data.injury_date ?? new Date().toISOString().split("T")[0],
          activityType: data.activity_type ?? "",
          activityTypeOther: data.activity_type_other ?? "",
          activityContext: data.activity_context ?? "",
          activityContextOther: data.activity_context_other ?? "",
          injuryCount: data.injury_count ?? 1,
          injuries: Array.isArray(data.injuries) && data.injuries.length > 0 ? data.injuries : [{ location: "", injuryType: "", mechanism: "" }],
          movementAbility: data.movement_ability ?? "",
          painLevel: data.pain_level ?? "",
          redFlags: Array.isArray(data.red_flags) ? data.red_flags : [],
        });

        setCurrentStep(1);
      } catch (err) {
        if (err instanceof Error) setErrorMsg(err.message ?? "Gagal memuat draft.");
        else setErrorMsg("Gagal memuat draft.");
      } finally {
        setLoadingDraft(false);
      }
    })();
  }, [user?.id, resetFormToBlank]);

  // =========================
  // SUBMIT / SAVE DRAFT
  // =========================
  const handleSubmit = async () => {
    try {
      await upsertReport("submitted");
      // ✅ selesai submit -> keluar dari mode edit draft
      sessionStorage.removeItem("iss_edit_draft_id");
      sessionStorage.removeItem("iss_edit_draft_mode");
      alert("Laporan cedera berhasil diajukan!");
      onNavigate("dashboard");
    } catch {
      // errorMsg sudah di-set
    }
  };

  const handleSaveDraft = async () => {
    try {
      await upsertReport("draft");
      // ✅ simpan draft -> balik ke DraftPage, dan keluar dari mode edit biar next buka blank
      sessionStorage.removeItem("iss_edit_draft_id");
      sessionStorage.removeItem("iss_edit_draft_mode");
      alert("Draft berhasil disimpan!");
      onNavigate("draft");
    } catch {
      // errorMsg sudah di-set
    }
  };

  // ✅ saat component unmount, kita matikan mode edit (biar ga nyangkut)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("iss_edit_draft_mode");
      // id jangan dihapus di sini (biar DraftPage bisa set lagi),
      // tapi mode wajib off supaya masuk input-cedera dari menu/sidebar tetap blank.
    };
  }, []);

  const result = currentStep === 4 ? calculateSeverityAndRecommendations() : null;

  const currentActivityTypes = userRole === "coach" ? activityTypes.coach : activityTypes.regional;
  const currentActivityContexts = userRole === "coach" ? activityContexts.coach : activityContexts.regional;

  const disabledAll = saving || loadingDraft || loadingProfile || !user;

  // ✅ Modal data (LaporanData) dibuat dengan useMemo supaya stabil dan tidak blank
  const modalData = useMemo<LaporanData>(() => {
    return {
      id: editingDraftId ? String(editingDraftId) : "-",
      namaAtlet: formData.athleteName?.trim() || "-",
      jenisKelamin: formData.gender || "-",
      usia: Number(formData.age || 0),
      tanggalKejadian: formData.injuryDate || "-",
      jenisAktivitas: (() => {
        const base = formData.activityType || "-";
        const other = formData.activityTypeOther?.trim();
        return other ? `${base} (${other})` : base;
      })(),
      konteks: (() => {
        const base = formData.activityContext || "-";
        const other = formData.activityContextOther?.trim();
        return other ? `${base} (${other})` : base;
      })(),
      cederaDetails: Array.isArray(formData.injuries)
        ? formData.injuries.map((i) => ({
            lokasi: i.location || "-",
            jenis: i.injuryType || "-",
            mekanisme: i.mechanism || "-",
          }))
        : [],
      kemampuanGerak: (() => {
        const map: Record<string, string> = {
          free_movement: "Bisa bergerak bebas",
          limited_movement: "Gerak terbatas",
          unable_to_move: "Tidak bisa bergerak",
        };
        return map[formData.movementAbility] ?? (formData.movementAbility || "-");
      })(),
      tingkatNyeri: (() => {
        const map: Record<string, string> = {
          mild: "Ringan (1–3/10)",
          moderate: "Sedang (4–7/10)",
          severe: "Berat (8–10/10)",
        };
        return map[formData.painLevel] ?? (formData.painLevel || "-");
      })(),
      redFlags: Array.isArray(formData.redFlags) ? formData.redFlags : [],
      status: reportStatus === "submitted" ? "Menunggu Verifikasi" : "Draft",
      tanggalLapor: undefined,
      tanggalVerifikasi: undefined,
      verifikator: undefined,
      pelapor: {
        nama: user?.user_metadata?.full_name || user?.email || "-",
        wilayah: user?.user_metadata?.region || "-",
      },
    };
  }, [editingDraftId, formData, reportStatus, user]);

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPage="input-cedera"
        userRole={mappedRole}
        onLogout={handleLogout}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
                type="button"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">{editingDraftId ? "Edit Draft Laporan Cedera" : "Input Cedera Baru"}</h1>
                <p className="text-sm text-gray-600">
                  Langkah {currentStep} dari 4 {editingDraftId ? "• Draft" : ""}
                </p>
                {(loadingDraft || loadingProfile) && <p className="text-xs text-gray-500 mt-1">Memuat data...</p>}
                {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between w-full px-4">
            {["Kejadian", "Cedera", "Penilaian", "Ringkasan"].map((step, index) => (
              <div key={index} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep > index + 1
                        ? "bg-green-600 text-white"
                        : currentStep === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > index + 1 ? "✓" : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-600 whitespace-nowrap">{step}</span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > index + 1 ? "bg-green-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ====== Step 1 ====== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">1. Informasi Kejadian</h2>
                <p className="text-sm text-gray-600">Masukkan informasi dasar tentang kejadian cedera</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">
                    Nama Atlet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.athleteName}
                    onChange={(e) => handleChange("athleteName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap atlet"
                    disabled={disabledAll}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabledAll}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Usia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan usia"
                    min="1"
                    max="100"
                    disabled={disabledAll}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Tanggal Kejadian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.injuryDate}
                    onChange={(e) => handleChange("injuryDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={disabledAll}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Jenis Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.activityType}
                  onChange={(e) => handleChange("activityType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabledAll}
                >
                  <option value="">Pilih jenis kegiatan</option>
                  {currentActivityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {needsActivityTypeOther && (
                <div>
                  <label className="block text-sm mb-2">
                    Keterangan Tambahan Jenis Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.activityTypeOther}
                    onChange={(e) => handleChange("activityTypeOther", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan jenis kegiatan"
                    disabled={disabledAll}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">
                  Konteks Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.activityContext}
                  onChange={(e) => handleChange("activityContext", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabledAll}
                >
                  <option value="">Pilih konteks kegiatan</option>
                  {currentActivityContexts.map((context) => (
                    <option key={context.value} value={context.value}>
                      {context.label}
                    </option>
                  ))}
                </select>
              </div>

              {needsActivityContextOther && (
                <div>
                  <label className="block text-sm mb-2">
                    Keterangan Tambahan Konteks Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.activityContextOther}
                    onChange={(e) => handleChange("activityContextOther", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan konteks kegiatan"
                    disabled={disabledAll}
                  />
                </div>
              )}
            </div>
          )}

          {/* ====== Step 2 ====== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">2. Informasi Cedera</h2>
                <p className="text-sm text-gray-600">Masukkan detail cedera yang dialami atlet</p>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Jumlah Cedera <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {[1, 2, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleInjuryCountChange(count)}
                      disabled={disabledAll}
                      className={`px-6 py-2 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.injuryCount === count
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                      }`}
                      type="button"
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Maksimal 3 cedera per kejadian</p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-600 w-16">No</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600" style={{ minWidth: "200px" }}>
                          Lokasi Cedera <span className="text-red-500">*</span>
                        </th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600" style={{ minWidth: "220px" }}>
                          Perkiraan Jenis Cedera <span className="text-red-500">*</span>
                        </th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600" style={{ minWidth: "220px" }}>
                          Mekanisme <span className="text-red-500">*</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.injuries.map((injury, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">{index + 1}</td>
                          <td className="px-4 py-3">
                            <select
                              value={injury.location}
                              onChange={(e) => handleInjuryChange(index, "location", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={disabledAll}
                            >
                              <option value="">Pilih lokasi</option>
                              {locationOptions.map((location) => (
                                <option key={location} value={location}>
                                  {location}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={injury.injuryType}
                              onChange={(e) => handleInjuryChange(index, "injuryType", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={disabledAll}
                            >
                              <option value="">Pilih jenis cedera</option>
                              {injuryTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={injury.mechanism}
                              onChange={(e) => handleInjuryChange(index, "mechanism", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={disabledAll}
                            >
                              <option value="">Pilih mekanisme</option>
                              {mechanismOptions.map((mechanism) => (
                                <option key={mechanism} value={mechanism}>
                                  {mechanism}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====== Step 3 ====== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">3. Penilaian Awal oleh Pelatih</h2>
                <p className="text-sm text-gray-600">Lakukan penilaian awal kondisi atlet setelah cedera</p>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Kemampuan Gerak <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.movementAbility}
                  onChange={(e) => handleChange("movementAbility", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabledAll}
                >
                  <option value="">Pilih kemampuan gerak</option>
                  <option value="free_movement">Bisa bergerak bebas</option>
                  <option value="limited_movement">Gerak terbatas</option>
                  <option value="unable_to_move">Tidak bisa bergerak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Nyeri <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.painLevel}
                  onChange={(e) => handleChange("painLevel", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabledAll}
                >
                  <option value="">Pilih tingkat nyeri</option>
                  <option value="mild">Ringan</option>
                  <option value="moderate">Sedang</option>
                  <option value="severe">Berat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-3">Tanda Bahaya (Red Flags)</label>
                <p className="text-xs text-gray-500 mb-3">Pilih semua yang sesuai. Jika tidak ada tanda bahaya, biarkan kosong.</p>

                <div className="space-y-2">
                  {[
                    { value: "severe_swelling", label: "Bengkak hebat" },
                    { value: "deformity", label: "Bentuk sendi tidak normal" },
                    { value: "dizziness", label: "Pusing" },
                    { value: "loss_of_consciousness", label: "Tidak sadar" },
                    { value: "numbness", label: "Mati rasa" },
                    { value: "uncontrolled_bleeding", label: "Perdarahan hebat" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.redFlags.includes(option.value) ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-red-300"
                      } ${disabledAll ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formData.redFlags.includes(option.value)}
                        onChange={() => handleRedFlagChange(option.value)}
                        className="w-4 h-4 text-red-600"
                        disabled={disabledAll}
                      />
                      <span className="ml-3 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.redFlags.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm text-red-900 mb-1">Peringatan!</h3>
                      <p className="text-xs text-red-700">Tanda bahaya terdeteksi. Pastikan untuk segera memberikan penanganan yang tepat sesuai rekomendasi di langkah berikutnya.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== Step 4 (ringkasan) ====== */}
          {currentStep === 4 && result && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl mb-2">4. Ringkasan & Rekomendasi</h2>
                <p className="text-sm text-gray-600">Hasil penilaian dan rekomendasi penanganan</p>
              </div>

              <div className="flex items-center justify-center py-4">
                <div
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 ${
                    result.severity === "BERAT" ? "bg-red-50 border-red-600" : "bg-green-50 border-green-600"
                  }`}
                >
                  {result.severity === "BERAT" ? <AlertTriangle className="w-7 h-7 text-red-600" /> : <CheckCircle className="w-7 h-7 text-green-600" />}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Tingkat Cedera</p>
                    <p className={`text-2xl ${result.severity === "BERAT" ? "text-red-600" : "text-green-600"}`}>{result.severity}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-base mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-900">Rekomendasi Penanganan</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                          <span className="text-gray-900">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">⚠️ Catatan Sistem:</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Sistem tidak mendiagnosis</li>
                      <li>• Sistem membantu keputusan awal</li>
                      <li>• Jika ragu → naikkan ke kategori BERAT</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-base mb-4">Ringkasan Data</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Nama Atlet</span>
                      <span className="text-right">{modalData.namaAtlet}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Tanggal Kejadian</span>
                      <span className="text-right">{modalData.tanggalKejadian}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Aktivitas</span>
                      <span className="text-right">{modalData.jenisAktivitas}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Konteks</span>
                      <span className="text-right">{modalData.konteks}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Jumlah Cedera</span>
                      <span className="text-right">{modalData.cederaDetails.length}</span>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowRingkasanModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      type="button"
                    >
                      Lihat Detail (Ringkasan Lengkap)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep < 4 ? (
              <>
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1 || disabledAll}
                  className="flex items-center gap-2 px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Kembali
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || disabledAll}
                  className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  Lanjut
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentStep(1)}
                  disabled={disabledAll}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Edit
                </button>

                <div className="flex gap-3">
                  {canSaveDraft && (
                    <button
                      onClick={handleSaveDraft}
                      disabled={disabledAll}
                      className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Simpan Draft (status='draft')"
                      type="button"
                    >
                      {saving ? "Menyimpan..." : "Simpan Draft"}
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={disabledAll || !canSaveDraft}
                    className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Ajukan (status='submitted')"
                    type="button"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {saving ? "Mengajukan..." : "Ajukan"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Status saat ini: <span className="font-medium">{reportStatus}</span>
          </div>
        </div>
      </main>

      {/* ✅ Modal Ringkasan */}
      <ModalRingkasanData isOpen={showRingkasanModal} onClose={() => setShowRingkasanModal(false)} data={modalData} />
    </div>
  );
}
