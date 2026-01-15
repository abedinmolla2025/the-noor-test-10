import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { ProtectedRoute } from './ProtectedRoute';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AdminBottomNavigation } from './AdminBottomNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const pageTitleFromPath = (pathname: string) => {
  if (pathname.startsWith('/admin/users')) return 'Users';
  if (pathname.startsWith('/admin/content')) return 'Content';
  if (pathname.startsWith('/admin/notifications')) return 'Notifications';
  if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/admin/reports')) return 'Reports';
  if (pathname.startsWith('/admin/ads')) return 'Ads';
  if (pathname.startsWith('/admin/finance') || pathname.startsWith('/admin/monetization')) return 'Finance';
  if (pathname.startsWith('/admin/audit')) return 'Audit';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Dashboard';
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const pageTitle = pageTitleFromPath(location.pathname);

  return (
    <ProtectedRoute>
      <div className="admin-compact flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 overflow-auto">
          {/* Mobile top app bar */}
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-3 py-3 backdrop-blur md:hidden">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                NOOR Admin
              </p>
              <h1 className="truncate text-sm font-semibold leading-tight">{pageTitle}</h1>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open admin menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-r border-border p-0">
                <AdminSidebar showQuickShortcuts />
              </SheetContent>
            </Sheet>
          </div>

          {/* Content padding includes mobile bottom-tab safe area */}
          <div className="container mx-auto px-3 py-4 pb-24 sm:px-4 sm:py-6 md:pb-6 lg:px-6">
            {children}
          </div>

          <AdminBottomNavigation />
        </main>
      </div>
    </ProtectedRoute>
  );
};
