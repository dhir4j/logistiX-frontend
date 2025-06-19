
import { AdminDashboardContent } from '@/components/admin/admin-dashboard-content';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
      <AdminDashboardContent />
    </div>
  );
}

