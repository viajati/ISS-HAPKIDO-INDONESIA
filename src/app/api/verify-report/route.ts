import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

async function requireAdminNasional() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    console.error("Auth error:", userErr);
    return { error: "Unauthorized", status: 401 as const };
  }

  const uid = user.id;
  console.log("User ID:", uid);

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", uid)
    .maybeSingle();

  console.log("Profile data:", prof);
  console.log("Profile error:", profErr);

  if (!prof || prof.role !== "admin_nasional") {
    console.error(
      `Access denied. User role: ${prof?.role || "null"}, Required: admin_nasional`
    );

    return {
      error: "Forbidden: Only admin_nasional can verify or delete reports",
      status: 403 as const,
    };
  }

  return { uid, supabase };
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdminNasional();

    if ("error" in gate) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    const body = await req.json();
    const { report_id, action } = body; // action: approve | reject | delete

    if (!report_id || typeof report_id !== "number") {
      return NextResponse.json({ error: "Invalid report_id" }, { status: 400 });
    }

    if (!action || !["approve", "reject", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // DELETE verified/rejected report permanently
    if (action === "delete") {
      console.log("Calling admin_delete_verified_report RPC:", {
        p_report_id: report_id,
      });

      const { data, error } = await gate.supabase.rpc(
        "admin_delete_verified_report",
        {
          p_report_id: report_id,
        }
      );

      if (error) {
        console.error("Delete RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Report deleted permanently",
        report: data,
      });
    }

    // APPROVE / REJECT submitted report
    console.log("Calling admin_verify_report RPC:", {
      p_report_id: report_id,
      p_action: action,
    });

    const { data, error } = await gate.supabase.rpc("admin_verify_report", {
      p_report_id: report_id,
      p_action: action,
    });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Report not found or already processed" },
        { status: 404 }
      );
    }

    console.log("RPC success:", data);

    return NextResponse.json({
      success: true,
      message: `Report ${
        action === "approve" ? "verified" : "rejected"
      } successfully`,
      report: data,
    });
  } catch (e: any) {
    console.error("Verify report error:", e);

    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
