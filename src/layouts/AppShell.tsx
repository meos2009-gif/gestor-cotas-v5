export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Container central com margens laterais e espaçamento vertical */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {children}
      </div>
    </div>
  );
}
