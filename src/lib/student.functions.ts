import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getStudentAcademy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = context.supabase as unknown as SupabaseClient;
    const { data: authData, error: authError } = await client.auth.getUser();
    const user = authData.user;
    if (authError || !user?.email || !user.email_confirmed_at) throw new Error("EMAIL_NOT_CONFIRMED");

    const displayName =
      typeof user.user_metadata?.["display_name"] === "string"
        ? user.user_metadata["display_name"].trim()
        : user.email.split("@")[0];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as SupabaseClient;
    const { error: linkError } = await admin.rpc("link_verified_student", {
      p_user_id: user.id,
      p_email: user.email,
      p_display_name: displayName || "Aluno",
    });
    if (linkError) throw new Error("PROFILE_SYNC_FAILED");

    const { data: grants, error: grantsError } = await client
      .from("purchase_entitlements")
      .select("entitlement, active")
      .eq("active", true);
    if (grantsError) throw new Error("ACCESS_LOOKUP_FAILED");

    const entitlements = Array.from(
      new Set((grants ?? []).map((grant) => String(grant.entitlement))),
    );
    const developmentPreview = process.env["NODE_ENV"] !== "production";
    const { buildAcademyData } = await import("@/lib/academy.server");
    return buildAcademyData(displayName || "Aluno", entitlements, developmentPreview);
  });
