"use client";

import React from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useLanguage } from "../../components/LanguageContext";
import { useAuth } from "../../components/AuthContext";
import { Button } from "../../components/ui";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <header className="mb-10">
          <h1 className="text-headline-md font-bold text-on-surface">Profile</h1>
          <p className="text-body-md text-on-surface-variant">Manage your personal account</p>
        </header>
        
        <div className="max-w-3xl space-y-8">
          <section className="bg-surface border border-outline-variant rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Email</label>
                <input type="email" disabled className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2 opacity-50 cursor-not-allowed text-on-surface" value={user?.email || ""} />
              </div>
            </div>
            <Button variant="outline" onClick={() => logout()}>Sign Out</Button>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
