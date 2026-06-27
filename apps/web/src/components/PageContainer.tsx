"use client";

import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withNavbar?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className, withNavbar = false }) => {
  return (
    <div className={cn("min-h-screen bg-background text-on-surface", withNavbar && "pt-24", className)}>
      {children}
    </div>
  );
};
