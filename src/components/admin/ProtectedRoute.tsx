import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, loading, forceClearLoading } = useAdmin();
  const loadingRenderCount = useRef(0);

  useEffect(() => {
    if (loading) {
      loadingRenderCount.current += 1;
      if (loadingRenderCount.current > 1) {
        console.warn('[ProtectedRoute] loading persisted across renders, forcing clear');
        forceClearLoading();
      }
    } else {
      loadingRenderCount.current = 0;
    }
  }, [loading, forceClearLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
