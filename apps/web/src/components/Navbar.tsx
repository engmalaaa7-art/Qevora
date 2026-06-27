"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "./ui";
import { useLanguage } from "./LanguageContext";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { label: t("navFeatures"), href: "#features" },
    { label: t("navTemplates"), href: "#templates" },
    { label: t("navPricing"), href: "#pricing" },
    { label: t("navDocs"), href: "#" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="gradient-text text-headline-md font-bold tracking-tight">
            Qevora
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-stack-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 text-xs">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-full font-medium transition ${
                language === "en"
                  ? "bg-primary text-background font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-3 py-1.5 rounded-full font-medium transition ${
                language === "ar"
                  ? "bg-primary text-background font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              AR
            </button>
          </div>

          <Button href="/login" size="md">
            {t("navStart")}
          </Button>
        </div>

        {/* Mobile Toggle & Lang Switcher */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="p-2 text-on-surface-variant hover:text-on-surface bg-white/5 rounded-lg border border-white/10"
            title="Toggle Language"
          >
            <Languages size={18} />
          </button>
          <button
            className="text-on-surface"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10 px-margin-mobile py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-label-sm text-on-surface-variant hover:text-primary transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button href="/login" size="md" className="w-full">
            {t("navStart")}
          </Button>
        </div>
      )}
    </header>
  );
};
