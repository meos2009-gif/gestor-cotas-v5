export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-xl sm:text-2xl font-bold text-secondary">
      {children}
    </h1>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg border border-gray-700 rounded-lg p-4 sm:p-5 space-y-4 shadow-sm">
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border border-gray-600 p-2 bg-bg text-text rounded w-full text-sm"
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="border border-gray-600 p-2 bg-bg text-text rounded w-full text-sm"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent";
}) {
  const base = "px-4 py-2 rounded text-sm font-semibold transition";
  const variants = {
    primary: "bg-primary text-white hover:bg-gray-800",
    secondary: "bg-secondary text-primary hover:bg-accent",
    accent: "bg-accent text-white hover:bg-secondary",
  };

  return (
    <button {...props} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}
