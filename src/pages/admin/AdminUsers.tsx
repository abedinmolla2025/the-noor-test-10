import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Settings, Users as UsersIcon, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin, AppRole } from '@/contexts/AdminContext';
import { RoleManagementDialog } from '@/components/admin/RoleManagementDialog';
import { MobileTableWrapper } from '@/components/admin/MobileTableWrapper';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
    roles: AppRole[];
    fullName?: string | null;
    createdAt?: string | null;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdmin();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const openRoleDialog = (userId: string, email: string, roles: AppRole[]) => {
    setSelectedUser({ id: userId, email, roles });
    setRoleDialogOpen(true);
  };

  const openDeleteDialog = (userId: string, email: string) => {
    setSelectedUser({ id: userId, email, roles: [] });
    setDeleteDialogOpen(true);
  };

  const openDetails = (payload: {
    id: string;
    email: string;
    roles: AppRole[];
    fullName?: string | null;
    createdAt?: string | null;
  }) => {
    setSelectedUser(payload);
    setDetailsOpen(true);
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User deleted successfully' });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    },
  });

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredEmpty = useMemo(() => search.trim().length > 0, [search]);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Users Management</h1>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Users Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Search, manage roles and remove access for NOOR users.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <p className="text-xs sm:text-sm text-muted-foreground">Loading users…</p>
          ) : users && users.length > 0 ? (
            <MobileTableWrapper helperText="Swipe to see more, or open Details on mobile.">
              <Table className="min-w-[640px] text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="h-9">
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userRoles = ((user.user_roles as any) || []).map((r: any) => r.role as AppRole);
                    const createdAt = user.created_at;
                    return (
                      <TableRow key={user.id} className="h-9">
                        <TableCell className="max-w-[160px] truncate align-middle text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate align-middle text-xs sm:text-sm hidden sm:table-cell">
                          {user.full_name || '-'}
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex flex-wrap gap-1">
                            {userRoles.length > 0 ? (
                              userRoles.map((role: AppRole) => (
                                <Badge
                                  key={role}
                                  variant={getRoleBadgeVariant(role)}
                                  className="px-1.5 py-0.5 text-[11px] font-medium"
                                >
                                  {role.replace('_', ' ')}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="px-1.5 py-0.5 text-[11px] font-medium">
                                No roles
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap align-middle text-[11px] sm:text-xs text-muted-foreground hidden sm:table-cell">
                          {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-[11px] sm:hidden"
                              onClick={() =>
                                openDetails({
                                  id: user.id,
                                  email: user.email || '',
                                  roles: userRoles,
                                  fullName: user.full_name,
                                  createdAt,
                                })
                              }
                              aria-label="View user details"
                            >
                              <Info className="h-3.5 w-3.5 mr-1" />
                              Details
                            </Button>

                            {isSuperAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-[11px] sm:text-xs hidden sm:inline-flex"
                                  onClick={() => openRoleDialog(user.id, user.email || '', userRoles)}
                                >
                                  <Settings className="h-3.5 w-3.5 mr-1" />
                                  Manage Roles
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-[11px] sm:text-xs sm:hidden"
                                  onClick={() => openRoleDialog(user.id, user.email || '', userRoles)}
                                >
                                  <Settings className="h-3.5 w-3.5 mr-1" />
                                  Roles
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openDeleteDialog(user.id, user.email || '')}
                                  aria-label="Delete user"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </MobileTableWrapper>
          ) : (
            <AdminEmptyState
              title={filteredEmpty ? "No users match your search" : "No users found"}
              description={
                filteredEmpty
                  ? "Try a different keyword, or clear the search to see everyone."
                  : "Once users sign up, they’ll appear here." 
              }
              icon={<UsersIcon className="h-4 w-4" />}
              primaryAction={
                filteredEmpty
                  ? {
                      label: "Clear search",
                      onClick: () => setSearch(""),
                      variant: "outline",
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <RoleManagementDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            userId={selectedUser.id}
            userEmail={selectedUser.email}
            currentRoles={selectedUser.roles}
          />

          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User details</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Roles</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedUser.roles?.length ? (
                      selectedUser.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="px-1.5 py-0.5 text-[11px] font-medium">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="px-1.5 py-0.5 text-[11px] font-medium">
                        No roles
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user account for{' '}
                  <strong>{selectedUser.email}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
