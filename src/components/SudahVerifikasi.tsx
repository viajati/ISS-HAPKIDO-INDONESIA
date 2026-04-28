import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import {
  Menu,
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  MapPin,
  RefreshCw,
  Undo2,
  Trash2,
} from "lucide-react";
import { ModalRingkasanData } from "./ModalRingkasanData";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";

/* ================= TYPES ================= */

interface SudahVerifikasiProps {
  onNavigate: (page: string) => void;
}

type ProfileJoin = {
  full_name: string;
  role: string;
  wilayah: string | null;
  email?: string | null;
};

type DbRow = {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  athlete_name: string | null;
  gender: string | null;
  age: number | null;
  injury_date: string | null;
  activity_type: string | null;
  activity_type_other: string | null;
  activity_context: string | null;
  activity_context_other: string | null;
  injuries: any;
  movement_ability: string | null;
  pain_level: string | null;
  red_flags: string[] | null;
  severity_level: string | null;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  profiles: ProfileJoin | ProfileJoin[] | null;
};

interface LaporanVerified {
  id: string;
  tanggalLapor: string;
  tanggalKejadian: string;
  tanggalVerifikasi: string;
  pelapor: { nama: string; role: string; wilayah: string };
  atlet: { nama: string; umur: number; jenisKelamin: string };
  cedera: { lokasi: string; jenis: string; derajat: string };
  kegiatan: { jenis: string; konteks: string };
  verifikator: string;
  status: "Terverifikasi" | "Ditolak";
}

/* ================= HELPERS ================= */

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toISOString().split("T")[0] : "-";

/* ================= COMPONENT ================= */

export function SudahVerifikasi({ onNavigate }: SudahVerifikasiProps) {
  const { user, profile, loadingProfile } = useAuth();

  const [rows, setRows] = useState<LaporanVerified[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedLaporan, setSelectedLaporan] = useState<LaporanVerified | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /* ================= LOAD ================= */

  const loadReviewed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("injury_reports")
        .select("*, profiles(full_name, role, wilayah)")
        .in("status", ["verified", "rejected"])
        .order("verified_at", { ascending: false });

      if (error) throw error;

      const mapped = (data as DbRow[]).map((r) => ({
        id: String(r.id),
        tanggalLapor: formatDate(r.created_at),
        tanggalKejadian: formatDate(r.injury_date),
        tanggalVerifikasi: formatDate(r.verified_at),
        pelapor: {
          nama: (r.profiles as any)?.full_name || "-",
          role: (r.profiles as any)?.role || "-",
          wilayah: (r.profiles as any)?.wilayah || "-",
        },
        atlet: {
          nama: r.athlete_name || "-",
          umur: r.age || 0,
          jenisKelamin: r.gender || "-",
        },
        cedera: {
          lokasi: r.injuries?.[0]?.location || "-",
          jenis: r.injuries?.[0]?.injuryType || "-",
          derajat: r.severity_level || "-",
        },
        kegiatan: {
          jenis: r.activity_type || "-",
          konteks: r.activity_context || "-",
        },
        verifikator: "Admin Nasional",
        status: r.status === "verified" ? "Terverifikasi" : "Ditolak",
      }));

      setRows(mapped);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingProfile) loadReviewed();
  }, [loadingProfile]);

  /* ================= ACTIONS ================= */

  // UNDO
  const handleUndo = async (id: string) => {
    if (!confirm("Kembalikan ke pending?")) return;

    setBusyId(id);
    try {
      const { error } = await supabase
        .from("injury_reports")
        .update({ status: "submitted", verified_by: null, verified_at: null })
        .eq("id", Number(id));

      if (error) throw error;

      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // DELETE (🔥 FINAL FIX)
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus permanen?")) return;

    setBusyId(id);
    try {
      const { error } = await supabase.rpc("admin_delete_verified_report", {
        p_report_id: Number(id),
      });

      if (error) throw error;

      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setBusyId(null);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Sudah Verifikasi</h1>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Atlet</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.status}</td>
              <td>{r.atlet.nama}</td>

              <td className="flex gap-2">
                <button onClick={() => handleUndo(r.id)}>
                  <Undo2 />
                </button>

                <button onClick={() => handleDelete(r.id)}>
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
