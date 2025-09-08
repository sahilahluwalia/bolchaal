import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseStyles =
  "ui:inline-flex ui:items-center ui:justify-center ui:rounded-md ui:font-medium ui:transition-colors focus:ui:outline-none focus:ui:ring-2 focus:ui:ring-offset-2 ui:disabled:opacity-50 ui:disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "ui:bg-indigo-600 ui:text-white hover:ui:bg-indigo-700 focus:ui:ring-indigo-500 ui:border ui:border-transparent",
  secondary:
    "ui:bg-gray-900 ui:text-white hover:ui:bg-gray-800 focus:ui:ring-gray-700 ui:border ui:border-transparent",
  outline:
    "ui:bg-transparent ui:text-gray-900 hover:ui:bg-gray-50 focus:ui:ring-gray-300 ui:border ui:border-gray-300",
  ghost:
    "ui:bg-transparent ui:text-gray-900 hover:ui:bg-gray-100 focus:ui:ring-gray-300 ui:border ui:border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "ui:h-9 ui:px-3 ui:text-sm",
  md: "ui:h-10 ui:px-4 ui:text-sm",
  lg: "ui:h-11 ui:px-6 ui:text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? "ui:w-full" : "";
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
