import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

          <div className="flex justify-end">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-xs font-mono max-w-[140px] truncate">
                    {log.actor_id}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[140px] truncate">
                    {log.resource_id || '-'}
                  </TableCell>
                  <TableCell>{log.resource_type || '-'}</TableCell>
                  <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  <TableCell>
                    <pre className="text-xs max-w-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.metadata || {}, null, 2)}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
