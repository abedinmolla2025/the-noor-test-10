import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from '@/contexts/AdminContext';
import { Shield, UserCog, Edit, User as UserIcon } from 'lucide-react';

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  currentRoles: AppRole[];
}

const ROLE_OPTIONS: { value: AppRole; label: string; description: string; icon: any }[] = [
  {
    value: 'user',
    label: 'User',
    description: 'Basic user access',
    icon: UserIcon,
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can create and edit content',
    icon: Edit,
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full administrative access',
    icon: UserCog,
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Complete system control',
    icon: Shield,
  },
];

export const RoleManagementDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  currentRoles,
}: RoleManagementDialogProps) => {
  const [selectedRoles, setSelectedRoles] = useState<Set<AppRole>>(new Set(currentRoles));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRolesMutation = useMutation({
    mutationFn: async (roles: AppRole[]) => {
      // Delete all existing roles
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Insert new roles
      if (roles.length > 0) {
        const { error } = await supabase
          .from('user_roles')
          .insert(roles.map((role) => ({ user_id: userId, role })));

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Roles updated',
        description: `Successfully updated roles for ${userEmail}`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update roles',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRoleToggle = (role: AppRole, checked: boolean) => {
    const newRoles = new Set(selectedRoles);
    if (checked) {
      newRoles.add(role);
    } else {
      newRoles.delete(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleSave = () => {
    updateRolesMutation.mutate(Array.from(selectedRoles));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            Assign or revoke roles for <strong>{userEmail}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.value}
                className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={`role-${role.value}`}
                  checked={selectedRoles.has(role.value)}
                  onCheckedChange={(checked) =>
                    handleRoleToggle(role.value, checked as boolean)
                  }
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor={`role-${role.value}`}
                      className="font-semibold cursor-pointer"
                    >
                      {role.label}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateRolesMutation.isPending}>
            {updateRolesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
