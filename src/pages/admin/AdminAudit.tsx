import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MobileTableWrapper } from '@/components/admin/MobileTableWrapper';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Activity, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export default function AdminAuditPage() {
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const hasFilters = useMemo(() => {
    return !!(
      actorFilter.trim() ||
      actionFilter.trim() ||
      resourceFilter.trim() ||
      fromDate ||
      toDate
    );
  }, [actorFilter, actionFilter, resourceFilter, fromDate, toDate]);

  const { data: logs, refetch, isFetching } = useQuery({
    queryKey: ['admin-audit-log', actorFilter, actionFilter, resourceFilter, fromDate, toDate],
    queryFn: async () => {
      let query = supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false });

      if (actorFilter) query = query.ilike('actor_id', `%${actorFilter}%`);
      if (actionFilter) query = query.ilike('action', `%${actionFilter}%`);
      if (resourceFilter) query = query.ilike('resource_id', `%${resourceFilter}%`);
      if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString());
      if (toDate) query = query.lte('created_at', new Date(toDate).toISOString());

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const resetFilters = () => {
    setActorFilter('');
    setActionFilter('');
    setResourceFilter('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground mt-2">
          Monitor all critical actions taken in the NOOR Admin Panel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="actor">Actor ID</Label>
              <Input
                id="actor"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                placeholder="Filter by actor UUID"
              />
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="e.g. content.publish"
              />
            </div>
            <div>
              <Label htmlFor="resource">Resource ID</Label>
              <Input
                id="resource"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                placeholder="Filter by resource UUID"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            {hasFilters && (
              <Button variant="outline" onClick={resetFilters} disabled={isFetching}>
                Reset
              </Button>
            )}
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Filtering...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <MobileTableWrapper helperText="Swipe to see more, or open Details on mobile.">
              <Table className="min-w-[900px] text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="h-9">
                    <TableHead className="whitespace-nowrap">Action</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Actor</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Resource</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Time</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Metadata</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id} className="h-9 align-top">
                      <TableCell className="align-middle">{log.action}</TableCell>
                      <TableCell className="text-[11px] sm:text-xs font-mono max-w-[140px] truncate align-middle hidden sm:table-cell">
                        {log.actor_id}
                      </TableCell>
                      <TableCell className="text-[11px] sm:text-xs font-mono max-w-[140px] truncate align-middle hidden sm:table-cell">
                        {log.resource_id || '-'}
                      </TableCell>
                      <TableCell className="align-middle hidden sm:table-cell">{log.resource_type || '-'}</TableCell>
                      <TableCell className="align-middle whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <pre className="text-[11px] sm:text-xs max-w-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.metadata || {}, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-[11px] sm:hidden"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsOpen(true);
                          }}
                        >
                          <Info className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MobileTableWrapper>
          ) : (
            <AdminEmptyState
              title={hasFilters ? 'No events match your filters' : 'No audit events yet'}
              description={
                hasFilters
                  ? 'Broaden your filters or reset to see all events.'
                  : 'When admins perform actions, events will show up here.'
              }
              icon={<Activity className="h-4 w-4" />}
              primaryAction={
                hasFilters
                  ? {
                      label: 'Reset filters',
                      onClick: resetFilters,
                      variant: 'outline',
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit event details</DialogTitle>
          </DialogHeader>
          {selectedLog ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">{formatDateTime(selectedLog.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actor</p>
                <p className="font-mono text-xs break-all">{selectedLog.actor_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resource</p>
                <p className="font-mono text-xs break-all">{selectedLog.resource_id || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{selectedLog.resource_type || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Metadata</p>
                <pre className="mt-1 max-h-[260px] overflow-auto rounded-md bg-muted p-3 text-[11px]">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
