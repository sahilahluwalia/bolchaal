export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  primary: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  secondary: "bg-sky-100 text-sky-800 hover:bg-sky-200",
  success: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  danger: "bg-red-100 text-red-800 hover:bg-red-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = badgeStyles[variant];

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className || ""}`}
      {...props}
    />
  );
}
