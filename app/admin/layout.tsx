export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container flex-1 bg-surface">
      <div className="border-b border-border bg-white px-6 py-4">
        <h2 className="text-xl font-bold text-neutral-text font-heading">UniDeal Admin</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
