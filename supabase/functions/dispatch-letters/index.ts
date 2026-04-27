// Scheduled dispatcher: send all due letters via Resend
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Future Self <onboarding@resend.dev>";

const moodMeta: Record<string, { emoji: string; tone: string }> = {
  happy: { emoji: "😊", tone: "joyful" },
  sad: { emoji: "💔", tone: "tender" },
  love: { emoji: "💕", tone: "loving" },
};

function buildHtml(message: string, mood: string | null, createdAt: string) {
  const m = moodMeta[mood ?? "love"] ?? moodMeta.love;
  const safe = message.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
  const dateStr = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  return `<!doctype html>
<html><body style="margin:0;padding:30px 12px;background:linear-gradient(160deg,#FFE5EC 0%,#FFD1DC 50%,#FFB6C1 100%);font-family:-apple-system,BlinkMacSystemFont,'Quicksand',Arial,sans-serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;">
    <tr><td align="center" style="padding-bottom:18px;">
      <div style="font-size:42px;">${m.emoji}💌</div>
      <h1 style="margin:8px 0 0;color:#C2185B;font-size:24px;font-weight:700;">A letter from your past self</h1>
    </td></tr>
    <tr><td style="background:#fff;border-radius:24px;padding:32px 28px;box-shadow:0 12px 40px rgba(255,105,135,0.25);border:2px solid #FFD1DC;">
      <p style="color:#999;font-size:13px;margin:0 0 18px;font-style:italic;">Written ${dateStr} • ${m.tone} mood</p>
      <div style="color:#444;font-size:16px;line-height:1.7;white-space:pre-wrap;">${safe}</div>
      <hr style="border:none;border-top:1px dashed #FFB6C1;margin:24px 0;">
      <p style="color:#C2185B;text-align:center;margin:0;font-size:14px;font-weight:600;">With love, your past self ✨</p>
    </td></tr>
    <tr><td align="center" style="padding-top:22px;color:#C2185B;font-size:12px;opacity:0.75;">
      💕 Sent through Future Letters 💕
    </td></tr>
  </table>
</body></html>`;
}

async function sendOne(to: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: "💌 A letter from your past self",
      html,
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Resend ${r.status}: ${txt}`);
  }
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: due, error } = await supabase
      .from("letters")
      .select("id, email, message, mood, created_at")
      .eq("status", "pending")
      .lte("deliver_at", new Date().toISOString())
      .limit(50);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    const results: any[] = [];

    for (const letter of due ?? []) {
      try {
        await sendOne(letter.email, buildHtml(letter.message, letter.mood, letter.created_at));
        await supabase
          .from("letters")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", letter.id);
        sent++;
        results.push({ id: letter.id, ok: true });
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        console.error("send failed", letter.id, msg);
        await supabase.from("letters").update({ status: "failed" }).eq("id", letter.id);
        results.push({ id: letter.id, ok: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ checked: due?.length ?? 0, sent, failed, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("dispatch error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
