import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Activity, DollarSign, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, contentResult, activityResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('admin_content').select('id', { count: 'exact', head: true }),
        supabase.from('user_activity').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalContent: contentResult.count || 0,
        totalActivity: activityResult.count || 0,
        revenue: 0, // Placeholder
      };
    },
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Content Items',
      value: stats?.totalContent || 0,
      icon: BookOpen,
      description: 'Published content',
    },
    {
      title: 'User Activity',
      value: stats?.totalActivity || 0,
      icon: Activity,
      description: 'Total interactions',
    },
    {
      title: 'Revenue',
      value: `$${stats?.revenue || 0}`,
      icon: DollarSign,
      description: 'Total earnings',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="High-level overview of your NOOR app performance."
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-dashed border-border/70">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent activity yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
