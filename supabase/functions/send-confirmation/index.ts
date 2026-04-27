const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, deliverAt } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Future Letters <onboarding@resend.dev>",
        to: [email],
        subject: "✨ Your letter has been sealed in the stars!",
        html: `
          <!doctype html>
          <html>
            <body style="margin:0;padding:40px 20px;background-color:#FFF5F8;font-family:sans-serif;color:#C2185B;">
              <div style="max-width:500px;margin:0 auto;background:#ffffff;padding:30px;border-radius:30px;box-shadow:0 10px 30px rgba(255,105,135,0.2);border:2px solid #FFD1DC;text-align:center;">
                <div style="font-size:50px;margin-bottom:20px;">💌✨</div>
                <h1 style="font-size:24px;margin-bottom:10px;">Letter Sealed!</h1>
                <p style="font-size:16px;line-height:1.6;color:#444;">
                  Your message to your future self has been captured and safely sealed in our cosmic nebula.
                </p>
                <div style="margin:25px 0;padding:15px;background:#FFF0F5;border-radius:15px;font-weight:bold;color:#C2185B;">
                  Scheduled for delivery on:<br>
                  <span style="font-size:20px;">${deliverAt}</span>
                </div>
                <p style="font-size:14px;color:#999;">
                  We'll make sure it reaches you exactly when it's supposed to.
                </p>
                <hr style="border:none;border-top:1px dashed #FFB6C1;margin:30px 0;">
                <p style="font-size:14px;font-weight:bold;">With love, Future Letters 💕</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
