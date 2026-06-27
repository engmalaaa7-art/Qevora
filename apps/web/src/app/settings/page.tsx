"use client";

import React from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useLanguage } from "../../components/LanguageContext";
import { Button } from "../../components/ui";

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <header className="mb-10">
          <h1 className="text-headline-md font-bold text-on-surface">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your workspace preferences</p>
        </header>
        
        <div className="max-w-3xl space-y-8">
          <section className="bg-surface border border-outline-variant rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Workspace Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Workspace Name</label>
                <input type="text" className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2 outline-none focus:border-primary text-on-surface" defaultValue="My Workspace" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
