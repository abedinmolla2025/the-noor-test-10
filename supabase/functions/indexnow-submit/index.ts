 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
     const { path } = await req.json();
 
     if (!path) {
       return new Response(
         JSON.stringify({ success: false, error: "Path is required" }),
         {
           status: 400,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
 
     // Get IndexNow config
     const { data: config, error: configError } = await supabase
       .from("indexnow_config")
       .select("*")
       .order("created_at", { ascending: false })
       .limit(1)
       .single();
 
     if (configError || !config) {
       console.log("No IndexNow config found, skipping IndexNow submission");
       return new Response(
         JSON.stringify({
           success: false,
           skipped: true,
           message: "IndexNow not configured",
         }),
         {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
 
     const fullUrl = `https://${config.host}${path}`;
     console.log("Submitting to IndexNow:", fullUrl);
 
     // Submit to IndexNow
     const indexNowUrl = "https://api.indexnow.org/indexnow";
     const response = await fetch(indexNowUrl, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         host: config.host,
         key: config.api_key,
         keyLocation: config.key_location || `https://${config.host}/${config.api_key}.txt`,
         urlList: [fullUrl],
       }),
     });
 
     await response.text(); // Consume response
 
     console.log("IndexNow response status:", response.status);
 
     // 200 or 202 means success
     const success = response.status === 200 || response.status === 202;
 
     return new Response(
       JSON.stringify({
         success,
         status: response.status,
         url: fullUrl,
       }),
       {
         headers: {
           ...corsHeaders,
           "Content-Type": "application/json",
         },
       }
     );
   } catch (err) {
     console.error("IndexNow submission error:", err);
     return new Response(
       JSON.stringify({
         success: false,
         error: err instanceof Error ? err.message : "Unknown error",
       }),
       {
         status: 500,
         headers: {
           ...corsHeaders,
           "Content-Type": "application/json",
         },
       }
     );
   }
 });