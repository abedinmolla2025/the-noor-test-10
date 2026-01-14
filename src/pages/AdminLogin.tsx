import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2 } from "lucide-react";

const UNLOCK_KEY = "noor_admin_unlock";

const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Valid admin email required" })
    .max(255, { message: "Email is too long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password is too long" }),
});

const AdminLogin = () => {
  const { user, isAdmin, loading } = useAdmin();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unlocked = localStorage.getItem(UNLOCK_KEY) === "1";
    if (!unlocked) {
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, []);

  // If already logged in as admin, go straight to admin panel
  if (!loading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Block direct access if hidden unlock not performed
  if (allowed === false) {
    return <Navigate to="/" replace />;
  }

  if (allowed === null || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = adminLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Invalid credentials";
      setError(firstError);
      return;
    }

    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInError) {
        // Do not leak exact error details
        setError("Invalid email or password.");
        return;
      }

      // AdminContext listener will pick up session and isAdmin,
      // which will cause the redirect above to /admin for admin users.
    } catch (err) {
      console.error("Error during admin email login", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your administrator credentials to access the NOOR control panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Admin email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in as Admin"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
