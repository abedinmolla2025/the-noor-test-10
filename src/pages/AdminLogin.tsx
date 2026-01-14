import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AdminLogin = () => {
  const handleAdminLogin = useCallback(async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error("Error during admin Google login", error);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
        <Button onClick={handleAdminLogin} className="mx-auto">
          Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
