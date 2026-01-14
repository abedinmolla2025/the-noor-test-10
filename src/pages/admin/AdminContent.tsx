import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { Plus, Edit, Trash2, Workflow, History, Activity } from 'lucide-react';

interface AdminContentRow {
  id: string;
  content_type: string;
  title: string;
  title_arabic: string | null;
  content: string | null;
  content_arabic: string | null;
  category: string | null;
  is_published: boolean | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  approval_required: boolean;
  approved_by: string | null;
  approved_at: string | null;
  current_version_id: string | null;
}

interface ContentVersionRow {
  id: string;
  content_id: string;
  version_number: number;
  title: string;
  title_arabic: string | null;
  content: string | null;
  content_arabic: string | null;
  change_summary: string | null;
  created_at: string;
  created_by: string;
}

interface AuditLogRow {
  id: string;
  action: string;
  actor_id: string;
  resource_id: string | null;
  resource_type: string | null;
  metadata: any | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  in_review: 'outline',
  scheduled: 'outline',
  published: 'default',
  archived: 'destructive',
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export default function AdminContent() {
  const { user, roles, isAdmin, isSuperAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'workflow' | 'versions' | 'audit'>('edit');
  const [editForm, setEditForm] = useState({
    content_type: 'dua',
    title: '',
    title_arabic: '',
    content: '',
    content_arabic: '',
    category: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<ContentVersionRow | null>(null);

  const canEdit = !!user && (roles.includes('editor') || isAdmin || isSuperAdmin);
  const canApprove = !!user && (isAdmin || isSuperAdmin);

  const { data: content, isLoading } = useQuery<AdminContentRow[]>({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminContentRow[];
    },
  });

  const selectedContent = useMemo(
    () => content?.find((item) => item.id === selectedId) ?? null,
    [content, selectedId]
  );

  // Load versions for selected content
  const { data: versions } = useQuery<ContentVersionRow[]>({
    queryKey: ['content-versions', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', selectedId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as ContentVersionRow[];
    },
  });

  // Load audit log for selected content
  const { data: auditLogs } = useQuery<AuditLogRow[]>({
    queryKey: ['admin-audit-log', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('resource_type', 'content')
        .eq('resource_id', selectedId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AuditLogRow[];
    },
  });

  const logAudit = async (action: string, resourceId: string, metadata?: Record<string, any>) => {
    if (!user) return;

    const { error } = await supabase.from('admin_audit_log').insert({
      action,
      actor_id: user.id,
      resource_id: resourceId,
      resource_type: 'content',
      metadata: metadata ?? {},
    });

    if (error) {
      console.error('Failed to log audit event', error);
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log', resourceId] });
    }
  };

  const resetEditForm = (item?: AdminContentRow | null) => {
    if (!item) {
      setEditForm({
        content_type: 'dua',
        title: '',
        title_arabic: '',
        content: '',
        content_arabic: '',
        category: '',
      });
      setSelectedId(null);
      return;
    }

    setEditForm({
      content_type: item.content_type,
      title: item.title,
      title_arabic: item.title_arabic ?? '',
      content: item.content ?? '',
      content_arabic: item.content_arabic ?? '',
      category: item.category ?? '',
    });
    setSelectedId(item.id);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast({ title: 'Content deleted' });
      if (selectedId) {
        setSelectedId(null);
      }
    },
    onError: () => {
      toast({ title: 'Failed to delete content', variant: 'destructive' });
    },
  });

  const handleSave = async () => {
    if (!user || !canEdit) {
      toast({ title: 'You do not have permission to edit content', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      let contentId = selectedId;
      const basePayload = {
        content_type: editForm.content_type,
        title: editForm.title,
        title_arabic: editForm.title_arabic || null,
        content: editForm.content || null,
        content_arabic: editForm.content_arabic || null,
        category: editForm.category || null,
      };

      if (!contentId) {
        // Create new content in draft status
        const { data, error } = await supabase
          .from('admin_content')
          .insert({
            ...basePayload,
            status: 'draft',
            is_published: false,
          })
          .select()
          .single();

        if (error) throw error;
        contentId = data.id as string;
        await logAudit('content.create', contentId, { title: basePayload.title });
      } else {
        const { error } = await supabase
          .from('admin_content')
          .update(basePayload)
          .eq('id', contentId);
        if (error) throw error;
        await logAudit('content.update', contentId, { title: basePayload.title });
      }

      // Create a new version on every save
      if (contentId) {
        const { data: existingVersions, error: versionError } = await supabase
          .from('content_versions')
          .select('version_number')
          .eq('content_id', contentId)
          .order('version_number', { ascending: false })
          .limit(1);

        if (versionError) throw versionError;

        const nextVersionNumber =
          existingVersions && existingVersions.length > 0
            ? (existingVersions[0].version_number as number) + 1
            : 1;

        const { data: newVersion, error: insertVersionError } = await supabase
          .from('content_versions')
          .insert({
            content_id: contentId,
            version_number: nextVersionNumber,
            title: basePayload.title,
            title_arabic: basePayload.title_arabic,
            content: basePayload.content,
            content_arabic: basePayload.content_arabic,
            created_by: user.id,
          })
          .select()
          .single();

        if (insertVersionError) throw insertVersionError;

        const { error: updateCurrentVersionError } = await supabase
          .from('admin_content')
          .update({ current_version_id: newVersion.id })
          .eq('id', contentId);

        if (updateCurrentVersionError) throw updateCurrentVersionError;
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      if (contentId) {
        setSelectedId(contentId);
      }
      toast({ title: 'Content saved' });
    } catch (error) {
      console.error('Failed to save content', error);
      toast({ title: 'Failed to save content', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (status: string, extraFields: Record<string, any> = {}, auditAction?: string) => {
    if (!user || !selectedContent) return;
    if (!canApprove && (status === 'published' || status === 'scheduled' || status === 'archived')) {
      toast({ title: 'You do not have permission to change status', variant: 'destructive' });
      return;
    }

    const payload: Record<string, any> = {
      status,
      ...extraFields,
    };

    if (status === 'published') {
      payload.is_published = true;
      payload.published_at = new Date().toISOString();
    }
    if (status !== 'published') {
      payload.is_published = false;
    }

    try {
      const { error } = await supabase
        .from('admin_content')
        .update(payload)
        .eq('id', selectedContent.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      await logAudit(auditAction || 'content.update', selectedContent.id, {
        from: selectedContent.status,
        to: status,
      });

      toast({ title: `Status updated to ${STATUS_LABELS[status] || status}` });
    } catch (error) {
      console.error('Failed to update status', error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleSubmitForReview = () => {
    if (!selectedContent) return;
    if (!canEdit) {
      toast({ title: 'You do not have permission to submit for review', variant: 'destructive' });
      return;
    }
    updateStatus('in_review', {}, 'content.update');
  };

  const handlePublishNow = () => {
    if (!selectedContent) return;
    updateStatus('published', { approved_by: user?.id, approved_at: new Date().toISOString() }, 'content.publish');
  };

  const handleArchive = () => {
    if (!selectedContent) return;
    updateStatus('archived', {}, 'content.update');
  };

  const rollbackMutation = useMutation({
    mutationFn: async (version: ContentVersionRow) => {
      if (!user || !selectedContent) return;

      const basePayload = {
        content_type: selectedContent.content_type,
        title: version.title,
        title_arabic: version.title_arabic,
        content: version.content,
        content_arabic: version.content_arabic,
        category: selectedContent.category,
      };

      const { error: updateContentError } = await supabase
        .from('admin_content')
        .update(basePayload)
        .eq('id', selectedContent.id);

      if (updateContentError) throw updateContentError;

      const { data: existingVersions, error: versionError } = await supabase
        .from('content_versions')
        .select('version_number')
        .eq('content_id', selectedContent.id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError) throw versionError;

      const nextVersionNumber =
        existingVersions && existingVersions.length > 0
          ? (existingVersions[0].version_number as number) + 1
          : 1;

      const { data: newVersion, error: insertVersionError } = await supabase
        .from('content_versions')
        .insert({
          content_id: selectedContent.id,
          version_number: nextVersionNumber,
          title: basePayload.title,
          title_arabic: basePayload.title_arabic,
          content: basePayload.content,
          content_arabic: basePayload.content_arabic,
          created_by: user.id,
          change_summary: `Rollback to version ${version.version_number}`,
        })
        .select()
        .single();

      if (insertVersionError) throw insertVersionError;

      const { error: updateCurrentVersionError } = await supabase
        .from('admin_content')
        .update({ current_version_id: newVersion.id })
        .eq('id', selectedContent.id);

      if (updateCurrentVersionError) throw updateCurrentVersionError;

      await logAudit('content.rollback', selectedContent.id, {
        from_version: version.version_number,
        new_version: nextVersionNumber,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      await queryClient.invalidateQueries({ queryKey: ['content-versions', selectedId] });
      toast({ title: 'Content rolled back successfully' });
      setRollbackVersion(null);
    },
    onError: () => {
      toast({ title: 'Failed to rollback content', variant: 'destructive' });
    },
  });

  const handleRollback = (version: ContentVersionRow) => {
    if (!canApprove) {
      toast({ title: 'You do not have permission to rollback', variant: 'destructive' });
      return;
    }
    setRollbackVersion(version);
  };

  const onConfirmRollback = () => {
    if (rollbackVersion) {
      rollbackMutation.mutate(rollbackVersion);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage Quran, Dua, Hadith and other content with workflow, versions, and audit.
          </p>
        </div>
        <Button
          onClick={() => {
            resetEditForm();
            setActiveTab('edit');
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content?.map((item) => (
                  <TableRow
                    key={item.id}
                    className={selectedId === item.id ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Badge variant="outline">{item.content_type}</Badge>
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[item.status] || 'secondary'}>
                        {STATUS_LABELS[item.status] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(item.scheduled_at)}</TableCell>
                    <TableCell>{formatDateTime(item.published_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedId(item.id);
                            resetEditForm(item);
                            setActiveTab('workflow');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="workflow" disabled={!selectedContent}>
                <Workflow className="h-3 w-3 mr-1" /> Workflow
              </TabsTrigger>
              <TabsTrigger value="versions" disabled={!selectedContent}>
                <History className="h-3 w-3 mr-1" /> Versions
              </TabsTrigger>
              <TabsTrigger value="audit" disabled={!selectedContent}>
                <Activity className="h-3 w-3 mr-1" /> Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select
                      value={editForm.content_type}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, content_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quran">Quran</SelectItem>
                        <SelectItem value="dua">Dua</SelectItem>
                        <SelectItem value="hadith">Hadith</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Title (Arabic)</Label>
                    <Input
                      value={editForm.title_arabic}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title_arabic: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Input
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Content (Arabic)</Label>
                    <Textarea
                      value={editForm.content_arabic}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, content_arabic: e.target.value }))
                      }
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                {selectedContent && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      Status:{' '}
                      <Badge variant={STATUS_VARIANTS[selectedContent.status] || 'secondary'}>
                        {STATUS_LABELS[selectedContent.status] || selectedContent.status}
                      </Badge>
                    </div>
                    <div>Scheduled: {formatDateTime(selectedContent.scheduled_at)}</div>
                    <div>Published: {formatDateTime(selectedContent.published_at)}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => selectedContent && resetEditForm(selectedContent)}
                    disabled={!selectedContent}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || !canEdit}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="pt-4 space-y-4">
              {selectedContent ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <Label>Current Status</Label>
                      <div className="mt-1">
                        <Badge variant={STATUS_VARIANTS[selectedContent.status] || 'secondary'}>
                          {STATUS_LABELS[selectedContent.status] || selectedContent.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Scheduled At</Label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatDateTime(selectedContent.scheduled_at)}
                      </div>
                    </div>

                    <div>
                      <Label>Published At</Label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatDateTime(selectedContent.published_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSubmitForReview}
                      disabled={!canEdit || selectedContent.status !== 'draft'}
                    >
                      Submit for Review
                    </Button>
                    <Button
                      variant="default"
                      onClick={handlePublishNow}
                      disabled={!canApprove || selectedContent.status !== 'in_review'}
                    >
                      Publish Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleArchive}
                      disabled={!canApprove || selectedContent.status !== 'published'}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a content item from the list above to manage its workflow.
                </p>
              )}
            </TabsContent>

            <TabsContent value="versions" className="pt-4 space-y-4">
              {selectedContent ? (
                versions && versions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell>{version.version_number}</TableCell>
                          <TableCell>{version.title}</TableCell>
                          <TableCell>{formatDateTime(version.created_at)}</TableCell>
                          <TableCell>{version.change_summary || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <VersionPreviewDialog version={version} />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRollback(version)}
                              >
                                Rollback
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No versions found yet. Versions are created automatically on save.
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a content item from the list above to see its version history.
                </p>
              )}
            </TabsContent>

            <TabsContent value="audit" className="pt-4 space-y-4">
              {selectedContent ? (
                auditLogs && auditLogs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Metadata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.action}</TableCell>
                          <TableCell className="text-xs font-mono">{log.actor_id}</TableCell>
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
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No audit events recorded for this content yet.
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a content item from the list above to view its audit trail.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!rollbackVersion} onOpenChange={(open) => !open && setRollbackVersion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm rollback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            You are about to rollback this content to version{' '}
            <span className="font-semibold">{rollbackVersion?.version_number}</span>. This
            will create a new version with the rolled back content and update the current
            version.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRollbackVersion(null)}>
              Cancel
            </Button>
            <Button onClick={onConfirmRollback}>
              Confirm Rollback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const VersionPreviewDialog = ({ version }: { version: ContentVersionRow }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Preview
      </Button>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Version {version.version_number} – {version.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Title (Arabic)</Label>
            <p className="mt-1">{version.title_arabic || '-'}</p>
          </div>
          <div>
            <Label>Content</Label>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {version.content || '-'}
            </p>
          </div>
          <div>
            <Label>Content (Arabic)</Label>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {version.content_arabic || '-'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};