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
 
     // Get the sitemap URL from the request origin
     const url = new URL(req.url);
     const sitemapUrl = `${supabaseUrl}/functions/v1/sitemap`;
 
     console.log("Notifying search engines about sitemap:", sitemapUrl);
 
     // Ping Google
     const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
     const googleResponse = await fetch(googlePingUrl);
     await googleResponse.text(); // Consume response
     const googleSuccess = googleResponse.ok;
 
     console.log("Google ping status:", googleResponse.status);
 
     // Ping Bing
     const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
     const bingResponse = await fetch(bingPingUrl);
     await bingResponse.text(); // Consume response
     const bingSuccess = bingResponse.ok;
 
     console.log("Bing ping status:", bingResponse.status);
 
     return new Response(
       JSON.stringify({
         success: googleSuccess && bingSuccess,
         google: {
           success: googleSuccess,
           status: googleResponse.status,
         },
         bing: {
           success: bingSuccess,
           status: bingResponse.status,
         },
         sitemap_url: sitemapUrl,
       }),
       {
         headers: {
           ...corsHeaders,
           "Content-Type": "application/json",
         },
       }
     );
   } catch (err) {
     console.error("Search engine notification error:", err);
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