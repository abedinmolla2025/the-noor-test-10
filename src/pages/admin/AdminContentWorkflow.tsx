import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MobileTableWrapper } from '@/components/admin/MobileTableWrapper';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_STEPS = ['draft', 'in_review', 'scheduled', 'published', 'archived'] as const;

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export default function AdminContentWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, isSuperAdmin } = useAdmin();

  const { data: content } = useQuery({
    queryKey: ['admin-content-item', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  const { data: versions } = useQuery({
    queryKey: ['content-versions', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', id)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const { data: approvals } = useQuery({
    queryKey: ['content-approvals', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*')
        .eq('content_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['admin-audit-log', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('resource_type', 'content')
        .eq('resource_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const currentStatusIndex = useMemo(() => {
    if (!content) return 0;
    const idx = STATUS_STEPS.findIndex((s) => s === content.status);
    return idx === -1 ? 0 : idx;
  }, [content]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Workflow</h1>
          <p className="text-muted-foreground mt-2">
            Detailed workflow view for content item {id}
          </p>
        </div>
        <div className="space-y-1 text-right text-sm text-muted-foreground">
          <div>
            Status:{' '}
            {content && (
              <Badge className="ml-1">{STATUS_LABELS[content.status] || content.status}</Badge>
            )}
          </div>
          <div>Admin: {isAdmin ? 'Yes' : 'No'} · Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {STATUS_STEPS.map((status, index) => {
              const active = index <= currentStatusIndex;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">
                    {STATUS_LABELS[status] || status}
                  </span>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="w-10 h-px bg-border mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Approval Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Approvals for this content. Editors can request approval; Admins can approve or
              reject.
            </p>

            {approvals && approvals.length > 0 ? (
              <MobileTableWrapper>
                <Table className="min-w-[720px] text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow className="h-9">
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Requested By</TableHead>
                      <TableHead className="whitespace-nowrap">Approved By</TableHead>
                      <TableHead className="whitespace-nowrap">Created</TableHead>
                      <TableHead className="whitespace-nowrap">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((row) => (
                      <TableRow key={row.id} className="h-9">
                        <TableCell className="align-middle">{row.status}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs font-mono align-middle max-w-[220px] truncate">
                          {row.requested_by}
                        </TableCell>
                        <TableCell className="text-[11px] sm:text-xs font-mono align-middle max-w-[220px] truncate">
                          {row.approved_by || '-'}
                        </TableCell>
                        <TableCell className="align-middle whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
                          {formatDateTime(row.created_at)}
                        </TableCell>
                        <TableCell className="align-middle whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
                          {formatDateTime(row.updated_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MobileTableWrapper>
            ) : (
              <p className="text-sm text-muted-foreground">No approvals recorded yet.</p>
            )}

            {!user && (
              <p className="text-xs text-destructive">
                You must be logged in to perform approval actions.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scheduled Publish At</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTime(content?.scheduled_at)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Set new schedule</Label>
              <Input id="schedule" type="datetime-local" disabled={!isAdmin && !isSuperAdmin} />
              <Button className="w-full" disabled={!isAdmin && !isSuperAdmin}>
                Schedule Publish
              </Button>
            </div>

            <div>
              <Label>Published At</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTime(content?.published_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rollback Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {versions && versions.length > 0 ? (
              <MobileTableWrapper>
                <Table className="min-w-[560px] text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow className="h-9">
                      <TableHead className="whitespace-nowrap">Version</TableHead>
                      <TableHead className="whitespace-nowrap">Title</TableHead>
                      <TableHead className="whitespace-nowrap">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.slice(0, 5).map((v) => (
                      <TableRow key={v.id} className="h-9">
                        <TableCell className="align-middle">{v.version_number}</TableCell>
                        <TableCell className="align-middle max-w-[260px] truncate">{v.title}</TableCell>
                        <TableCell className="align-middle whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
                          {formatDateTime(v.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MobileTableWrapper>
            ) : (
              <p className="text-sm text-muted-foreground">No versions recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLogs && auditLogs.length > 0 ? (
              <MobileTableWrapper>
                <Table className="min-w-[520px] text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow className="h-9">
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                      <TableHead className="whitespace-nowrap">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 5).map((log) => (
                      <TableRow key={log.id} className="h-9">
                        <TableCell className="align-middle max-w-[260px] truncate">{log.action}</TableCell>
                        <TableCell className="align-middle whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MobileTableWrapper>
            ) : (
              <p className="text-sm text-muted-foreground">No audit events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
