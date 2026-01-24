import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  email: string;
  password: string;
  full_name: string;
  token: string;
  phone?: string;
  dojang?: string;
  wilayah?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const full_name = (body.full_name || "").trim();
    const token = (body.token || "").trim();

    const phone = body.phone?.trim() || null;
    const dojang = body.dojang?.trim() || null;
    // Tidak pakai wilayah dari token, hanya dari input user (jika ada)
    const wilayahInput = body.wilayah?.trim() || null;

    if (!email || !password || !full_name || !token) {
      return NextResponse.json(
        { error: "Email, password, nama lengkap, dan token wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "ENV Supabase belum lengkap (URL/ANON/SERVICE_ROLE)." },
        { status: 500 }
      );
    }

    // ANON: untuk signUp agar Supabase mengirim email verifikasi otomatis (Confirm Email ON)
    const supabaseAnon = createClient(supabaseUrl, anonKey);

    // ADMIN: bypass RLS untuk token/profiles + rollback delete user
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Validasi token (active + belum expired)
    const nowIso = new Date().toISOString();
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("registration_tokens")
      .select("id, role, status, expires_at") // wilayah dihapus
      .eq("token", token)
      .eq("status", "active")
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return NextResponse.json(
        { error: "Token tidak valid / sudah digunakan / sudah kadaluarsa." },
        { status: 400 }
      );
    }

    // 2) Sign up auth user
    // Catatan: jika Confirm Email ON, user akan dibuat tapi belum confirmed sampai klik link email.
    const { data: signUpData, error: signUpErr } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (signUpErr || !signUpData.user) {
      return NextResponse.json(
        { error: signUpErr?.message || "Gagal membuat user auth." },
        { status: 400 }
      );
    }

    const userId = signUpData.user.id;

    // 3) Insert profile (bypass RLS)
    // wilayah hanya dari input user (jika ada), tidak dari token
    const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name,
      email,
      phone,
      role: tokenRow.role,
      dojang,
      wilayah: wilayahInput,
    });

    if (profileErr) {
      // rollback auth user (service role)
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Gagal membuat profile: " + profileErr.message },
        { status: 400 }
      );
    }

    // 4) Log token usage (multi-use). Token tetap active.
    const { error: useErr } = await supabaseAdmin
      .from("registration_token_uses")
      .insert({
        token_id: tokenRow.id,
        used_by: userId,
        used_at: nowIso,
      });

    if (useErr) {
      // rollback supaya konsisten
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: "Gagal mencatat pemakaian token: " + useErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Akun berhasil dibuat. Silakan cek email untuk verifikasi sebelum login.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
