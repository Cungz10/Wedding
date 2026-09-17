import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[11px] font-semibold uppercase text-rose">{label}</label>}
      <input
        className={`w-full rounded-xl border border-rose/30 bg-white/70 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-plum focus:bg-white focus:ring-1 focus:ring-plum/20 disabled:opacity-60 ${
          error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { label: string; value: string | number }[];
};

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[11px] font-semibold uppercase text-rose">{label}</label>}
      <select
        className={`w-full rounded-xl border border-rose/30 bg-white/70 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-plum focus:bg-white focus:ring-1 focus:ring-plum/20 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
