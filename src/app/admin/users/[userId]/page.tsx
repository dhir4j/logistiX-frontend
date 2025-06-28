import { AdminUserDetails } from '@/components/admin/admin-user-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AdminUserDetailsPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId, 10);

  if (isNaN(userId)) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Invalid User ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>The user ID provided in the URL is not a valid number.</p>
        </CardContent>
      </Card>
    );
  }

  return <AdminUserDetails userId={userId} />;
}
