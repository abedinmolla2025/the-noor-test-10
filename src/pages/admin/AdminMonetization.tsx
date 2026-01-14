import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminMonetization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monetization</h1>
        <p className="text-muted-foreground mt-2">Manage subscriptions and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
