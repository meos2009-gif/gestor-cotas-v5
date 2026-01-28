export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="w-full px-4 sm:px-6 py-6 space-y-6 overflow-x-visible">
        {children}
      </div>
    </div>
  );
}
