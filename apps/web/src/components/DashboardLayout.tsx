"use client";

import React from "react";
import { LayoutGrid, Sliders, CreditCard, Database, Settings, User } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { ROUTES } from "../lib/routes";
import { cn } from "../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutGrid, label: "Projects", href: ROUTES.DASHBOARD },
    { icon: Sliders, label: "Templates", href: ROUTES.TEMPLATES },
    { icon: CreditCard, label: "Billing", href: ROUTES.BILLING },
    { icon: Settings, label: "Settings", href: ROUTES.SETTINGS },
    { icon: User, label: "Profile", href: ROUTES.PROFILE },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-rubik text-on-surface">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-outline-variant p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background font-bold shadow-glow-sm">
                Q
              </div>
              <span className="text-lg font-bold text-on-surface hover:text-primary transition-colors">Qevora Console</span>
            </Link>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors",
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                  )}
                >
                  <item.icon size={18} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl mt-8">
          <h4 className="font-semibold text-on-surface text-sm mb-2 flex items-center gap-1.5">
            <Database size={14} className="text-tertiary" /> {t("dashUsageQuota") || "Usage Quota"}
          </h4>
          <div className="w-full bg-surface-container-highest rounded-full h-2 mb-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: "40%" }}></div>
          </div>
          <p className="text-xs text-on-surface-variant">40,000 / 100,000 {t("dashTokens") || "Monthly Tokens"}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
