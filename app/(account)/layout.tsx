export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="account-container flex-1">
      {children}
    </div>
  );
}
