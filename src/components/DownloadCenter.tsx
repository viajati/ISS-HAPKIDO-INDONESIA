import { useState, useEffect, useMemo } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Download, FileSpreadsheet, Table, Filter, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

// Helper functions for Excel/CSV export
function toCsvAndDownload(rows: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toXlsxAndDownload(sheets: { name: string; rows: any[] }[], filename: string) {
  const wb = XLSX.utils.book_new();
  
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Apply styling to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
        
        const cellValue = String(ws[cellAddress].v || '');
        const isHeaderRow = row === 0;
        const isSectionHeader = cellValue.includes('RINGKASAN') || cellValue.includes('JENIS') || 
                                cellValue.includes('MEKANISME') || cellValue.includes('LOKASI') || 
                                cellValue.includes('DERAJAT');
        const isEvenRow = row % 2 === 0;
        const isTotalColumn = col === range.e.c; // Last column (Total)
        
        // Initialize cell style
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        
        // Header row styling (first row - column headers)
        if (isHeaderRow) {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: "1E40AF" } }, // Dark blue background
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 }, // White bold text
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
        // Section headers (RINGKASAN, JENIS CEDERA, etc.)
        else if (isSectionHeader) {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: "DBEAFE" } }, // Light blue background
            font: { bold: true, color: { rgb: "1E3A8A" }, sz: 10 }, // Dark blue bold text
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "3B82F6" } },
              bottom: { style: "thin", color: { rgb: "3B82F6" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } },
            },
          };
        }
        // Total column styling
        else if (isTotalColumn && !isSectionHeader && cellValue !== '') {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: isEvenRow ? "F3F4F6" : "FFFFFF" } },
            font: { bold: true, color: { rgb: "1F2937" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "medium", color: { rgb: "9CA3AF" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } },
            },
          };
        }
        // Regular data rows (zebra striping)
        else {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: isEvenRow ? "F9FAFB" : "FFFFFF" } },
            font: { color: { rgb: "374151" } },
            alignment: { 
              horizontal: col === 0 ? "left" : "center", 
              vertical: "center" 
            },
            border: {
              top: { style: "thin", color: { rgb: "E5E7EB" } },
              bottom: { style: "thin", color: { rgb: "E5E7EB" } },
              left: { style: "thin", color: { rgb: "E5E7EB" } },
              right: { style: "thin", color: { rgb: "E5E7EB" } },
            },
          };
        }
      }
    }
    
    // Set column widths
    const colWidths = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10;
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellAddress] && ws[cellAddress].v) {
          const cellValue = String(ws[cellAddress].v);
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }
      // First column (Kategori) should be wider
      const width = col === 0 ? Math.min(maxWidth + 4, 60) : Math.min(maxWidth + 2, 20);
      colWidths.push({ wch: width });
    }
    ws['!cols'] = colWidths;
    
    // Set row heights
    ws['!rows'] = Array(range.e.r + 1).fill({ hpt: 18 });
    ws['!rows'][0] = { hpt: 24 }; // Header row taller
    
    XLSX.utils.book_append_sheet(wb, ws, s.name);
  }
  
  XLSX.writeFile(wb, filename);
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function formatDateISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDateRange(
  periodeFilter: "6bulan" | "1tahun" | "tahun" | "custom",
  selectedYear: string,
  customStartDate: string,
  customEndDate: string
) {
  const today = new Date();
  if (periodeFilter === "6bulan") {
    return { start: formatDateISO(addMonths(today, -6)), end: formatDateISO(today) };
  }
  if (periodeFilter === "1tahun") {
    const y = Number(selectedYear || today.getFullYear());
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }
  if (periodeFilter === "tahun") {
    return { start: `${selectedYear}-01-01`, end: `${selectedYear}-12-31` };
  }
  return { start: customStartDate, end: customEndDate };
}

// Fetch raw data (wide format)
async function fetchRawWide(start: string, end: string) {
  const { data, error } = await supabase
    .from("injury_reports")
    .select(`
      id, user_id, athlete_name, gender, age, injury_date,
      activity_type, activity_context,
      injury_count, injuries,
      movement_ability, pain_level,
      red_flags, status,
      verified_by, verified_at,
      created_at, updated_at
    `)
    .eq("status", "verified")
    .gte("injury_date", start)
    .lte("injury_date", end)
    .order("injury_date", { ascending: true });

  if (error) throw error;

  const nameMap = await fetchProfileNameMap((data ?? []).map((row) => row.user_id));
  
  // Flatten JSONB fields for better readability
  const flattened = (data ?? []).map(row => {
    const flatRow: any = { ...row };

    flatRow.pelapor_name = nameMap.get(row.user_id) ?? "Tidak diketahui";
    
    // Flatten injuries array
    if (row.injuries && Array.isArray(row.injuries)) {
      // Create separate columns for each injury
      row.injuries.forEach((injury: any, index: number) => {
        const prefix = `injury_${index + 1}`;
        flatRow[`${prefix}_location`] = injury.location || '';
        flatRow[`${prefix}_mechanism`] = injury.mechanism || '';
      });
      
      // Also keep a summary string
      flatRow.injuries_summary = row.injuries
        .map((inj: any) => `${inj.location || 'N/A'} - ${inj.mechanism || 'N/A'}`)
        .join('; ');
      
      delete flatRow.injuries; // Remove original JSON field
    } else {
      flatRow.injuries_summary = '';
    }
    
    // Flatten red_flags array
    if (row.red_flags && Array.isArray(row.red_flags)) {
      flatRow.red_flags_list = row.red_flags.join(', ');
      flatRow.red_flags_count = row.red_flags.length;
      delete flatRow.red_flags; // Remove original JSON field
    } else {
      flatRow.red_flags_list = '';
      flatRow.red_flags_count = 0;
    }
    
    return flatRow;
  });
  
  return flattened;
}

// Convert wide to long format
function wideToLong(rows: any[]) {
  const long: any[] = [];
  for (const r of rows) {
    for (const [key, value] of Object.entries(r)) {
      long.push({
        report_id: r.id,
        user_id: r.user_id,
        pelapor_name: r.pelapor_name,
        injury_date: r.injury_date,
        variable: key,
        value: typeof value === "object" ? JSON.stringify(value) : value,
      });
    }
  }
  return long;
}

// Fetch crosstab data (following VisualisasiData format: Training vs Competition)
async function fetchCrosstabs(start: string, end: string) {
  const [
    summary,
    byLocation,
    byType,
    byMechanism,
    bySeverity,
  ] = await Promise.all([
    (supabase.rpc as any)("analytics_crosstab_summary", { start_date: start, end_date: end }),
    (supabase.rpc as any)("analytics_crosstab_by_location", { start_date: start, end_date: end, top_n: 9999 }),
    (supabase.rpc as any)("analytics_crosstab_by_injury_type", { start_date: start, end_date: end, top_n: 9999 }),
    (supabase.rpc as any)("analytics_crosstab_by_mechanism", { start_date: start, end_date: end, top_n: 9999 }),
    (supabase.rpc as any)("analytics_crosstab_by_severity", { start_date: start, end_date: end }),
  ]);

  const anyError = summary.error || byLocation.error || byType.error || byMechanism.error || bySeverity.error;

  if (anyError) throw (anyError as any);

  return {
    summary: summary.data ?? [],
    byLocation: byLocation.data ?? [],
    byType: byType.data ?? [],
    byMechanism: byMechanism.data ?? [],
    bySeverity: bySeverity.data ?? [],
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatHeaderLabel(key: string) {
  if (key === "pelapor_name") return "Nama Pelapor";
  if (key === "user_id") return "User ID";
  if (key === "report_id") return "Report ID";
  if (key === "injury_date") return "Injury Date";
  if (key === "created_at") return "Created At";
  if (key === "updated_at") return "Updated At";
  if (key === "verified_at") return "Verified At";
  if (key === "verified_by") return "Verified By";
  const words = key.split("_").map((w) => {
    if (w === "id") return "ID";
    if (w === "uuid") return "UUID";
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
  return words.join(" ");
}

function prettifyRows(rows: any[]) {
  return rows.map((row) => {
    const out: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      out[formatHeaderLabel(key)] = value;
    });
    return out;
  });
}

function orderRawWideRows(rows: any[]) {
  const preferredOrder = [
    "id",
    "user_id",
    "athlete_name",
    "pelapor_name",
    "gender",
    "age",
    "injury_date",
    "activity_type",
    "activity_context",
    "injury_count",
    "injuries_summary",
    "movement_ability",
    "pain_level",
    "red_flags_list",
    "red_flags_count",
    "status",
    "verified_by",
    "verified_at",
    "created_at",
    "updated_at",
  ];

  return rows.map((row) => {
    const ordered: Record<string, any> = {};
    const seen = new Set<string>();

    for (const key of preferredOrder) {
      if (key in row) {
        ordered[key] = row[key];
        seen.add(key);
      }
    }

    for (const key of Object.keys(row)) {
      if (!seen.has(key)) ordered[key] = row[key];
    }

    return ordered;
  });
}

function orderRawLongRows(rows: any[]) {
  const preferredOrder = [
    "report_id",
    "user_id",
    "pelapor_name",
    "injury_date",
    "variable",
    "value",
  ];

  return rows.map((row) => {
    const ordered: Record<string, any> = {};
    const seen = new Set<string>();

    for (const key of preferredOrder) {
      if (key in row) {
        ordered[key] = row[key];
        seen.add(key);
      }
    }

    for (const key of Object.keys(row)) {
      if (!seen.has(key)) ordered[key] = row[key];
    }

    return ordered;
  });
}

function monthKey(d: string) {
  return d.slice(0, 7); // YYYY-MM
}

function labelMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split("-");
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${monthNames[Math.max(0, Number(m) - 1)]} ${y}`;
}

async function fetchVerifiedForAggregation(start: string, end: string) {
  const { data, error } = await supabase
    .from("injury_reports")
    .select("id, user_id, injury_date, severity_level, status")
    .eq("status", "verified")
    .gte("injury_date", start)
    .lte("injury_date", end);

  if (error) throw error;
  return data ?? [];
}

async function fetchProfileNameMap(userIds: string[]) {
  const unique = Array.from(new Set(userIds)).filter(Boolean);
  if (unique.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  if (error) throw error;

  const m = new Map<string, string>();
  for (const p of data ?? []) {
    m.set(p.id, p.full_name ?? "Tidak diketahui");
  }
  return m;
}

interface DownloadCenterProps {
  onNavigate: (page: string) => void;
}

export function DownloadCenter({ 
  onNavigate
}: DownloadCenterProps) {
  const { profile, loadingProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [periodeFilter, setPeriodeFilter] = useState<'6bulan' | '1tahun' | 'tahun' | 'custom'>('6bulan');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formatData, setFormatData] = useState<'wide' | 'long'>('wide');
  const [selectedCrosstab, setSelectedCrosstab] = useState('derajat-wilayah');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Get role and region from profile
  const userRole = useMemo(() => profile?.role || 'pelatih', [profile?.role]);
  const userWilayah = useMemo(() => profile?.wilayah || 'DKI Jakarta', [profile?.wilayah]);
  const isNasional = userRole === 'admin_nasional';

  // Access control - only admin nasional can access this page
  useEffect(() => {
    if (loadingProfile) return;
    
    if (!profile) {
      toast.error('Anda harus login terlebih dahulu');
      onNavigate('login');
      return;
    }

    if (profile.role !== 'admin_nasional') {
      toast.error('Akses ditolak. Halaman ini hanya untuk Admin Nasional.');
      onNavigate('dashboard');
      return;
    }
  }, [loadingProfile, profile, onNavigate]);

  const getPeriodLabel = () => {
    if (periodeFilter === '6bulan') return '6 Bulan Terakhir';
    if (periodeFilter === '1tahun') return '1 Tahun Terakhir (2024)';
    if (periodeFilter === 'tahun') return `Tahun ${selectedYear}`;
    if (periodeFilter === 'custom') return `Custom: ${customStartDate} - ${customEndDate}`;
    return '6 Bulan Terakhir';
  };

  const handleDownload = async (type: string) => {
    try {
      const { start, end } = getDateRange(periodeFilter, selectedYear, customStartDate, customEndDate);

      if (periodeFilter === "custom" && (!start || !end)) {
        toast.error("Isi tanggal start & end untuk custom range");
        return;
      }

      setDownloading(type);
      toast.loading(`Menyiapkan ${type}...`, { id: "dl" });

      // 1) RAW DATA
      if (type.startsWith("raw_excel") || type.startsWith("raw_csv")) {
        const wide = await fetchRawWide(start, end);
        const orderedWide = orderRawWideRows(wide);
        const rows = formatData === "wide" ? orderedWide : wideToLong(orderedWide);
        const orderedRows = formatData === "wide" ? rows : orderRawLongRows(rows);
        const prettyRows = prettifyRows(orderedRows);

        const label = `${start}_to_${end}_${formatData}`;
        if (type === "raw_excel") {
          toXlsxAndDownload([{ name: formatData.toUpperCase(), rows: prettyRows }], `raw_${label}.xlsx`);
        } else {
          toCsvAndDownload(prettyRows, `raw_${label}.csv`);
        }

        toast.success("Download dimulai", { id: "dl" });
        return;
      }

      // 2) CROSSTAB
      if (type === "crosstab_excel" || type === "crosstab_csv") {
        const c = await fetchCrosstabs(start, end);

        // Format crosstab data untuk export (Training vs Competition format)
        const crosstabRows: any[] = [];
        
        // Header section
        crosstabRows.push({
          Kategori: "RINGKASAN DATA CEDERA",
          Training: "",
          Competition: "",
          Total: "",
        });
        
        // Summary data (Atlet & Cedera)
        const atletRow = c.summary.find((r: any) => r.kategori === "Atlet");
        const cederaRow = c.summary.find((r: any) => r.kategori === "Cedera");
        
        crosstabRows.push({
          Kategori: "Atlet",
          Training: atletRow?.training || 0,
          Competition: atletRow?.competition || 0,
          Total: atletRow?.total || 0,
        });
        
        crosstabRows.push({
          Kategori: "Cedera",
          Training: cederaRow?.training || 0,
          Competition: cederaRow?.competition || 0,
          Total: cederaRow?.total || 0,
        });
        
        // Empty row separator
        crosstabRows.push({ Kategori: "", Training: "", Competition: "", Total: "" });
        
        // Jenis Cedera section
        crosstabRows.push({
          Kategori: "JENIS CEDERA",
          Training: "",
          Competition: "",
          Total: "",
        });
        
        c.byType.forEach((row: any) => {
          crosstabRows.push({
            Kategori: `  ${row.kategori}`,
            Training: row.training,
            Competition: row.competition,
            Total: row.total,
          });
        });
        
        // Empty row separator
        crosstabRows.push({ Kategori: "", Training: "", Competition: "", Total: "" });
        
        // Mekanisme Cedera section
        crosstabRows.push({
          Kategori: "MEKANISME CEDERA",
          Training: "",
          Competition: "",
          Total: "",
        });
        
        c.byMechanism.forEach((row: any) => {
          crosstabRows.push({
            Kategori: `  ${row.kategori}`,
            Training: row.training,
            Competition: row.competition,
            Total: row.total,
          });
        });
        
        // Empty row separator
        crosstabRows.push({ Kategori: "", Training: "", Competition: "", Total: "" });
        
        // Lokasi Cedera section
        crosstabRows.push({
          Kategori: "LOKASI CEDERA",
          Training: "",
          Competition: "",
          Total: "",
        });
        
        c.byLocation.forEach((row: any) => {
          crosstabRows.push({
            Kategori: `  ${row.kategori}`,
            Training: row.training,
            Competition: row.competition,
            Total: row.total,
          });
        });
        
        // Empty row separator
        crosstabRows.push({ Kategori: "", Training: "", Competition: "", Total: "" });
        
        // Derajat Cedera section
        crosstabRows.push({
          Kategori: "DERAJAT CEDERA",
          Training: "",
          Competition: "",
          Total: "",
        });
        
        c.bySeverity.forEach((row: any) => {
          crosstabRows.push({
            Kategori: `  ${row.kategori}`,
            Training: row.training,
            Competition: row.competition,
            Total: row.total,
          });
        });

        const orderedCrosstabRows = crosstabRows.map((row) => ({
          Kategori: row.Kategori,
          Training: row.Training,
          Competition: row.Competition,
          Total: row.Total,
        }));

        if (type === "crosstab_excel") {
          toXlsxAndDownload(
            [{ name: "Crosstabulasi", rows: orderedCrosstabRows }],
            `crosstab_${start}_to_${end}.xlsx`
          );
        } else {
          toCsvAndDownload(orderedCrosstabRows, `crosstab_${start}_to_${end}.csv`);
        }

        toast.success("Download dimulai", { id: "dl" });
        return;
      }

      toast.error("Tipe download tidak dikenal", { id: "dl" });
    } catch (e: any) {
      console.error(e);
      toast.error(`Gagal download: ${e?.message ?? "Unknown error"}`, { id: "dl" });
    } finally {
      setDownloading(null);
    }
  };

  // Show loading while checking access
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!profile || profile.role !== 'admin_nasional') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="download-center"
        userRole="admin_nasional"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Download Center</h1>
                <p className="text-sm text-gray-600">
                  Export data cedera dalam berbagai format
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">
                  {userRole === 'admin_nasional' ? 'Admin Nasional' : userRole === 'admin_daerah' ? 'Admin Daerah' : 'Pelatih'}
                </p>
                <p className="text-xs text-gray-600">
                  {isNasional ? 'Pengurus Pusat' : userWilayah}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                {userRole === 'admin_nasional' ? 'SN' : 'AF'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter Periode:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={periodeFilter}
                onChange={(e) => setPeriodeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                <option value="1tahun">1 Tahun Terakhir</option>
                <option value="tahun">Pilih Tahun Tertentu</option>
                <option value="custom">Custom Range</option>
              </select>

              {periodeFilter === 'tahun' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              )}

              {periodeFilter === 'custom' && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Informasi Download</p>
              <p className="text-blue-700">
                Semua data akan diexport dalam format <strong>Excel (.xlsx)</strong> dan <strong>CSV</strong>. 
                {isNasional ? ' Data mencakup seluruh wilayah Indonesia.' : ` Data khusus untuk wilayah ${userWilayah}.`}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Data Dasar (Wide/Long) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-teal-900">1. Data Dasar (Raw Data)</h2>
                <p className="text-sm text-teal-700">Data lengkap semua laporan cedera dalam format terstruktur</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Format Data:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormatData('wide')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formatData === 'wide'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={formatData === 'wide'}
                      onChange={() => setFormatData('wide')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Wide Format</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Satu baris per laporan, semua data dalam kolom terpisah. 
                        <span className="block mt-1 text-xs">Cocok untuk: Analisis statistik, pivot table</span>
                      </p>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                        ID | Nama | Umur | Lokasi | Derajat | ...
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setFormatData('long')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formatData === 'long'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={formatData === 'long'}
                      onChange={() => setFormatData('long')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Long Format</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Multiple baris per laporan dengan struktur key-value.
                        <span className="block mt-1 text-xs">Cocok untuk: Database import, time-series analysis</span>
                      </p>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                        ID | Variable | Value
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Field Info */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Data yang disertakan:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Data Atlet (Nama, Umur, Gender)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Lokasi & Jenis Cedera (Per Injury)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Derajat & Mekanisme Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Aktivitas saat Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Red Flags (Comma-separated)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Tanggal Kejadian & Verifikasi
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Movement Ability & Pain Level
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Data Pelapor & Status
                </div>
                {isNasional && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                    Wilayah/Daerah
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p><strong>Catatan:</strong> Data cedera (injuries) akan dipecah menjadi kolom terpisah per cedera. 
                Red flags ditampilkan sebagai daftar yang dipisahkan koma untuk kemudahan membaca.</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload("raw_excel")}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {downloading === "raw_excel" ? "Menyiapkan..." : "Download Excel (.xlsx)"}
              </button>
              <button
                onClick={() => handleDownload("raw_csv")}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {downloading === "raw_csv" ? "Menyiapkan..." : "Download CSV (.csv)"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tabel Ringkasan (Crosstabulasi) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Table className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-blue-900">2. Tabel Ringkasan (Crosstabulasi)</h2>
                <p className="text-sm text-blue-700">Data agregat dalam bentuk tabel pivot dan crosstab</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Crosstab Description */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Tabel Crosstabulasi Lengkap</p>
              <p className="text-sm text-gray-600 mb-4">
                Tabel ringkasan yang menampilkan breakdown lengkap data cedera berdasarkan jenis aktivitas (Training vs Competition), 
                dengan detail jenis cedera, mekanisme, lokasi, dan derajat cedera dalam satu file terstruktur.
              </p>
              
              {/* What's included */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Tabel mencakup:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Total Atlet & Cedera (Training vs Competition)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Semua Jenis Cedera (Sprain, Strain, dll)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Semua Mekanisme Cedera
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Semua Lokasi Cedera
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Derajat Cedera (Ringan/Sedang/Berat)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Data Agregat Lengkap (Tidak Dibatasi)
                  </div>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload("crosstab_excel")}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {downloading === "crosstab_excel" ? "Menyiapkan..." : "Download Excel (.xlsx)"}
              </button>
              <button
                onClick={() => handleDownload("crosstab_csv")}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {downloading === "crosstab_csv" ? "Menyiapkan..." : "Download CSV (.csv)"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Catatan Penting</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Semua data yang diexport sudah terverifikasi dan valid sesuai periode yang dipilih.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Untuk pertanyaan teknis, silakan hubungi admin sistem melalui menu Help & Contact.</span>
            </li>
          </ul>
        </div>
      </main>

    </div>
  );
}