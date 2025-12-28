import { useState } from "react";
import { Volume2, VolumeX, Bell, BellOff, X, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface AthanSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: {
    enabled: boolean;
    prayers: {
      Fajr: boolean;
      Dhuhr: boolean;
      Asr: boolean;
      Maghrib: boolean;
      Isha: boolean;
    };
    volume: number;
    sound: "makkah" | "madinah";
  };
  onUpdateSettings: (settings: any) => void;
  onTogglePrayer: (prayer: "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha") => void;
  onRequestPermission: () => Promise<boolean>;
  isPlaying: boolean;
  onPlayTest: () => void;
  onStop: () => void;
}

const AthanSettingsModal = ({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onTogglePrayer,
  onRequestPermission,
  isPlaying,
  onPlayTest,
  onStop,
}: AthanSettingsModalProps) => {
  const [permissionGranted, setPermissionGranted] = useState(
    "Notification" in window && Notification.permission === "granted"
  );

  const handleRequestPermission = async () => {
    const granted = await onRequestPermission();
    setPermissionGranted(granted);
  };

  const prayers = [
    { key: "Fajr", name: "Fajr", arabic: "الفجر", time: "Dawn" },
    { key: "Dhuhr", name: "Dhuhr", arabic: "الظهر", time: "Noon" },
    { key: "Asr", name: "Asr", arabic: "العصر", time: "Afternoon" },
    { key: "Maghrib", name: "Maghrib", arabic: "المغرب", time: "Sunset" },
    { key: "Isha", name: "Isha", arabic: "العشاء", time: "Night" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Athan Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  {settings.enabled ? (
                    <Bell className="w-6 h-6 text-primary" />
                  ) : (
                    <BellOff className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">Athan Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ enabled: checked })
                  }
                />
              </div>

              {/* Notification Permission */}
              {!permissionGranted && settings.enabled && (
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    Enable browser notifications to receive Athan alerts even when
                    the app is in background.
                  </p>
                  <Button
                    onClick={handleRequestPermission}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Enable Notifications
                  </Button>
                </div>
              )}

              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Volume</p>
                  <div className="flex items-center gap-2">
                    {settings.volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-sm text-muted-foreground w-10">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[settings.volume * 100]}
                  onValueChange={([value]) =>
                    onUpdateSettings({ volume: value / 100 })
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Test Athan */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button
                    onClick={isPlaying ? onStop : onPlayTest}
                    variant={isPlaying ? "destructive" : "outline"}
                    className="flex-1 gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Test Athan
                      </>
                    )}
                  </Button>
                </div>

                {/* Athan sound selection */}
                <div className="space-y-2">
                  <p className="font-medium">Athan sound</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={settings.sound === "makkah" ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => onUpdateSettings({ sound: "makkah" })}
                    >
                      <span>Makkah</span>
                      {settings.sound === "makkah" && (
                        <span className="text-xs text-muted-foreground">Selected</span>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={settings.sound === "madinah" ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => onUpdateSettings({ sound: "madinah" })}
                    >
                      <span>Madinah</span>
                      {settings.sound === "madinah" && (
                        <span className="text-xs text-muted-foreground">Selected</span>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred Athan recitation style.
                  </p>
                </div>
              </div>

              {/* Prayer Toggle List */}
              <div className="space-y-2">
                <p className="font-medium mb-3">Prayer Notifications</p>
                {prayers.map((prayer) => (
                  <div
                    key={prayer.key}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{prayer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {prayer.arabic} • {prayer.time}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        settings.prayers[
                          prayer.key as keyof typeof settings.prayers
                        ]
                      }
                      onCheckedChange={() =>
                        onTogglePrayer(
                          prayer.key as "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
                        )
                      }
                      disabled={!settings.enabled}
                    />
                  </div>
                ))}
              </div>

              {/* Info */}
              <p className="text-xs text-muted-foreground text-center pb-4">
                Athan will play automatically when prayer time arrives. Keep the
                app open or allow background notifications.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AthanSettingsModal;
