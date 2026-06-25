import React from "react";
import { ArrowRight, Sparkles, Languages, Shield, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-xl font-bold text-text">Qevora</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#features" className="text-text-secondary hover:text-primary transition">Features</a>
            <a href="/login" className="text-text-secondary hover:text-primary transition">Login</a>
            <a href="/signup" className="text-primary hover:text-primary-dark font-medium transition">Sign Up</a>
            <a
              href="/editor"
              className="bg-primary hover:bg-primary-dark text-text-inverse px-5 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              Try Builder <ArrowRight size={16} />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow">
        <section className="py-24 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} /> Build websites instantly with AI
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-text tracking-tight mb-8 leading-tight">
            From <span className="text-primary">Words</span> to <span className="text-secondary">Website</span> in Minutes
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Describe your business in English or Arabic, and watch Qevora generate a stunning, conversion-optimized website complete with copywriting, images, and hosting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/editor"
              className="bg-primary hover:bg-primary-dark text-text-inverse px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Start Generating Free <ArrowRight size={20} />
            </a>
            <a
              href="#features"
              className="border border-border-strong hover:bg-surface-elevated text-text px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              How it works
            </a>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-background-alt">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-text mb-16">Supercharged Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
                  <Languages size={24} />
                </div>
                <h3 className="text-xl font-bold text-text mb-4">Bilingual by Default</h3>
                <p className="text-text-secondary">
                  Generate content fluently in Arabic and English, with automated RTL and LTR layout matching.
                </p>
              </div>
              <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-text mb-4">Component Registry</h3>
                <p className="text-text-secondary">
                  No random layouts. AI chooses from our certified components library for pixel-perfect presentation.
                </p>
              </div>
              <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold text-text mb-4">One-Click Publishing</h3>
                <p className="text-text-secondary">
                  Deploy instantly to Cloudflare edge CDN. Hook up custom domains with automatic SSL certification.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-text-secondary">
        <p className="text-sm">© 2026 Qevora AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
