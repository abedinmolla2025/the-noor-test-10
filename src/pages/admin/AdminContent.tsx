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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Plus, Edit, Trash2, Workflow, History, Activity, BookOpen, Upload, MoreVertical } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MobileTableWrapper } from '@/components/admin/MobileTableWrapper';
import { NameBulkImportDialog } from '@/components/admin/NameBulkImportDialog';
import { DuaBulkImportDialog } from '@/components/admin/DuaBulkImportDialog';

interface AdminContentRow {
  id: string;
  content_type: string;
  title: string;
  title_arabic: string | null;
  title_en: string | null;
  title_hi: string | null;
  title_ur: string | null;
  content: string | null;
  content_arabic: string | null;
  content_en: string | null;
  content_hi: string | null;
  content_ur: string | null;
  content_pronunciation: string | null;
  category: string | null;
  metadata: any | null;
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

const readMetaString = (meta: unknown, key: string) => {
  if (!meta || typeof meta !== 'object') return '';
  const obj = meta as Record<string, unknown>;
  return typeof obj[key] === 'string' ? (obj[key] as string) : '';
};

const buildNameMetadata = (
  existing: unknown,
  patch: {
    bn_name?: string;
    pronunciation?: string;
    gender?: string;
    source?: string;
    origin?: string;
    reference?: string;
  }
) => {
  const base = existing && typeof existing === 'object' ? { ...(existing as any) } : {};
  const next: Record<string, any> = { ...base };

  const setOrDelete = (k: string, v?: string) => {
    const val = (v ?? '').trim();
    if (val) next[k] = val;
    else delete next[k];
  };

  setOrDelete('bn_name', patch.bn_name);
  setOrDelete('pronunciation', patch.pronunciation);
  setOrDelete('gender', patch.gender);
  setOrDelete('source', patch.source);
  setOrDelete('origin', patch.origin);
  setOrDelete('reference', patch.reference);

  return next;
};

export default function AdminContent() {
  const { user, roles, isAdmin, isSuperAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'workflow' | 'versions' | 'audit'>('edit');
  const [isNameImportOpen, setIsNameImportOpen] = useState(false);
  const [isDuaImportOpen, setIsDuaImportOpen] = useState(false);

  // Quick filters (mobile + desktop)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editForm, setEditForm] = useState({
    content_type: 'dua',
    title: '',
    title_arabic: '',
    title_en: '',
    title_hi: '',
    title_ur: '',
    content: '',
    content_arabic: '',
    content_en: '',
    content_hi: '',
    content_ur: '',
    content_pronunciation: '',
    category: '',
    // Name-only metadata
    meta_bn_name: '',
    meta_pronunciation: '',
    meta_gender: '',
    meta_source: '',
    meta_origin: '',
    meta_reference: '',
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

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    for (const item of content ?? []) set.add(item.content_type);
    return Array.from(set).sort();
  }, [content]);

  const filteredContent = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (content ?? []).filter((item) => {
      if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;

      const hay = [item.title, item.title_arabic, item.title_en, item.title_hi, item.title_ur]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }, [content, searchQuery, statusFilter, typeFilter]);

  const existingNameKeys = useMemo(() => {
    const keyOf = (title: string, titleArabic?: string | null) =>
      `${title.trim().toLowerCase()}||${(titleArabic ?? '').trim().toLowerCase()}`;

    const set = new Set<string>();
    for (const item of content ?? []) {
      if (item.content_type !== 'name') continue;
      set.add(keyOf(item.title, item.title_arabic));
    }
    return set;
  }, [content]);

  const existingDuaKeys = useMemo(() => {
    const keyOf = (title: string, titleArabic?: string | null) =>
      `${title.trim().toLowerCase()}||${(titleArabic ?? '').trim().toLowerCase()}`;

    const set = new Set<string>();
    for (const item of content ?? []) {
      if (item.content_type !== 'dua') continue;
      set.add(keyOf(item.title, item.title_arabic));
    }
    return set;
  }, [content]);

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
        title_en: '',
        title_hi: '',
        title_ur: '',
        content: '',
        content_arabic: '',
        content_en: '',
        content_hi: '',
        content_ur: '',
        content_pronunciation: '',
        category: '',
        meta_bn_name: '',
        meta_pronunciation: '',
        meta_gender: '',
        meta_source: '',
        meta_origin: '',
        meta_reference: '',
      });
      setSelectedId(null);
      return;
    }

    setEditForm({
      content_type: item.content_type,
      title: item.title,
      title_arabic: item.title_arabic ?? '',
      title_en: item.title_en ?? '',
      title_hi: item.title_hi ?? '',
      title_ur: item.title_ur ?? '',
      content: item.content ?? '',
      content_arabic: item.content_arabic ?? '',
      content_en: item.content_en ?? '',
      content_hi: item.content_hi ?? '',
      content_ur: item.content_ur ?? '',
      content_pronunciation: item.content_pronunciation ?? '',
      category: item.category ?? '',
      meta_bn_name: readMetaString(item.metadata, 'bn_name'),
      meta_pronunciation: readMetaString(item.metadata, 'pronunciation'),
      meta_gender: readMetaString(item.metadata, 'gender'),
      meta_source: readMetaString(item.metadata, 'source'),
      meta_origin: readMetaString(item.metadata, 'origin'),
      meta_reference: readMetaString(item.metadata, 'reference'),
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
        title_en: editForm.title_en || null,
        title_hi: editForm.title_hi || null,
        title_ur: editForm.title_ur || null,
        content: editForm.content || null,
        content_arabic: editForm.content_arabic || null,
        content_en: editForm.content_en || null,
        content_hi: editForm.content_hi || null,
        content_ur: editForm.content_ur || null,
        content_pronunciation: editForm.content_pronunciation || null,
        category: editForm.category || null,
        ...(editForm.content_type === 'name'
          ? {
              metadata: buildNameMetadata(selectedContent?.metadata, {
                bn_name: editForm.meta_bn_name,
                pronunciation: editForm.meta_pronunciation,
                gender: editForm.meta_gender,
                source: editForm.meta_source,
                origin: editForm.meta_origin,
                reference: editForm.meta_reference,
              }),
            }
          : {}),
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
      <AdminPageHeader
        title="Content Management"
        description="Manage Quran, Dua, Hadith and other content with workflow, versions, and audit."
        icon={BookOpen}
        actions={
          <div
            className="-mx-3 flex w-[calc(100%+1.5rem)] gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0 sm:pb-0"
            aria-label="Content actions"
          >
            <Button
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => {
                resetEditForm();
                setActiveTab('edit');
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Content
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 whitespace-nowrap"
              onClick={() => setIsNameImportOpen(true)}
              disabled={!canEdit}
              title={!canEdit ? 'No permission' : undefined}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Names (JSON)
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 whitespace-nowrap"
              onClick={() => setIsDuaImportOpen(true)}
              disabled={!canEdit}
              title={!canEdit ? 'No permission' : undefined}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Dua (JSON)
            </Button>
          </div>
        }
      />

      <NameBulkImportDialog
        open={isNameImportOpen}
        onOpenChange={setIsNameImportOpen}
        canEdit={canEdit}
        existingKeys={existingNameKeys}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-content'] });
        }}
      />

      <DuaBulkImportDialog
        open={isDuaImportOpen}
        onOpenChange={setIsDuaImportOpen}
        canEdit={canEdit}
        existingKeys={existingDuaKeys}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-content'] });
        }}
      />

      <Card className="shadow-sm border-border/80">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Content List</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Filter, select and manage items before working on their workflow.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <p className="text-xs sm:text-sm text-muted-foreground">Loading content…</p>
          ) : content && content.length > 0 ? (
            <>
              {/* Quick filters */}
              <div className="mb-3 grid gap-2 sm:mb-4 sm:grid-cols-[1fr_180px_180px]">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title…"
                  className="h-9"
                />

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="all">All types</SelectItem>
                    {availableTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="all">All status</SelectItem>
                    {Object.keys(STATUS_LABELS).map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status] || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredContent.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No matches. Try clearing filters.
                </p>
              ) : (
                <>
                  {/* Mobile: compact card-row list */}
                  <div className="space-y-2 sm:hidden">
                    {filteredContent.map((item) => {
                      const isSelected = selectedId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={
                            'flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-background p-3 shadow-sm ' +
                            (isSelected ? 'ring-2 ring-ring/40' : '')
                          }
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setSelectedId(item.id);
                              resetEditForm(item);
                              setActiveTab('edit');
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                              >
                                {item.content_type}
                              </Badge>
                              <p className="min-w-0 truncate text-sm font-medium text-foreground">{item.title}</p>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <Badge
                                variant={STATUS_VARIANTS[item.status] || 'secondary'}
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {STATUS_LABELS[item.status] || item.status}
                              </Badge>
                              <span className="truncate">{item.category || '-'}</span>
                            </div>
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 shrink-0 p-0"
                                aria-label="Row actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={6} className="z-50 w-44 bg-popover">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedId(item.id);
                                  resetEditForm(item);
                                  setActiveTab('workflow');
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Open workflow
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden sm:block">
                    <MobileTableWrapper>
                      <Table className="min-w-[720px] text-xs sm:text-sm">
                        <TableHeader>
                          <TableRow className="h-9">
                            <TableHead className="w-[90px] whitespace-nowrap">Type</TableHead>
                            <TableHead className="whitespace-nowrap">Title</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap">Category</TableHead>
                            <TableHead className="w-[120px] whitespace-nowrap">Status</TableHead>
                            <TableHead className="w-[150px] whitespace-nowrap">Scheduled</TableHead>
                            <TableHead className="w-[150px] whitespace-nowrap">Published</TableHead>
                            <TableHead className="w-[90px] text-right whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContent.map((item) => (
                            <TableRow
                              key={item.id}
                              className={`h-9 ${
                                selectedId === item.id ? 'bg-muted/60 hover:bg-muted/70' : 'hover:bg-muted/40'
                              }`}
                            >
                              <TableCell className="align-middle">
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                                >
                                  {item.content_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate align-middle text-xs sm:text-sm">
                                {item.title}
                              </TableCell>
                              <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle">
                                {item.category || '-'}
                              </TableCell>
                              <TableCell className="align-middle">
                                <Badge
                                  variant={STATUS_VARIANTS[item.status] || 'secondary'}
                                  className="rounded-full px-2 py-0.5 text-[11px] font-medium flex items-center gap-1"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {STATUS_LABELS[item.status] || item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle whitespace-nowrap">
                                {formatDateTime(item.scheduled_at)}
                              </TableCell>
                              <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle whitespace-nowrap">
                                {formatDateTime(item.published_at)}
                              </TableCell>
                              <TableCell className="text-right align-middle">
                                <div className="inline-flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setSelectedId(item.id);
                                      resetEditForm(item);
                                      setActiveTab('workflow');
                                    }}
                                    aria-label="Open workflow"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() => deleteMutation.mutate(item.id)}
                                    aria-label="Delete content"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </MobileTableWrapper>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">No content yet. Create your first item.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <TabsList className="w-full gap-1 overflow-x-auto rounded-full bg-muted/70 p-1 text-xs [-webkit-overflow-scrolling:touch] sm:w-auto sm:overflow-visible sm:text-sm">
              <TabsTrigger
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow"
                value="edit"
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="workflow"
                disabled={!selectedContent}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow"
              >
                <Workflow className="h-3 w-3 mr-1" /> Workflow
              </TabsTrigger>
              <TabsTrigger
                value="versions"
                disabled={!selectedContent}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow"
              >
                <History className="h-3 w-3 mr-1" /> Versions
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                disabled={!selectedContent}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow"
              >
                <Activity className="h-3 w-3 mr-1" /> Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="pt-3 space-y-3 sm:pt-4 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                <div className="space-y-3 sm:space-y-4">
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
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>
                      {editForm.content_type === 'name' ? 'Title (English / Transliteration)' : 'Title'}
                    </Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder={
                        editForm.content_type === 'name'
                          ? 'যেমন: Abdullah / Aisha'
                          : undefined
                      }
                    />
                  </div>

                  <div>
                    <Label>
                      {editForm.content_type === 'name' ? 'Title (Arabic name)' : 'Title (Arabic)'}
                    </Label>
                    <Input
                      value={editForm.title_arabic}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title_arabic: e.target.value }))
                      }
                      placeholder={
                        editForm.content_type === 'name'
                          ? 'যেমন: عبدالله / عائشة'
                          : undefined
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

                  {editForm.content_type === 'name' && (
                    <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
                      <div className="text-xs font-medium text-muted-foreground">Name metadata</div>

                      <div>
                        <Label>Title (Bangla name)</Label>
                        <Input
                          value={editForm.meta_bn_name}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, meta_bn_name: e.target.value }))
                          }
                          placeholder="যেমন: আব্দুল্লাহ / আয়েশা"
                        />
                      </div>

                      <div>
                        <Label>Pronunciation (Bangla)</Label>
                        <Input
                          value={editForm.meta_pronunciation}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, meta_pronunciation: e.target.value }))
                          }
                          placeholder="যেমন: আব্দুল্লাহ"
                        />
                      </div>

                      <div>
                        <Label>Gender</Label>
                        <Select
                          value={editForm.meta_gender || 'unknown'}
                          onValueChange={(v) =>
                            setEditForm((prev) => ({
                              ...prev,
                              meta_gender: v === 'unknown' ? '' : v,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unknown">Unspecified</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Source</Label>
                        <Input
                          value={editForm.meta_source}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, meta_source: e.target.value }))
                          }
                          placeholder="যেমন: Quran/Hadith/Dictionary/Local"
                        />
                      </div>

                      <div>
                        <Label>Origin</Label>
                        <Input
                          value={editForm.meta_origin}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, meta_origin: e.target.value }))
                          }
                          placeholder="যেমন: Arabic, Persian, Turkish"
                        />
                      </div>

                      <div>
                        <Label>Reference</Label>
                        <Input
                          value={editForm.meta_reference}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, meta_reference: e.target.value }))
                          }
                          placeholder="লিংক/বইয়ের নাম/হাদিস নম্বর (optional)"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label>
                      {editForm.content_type === 'name' ? 'Meaning (Bangla)' : 'Content'}
                    </Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                      rows={4}
                      placeholder={
                        editForm.content_type === 'name'
                          ? 'বাংলা অর্থ লিখুন...'
                          : undefined
                      }
                    />
                  </div>

                  {editForm.content_type === 'name' && (
                    <div>
                      <Label>Meaning (English)</Label>
                      <Textarea
                        value={editForm.content_en}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, content_en: e.target.value }))
                        }
                        rows={3}
                        placeholder="English meaning লিখুন..."
                      />
                    </div>
                  )}

                  {editForm.content_type !== 'name' && (
                    <div>
                      <Label>Bangla Pronunciation</Label>
                      <Textarea
                        value={editForm.content_pronunciation}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, content_pronunciation: e.target.value }))
                        }
                        rows={3}
                      />
                    </div>
                  )}

                  {editForm.content_type !== 'name' && (
                    <div>
                      <Label>Content (Arabic)</Label>
                      <Textarea
                        value={editForm.content_arabic}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, content_arabic: e.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="-mx-3 sticky bottom-20 z-40 mt-4 border-t border-border/70 bg-background/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:mt-4 sm:border-t sm:bg-transparent sm:px-0 sm:py-4 sm:backdrop-blur-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {selectedContent && (
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={STATUS_VARIANTS[selectedContent.status] || 'secondary'}
                          className="rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {STATUS_LABELS[selectedContent.status] || selectedContent.status}
                        </Badge>
                      </div>
                      <div>Scheduled: {formatDateTime(selectedContent.scheduled_at)}</div>
                      <div>Published: {formatDateTime(selectedContent.published_at)}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                    <Button
                      variant="outline"
                      className="h-9 w-full"
                      onClick={() => selectedContent && resetEditForm(selectedContent)}
                      disabled={!selectedContent}
                    >
                      Reset
                    </Button>
                    <Button
                      className="h-9 w-full"
                      onClick={handleSave}
                      disabled={isSaving || !canEdit}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
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
                        <Badge
                          variant={STATUS_VARIANTS[selectedContent.status] || 'secondary'}
                          className="rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
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

            <TabsContent value="versions" className="pt-6 space-y-4 border-t border-border/60 mt-4">
              {selectedContent ? (
                versions && versions.length > 0 ? (
                  <MobileTableWrapper>
                    <Table className="min-w-[640px] text-xs sm:text-sm">
                      <TableHeader>
                        <TableRow className="h-9">
                          <TableHead className="w-[90px] whitespace-nowrap">Version</TableHead>
                          <TableHead className="whitespace-nowrap">Title</TableHead>
                          <TableHead className="w-[180px] whitespace-nowrap">Created At</TableHead>
                          <TableHead className="whitespace-nowrap">Summary</TableHead>
                          <TableHead className="w-[140px] text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {versions.map((version) => (
                          <TableRow key={version.id} className="h-9">
                            <TableCell className="align-middle">{version.version_number}</TableCell>
                            <TableCell className="max-w-[200px] truncate align-middle text-xs sm:text-sm">
                              {version.title}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle whitespace-nowrap">
                              {formatDateTime(version.created_at)}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle">
                              {version.change_summary || '-'}
                            </TableCell>
                            <TableCell className="text-right align-middle">
                              <div className="inline-flex gap-1 sm:gap-2">
                                <VersionPreviewDialog version={version} />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-[11px] sm:text-xs"
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
                  </MobileTableWrapper>
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

            <TabsContent value="audit" className="pt-6 space-y-4 border-t border-border/60 mt-4">
              {selectedContent ? (
                auditLogs && auditLogs.length > 0 ? (
                  <MobileTableWrapper>
                    <Table className="min-w-[640px] text-xs sm:text-sm">
                      <TableHeader>
                        <TableRow className="h-9">
                          <TableHead className="whitespace-nowrap">Action</TableHead>
                          <TableHead className="whitespace-nowrap">Actor</TableHead>
                          <TableHead className="whitespace-nowrap">When</TableHead>
                          <TableHead className="whitespace-nowrap">Metadata</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id} className="h-9 align-top">
                            <TableCell className="align-middle">{log.action}</TableCell>
                            <TableCell className="text-[11px] sm:text-xs font-mono align-middle max-w-[180px] truncate">
                              {log.actor_id}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-xs text-muted-foreground align-middle whitespace-nowrap">
                              {formatDateTime(log.created_at)}
                            </TableCell>
                            <TableCell>
                              <pre className="text-[11px] sm:text-xs max-w-[260px] overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.metadata || {}, null, 2)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </MobileTableWrapper>
                ) : (
                  <p className="text-sm text-muted-foreground">No audit events recorded for this content yet.</p>
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