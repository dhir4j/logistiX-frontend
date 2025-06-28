import { AdminUsersTable } from '@/components/admin/admin-users-table';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold text-primary">User Management</h1>
      <AdminUsersTable />
    </div>
  );
}
