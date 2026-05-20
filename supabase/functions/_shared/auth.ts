import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

/**
 * Authorizes a request to an admin/service edge function.
 * Accepts either:
 *   1. A service-role bearer token (used by Inngest / cron / server-to-server calls), or
 *   2. A signed-in user that has the 'admin' role in public.user_roles.
 * Returns null when authorized, or a Response (401/403) when not.
 */
export async function requireAdmin(req: Request, corsHeaders: Record<string, string>): Promise<Response | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Service-to-service: service role key allowed.
  if (token === serviceKey) return null;

  // Otherwise, validate user JWT and admin role.
  const sb = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userRes, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}