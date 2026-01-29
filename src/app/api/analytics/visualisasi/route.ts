import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function parseDate(s: string | null, fallback: string) {
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : fallback;
}

async function requireAdminNasional(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Unauthorized", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData.user) return { error: "Unauthorized", status: 401 as const };

  const uid = userData.user.id;
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", uid)
    .maybeSingle();

  if (!prof || prof.role !== "admin_nasional") return { error: "Forbidden", status: 403 as const };
  return { uid };
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdminNasional(req);
    if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const url = new URL(req.url);
    const start = parseDate(url.searchParams.get("start"), "2024-07-01");
    const end = parseDate(url.searchParams.get("end"), "2024-12-31");

    const [monthly, pie, lokasi, aktivitas] = await Promise.all([
      supabaseAdmin.rpc("analytics_monthly_counts", { start_date: start, end_date: end }),
      supabaseAdmin.rpc("analytics_severity_pie", { start_date: start, end_date: end }),
      supabaseAdmin.rpc("analytics_top_locations", { start_date: start, end_date: end, top_n: 10 }),
      supabaseAdmin.rpc("analytics_top_activities", { start_date: start, end_date: end, top_n: 10 }),
    ]);

    const anyErr = monthly.error || pie.error || lokasi.error || aktivitas.error;
    if (anyErr) return NextResponse.json({ error: anyErr.message }, { status: 500 });

    // Add colors to severity data
    const severityColorMap: Record<string, string> = {
      'Ringan': '#22c55e',    // green-500
      'Sedang': '#f59e0b',    // amber-500
      'Berat': '#ef4444',     // red-500
    };

    const dataDerajatWithColors = (pie.data ?? []).map((item: any) => ({
      ...item,
      color: severityColorMap[item.name] || '#6b7280',
    }));

    // Add colors to location data (varied palette)
    const locationColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#eab308', '#f43f5e', '#6366f1', '#14b8a6'];
    const dataLokasiWithColors = (lokasi.data ?? []).map((item: any, idx: number) => ({
      ...item,
      color: locationColors[idx % locationColors.length],
    }));

    // Add colors to activity data (varied palette)
    const activityColors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#f97316', '#14b8a6'];
    const dataAktivitasWithColors = (aktivitas.data ?? []).map((item: any, idx: number) => ({
      ...item,
      color: activityColors[idx % activityColors.length],
    }));

    return NextResponse.json({
      period: { start, end },
      dataPerBulan: monthly.data ?? [],
      dataDerajat: dataDerajatWithColors,
      dataLokasi: dataLokasiWithColors,
      dataAktivitas: dataAktivitasWithColors,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
