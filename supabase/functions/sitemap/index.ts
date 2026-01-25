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
 
     const { data: pages, error } = await supabase
       .from("seo_pages")
       .select("path, updated_at, robots")
       .order("path", { ascending: true });
 
     if (error) {
       console.error("Error fetching seo_pages:", error);
       return new Response("Error fetching sitemap data", {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "text/plain" },
       });
     }
 
     const indexablePages = (pages || []).filter((p) => {
       const robots = (p.robots || "").toLowerCase();
       return !robots.includes("noindex");
     });
 
     const url = new URL(req.url);
     const origin = `${url.protocol}//${url.host}`;
 
     const urls = indexablePages
       .map((p) => {
         const lastmod = p.updated_at
           ? new Date(p.updated_at).toISOString().split("T")[0]
           : new Date().toISOString().split("T")[0];
         const priority = p.path === "/" ? "1.0" : "0.8";
         const changefreq = p.path === "/" ? "daily" : "weekly";
 
         return `  <url>
     <loc>${origin}${p.path}</loc>
     <lastmod>${lastmod}</lastmod>
     <changefreq>${changefreq}</changefreq>
     <priority>${priority}</priority>
   </url>`;
       })
       .join("\n");
 
     const xml = `<?xml version="1.0" encoding="UTF-8"?>
 <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 ${urls}
 </urlset>`;
 
     return new Response(xml, {
       headers: {
         ...corsHeaders,
         "Content-Type": "application/xml; charset=utf-8",
         "Cache-Control": "public, max-age=3600, s-maxage=3600",
       },
     });
   } catch (err) {
     console.error("Sitemap generation error:", err);
     return new Response("Internal server error", {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "text/plain" },
     });
   }
 });
 