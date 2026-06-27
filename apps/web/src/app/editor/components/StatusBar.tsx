"use client";

import React from "react";
import { useEditor } from "./EditorContext";

export const StatusBar: React.FC = () => {
  const { aiLoading, statusMessage, schema, selectedSectionId } = useEditor();

  const activeSection = schema?.pages?.[0]?.sections.find(
    (s) => s.id === selectedSectionId
  );

  return (
    <footer className="h-8 glass border-t border-outline-variant flex items-center justify-between px-6 text-[10px] text-on-surface-variant shrink-0 z-40 font-rubik">
      <div className="flex items-center gap-1.5">
        <span className="hover:text-on-surface cursor-pointer">Home (/)</span>
        {activeSection && (
          <>
            <span className="opacity-50">/</span>
            <span className="text-primary font-bold capitalize">{activeSection.type}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${aiLoading ? "bg-tertiary animate-pulse" : "bg-primary"}`} />
          <span>{statusMessage}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[40px] text-center">Auto-Sync</span>
        </div>
      </div>
    </footer>
  );
};
