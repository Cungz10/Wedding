import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  children: React.ReactNode;
};

export function Badge({ variant = "neutral", className = "", children, ...props }: BadgeProps) {
  let baseStyle = "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ";

  switch (variant) {
    case "success":
      baseStyle += "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "warning":
      baseStyle += "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "danger":
      baseStyle += "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "info":
      baseStyle += "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "primary":
      baseStyle += "bg-plum/10 text-plum border-plum/20";
      break;
    case "neutral":
      baseStyle += "bg-ink/5 text-ink/60 border-ink/10";
      break;
  }

  return (
    <span className={`${baseStyle} ${className}`} {...props}>
      {children}
    </span>
  );
}
