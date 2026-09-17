import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "solid" | "glass" | "outline" | "highlight";
  children: React.ReactNode;
};

export function Card({ variant = "solid", className = "", children, ...props }: CardProps) {
  let baseStyle = "rounded-3xl shadow-sm transition-all duration-300 ";
  
  switch (variant) {
    case "solid":
      baseStyle += "bg-white/90 border border-rose/30";
      break;
    case "glass":
      baseStyle += "bg-white/60 backdrop-blur-md border border-rose/20 shadow-2xs";
      break;
    case "outline":
      baseStyle += "bg-transparent border-2 border-rose/20 hover:bg-white/40";
      break;
    case "highlight":
      baseStyle += "bg-gradient-to-br from-white/90 via-ivory to-rose/10 border border-rose/30";
      break;
  }

  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}
