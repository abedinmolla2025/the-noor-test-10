import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type AppRole = "user" | "editor" | "admin" | "super_admin";

type AdminContextType = {
  user: User | null;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  forceClearLoading: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[AdminAuth] getSession error (initial)", error);
        }

        const session = data.session;
        console.log("[AdminAuth] getSession (initial)", {
          userId: session?.user?.id ?? null,
          hasSession: !!session,
        });

        if (!isMounted) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRoles(session.user.id);
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error("[AdminAuth] Unexpected error in loadInitialSession", error);
        if (isMounted) {
          setUser(null);
          setRoles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AdminAuth] onAuthStateChange", {
          event,
          userId: session?.user?.id ?? null,
        });

        if (!isMounted) return;

        setUser(session?.user ?? null);

        try {
          if (session?.user) {
            await fetchUserRoles(session.user.id);
          } else {
            setRoles([]);
          }
        } catch (error) {
          console.error(
            "[AdminAuth] Error during onAuthStateChange role loading",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    loadInitialSession();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } else {
        setRoles(data?.map(r => r.role as AppRole) || []);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    }
  };

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');

  return (
    <AdminContext.Provider
      value={{ user, roles, isAdmin, isSuperAdmin, loading, forceClearLoading: () => setLoading(false) }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
};
