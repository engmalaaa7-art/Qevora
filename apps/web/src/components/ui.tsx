"use client";

import React from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────
   GlowButton – Primary gradient CTA button
   ────────────────────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glow" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "glow",
  size = "md",
  href,
  target,
  children,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-body-sm",
    md: "px-6 py-2.5 text-label-sm",
    lg: "px-10 py-5 text-headline-md",
  };

  const variantClasses = {
    glow: "glow-button text-white font-bold",
    outline:
      "border border-white/10 bg-white/5 hover:bg-white/10 text-on-surface transition-colors font-bold",
    ghost:
      "text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors",
  };

  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-rubik transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base} target={target}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
};

/* ──────────────────────────────────────────────────────────
   GlassCard – Glassmorphic container card
   ────────────────────────────────────────────────────────── */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hover = true,
  padding = "p-8",
}) => {
  return (
    <div
      className={`${hover ? "glass-card" : "glass"} rounded-2xl ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   SectionHeading – Section title + subtitle
   ────────────────────────────────────────────────────────── */
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  center = true,
  className = "",
}) => (
  <div className={`${center ? "text-center" : ""} mb-16 space-y-4 ${className}`}>
    <h2 className="text-headline-xl font-rubik font-bold text-on-surface">
      {title}
    </h2>
    {subtitle && (
      <p className="text-body-md text-on-surface-variant">{subtitle}</p>
    )}
  </div>
);

/* ──────────────────────────────────────────────────────────
   FeatureIcon – Icon container for feature cards
   ────────────────────────────────────────────────────────── */
interface FeatureIconProps {
  color?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({
  color = "primary",
  children,
}) => {
  const bgColor = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
  };

  return (
    <div
      className={`w-12 h-12 rounded-xl ${bgColor[color]} flex items-center justify-center mb-6`}
    >
      {children}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   StatusBadge – Live/Beta/New pill badge
   ────────────────────────────────────────────────────────── */
interface StatusBadgeProps {
  label: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  pulse = false,
}) => (
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-label-xs uppercase tracking-widest">
    {pulse && (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
    )}
    {label}
  </div>
);

/* ──────────────────────────────────────────────────────────
   Input – Styled text input
   ────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  icon,
  className = "",
  ...props
}) => (
  <div className="flex items-center gap-3 w-full">
    {icon && <span className="text-on-surface-variant">{icon}</span>}
    <input
      className={`w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder:text-on-surface-variant/50 py-4 font-rubik ${className}`}
      {...props}
    />
  </div>
);

/* ──────────────────────────────────────────────────────────
   Section – Layout wrapper
   ────────────────────────────────────────────────────────── */
interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  className = "",
  containerClassName = "",
}) => (
  <section
    id={id}
    className={`py-stack-xl px-margin-mobile md:px-margin-desktop ${className}`}
  >
    <div className={`max-w-container-max mx-auto ${containerClassName}`}>
      {children}
    </div>
  </section>
);
