 import { useState } from 'react';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { useToast } from '@/hooks/use-toast';
 import { Badge } from '@/components/ui/badge';
 import { Plus, Trash2, Upload, Power, PowerOff } from 'lucide-react';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { SplashScreenPreview } from './SplashScreenPreview';
 import { SplashTemplateGallery } from './SplashTemplateGallery';
 import { SplashTemplate } from '@/lib/splashTemplates';
 
 interface SplashScreen {
   id: string;
   title: string;
   lottie_url: string;
   duration: number;
   fade_out_duration: number;
   start_date: string;
   end_date: string;
   is_active: boolean;
   priority: number;
   platform: string;
 }
 
 export function SplashScreensManager() {
   const { toast } = useToast();
   const queryClient = useQueryClient();
   const [editingId, setEditingId] = useState<string | null>(null);
   const [uploadingFile, setUploadingFile] = useState(false);
 
   const { data: splashScreens = [] } = useQuery<SplashScreen[]>({
     queryKey: ['admin-splash-screens'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('admin_splash_screens')
         .select('*')
         .order('priority', { ascending: false })
         .order('start_date', { ascending: false });
       if (error) throw error;
       return data as SplashScreen[];
     },
   });
 
   const createMutation = useMutation({
     mutationFn: async (newSplash: Omit<SplashScreen, 'id'>) => {
       const { error } = await supabase.from('admin_splash_screens').insert(newSplash);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-splash-screens'] });
       toast({ title: 'Splash screen created' });
     },
   });
 
   const updateMutation = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<SplashScreen> & { id: string }) => {
       const { error } = await supabase
         .from('admin_splash_screens')
         .update(updates)
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-splash-screens'] });
       toast({ title: 'Splash screen updated' });
       setEditingId(null);
     },
   });
 
   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('admin_splash_screens').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-splash-screens'] });
       toast({ title: 'Splash screen deleted' });
     },
   });
 
   const toggleAllMutation = useMutation({
     mutationFn: async (enable: boolean) => {
       const { error } = await supabase
         .from('admin_splash_screens')
         .update({ is_active: enable })
         .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
       if (error) throw error;
     },
     onSuccess: (_, enable) => {
       queryClient.invalidateQueries({ queryKey: ['admin-splash-screens'] });
       toast({ 
         title: enable ? 'All splash screens enabled' : 'All splash screens disabled',
         description: enable ? 'Users will see splash screens when applicable' : 'Splash screens are now hidden'
       });
     },
   });

   const handleFileUpload = async (file: File, splashId: string) => {
     setUploadingFile(true);
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `splash-${Date.now()}.${fileExt}`;
         const filePath = `${fileName}`;
 
       const { error: uploadError } = await supabase.storage
           .from('splash-screens')
         .upload(filePath, file);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
           .from('splash-screens')
         .getPublicUrl(filePath);
 
       await updateMutation.mutateAsync({ id: splashId, lottie_url: publicUrl });
     } catch (error) {
       console.error('Upload error:', error);
       toast({ title: 'Upload failed', variant: 'destructive' });
     } finally {
       setUploadingFile(false);
     }
   };
 
   const handleCreateNew = () => {
     const today = new Date().toISOString().split('T')[0];
     const nextMonth = new Date();
     nextMonth.setMonth(nextMonth.getMonth() + 1);
     
     createMutation.mutate({
       title: 'New Splash Screen',
       lottie_url: '',
       duration: 3000,
       fade_out_duration: 500,
       start_date: today,
       end_date: nextMonth.toISOString().split('T')[0],
       is_active: false,
       priority: 0,
       platform: 'both',
     });
   };
 
   const activeCount = splashScreens.filter(s => s.is_active).length;
   const hasAny = splashScreens.length > 0;

   return (
     <div className="space-y-6">
       {/* Global Status Bar */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
         <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className={`h-3 w-3 rounded-full ${activeCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
           <div>
             <p className="font-medium text-sm sm:text-base">
               {activeCount > 0 ? `${activeCount} Splash Screen${activeCount > 1 ? 's' : ''} Active` : 'All Splash Screens Disabled'}
             </p>
             <p className="text-xs text-muted-foreground">
               {activeCount > 0 
                 ? 'Users will see splash screens based on schedule and platform'
                 : 'No splash screens are currently shown to users'}
             </p>
           </div>
         </div>
         {hasAny && (
           <div className="flex gap-2 w-full sm:w-auto">
             <Button
               variant={activeCount > 0 ? "outline" : "default"}
               size="sm"
               className="gap-2 flex-1 sm:flex-none"
               onClick={() => toggleAllMutation.mutate(true)}
               disabled={toggleAllMutation.isPending}
             >
               <Power className="h-4 w-4" />
               <span className="hidden sm:inline">Enable All</span>
               <span className="sm:hidden">Enable</span>
             </Button>
             <Button
               variant={activeCount > 0 ? "destructive" : "outline"}
               size="sm"
               className="gap-2 flex-1 sm:flex-none"
               onClick={() => toggleAllMutation.mutate(false)}
               disabled={toggleAllMutation.isPending}
             >
               <PowerOff className="h-4 w-4" />
               <span className="hidden sm:inline">Disable All</span>
               <span className="sm:hidden">Disable</span>
             </Button>
           </div>
         )}
       </div>

       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="w-full sm:w-auto">
           <h2 className="text-xl sm:text-2xl font-bold">Splash Screens</h2>
           <p className="text-sm text-muted-foreground">
             Manage multiple splash screens for different occasions and events
           </p>
         </div>
         <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
           <SplashTemplateGallery
             onSelectTemplate={(template) => {
               createMutation.mutate({
                 title: template.name,
                 lottie_url: template.lottieUrl,
                 duration: template.duration,
                 fade_out_duration: template.fadeOutDuration,
                 start_date: new Date().toISOString().split('T')[0],
                 end_date: (() => {
                   const date = new Date();
                   date.setMonth(date.getMonth() + 1);
                   return date.toISOString().split('T')[0];
                 })(),
                 is_active: false,
                 priority: 0,
                 platform: 'both',
               });
             }}
           />
           <Button onClick={handleCreateNew}>
             <Plus className="mr-2 h-4 w-4" />
             <span className="hidden sm:inline">Create Custom</span>
             <span className="sm:hidden">Custom</span>
           </Button>
         </div>
       </div>
 
       <Tabs defaultValue="active">
         <TabsList className="grid w-full grid-cols-3">
           <TabsTrigger value="active">Active</TabsTrigger>
           <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
           <TabsTrigger value="all">All</TabsTrigger>
         </TabsList>
 
         <TabsContent value="active" className="space-y-4">
           {(splashScreens || []).filter((s) => s.is_active && new Date(s.start_date) <= new Date() && new Date(s.end_date) >= new Date()).map((splash) => (
             <SplashScreenCard
               key={splash.id}
               splash={splash}
               isEditing={editingId === splash.id}
               onEdit={() => setEditingId(splash.id)}
               onUpdate={(updates) => updateMutation.mutate({ id: splash.id, ...updates })}
               onDelete={() => deleteMutation.mutate(splash.id)}
               onFileUpload={(file) => handleFileUpload(file, splash.id)}
               uploading={uploadingFile}
             />
           ))}
         </TabsContent>
 
         <TabsContent value="scheduled" className="space-y-4">
           {(splashScreens || []).filter((s) => new Date(s.start_date) > new Date()).map((splash) => (
             <SplashScreenCard
               key={splash.id}
               splash={splash}
               isEditing={editingId === splash.id}
               onEdit={() => setEditingId(splash.id)}
               onUpdate={(updates) => updateMutation.mutate({ id: splash.id, ...updates })}
               onDelete={() => deleteMutation.mutate(splash.id)}
               onFileUpload={(file) => handleFileUpload(file, splash.id)}
               uploading={uploadingFile}
             />
           ))}
         </TabsContent>
 
         <TabsContent value="all" className="space-y-4">
           {(splashScreens || []).map((splash) => (
             <SplashScreenCard
               key={splash.id}
               splash={splash}
               isEditing={editingId === splash.id}
               onEdit={() => setEditingId(splash.id)}
               onUpdate={(updates) => updateMutation.mutate({ id: splash.id, ...updates })}
               onDelete={() => deleteMutation.mutate(splash.id)}
               onFileUpload={(file) => handleFileUpload(file, splash.id)}
               uploading={uploadingFile}
             />
           ))}
         </TabsContent>
       </Tabs>
     </div>
   );
 }
 
 function SplashScreenCard({
   splash,
   isEditing,
   onEdit,
   onUpdate,
   onDelete,
   onFileUpload,
   uploading,
 }: {
   splash: SplashScreen;
   isEditing: boolean;
   onEdit: () => void;
   onUpdate: (updates: Partial<SplashScreen>) => void;
   onDelete: () => void;
   onFileUpload: (file: File) => void;
   uploading: boolean;
 }) {
   const [localData, setLocalData] = useState(splash);
   const [showTemplates, setShowTemplates] = useState(false);
 
   const handleApplyTemplate = (template: SplashTemplate) => {
     setLocalData({
       ...localData,
       title: template.name,
       lottie_url: template.lottieUrl,
       duration: template.duration,
       fade_out_duration: template.fadeOutDuration,
     });
     setShowTemplates(false);
   };
 
   const handleSave = () => {
     onUpdate(localData);
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
           <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
             <CardTitle className="text-lg">{splash.title}</CardTitle>
             {splash.is_active && (
               <Badge variant="default" className="gap-1">
                 <Power className="h-3 w-3" />
                 Active
               </Badge>
             )}
             {!splash.is_active && (
               <Badge variant="secondary" className="gap-1">
                 <PowerOff className="h-3 w-3" />
                 Inactive
               </Badge>
             )}
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="flex items-center gap-2 bg-muted/50 px-2 sm:px-3 py-1.5 rounded-md flex-1 sm:flex-none justify-center">
               <span className="text-xs font-medium text-muted-foreground">
                 {splash.is_active ? 'Enabled' : 'Disabled'}
               </span>
               <Switch
               checked={splash.is_active}
               onCheckedChange={(checked) => onUpdate({ is_active: checked })}
             />
             </div>
             <Button variant="ghost" size="sm" onClick={onEdit} className="hidden sm:inline-flex">
               Edit
             </Button>
             <Button variant="ghost" size="sm" onClick={onDelete} className="hidden sm:inline-flex">
               <Trash2 className="h-4 w-4" />
             </Button>
             {/* Mobile: Show icons only */}
             <Button variant="ghost" size="sm" onClick={onEdit} className="sm:hidden">
               <span className="sr-only">Edit</span>
               ✏️
             </Button>
             <Button variant="ghost" size="sm" onClick={onDelete} className="sm:hidden">
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {isEditing ? (
           <>
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>Title</Label>
                 <Input
                   value={localData.title}
                   onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Platform</Label>
                 <Select
                   value={localData.platform}
                   onValueChange={(value: 'web' | 'app' | 'both') =>
                     setLocalData({ ...localData, platform: value })
                   }
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="web">Web</SelectItem>
                     <SelectItem value="app">App</SelectItem>
                     <SelectItem value="both">Both</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
 
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>Start Date</Label>
                 <Input
                   type="date"
                   value={localData.start_date.split('T')[0]}
                   onChange={(e) =>
                     setLocalData({ ...localData, start_date: e.target.value })
                   }
                 />
               </div>
               <div className="space-y-2">
                 <Label>End Date</Label>
                 <Input
                   type="date"
                   value={localData.end_date.split('T')[0]}
                   onChange={(e) =>
                     setLocalData({ ...localData, end_date: e.target.value })
                   }
                 />
               </div>
             </div>
 
             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
               <div className="space-y-2">
                 <Label>Duration (ms)</Label>
                 <Input
                   type="number"
                   value={localData.duration}
                   onChange={(e) =>
                     setLocalData({ ...localData, duration: parseInt(e.target.value) })
                   }
                 />
               </div>
               <div className="space-y-2">
                 <Label>Fade Out (ms)</Label>
                 <Input
                   type="number"
                   value={localData.fade_out_duration}
                   onChange={(e) =>
                     setLocalData({ ...localData, fade_out_duration: parseInt(e.target.value) })
                   }
                 />
               </div>
               <div className="space-y-2">
                 <Label>Priority</Label>
                 <Input
                   type="number"
                   value={localData.priority}
                   onChange={(e) =>
                     setLocalData({ ...localData, priority: parseInt(e.target.value) })
                   }
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label>Lottie Animation</Label>
               <div className="flex flex-col sm:flex-row gap-2 mb-2">
                 <SplashTemplateGallery onSelectTemplate={handleApplyTemplate} />
                 <Button
                   variant="outline"
                   className="w-full sm:w-auto"
                   disabled={uploading}
                   onClick={() => {
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = '.json';
                     input.onchange = (e) => {
                       const file = (e.target as HTMLInputElement).files?.[0];
                       if (file) onFileUpload(file);
                     };
                     input.click();
                   }}
                 >
                   <Upload className="mr-2 h-4 w-4" />
                   Upload JSON
                 </Button>
               </div>
               <div className="flex gap-2">
                 <Input
                   value={localData.lottie_url}
                   onChange={(e) =>
                     setLocalData({ ...localData, lottie_url: e.target.value })
                   }
                   placeholder="Enter Lottie URL or use template/upload"
                 />
               </div>
               <p className="text-xs text-muted-foreground">
                 Choose from templates, upload your own JSON, or paste a URL
               </p>
             </div>
 
             <Button onClick={handleSave}>Save Changes</Button>

             {localData.lottie_url && (
               <div className="mt-6">
                 <SplashScreenPreview
                   lottieUrl={localData.lottie_url}
                   duration={localData.duration}
                   fadeOutDuration={localData.fade_out_duration}
                 />
               </div>
             )}
           </>
         ) : (
           <div className="grid gap-2 text-sm">
             <div className="flex justify-between">
               <span className="text-muted-foreground">Platform:</span>
               <span className="font-medium">{splash.platform}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Duration:</span>
               <span className="font-medium">{splash.duration}ms</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Period:</span>
               <span className="font-medium">
                 {new Date(splash.start_date).toLocaleDateString()} -{' '}
                 {new Date(splash.end_date).toLocaleDateString()}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Priority:</span>
               <span className="font-medium">{splash.priority}</span>
             </div>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }