"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Chrome, Github, Terminal, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";
import { AuthLayout } from "../../components/AuthLayout";
import { GuestRoute } from "../../components/GuestRoute";
import { useAuth } from "../../components/AuthContext";
import { api } from "../../lib/api";
import Link from "next/link";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <AuthLayout>
        <div className="text-center md:text-left rtl:md:text-right space-y-2">
          <h1 className="font-rubik text-headline-xl font-bold text-white">
            {t("loginWelcome")}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t("loginSubWelcome")}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <button
            className="glass p-3 flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/10 transition active:scale-95 text-on-surface hover:border-primary/20"
            title="Google"
          >
            <Chrome size={18} />
          </button>
          <button
            className="glass p-3 flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/10 transition active:scale-95 text-on-surface hover:border-primary/20"
            title="GitHub"
          >
            <Github size={18} />
          </button>
          <button
            className="glass p-3 flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/10 transition active:scale-95 text-on-surface hover:border-primary/20"
            title="Microsoft"
          >
            <Terminal size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-white/10" />
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            {t("loginOr")}
          </span>
          <div className="h-[1px] flex-grow bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface block font-medium">
              {t("loginEmailLabel")}
            </label>
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors rtl:left-auto rtl:right-4"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-body-md text-on-surface placeholder:text-on-surface-variant/30 rtl:pl-4 rtl:pr-12"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-label-md text-on-surface block font-medium">
                {t("loginPassLabel")}
              </label>
              <a href="#" className="text-primary hover:text-primary/80 transition">
                {t("loginForgot")}
              </a>
            </div>
            <div className="relative group">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors rtl:left-auto rtl:right-4"
              />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-body-md text-on-surface placeholder:text-on-surface-variant/30 rtl:pl-10 rtl:pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface rtl:right-auto rtl:left-0 rtl:pl-3"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-background"
            />
            <label htmlFor="remember" className="text-xs text-on-surface-variant cursor-pointer select-none">
              {t("loginRemember")}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-background font-bold text-sm rounded-xl hover:bg-primary/95 transition shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            <span>{loading ? "..." : t("loginBtn")}</span>
            {!loading && <ArrowRight size={16} className="rtl:rotate-180" />}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-on-surface-variant">
            {t("loginFooterText")}{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              {t("loginGetStarted")}
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestRoute>
  );
}
