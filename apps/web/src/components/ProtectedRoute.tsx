"use client";

import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "../lib/routes";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-background font-black text-2xl shadow-lg">
            Q
          </div>
          <span className="text-body-sm text-on-surface-variant font-rubik tracking-widest uppercase">Authenticating</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
