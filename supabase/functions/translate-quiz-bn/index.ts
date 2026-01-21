import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TranslateRequest = {
  limit?: number;
};

type TranslateResult = {
  id: string;
  question_bn: string;
  options_bn: string[];
};

function cleanString(input: unknown) {
  return String(input ?? "").trim();
}

async function translateToBangla(payload: { question: string; options: string[] }) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `You are a professional Bangla translator for Islamic quiz content.
Translate the following quiz question and its 4 options from English to Bangla.

Rules:
- Keep Islamic terms accurate.
- Keep numbers as numerals.
- Return STRICT JSON only (no markdown, no extra text).
- Output shape: {"question_bn": string, "options_bn": [string,string,string,string]}

Input:
Question: ${payload.question}
Options: ${payload.options.map((o, i) => `${i + 1}) ${o}`).join(" | ")}
`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    throw new Error(`AI gateway error: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI response missing content");

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Sometimes models wrap JSON in whitespace or stray text; attempt a safe extract.
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("AI response is not valid JSON");
    parsed = JSON.parse(content.slice(start, end + 1));
  }

  const question_bn = cleanString(parsed.question_bn);
  const options_bn = Array.isArray(parsed.options_bn) ? parsed.options_bn.map(cleanString) : [];
  if (!question_bn) throw new Error("AI returned empty question_bn");
  if (options_bn.length !== 4 || options_bn.some((s: string) => !s)) {
    throw new Error("AI returned invalid options_bn");
  }

  return { question_bn, options_bn };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 20 } = (await req.json().catch(() => ({}))) as TranslateRequest;
    const cappedLimit = Math.max(1, Math.min(50, Number(limit) || 20));

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Backend credentials missing");

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: rows, error } = await admin
      .from("quiz_questions")
      .select("id, question, question_en, options, options_en, question_bn, options_bn")
      .or("question_bn.is.null,options_bn.is.null")
      .limit(cappedLimit);

    if (error) throw error;

    const pending = (rows ?? []).filter((r: any) => !r.question_bn || !Array.isArray(r.options_bn) || r.options_bn?.length !== 4);
    if (pending.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: TranslateResult[] = [];
    for (const r of pending) {
      const q = cleanString(r.question_en || r.question);
      const opts = (Array.isArray(r.options_en) && r.options_en.length === 4 ? r.options_en : r.options) as string[];
      const options = Array.isArray(opts) ? opts.map(cleanString) : [];
      if (!q || options.length !== 4) continue;

      const translated = await translateToBangla({ question: q, options });
      results.push({ id: r.id, ...translated });
    }

    let updated = 0;
    for (const r of results) {
      const { error: updateErr } = await admin
        .from("quiz_questions")
        .update({
          question_bn: r.question_bn,
          options_bn: r.options_bn,
        })
        .eq("id", r.id);
      if (updateErr) {
        console.error("Update failed", r.id, updateErr);
        continue;
      }
      updated += 1;
    }

    return new Response(
      JSON.stringify({ ok: true, processed: pending.length, updated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in translate-quiz-bn:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
