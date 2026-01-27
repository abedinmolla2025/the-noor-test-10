import { SplashScreensManager } from "@/components/admin/SplashScreensManager";

export default function AdminSplashScreens() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Splash Screens</h1>
        <p className="mt-2 text-muted-foreground">
          Manage scheduled splash animations (web/app/both) with priority and templates.
        </p>
      </div>

      <SplashScreensManager />
    </div>
  );
}
