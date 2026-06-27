"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { LanguageProvider } from "./LanguageContext";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
};
