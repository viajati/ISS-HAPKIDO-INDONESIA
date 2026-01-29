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

    const [summary, jenis, mekanisme, lokasi, derajat] = await Promise.all([
      supabaseAdmin.rpc("analytics_crosstab_summary", { start_date: start, end_date: end }),
      supabaseAdmin.rpc("analytics_crosstab_by_injury_type", { start_date: start, end_date: end, top_n: 9999 }),
      supabaseAdmin.rpc("analytics_crosstab_by_mechanism", { start_date: start, end_date: end, top_n: 9999 }),
      supabaseAdmin.rpc("analytics_crosstab_by_location", { start_date: start, end_date: end, top_n: 9999 }),
      supabaseAdmin.rpc("analytics_crosstab_by_severity", { start_date: start, end_date: end }),
    ]);

    const anyErr = summary.error || jenis.error || mekanisme.error || lokasi.error || derajat.error;
    if (anyErr) return NextResponse.json({ error: anyErr.message }, { status: 500 });

    return NextResponse.json({
      period: { start, end },
      summary: summary.data ?? [],
      jenis_cedera: jenis.data ?? [],
      mekanisme: mekanisme.data ?? [],
      lokasi: lokasi.data ?? [],
      derajat: derajat.data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
