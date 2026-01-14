import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media Management</h1>
        <p className="text-muted-foreground mt-2">Upload and manage media files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
