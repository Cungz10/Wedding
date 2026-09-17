import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  let baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ";
  
  // Sizes
  switch (size) {
    case "sm":
      baseStyle += "px-3 py-1.5 text-[11px] rounded-xl ";
      break;
    case "md":
      baseStyle += "px-4 py-2.5 text-xs rounded-2xl ";
      break;
    case "lg":
      baseStyle += "px-6 py-3.5 text-sm rounded-full ";
      break;
  }

  // Variants
  switch (variant) {
    case "primary":
      baseStyle += "bg-plum text-ivory shadow-sm hover:bg-plum-dark hover:shadow-md ";
      break;
    case "secondary":
      baseStyle += "bg-rose/20 text-plum shadow-sm hover:bg-rose/30 ";
      break;
    case "outline":
      baseStyle += "border border-rose/40 bg-white/60 text-plum hover:bg-rose/10 ";
      break;
    case "danger":
      baseStyle += "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 ";
      break;
    case "ghost":
      baseStyle += "bg-transparent text-ink/70 hover:bg-rose/10 hover:text-plum ";
      break;
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
