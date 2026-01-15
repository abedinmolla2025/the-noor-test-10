import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2 } from "lucide-react";
import { getDeviceFingerprint, isAdminIdleExpired, setLastAdminActivityNow } from "@/lib/adminSecurity";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAdmin();

  // ONE SINGLE SOURCE OF TRUTH for admin unlock state
  const unlocked = localStorage.getItem("noor_admin_unlocked") === "1";

  // Sliding inactivity timeout (30 min) for admin panel
  useEffect(() => {
    if (!user || !isAdmin || !unlocked) return;

    let cancelled = false;

    // If this device doesn't match the bound fingerprint, force lock.
    (async () => {
      const bound = localStorage.getItem("noor_admin_device_fingerprint");
      if (!bound) return;
      const current = await getDeviceFingerprint();
      if (!cancelled && current !== bound) {
        try {
          await supabase.functions.invoke("admin-security", {
            body: { action: "log_event", action_name: "permission_denied" },
          });
        } catch {
          // ignore
        }
        await supabase.auth.signOut();
        localStorage.removeItem("noor_admin_unlocked");
        localStorage.removeItem("noor_admin_last_activity");
        localStorage.removeItem("noor_admin_device_fingerprint");
      }
    })();

    const bump = () => setLastAdminActivityNow();
    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((evt) => window.addEventListener(evt, bump, { passive: true }));

    const timer = window.setInterval(async () => {
      if (isAdminIdleExpired()) {
        try {
          await supabase.functions.invoke("admin-security", {
            body: { action: "log_event", action_name: "session_expired" },
          });
        } catch {
          // ignore
        }
        await supabase.auth.signOut();
        localStorage.removeItem("noor_admin_unlocked");
        localStorage.removeItem("noor_admin_last_activity");
        localStorage.removeItem("noor_admin_device_fingerprint");
      }
    }, 15_000);

    return () => {
      cancelled = true;
      events.forEach((evt) => window.removeEventListener(evt, bump));
      window.clearInterval(timer);
    };
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin access requires: backend-authenticated admin + local unlock state + not expired
  if (!user || !isAdmin || !unlocked) {
    return <Navigate to="/" replace />;
  }

  if (isAdminIdleExpired()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

