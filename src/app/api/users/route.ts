import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // pastikan caller login
  const { data: auth } = await supabase.auth.getUser();
  const callerId = auth.user?.id;
  if (!callerId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // pastikan admin nasional
  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .single();

  if (meErr || me?.role !== "admin_nasional") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ambil semua admin_daerah & pelatih
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, wilayah, created_at, is_active")
    .in("role", ["admin_daerah", "pelatih"])
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ users: data ?? [] });
}

