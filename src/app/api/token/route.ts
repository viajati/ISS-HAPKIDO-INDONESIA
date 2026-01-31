import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Role = "pelatih" | "admin_daerah" | "admin_nasional";
type TokenStatus = "active" | "expired" | "used";

type TokenRow = {
  id: number;
  token: string;
  role: Role;
  status: TokenStatus;
  created_by: string;
  created_at: string;
  expires_at: string;
};

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

function randomToken(len = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

async function getAuthedUserAndRole(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { error: "ENV Supabase belum lengkap (URL/ANON/SERVICE_ROLE)." as const };
  }

  const jwt = getBearerToken(req);
  if (!jwt) return { error: "Unauthorized: missing Bearer token" as const };

  // 1) validasi JWT -> dapatkan user id
  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return { error: "Unauthorized: invalid session" as const };

  // 2) cek role dari profiles (service role supaya tidak kena RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr || !profile) return { error: "Profile tidak ditemukan" as const };

  return {
    supabaseAdmin,
    userId: user.id,
    userRole: profile.role as string,
  };
}

// ===============================
// POST: generate token baru
// ===============================
export async function POST(req: Request) {
  try {
    const auth = await getAuthedUserAndRole(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

    if (auth.userRole !== "admin_nasional") {
      return NextResponse.json({ error: "Forbidden: hanya admin nasional" }, { status: 403 });
    }

    const body = (await req.json()) as { role?: Role; validDays?: number };

    const role = body.role;
    const validDays = Number(body.validDays);

    if (!role || !["pelatih", "admin_daerah", "admin_nasional"].includes(role)) {
      return NextResponse.json({ error: "role tidak valid" }, { status: 400 });
    }
    if (!Number.isFinite(validDays) || validDays < 1 || validDays > 365) {
      return NextResponse.json({ error: "validDays harus 1-365" }, { status: 400 });
    }

    // Token 4 huruf (A-Z)
    const token = randomToken(4);

    // Expire token aktif sebelumnya untuk role yang sama (1 token aktif per role)
    const { error: expireErr } = await auth.supabaseAdmin
      .from("registration_tokens")
      .update({ status: "expired" })
      .eq("status", "active")
      .eq("role", role);

    if (expireErr) {
      return NextResponse.json({ error: "Gagal expire token lama: " + expireErr.message }, { status: 400 });
    }

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(now.getDate() + validDays);

    const { data, error } = await auth.supabaseAdmin
      .from("registration_tokens")
      .insert({
        token,
        role,
        status: "active",
        created_by: auth.userId, // ✅ dari user login, bukan client
        created_at: now.toISOString(),
        expires_at: validUntil.toISOString(),
      })
      .select("id, token, role, status, created_by, created_at, expires_at")
      .single<TokenRow>();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Insert token gagal" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      token: data.token,
      role: data.role,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      validUntil: data.expires_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ===============================
// GET: token history + activeByRole
// ===============================
export async function GET(req: Request) {
  try {
    const auth = await getAuthedUserAndRole(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

    if (auth.userRole !== "admin_nasional") {
      return NextResponse.json({ error: "Forbidden: hanya admin nasional" }, { status: 403 });
    }

    // Auto-expire tokens that passed their expiry date
    const nowIso = new Date().toISOString();
    const { error: autoExpireErr } = await auth.supabaseAdmin
      .from("registration_tokens")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", nowIso);

    if (autoExpireErr) {
      return NextResponse.json({ error: "Gagal update status token: " + autoExpireErr.message }, { status: 400 });
    }

    const { data, error } = await auth.supabaseAdmin
      .from("registration_tokens")
      .select("id, token, role, status, created_by, created_at, expires_at")
      .order("created_at", { ascending: false })
      .returns<TokenRow[]>();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const activeByRole: Record<Role, TokenRow | null> = {
      pelatih: null,
      admin_daerah: null,
      admin_nasional: null,
    };

    for (const t of data ?? []) {
      if (t.status === "active" && !activeByRole[t.role]) activeByRole[t.role] = t;
    }

    return NextResponse.json({ tokens: data, activeByRole });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
