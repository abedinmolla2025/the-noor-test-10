import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Right-side slot for page actions (buttons, dropdowns, etc.). */
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
}) => {
  return (
    <header className="mb-4 space-y-2 sm:mb-6">
      <Breadcrumb>
        <BreadcrumbList className="text-[11px] text-muted-foreground">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard" className="hover:text-foreground">
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
          </div>
          {description && <p className="max-w-2xl text-xs text-muted-foreground">{description}</p>}
        </div>

        {actions ? (
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-start gap-2 sm:justify-end">{actions}</div>
          </div>
        ) : null}
      </div>
    </header>
  );
};
