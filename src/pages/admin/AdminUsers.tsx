import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Settings } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin, AppRole } from '@/contexts/AdminContext';
import { RoleManagementDialog } from '@/components/admin/RoleManagementDialog';
import { MobileTableWrapper } from '@/components/admin/MobileTableWrapper';
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

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
    roles: AppRole[];
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
            <MobileTableWrapper>
              <Table className="min-w-[640px] text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="h-9">
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Joined</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userRoles = ((user.user_roles as any) || []).map((r: any) => r.role as AppRole);
                    return (
                      <TableRow key={user.id} className="h-9">
                        <TableCell className="max-w-[160px] truncate align-middle text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate align-middle text-xs sm:text-sm">
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
                        <TableCell className="whitespace-nowrap align-middle text-[11px] sm:text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            {isSuperAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-[11px] sm:text-xs"
                                  onClick={() => openRoleDialog(user.id, user.email || '', userRoles)}
                                >
                                  <Settings className="h-3.5 w-3.5 mr-1" />
                                  <span className="hidden sm:inline">Manage Roles</span>
                                  <span className="sm:hidden">Roles</span>
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
            <p className="text-xs sm:text-sm text-muted-foreground">No users found.</p>
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
