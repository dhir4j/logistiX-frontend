import { AdminPaymentsTable } from '@/components/admin/admin-payments-table';

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold text-primary">Payment Requests</h1>
      <AdminPaymentsTable />
    </div>
  );
}
