 import { useState } from 'react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { SPLASH_TEMPLATES, TEMPLATE_CATEGORIES, SplashTemplate } from '@/lib/splashTemplates';
 import { Sparkles, Clock, Zap } from 'lucide-react';
 import { SplashScreenPreview } from './SplashScreenPreview';
 
 interface SplashTemplateGalleryProps {
   onSelectTemplate: (template: SplashTemplate) => void;
 }
 
 export function SplashTemplateGallery({ onSelectTemplate }: SplashTemplateGalleryProps) {
   const [selectedCategory, setSelectedCategory] = useState<string>('all');
   const [previewTemplate, setPreviewTemplate] = useState<SplashTemplate | null>(null);
 
   const filteredTemplates =
     selectedCategory === 'all'
       ? SPLASH_TEMPLATES
       : SPLASH_TEMPLATES.filter((t) => t.category === selectedCategory);
 
   return (
     <Dialog>
       <DialogTrigger asChild>
         <Button variant="outline" className="gap-2">
           <Sparkles className="h-4 w-4" />
           Browse Templates
         </Button>
       </DialogTrigger>
       <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="text-2xl">Splash Screen Templates</DialogTitle>
           <p className="text-sm text-muted-foreground">
             Pre-designed splash screens for Islamic occasions and events
           </p>
         </DialogHeader>
 
         <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
           <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
             {TEMPLATE_CATEGORIES.map((cat) => (
               <TabsTrigger key={cat.value} value={cat.value} className="text-xs sm:text-sm px-2">
                 {cat.label}
               </TabsTrigger>
             ))}
           </TabsList>
 
           <TabsContent value={selectedCategory} className="mt-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {filteredTemplates.map((template) => (
                 <TemplateCard
                   key={template.id}
                   template={template}
                   onSelect={() => onSelectTemplate(template)}
                   onPreview={() => setPreviewTemplate(template)}
                 />
               ))}
             </div>
 
             {filteredTemplates.length === 0 && (
               <div className="text-center py-12">
                 <p className="text-muted-foreground">No templates in this category yet</p>
               </div>
             )}
           </TabsContent>
         </Tabs>
 
         {/* Preview Modal */}
         {previewTemplate && (
           <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
             <DialogContent className="max-w-4xl">
               <DialogHeader>
                 <DialogTitle>{previewTemplate.name}</DialogTitle>
                 <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
               </DialogHeader>
               <SplashScreenPreview
                 lottieUrl={previewTemplate.lottieUrl}
                 duration={previewTemplate.duration}
                 fadeOutDuration={previewTemplate.fadeOutDuration}
               />
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                   Close
                 </Button>
                 <Button
                   onClick={() => {
                     onSelectTemplate(previewTemplate);
                     setPreviewTemplate(null);
                   }}
                 >
                   Use This Template
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         )}
       </DialogContent>
     </Dialog>
   );
 }
 
 function TemplateCard({
   template,
   onSelect,
   onPreview,
 }: {
   template: SplashTemplate;
   onSelect: () => void;
   onPreview: () => void;
 }) {
   const categoryColors = {
     ramadan: 'bg-purple-500/10 text-purple-600 border-purple-200',
     eid: 'bg-green-500/10 text-green-600 border-green-200',
     muharram: 'bg-slate-500/10 text-slate-600 border-slate-200',
     general: 'bg-blue-500/10 text-blue-600 border-blue-200',
     seasonal: 'bg-amber-500/10 text-amber-600 border-amber-200',
   };
 
   return (
     <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
       <CardContent className="p-0">
         {/* Preview Area with Gradient */}
         <div
           className="h-40 relative flex items-center justify-center"
           style={{
             background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`,
           }}
         >
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
           <div className="relative z-10 text-white text-center space-y-2">
             <Sparkles className="h-12 w-12 mx-auto opacity-80" />
             <p className="text-sm font-medium">{template.name}</p>
           </div>
           
           {/* Preview Button Overlay */}
           <Button
             variant="secondary"
             size="sm"
             className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
             onClick={onPreview}
           >
             Preview
           </Button>
         </div>
 
         {/* Info Section */}
         <div className="p-4 space-y-3">
           <div className="flex items-start justify-between gap-2">
             <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
             <Badge variant="outline" className={categoryColors[template.category]}>
               {template.category}
             </Badge>
           </div>
 
           <p className="text-xs text-muted-foreground line-clamp-2">
             {template.description}
           </p>
 
           <div className="flex items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
               <Clock className="h-3 w-3" />
               {(template.duration / 1000).toFixed(1)}s
             </div>
             <div className="flex items-center gap-1">
               <Zap className="h-3 w-3" />
               {template.fadeOutDuration}ms fade
             </div>
           </div>
 
           <Button size="sm" className="w-full" onClick={onSelect}>
             Use Template
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 }