import { useState, useEffect, useMemo } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Download, FileSpreadsheet, Table, BarChart3, Filter, Calendar, FileText, FileDown } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  
  // Flatten JSONB fields for better readability
  const flattened = (data ?? []).map(row => {
    const flatRow: any = { ...row };
    
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

async function fetchProfilesMap(userIds: string[]) {
  const unique = Array.from(new Set(userIds)).filter(Boolean);
  if (unique.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, wilayah")
    .in("id", unique);

  if (error) throw error;

  const m = new Map<string, string>();
  for (const p of data ?? []) {
    m.set(p.id, p.wilayah ?? "Tidak diketahui");
  }
  return m;
}

function groupMonthlyByWilayah(rows: any[], idToWilayah: Map<string, string>) {
  const months = Array.from(new Set(rows.map(r => monthKey(r.injury_date)))).sort();
  const wilayahSet = new Set<string>();
  const counts = new Map<string, Map<string, number>>();

  for (const r of rows) {
    const w = idToWilayah.get(r.user_id) ?? "Tidak diketahui";
    wilayahSet.add(w);
    const mk = monthKey(r.injury_date);

    if (!counts.has(w)) counts.set(w, new Map());
    const m = counts.get(w)!;
    m.set(mk, (m.get(mk) ?? 0) + 1);
  }

  const wilayahList = Array.from(wilayahSet).sort();
  const datasets = wilayahList.map(w => ({
    label: w,
    data: months.map(mk => counts.get(w)?.get(mk) ?? 0),
  }));

  return { months, monthLabels: months.map(labelMonth), datasets };
}

function groupSeverityByWilayah(rows: any[], idToWilayah: Map<string, string>) {
  const severities = ["Ringan", "Sedang", "Berat", "Lainnya"];
  const wilayahSet = new Set<string>();
  const counts = new Map<string, Map<string, number>>();

  for (const r of rows) {
    const w = idToWilayah.get(r.user_id) ?? "Tidak diketahui";
    wilayahSet.add(w);

    const sevRaw = (r.severity_level ?? "").toString().toLowerCase();
    let sev = "Lainnya";
    if (sevRaw === "ringan") sev = "Ringan";
    else if (sevRaw === "sedang") sev = "Sedang";
    else if (sevRaw === "berat") sev = "Berat";

    if (!counts.has(w)) counts.set(w, new Map());
    const m = counts.get(w)!;
    m.set(sev, (m.get(sev) ?? 0) + 1);
  }

  const wilayahList = Array.from(wilayahSet).sort();
  const datasets = severities.map(sev => ({
    label: sev,
    data: wilayahList.map(w => counts.get(w)?.get(sev) ?? 0),
  }));

  return { wilayahList, severities, datasets };
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
  const [selectedChart, setSelectedChart] = useState('bar-bulan');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Untuk mode export (render chart off-screen)
  const [exportPayload, setExportPayload] = useState<any | null>(null);
  const exportRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);

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

  const exportChartsZip = async (start: string, end: string, isNasional: boolean) => {
    // 1) ambil data chart berbasis RPC yang sudah ada
    const [monthly, pie, topLok, topAkt] = await Promise.all([
      (supabase.rpc as any)("analytics_monthly_counts", { start_date: start, end_date: end }),
      (supabase.rpc as any)("analytics_severity_pie", { start_date: start, end_date: end }),
      (supabase.rpc as any)("analytics_top_locations", { start_date: start, end_date: end, top_n: 10 }),
      (supabase.rpc as any)("analytics_top_activities", { start_date: start, end_date: end, top_n: 10 }),
    ]);

    const anyErr = monthly.error || pie.error || topLok.error || topAkt.error;
    if (anyErr) throw anyErr;

    // 2) untuk nasional: agregasi wilayah via raw query
    let wilayahMonthly: any = null;
    let severityWilayah: any = null;

    if (isNasional) {
      const rows = await fetchVerifiedForAggregation(start, end);
      const idMap = await fetchProfilesMap(rows.map(r => r.user_id));
      wilayahMonthly = groupMonthlyByWilayah(rows, idMap);
      severityWilayah = groupSeverityByWilayah(rows, idMap);
    }

    // 3) set payload -> render offscreen
    setExportPayload({
      start, end,
      monthly: monthly.data ?? [],
      pie: pie.data ?? [],
      topLok: topLok.data ?? [],
      topAkt: topAkt.data ?? [],
      wilayahMonthly,
      severityWilayah,
      isNasional,
    });

    // 4) tunggu render 2 frame
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 5) capture PNG per chart
    if (!exportRef.current) throw new Error("Export container not ready");

    const chartNodes = exportRef.current.querySelectorAll("[data-chart]");
    const zip = new JSZip();

    for (const node of Array.from(chartNodes)) {
      const el = node as HTMLElement;
      const name = el.getAttribute("data-chart") ?? "chart";
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
      const blob: Blob | null = await new Promise(res => canvas.toBlob(res, "image/png"));
      if (blob) zip.file(`${name}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `charts_${start}_to_${end}.zip`);

    // cleanup
    setExportPayload(null);
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
        const rows = formatData === "wide" ? wide : wideToLong(wide);

        const label = `${start}_to_${end}_${formatData}`;
        if (type === "raw_excel") {
          toXlsxAndDownload([{ name: formatData.toUpperCase(), rows }], `raw_${label}.xlsx`);
        } else {
          toCsvAndDownload(rows, `raw_${label}.csv`);
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

        if (type === "crosstab_excel") {
          toXlsxAndDownload(
            [{ name: "Crosstabulasi", rows: crosstabRows }],
            `crosstab_${start}_to_${end}.xlsx`
          );
        } else {
          toCsvAndDownload(crosstabRows, `crosstab_${start}_to_${end}.csv`);
        }

        toast.success("Download dimulai", { id: "dl" });
        return;
      }

      // 3) PNG grafik
      if (type === "charts_png") {
        await exportChartsZip(start, end, isNasional);
        toast.success("ZIP grafik berhasil dibuat", { id: "dl" });
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
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <p className="text-sm text-blue-900">
                    <strong>Excel:</strong> Dilengkapi dengan styling (header berwarna, border, bold text) untuk kemudahan membaca.<br />
                    <strong>CSV:</strong> Format plain text yang kompatibel dengan semua aplikasi spreadsheet.
                  </p>
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

        {/* 3. Ilustrasi & Grafik */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-purple-900">3. Ilustrasi & Grafik</h2>
                <p className="text-sm text-purple-700">Visualisasi data dalam bentuk chart dan diagram</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Chart Options */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Pilih grafik yang ingin didownload:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedChart('bar-bulan')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-bulan'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-bulan'}
                      onChange={() => setSelectedChart('bar-bulan')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Cedera per Bulan</p>
                      <p className="text-sm text-gray-600 mt-1">Trend jumlah cedera bulanan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('pie-derajat')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'pie-derajat'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'pie-derajat'}
                      onChange={() => setSelectedChart('pie-derajat')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Pie Chart: Distribusi Derajat</p>
                      <p className="text-sm text-gray-600 mt-1">Proporsi ringan/sedang/berat</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('bar-lokasi')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-lokasi'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-lokasi'}
                      onChange={() => setSelectedChart('bar-lokasi')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Lokasi Cedera</p>
                      <p className="text-sm text-gray-600 mt-1">Top lokasi cedera terbanyak</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('bar-aktivitas')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-aktivitas'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-aktivitas'}
                      onChange={() => setSelectedChart('bar-aktivitas')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Jenis Aktivitas</p>
                      <p className="text-sm text-gray-600 mt-1">Aktivitas penyebab cedera</p>
                    </div>
                  </div>
                </button>

                {isNasional && (
                  <>
                    <button
                      onClick={() => setSelectedChart('line-wilayah')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedChart === 'line-wilayah'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedChart === 'line-wilayah'}
                          onChange={() => setSelectedChart('line-wilayah')}
                          className="mt-1"
                        />
                        <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Line Chart: Trend per Wilayah</p>
                          <p className="text-sm text-gray-600 mt-1">Perbandingan trend antar wilayah</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedChart('stacked-derajat')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedChart === 'stacked-derajat'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedChart === 'stacked-derajat'}
                          onChange={() => setSelectedChart('stacked-derajat')}
                          className="mt-1"
                        />
                        <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Stacked Bar: Derajat × Wilayah</p>
                          <p className="text-sm text-gray-600 mt-1">Breakdown derajat per wilayah</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Format Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900">
                <strong>Format:</strong> Semua grafik akan diexport dalam resolusi tinggi (High-Resolution PNG) 
                yang cocok untuk publikasi dan presentasi.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload("charts_png")}
                disabled={downloading !== null}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-5 h-5" />
                {downloading === "charts_png" ? "Menyiapkan..." : "Download PNG (High-Res)"}
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
              <span><strong>Format Crosstabulasi:</strong> Mengikuti format yang sama dengan halaman Visualisasi Data (Training vs Competition).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Styling Excel:</strong> File Excel dilengkapi dengan header berwarna, zebra-striping, border, dan bold text untuk kemudahan membaca.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Data bersifat rahasia dan hanya untuk keperluan analisis internal organisasi.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Untuk pertanyaan teknis, silakan hubungi admin sistem melalui menu Help & Contact.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* OFFSCREEN EXPORT AREA (hidden) */}
      {exportPayload && (
        <div
          ref={(el) => { exportRef.current = el; }}
          style={{
            position: "fixed",
            left: -99999,
            top: 0,
            width: 1200,
            padding: 24,
            background: "white",
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>
            Grafik Cedera ({exportPayload.start} – {exportPayload.end})
          </h2>

          {/* 1) Bar: cedera per bulan */}
          <div data-chart="bar-cedera-per-bulan" style={{ width: 1100, height: 450, marginBottom: 24 }}>
            <Bar
              data={{
                labels: (exportPayload.monthly ?? []).map((x: any) => x.bulan),
                datasets: [
                  { label: "Jumlah", data: (exportPayload.monthly ?? []).map((x: any) => x.jumlah) },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>

          {/* 2) Pie: derajat */}
          <div data-chart="pie-derajat" style={{ width: 700, height: 450, marginBottom: 24 }}>
            <Pie
              data={{
                labels: (exportPayload.pie ?? []).map((x: any) => x.name),
                datasets: [
                  { label: "Proporsi", data: (exportPayload.pie ?? []).map((x: any) => x.value) },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>

          {/* 3) Bar: top lokasi */}
          <div data-chart="bar-top-lokasi" style={{ width: 1100, height: 450, marginBottom: 24 }}>
            <Bar
              data={{
                labels: (exportPayload.topLok ?? []).map((x: any) => x.lokasi),
                datasets: [
                  { label: "Jumlah", data: (exportPayload.topLok ?? []).map((x: any) => x.jumlah) },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>

          {/* 4) Bar: top aktivitas */}
          <div data-chart="bar-top-aktivitas" style={{ width: 1100, height: 450, marginBottom: 24 }}>
            <Bar
              data={{
                labels: (exportPayload.topAkt ?? []).map((x: any) => x.aktivitas),
                datasets: [
                  { label: "Jumlah", data: (exportPayload.topAkt ?? []).map((x: any) => x.jumlah) },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>

          {/* Nasional-only charts */}
          {exportPayload.isNasional && exportPayload.wilayahMonthly && (
            <div data-chart="line-trend-per-wilayah" style={{ width: 1100, height: 450, marginBottom: 24 }}>
              <Line
                data={{
                  labels: exportPayload.wilayahMonthly.monthLabels,
                  datasets: exportPayload.wilayahMonthly.datasets.map((d: any) => ({
                    label: d.label,
                    data: d.data,
                  })),
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          )}

          {exportPayload.isNasional && exportPayload.severityWilayah && (
            <div data-chart="stacked-derajat-per-wilayah" style={{ width: 1100, height: 450, marginBottom: 24 }}>
              <Bar
                data={{
                  labels: exportPayload.severityWilayah.wilayahList,
                  datasets: exportPayload.severityWilayah.datasets.map((d: any) => ({
                    label: d.label,
                    data: d.data,
                  })),
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                  },
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}