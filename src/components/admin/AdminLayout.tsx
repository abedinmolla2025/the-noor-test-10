import React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { ProtectedRoute } from "./ProtectedRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[AdminLayout] Uncaught error", { error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred while loading the admin panel. Please
              try again.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  try {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('[AdminLayout] Uncaught error in admin layout', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold">Admin panel failed to load</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while rendering the admin interface.
          </p>
        </div>
      </div>
    );
  }
};
