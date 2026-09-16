"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
        <circle cx="6" cy="6" r="2.2" />
        <circle cx="12" cy="18" r="2.2" />
        <circle cx="18" cy="10" r="2.2" />
        <path d="M6 8.2C6 12 9 13 12 15.8M18 12.2c0 2.4-2.4 3.6-4.8 4.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/budget",
    label: "Budget",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
        <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
        <path d="M3.5 10.5h17" strokeLinecap="round" />
        <path d="M7 14.5h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dokumen",
    label: "Dokumen",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
        <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
        <path d="M14 3.5V8h4" strokeLinejoin="round" />
        <path d="M9 13h6M9 16.5h6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose/30 bg-ivory/95 backdrop-blur
                 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi utama"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  active ? "text-plum" : "text-ink/50"
                }`}
              >
                {item.icon(!!active)}
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
