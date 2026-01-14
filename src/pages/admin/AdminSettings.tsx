import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AppSettingRow {
  id: string;
  setting_key: string;
  setting_value: any;
}

const BRANDING_KEY = 'branding';
const THEME_KEY = 'theme';
const SEO_KEY = 'seo';
const SYSTEM_KEY = 'system';
const MODULES_KEY = 'modules';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<AppSettingRow[]>({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      return data as AppSettingRow[];
    },
  });

  const getValue = (key: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value ?? {};

  const [branding, setBranding] = useState(() => getValue(BRANDING_KEY));
  const [theme, setTheme] = useState(() => getValue(THEME_KEY));
  const [seo, setSeo] = useState(() => getValue(SEO_KEY));
  const [system, setSystem] = useState(() => ({
    maintenanceMode: false,
    showAds: false,
    forceUpdate: false,
    ...(getValue(SYSTEM_KEY) || {}),
  }));
  const [modules, setModules] = useState(() => ({
    prayerTimes: true,
    quran: true,
    duas: true,
    hadith: true,
    calendar: true,
    quiz: true,
    ...(getValue(MODULES_KEY) || {}),
  }));

  const updateSettingMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: any;
    }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ setting_key: key, setting_value: value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast({ title: 'Settings updated' });
    },
  });

  const handleSimpleChange = (
    updater: (value: any) => void,
    field: string,
  ) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      updater((prev: any) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSwitchChange = (
    updater: (value: any) => void,
    field: string,
  ) =>
    (checked: boolean) => {
      updater((prev: any) => ({ ...prev, [field]: checked }));
    };

  const handleModulesToggle = (field: keyof typeof modules) => (checked: boolean) => {
    setModules((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSave = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
    target: 'branding' | 'seo',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${target}/${field}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('branding')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('branding')
      .getPublicUrl(data.path);

    const url = publicUrlData.publicUrl;

    if (target === 'branding') {
      setBranding((prev: any) => ({ ...prev, [field]: url }));
    } else {
      setSeo((prev: any) => ({ ...prev, [field]: url }));
    }

    toast({ title: 'Image uploaded' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global App Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage branding, theme, SEO and system behavior for the entire app.
        </p>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="appName">App name</Label>
                  <Input
                    id="appName"
                    value={branding.appName || ''}
                    onChange={handleSimpleChange(setBranding, 'appName')}
                    placeholder="NOOR"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={branding.tagline || ''}
                    onChange={handleSimpleChange(setBranding, 'tagline')}
                    placeholder="Prayer, Quran & more"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoUrl', 'branding')}
                  />
                  {branding.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt="Logo preview"
                      className="h-12 w-12 rounded-full object-cover mt-2 border border-border"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>App Icon / Favicon</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'iconUrl', 'branding')}
                  />
                  {branding.iconUrl && (
                    <img
                      src={branding.iconUrl}
                      alt="Icon preview"
                      className="h-12 w-12 rounded-lg object-cover mt-2 border border-border"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave(BRANDING_KEY, branding)}>Save branding</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Colors are HSL values (e.g. <code>158 64% 35%</code>) that map directly to the
                Tailwind design tokens like <code>--primary</code>.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="primaryColor">Primary color (HSL)</Label>
                  <Input
                    id="primaryColor"
                    value={theme.primaryColor || ''}
                    onChange={handleSimpleChange(setTheme, 'primaryColor')}
                    placeholder="158 64% 35%"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary color (HSL)</Label>
                  <Input
                    id="secondaryColor"
                    value={theme.secondaryColor || ''}
                    onChange={handleSimpleChange(setTheme, 'secondaryColor')}
                    placeholder="210 40% 96.1%"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="accentColor">Accent color (HSL)</Label>
                  <Input
                    id="accentColor"
                    value={theme.accentColor || ''}
                    onChange={handleSimpleChange(setTheme, 'accentColor')}
                    placeholder="45 93% 58%"
                  />
                </div>
                <div>
                  <Label htmlFor="borderRadius">Border radius (e.g. 1rem)</Label>
                  <Input
                    id="borderRadius"
                    value={theme.borderRadius || ''}
                    onChange={handleSimpleChange(setTheme, 'borderRadius')}
                    placeholder="1rem"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Default mode</Label>
                    <p className="text-sm text-muted-foreground">Light or dark on first load</p>
                  </div>
                  <Switch
                    checked={theme.defaultMode === 'dark'}
                    onCheckedChange={(checked) =>
                      setTheme((prev: any) => ({
                        ...prev,
                        defaultMode: checked ? 'dark' : 'light',
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave(THEME_KEY, theme)}>Save theme</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="seoTitle">Default title</Label>
                  <Input
                    id="seoTitle"
                    value={seo.title || ''}
                    onChange={handleSimpleChange(setSeo, 'title')}
                    placeholder="NOOR - Prayer Times, Quran & More"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta description</Label>
                  <Input
                    id="seoDescription"
                    value={seo.description || ''}
                    onChange={handleSimpleChange(setSeo, 'description')}
                    placeholder="Stay connected with your daily prayers..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share / Open Graph image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'shareImageUrl', 'seo')}
                />
                {seo.shareImageUrl && (
                  <img
                    src={seo.shareImageUrl}
                    alt="Share preview"
                    className="h-24 rounded-xl object-cover mt-2 border border-border"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave(SEO_KEY, seo)}>Save SEO</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a maintenance banner for all users (frontend only)
                  </p>
                </div>
                <Switch
                  checked={system.maintenanceMode}
                  onCheckedChange={handleSwitchChange(setSystem, 'maintenanceMode')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Ads</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle ad placements across the app
                  </p>
                </div>
                <Switch
                  checked={system.showAds}
                  onCheckedChange={handleSwitchChange(setSystem, 'showAds')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Force Update</Label>
                  <p className="text-sm text-muted-foreground">
                    Signal clients that a hard refresh / app update is required
                  </p>
                </div>
                <Switch
                  checked={system.forceUpdate}
                  onCheckedChange={handleSwitchChange(setSystem, 'forceUpdate')}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave(SYSTEM_KEY, system)}>Save system</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enable or disable major app modules. Disabled modules will be hidden from navigation
                and home screen entry points.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prayer Times</Label>
                    <p className="text-sm text-muted-foreground">Prayer times & Athan</p>
                  </div>
                  <Switch
                    checked={modules.prayerTimes}
                    onCheckedChange={handleModulesToggle('prayerTimes')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quran</Label>
                    <p className="text-sm text-muted-foreground">Quran reader & audio</p>
                  </div>
                  <Switch
                    checked={modules.quran}
                    onCheckedChange={handleModulesToggle('quran')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duas</Label>
                    <p className="text-sm text-muted-foreground">Daily & category based duas</p>
                  </div>
                  <Switch
                    checked={modules.duas}
                    onCheckedChange={handleModulesToggle('duas')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hadith</Label>
                    <p className="text-sm text-muted-foreground">Bukhari & other collections</p>
                  </div>
                  <Switch
                    checked={modules.hadith}
                    onCheckedChange={handleModulesToggle('hadith')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Calendar</Label>
                    <p className="text-sm text-muted-foreground">Islamic calendar</p>
                  </div>
                  <Switch
                    checked={modules.calendar}
                    onCheckedChange={handleModulesToggle('calendar')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Quiz</Label>
                    <p className="text-sm text-muted-foreground">Daily quiz module</p>
                  </div>
                  <Switch
                    checked={modules.quiz}
                    onCheckedChange={handleModulesToggle('quiz')}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave(MODULES_KEY, modules)}>Save modules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
