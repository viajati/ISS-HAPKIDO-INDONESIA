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

interface SudahVerifikasiProps {
  onNavigate: (page: string) => void;
}

type ProfileJoin = {
  full_name: string;
  role: "pelatih" | "admin_daerah" | "admin_nasional" | string;
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
  injuries: Array<{ location: string; injuryType: string; mechanism: string }> | null;
  movement_ability: string | null;
  pain_level: string | null;
  red_flags: string[] | null;
  severity_level: string | null;
  status: "verified" | "rejected" | string;
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

function formatDateYMD(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toISOString().split("T")[0];
}

function firstProfile(p?: ProfileJoin | ProfileJoin[] | null): ProfileJoin | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] : p;
}

export function SudahVerifikasi({ onNavigate }: SudahVerifikasiProps) {
  const { user, loadingProfile, profile } = useAuth();

  const [rows, setRows] = useState<LaporanVerified[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedLaporan, setSelectedLaporan] = useState<LaporanVerified | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (loadingProfile) return;

    if (!profile) {
      toast.error("Harus login");
      onNavigate("login");
      return;
    }

    if (profile.role !== "admin_nasional") {
      toast.error("Akses ditolak");
      onNavigate("dashboard");
    }
  }, [loadingProfile, profile]);

  const loadReviewed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("injury_reports")
        .select(
          `id, created_at, injury_date, severity_level,
           athlete_name, gender, age,
           status, verified_at,
           profiles:profiles!injury_reports_user_id_fkey(full_name, role, wilayah)`
        )
        .in("status", ["verified", "rejected"]);

      if (error) throw error;

      const mapped = (data as DbRow[]).map((r) => {
        const p = firstProfile(r.profiles);

        return {
          id: String(r.id),
          tanggalLapor: formatDateYMD(r.created_at),
          tanggalKejadian: formatDateYMD(r.injury_date),
          tanggalVerifikasi: formatDateYMD(r.verified_at),
          pelapor: {
            nama: p?.full_name || "-",
            role: p?.role || "-",
            wilayah: p?.wilayah || "-",
          },
          atlet: {
            nama: r.athlete_name || "-",
            umur: r.age || 0,
            jenisKelamin: r.gender || "-",
          },
          cedera: {
            lokasi: "-",
            jenis: "-",
            derajat: r.severity_level || "-",
          },
          kegiatan: { jenis: "-", konteks: "-" },
          verifikator: "Admin Nasional",
          status: r.status === "verified" ? "Terverifikasi" : "Ditolak",
        };
      });

      setRows(mapped);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewed();
  }, []);

  // UNDO
  const handleUndo = async (id: string) => {
    if (!confirm("Undo ke pending?")) return;

    setBusyId(id);
    try {
      const { error } = await supabase
        .from("injury_reports")
        .update({ status: "submitted" })
        .eq("id", Number(id));

      if (error) throw error;

      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // DELETE
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
