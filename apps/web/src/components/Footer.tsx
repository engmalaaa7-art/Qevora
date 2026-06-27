import React from "react";
import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Discord", href: "#" },
];

export const Footer: React.FC = () => (
  <footer className="bg-surface py-stack-xl border-t border-white/5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Brand */}
      <div>
        <Link href="/" className="inline-block mb-6">
          <span className="gradient-text text-headline-md font-bold tracking-tight">
            Qevora
          </span>
        </Link>
        <p className="text-body-md text-on-surface-variant max-w-sm">
          Elevating the web through hyper-intelligent design and automated
          precision. Built for the next generation of digital builders.
        </p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h4 className="text-label-xs text-on-surface uppercase mb-4">
              {col.title}
            </h4>
            <ul className="space-y-2 text-label-sm text-on-surface-variant">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom */}
    <div className="mt-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-label-xs text-on-surface-variant">
        © {new Date().getFullYear()} Qevora AI. All rights reserved.
      </p>
      <div className="flex gap-6">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-on-surface-variant hover:text-primary transition-colors text-label-xs uppercase tracking-widest"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
