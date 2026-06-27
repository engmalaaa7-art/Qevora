"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
          language === "en"
            ? "bg-primary text-background border-primary"
            : "bg-white/5 text-on-surface-variant border-transparent hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ar")}
        className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
          language === "ar"
            ? "bg-primary text-background border-primary"
            : "bg-white/5 text-on-surface-variant border-transparent hover:bg-white/10"
        }`}
      >
        AR
      </button>
    </div>
  );
};
