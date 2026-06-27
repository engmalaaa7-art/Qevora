"use client";

import React from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, actionLabel, onAction, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-surface border border-outline-variant rounded-2xl", className)}>
      {icon && <div className="text-on-surface-variant mb-4 opacity-50">{icon}</div>}
      <h3 className="text-headline-md font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-md mb-8">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
