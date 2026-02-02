import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppNameStyles {
  appName?: string;
  tagline?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  taglineFontFamily?: string;
  taglineFontSize?: number;
  taglineColor?: string;
}

interface AppNameEditorProps {
  branding: AppNameStyles;
  onChange: (branding: AppNameStyles) => void;
}

// Premium-focused font options for primary name & subtitle.
// These are aligned with the fonts we actually load in index.html
// and the Tailwind design tokens (arabic, bangla, premium, display, quiz fonts).
const FONT_OPTIONS = [
	// Defaults (keep these as the editor defaults)
	{ value: 'Inter, sans-serif', label: 'Inter (Default)' },
	{ value: 'Poppins, system-ui, sans-serif', label: 'Poppins (Modern)' },
	{ value: 'DM Sans, system-ui, sans-serif', label: 'DM Sans (Clean)' },
	{ value: 'Noto Sans Bengali, Hind Siliguri, system-ui, sans-serif', label: 'Noto Sans Bengali (Clean Bangla)' },

	// Premium Latin / logo style
	{ value: 'Cinzel, Playfair Display, serif', label: 'Cinzel (Premium Logo)' },
	{ value: 'Playfair Display, serif', label: 'Playfair Display (Elegant Serif)' },
	{ value: 'Lora, DM Sans, system-ui, serif', label: 'Lora (Soft Serif)' },
	{ value: 'Cormorant Garamond, Playfair Display, serif', label: 'Cormorant Garamond (Luxury)' },
	{ value: 'Crimson Pro, Lora, serif', label: 'Crimson Pro (Editorial)' },
	{ value: 'Marcellus, Cinzel, serif', label: 'Marcellus (Classic Display)' },

	// Arabic premium options
	{ value: 'Cairo, Scheherazade New, Noto Naskh Arabic, serif', label: 'Cairo (Modern Arabic)' },
	{ value: 'Scheherazade New, Noto Naskh Arabic, serif', label: 'Scheherazade New (Quranic)' },
	{ value: 'Noto Naskh Arabic, Scheherazade New, serif', label: 'Noto Naskh Arabic' },
	{ value: 'Amiri, Scheherazade New, Noto Naskh Arabic, serif', label: 'Amiri (Traditional Arabic)' },
	{ value: 'Reem Kufi, Noto Naskh Arabic, system-ui, sans-serif', label: 'Reem Kufi (Kufi Style)' },

	// Bangla premium options
	{ value: 'Noto Serif Bengali, Hind Siliguri, system-ui, serif', label: 'Noto Serif Bengali (Premium)' },
	{ value: 'Hind Siliguri, system-ui, sans-serif', label: 'Hind Siliguri (Bangla UI)' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

const COLOR_PRESETS = [
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ffffff', label: 'White' },
  { value: '#000000', label: 'Black' },
  { value: '#d4af37', label: 'Gold' },
];

export function AppNameEditor({ branding, onChange }: AppNameEditorProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [showCustomTaglineColor, setShowCustomTaglineColor] = useState(false);

  const handleChange = (field: keyof AppNameStyles, value: string | number) => {
    onChange({ ...branding, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">App Name & Tagline Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted p-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">Live Preview</p>
          <h1
            style={{
              fontFamily: branding.fontFamily || 'Inter, sans-serif',
              fontSize: `${branding.fontSize || 32}px`,
              fontWeight: branding.fontWeight || '700',
              color: branding.color || '#10b981',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {branding.appName || 'NOOR'}
          </h1>
          <p
            style={{
              fontFamily: branding.taglineFontFamily || 'Inter, sans-serif',
              fontSize: `${branding.taglineFontSize || 14}px`,
              color: branding.taglineColor || '#888888',
              marginTop: '4px',
            }}
          >
            {branding.tagline || 'Prayer, Quran & More'}
          </p>
        </div>

        {/* App Name Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm border-b pb-2">App Name</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appName">Name</Label>
              <Input
                id="appName"
                value={branding.appName || ''}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder="NOOR"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={branding.fontFamily || 'Inter, sans-serif'}
                onValueChange={(value) => handleChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={branding.fontWeight || '700'}
                onValueChange={(value) => handleChange('fontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHT_OPTIONS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {branding.fontSize || 32}px</Label>
              <Slider
                value={[branding.fontSize || 32]}
                onValueChange={([value]) => handleChange('fontSize', value)}
                min={16}
                max={72}
                step={1}
                className="py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    branding.color === preset.value
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => {
                    handleChange('color', preset.value);
                    setShowCustomColor(false);
                  }}
                  title={preset.label}
                />
              ))}
              <button
                type="button"
                className={`w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-xs ${
                  showCustomColor ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => setShowCustomColor(!showCustomColor)}
                title="Custom color"
              >
                +
              </button>
            </div>
            {showCustomColor && (
              <Input
                type="color"
                value={branding.color || '#10b981'}
                onChange={(e) => handleChange('color', e.target.value)}
                className="h-10 w-full cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Tagline Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm border-b pb-2">Tagline</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tagline">Text</Label>
              <Input
                id="tagline"
                value={branding.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Prayer, Quran & More"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={branding.taglineFontFamily || 'Inter, sans-serif'}
                onValueChange={(value) => handleChange('taglineFontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Font Size: {branding.taglineFontSize || 14}px</Label>
              <Slider
                value={[branding.taglineFontSize || 14]}
                onValueChange={([value]) => handleChange('taglineFontSize', value)}
                min={10}
                max={28}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`w-6 h-6 rounded-full border transition-all ${
                      branding.taglineColor === preset.value
                        ? 'ring-2 ring-primary ring-offset-1'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    onClick={() => {
                      handleChange('taglineColor', preset.value);
                      setShowCustomTaglineColor(false);
                    }}
                    title={preset.label}
                  />
                ))}
                <button
                  type="button"
                  className={`w-6 h-6 rounded-full border border-dashed flex items-center justify-center text-xs ${
                    showCustomTaglineColor ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  onClick={() => setShowCustomTaglineColor(!showCustomTaglineColor)}
                  title="Custom"
                >
                  +
                </button>
              </div>
              {showCustomTaglineColor && (
                <Input
                  type="color"
                  value={branding.taglineColor || '#888888'}
                  onChange={(e) => handleChange('taglineColor', e.target.value)}
                  className="h-8 w-full cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
