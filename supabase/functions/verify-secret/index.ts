// Verify the secret password using bcrypt with plain-text fallback
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing password" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("secret_access")
      .select("password_hash, message")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.error("DB error or no data:", error);
      return new Response(JSON.stringify({ success: false, error: "Secret not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let ok = false;
    
    // Check if the stored hash looks like a bcrypt hash (starts with $2)
    if (data.password_hash.startsWith("$2")) {
      try {
        ok = await bcrypt.compare(password, data.password_hash);
      } catch (err) {
        console.error("Bcrypt error:", err);
        ok = false;
      }
    } else {
      // Plain text fallback
      ok = password.trim() === data.password_hash.trim();
    }

    if (!ok) {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: data.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-secret error", err);
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
