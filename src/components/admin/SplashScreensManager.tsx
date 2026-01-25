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
 import { Plus, Trash2, Upload } from 'lucide-react';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { SplashScreenPreview } from './SplashScreenPreview';
 
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
 
   const handleFileUpload = async (file: File, splashId: string) => {
     setUploadingFile(true);
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `splash-${Date.now()}.${fileExt}`;
       const filePath = `splash-screens/${fileName}`;
 
       const { error: uploadError } = await supabase.storage
         .from('media')
         .upload(filePath, file);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
         .from('media')
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
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold">Splash Screens</h2>
           <p className="text-sm text-muted-foreground">
             Manage multiple splash screens for different occasions and events
           </p>
         </div>
         <Button onClick={handleCreateNew}>
           <Plus className="mr-2 h-4 w-4" />
           Add New
         </Button>
       </div>
 
       <Tabs defaultValue="active">
         <TabsList>
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
 
   const handleSave = () => {
     onUpdate(localData);
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg">{splash.title}</CardTitle>
           <div className="flex items-center gap-2">
             <Switch
               checked={splash.is_active}
               onCheckedChange={(checked) => onUpdate({ is_active: checked })}
             />
             <Button variant="ghost" size="sm" onClick={onEdit}>
               Edit
             </Button>
             <Button variant="ghost" size="sm" onClick={onDelete}>
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {isEditing ? (
           <>
             <div className="grid gap-4 md:grid-cols-2">
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
 
             <div className="grid gap-4 md:grid-cols-2">
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
 
             <div className="grid gap-4 md:grid-cols-3">
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
               <div className="flex gap-2">
                 <Input
                   value={localData.lottie_url}
                   onChange={(e) =>
                     setLocalData({ ...localData, lottie_url: e.target.value })
                   }
                   placeholder="URL or upload JSON file"
                 />
                 <Button
                   variant="outline"
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
                   <Upload className="h-4 w-4" />
                 </Button>
               </div>
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