import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length);

  const body = await req.json().catch(() => ({}));
  const { userId, nextActive } = body ?? {};

  if (!userId || typeof nextActive !== "boolean") {
    return NextResponse.json({ error: "Expected { userId, nextActive }" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // caller login?
  const { data: auth } = await supabase.auth.getUser();
  const callerId = auth.user?.id;
  if (!callerId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // caller admin nasional?
  const { data: me } = await supabase.from("profiles").select("role").eq("id", callerId).single();
  if (me?.role !== "admin_nasional") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // (opsional) jangan boleh disable admin_nasional
  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (target?.role === "admin_nasional") {
    return NextResponse.json({ error: "Tidak bisa menonaktifkan admin_nasional" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
