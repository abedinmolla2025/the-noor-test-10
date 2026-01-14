import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, BarChart3 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function AdminAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data: activities, error } = await supabase
        .from('user_activity')
        .select('activity_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const activityCounts = activities?.reduce((acc: any, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalActivities: activities?.length || 0,
        activityTypes: activityCounts || {},
      };
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="User engagement and activity metrics across your app."
        icon={BarChart3}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {analytics?.totalActivities || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics?.activityTypes &&
              Object.entries(analytics.activityTypes).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span>{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
