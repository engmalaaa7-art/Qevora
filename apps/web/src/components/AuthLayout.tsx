"use client";

import React from "react";
import { LanguageToggle } from "./LanguageToggle";
import { AmbientBackground } from "./AmbientBackground";
import { useLanguage } from "./LanguageContext";

interface AuthLayoutProps {
  children: React.ReactNode;
  activeNodes?: string;
  latency?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  activeNodes = "1.2M+", 
  latency = "14ms" 
}) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-on-surface bg-background relative overflow-hidden">
      {/* Visual Left Sidebar */}
      <section className="hidden md:flex relative w-1/2 min-h-screen overflow-hidden bg-surface-container-lowest border-r border-white/5 flex-col justify-between p-12">
        <AmbientBackground opacity={40} type="blobs" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background font-black text-xl shadow-lg">
            Q
          </div>
          <span className="font-rubik text-headline-lg font-bold tracking-tight">Qevora</span>
        </div>

        {/* Core Marketing Pitch */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <h2 className="font-rubik text-5xl font-extrabold leading-tight text-white">
            {t("loginSidebarTitle1")} <span className="text-primary">{t("loginSidebarTitle2")}</span> {t("loginSidebarTitle3")}
          </h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            {t("loginSidebarDesc")}
          </p>
        </div>

        {/* Real-time stats footer */}
        <div className="relative z-10 flex gap-12 border-t border-white/5 pt-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-primary font-bold tracking-wider mb-1">
              {t("loginActiveNodes")}
            </span>
            <span className="text-headline-lg font-black text-white">{activeNodes}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-secondary font-bold tracking-wider mb-1">
              {t("loginLatency")}
            </span>
            <span className="text-headline-lg font-black text-white">{latency}</span>
          </div>
        </div>
      </section>

      {/* Forms Content Panel */}
      <main className="flex-grow flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        <div className="absolute top-6 right-6 md:top-8 md:right-8">
          <LanguageToggle />
        </div>
        
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo view */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background font-black text-xl shadow-lg">
              Q
            </div>
            <span className="font-rubik text-headline-lg font-bold text-on-surface">Qevora</span>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
};
