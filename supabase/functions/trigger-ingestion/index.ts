import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/inngest";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const INNGEST_API_KEY = Deno.env.get("INNGEST_API_KEY");
  if (!INNGEST_API_KEY) {
    return new Response(JSON.stringify({ error: "INNGEST_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const source = body.source || "all";

  // Send event to Inngest to trigger ingestion
  const response = await fetch(`${GATEWAY_URL}/e/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": INNGEST_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "app/ingest.requested",
      data: { source, triggered_by: "admin" },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    return new Response(JSON.stringify({ error: `Inngest event failed [${response.status}]: ${errBody}` }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await response.json();
  return new Response(JSON.stringify({ success: true, inngest: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
