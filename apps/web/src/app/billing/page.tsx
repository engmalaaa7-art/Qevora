"use client";

import React from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useLanguage } from "../../components/LanguageContext";
import { Button } from "../../components/ui";

export default function BillingPage() {
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <header className="mb-10">
          <h1 className="text-headline-md font-bold text-on-surface">Billing & Usage</h1>
          <p className="text-body-md text-on-surface-variant">Manage your subscription and tokens</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-surface border border-outline-variant rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">Current Plan</h3>
            <p className="text-sm text-on-surface-variant mb-6">You are currently on the Free plan.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-on-surface">$0</span><span className="text-on-surface-variant">/mo</span>
            </div>
            <Button variant="glow" href="/pricing" className="w-full justify-center">Upgrade to Pro</Button>
          </section>

          <section className="bg-surface border border-outline-variant rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">Usage Quota</h3>
            <p className="text-sm text-on-surface-variant mb-6">Token usage resets at the end of the month.</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Generations</span>
                <span className="font-bold">40 / 100</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
