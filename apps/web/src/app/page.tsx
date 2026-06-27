"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle, UploadCloud, Rocket, Play } from "lucide-react";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button, GlassCard, Section, FeatureIcon, StatusBadge, Input } from "../components/ui";
import { AmbientShader } from "../components/AmbientShader";

function LandingPageContent() {
  const { t, language } = useLanguage();
  const [promptText, setPromptText] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      window.location.href = `/editor?prompt=${encodeURIComponent(promptText)}`;
    } else {
      window.location.href = `/editor`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative">
      {/* WebGL Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <AmbientShader type="blobs" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <main className="flex-grow z-10">
        <Section className="pt-32 pb-stack-xl flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
          <div className="max-w-4xl space-y-6">
            <StatusBadge label={t("heroBadge")} pulse />
            <h1 className="font-rubik text-5xl md:text-display-lg leading-[1.1] text-on-surface font-extrabold tracking-tight">
              {t("heroTitle1")}
              <br />
              <span className="gradient-text">{t("heroTitle2")}</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {t("heroSub")}
            </p>
          </div>

          {/* AI Generator Input Bar */}
          <form
            onSubmit={handleGenerate}
            className="w-full max-w-3xl mt-12 px-margin-mobile"
          >
            <div className="glass p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-2xl border border-white/10">
              <div className="flex-grow flex items-center px-4 w-full">
                <Sparkles size={20} className="text-on-surface-variant mr-3 shrink-0" />
                <Input
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={t("heroPlaceholder")}
                />
              </div>
              <Button type="submit" size="md" className="w-full sm:w-auto py-4">
                {t("heroGenerate")}
                <Rocket size={16} className="rtl:rotate-180" />
              </Button>
            </div>
          </form>

          {/* Mini social proof metrics */}
          <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-60">
            <div className="text-center">
              <div className="text-headline-md font-bold text-on-surface">100K+</div>
              <div className="text-label-xs text-on-surface-variant uppercase tracking-wider">
                {t("statWebsites")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-headline-md font-bold text-on-surface">45+</div>
              <div className="text-label-xs text-on-surface-variant uppercase tracking-wider">
                {t("statCountries")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-headline-md font-bold text-on-surface">99.9%</div>
              <div className="text-label-xs text-on-surface-variant uppercase tracking-wider">
                {t("statUptime")}
              </div>
            </div>
          </div>
        </Section>

        {/* Features Grid */}
        <Section id="features" className="py-stack-xl max-w-container-max mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-headline-xl font-bold text-on-surface">
              {t("featuresTitle")}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {t("featuresSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <GlassCard className="md:col-span-8 flex flex-col justify-between min-h-[400px]">
              <div>
                <FeatureIcon color="primary">
                  <Sparkles size={24} />
                </FeatureIcon>
                <h3 className="text-headline-md font-bold mb-2">
                  {t("feat1Title")}
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  {t("feat1Desc")}
                </p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden border border-white/5 bg-surface-container-low h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <div className="p-6 space-y-3 opacity-40">
                  <div className="h-4 w-3/4 bg-on-surface/10 rounded" />
                  <div className="h-28 w-full bg-on-surface/5 rounded-lg border border-white/5 p-4 space-y-2">
                    <div className="h-3 w-1/2 bg-on-surface/10 rounded" />
                    <div className="h-3 w-full bg-on-surface/10 rounded" />
                    <div className="h-3 w-5/6 bg-on-surface/10 rounded" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-4 flex flex-col justify-between">
              <div>
                <FeatureIcon color="tertiary">
                  <span className="text-lg font-bold">A/E</span>
                </FeatureIcon>
                <h3 className="text-headline-md font-bold mb-2">
                  {t("feat2Title")}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {t("feat2Desc")}
                </p>
              </div>
              <div className="pt-8 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] border border-white/10 uppercase font-bold text-on-surface-variant">
                  English
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] border border-white/10 uppercase font-bold text-on-surface-variant">
                  العربية
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] border border-white/10 uppercase font-bold text-on-surface-variant">
                  Español
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] border border-white/10 uppercase font-bold text-on-surface-variant">
                  日本語
                </span>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-4">
              <FeatureIcon color="secondary">
                <Rocket size={24} />
              </FeatureIcon>
              <h3 className="text-headline-md font-bold mb-2">
                {t("feat3Title")}
              </h3>
              <p className="text-body-md text-on-surface-variant">
                {t("feat3Desc")}
              </p>
            </GlassCard>

            <GlassCard className="md:col-span-8 flex flex-col sm:flex-row items-center gap-8 justify-between">
              <div className="flex-grow">
                <FeatureIcon color="primary">
                  <UploadCloud size={24} />
                </FeatureIcon>
                <h3 className="text-headline-md font-bold mb-2">
                  {t("feat4Title")}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {t("feat4Desc")}
                </p>
              </div>
              <div className="shrink-0 w-36 h-36 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center">
                <UploadCloud size={36} className="text-white/20" />
              </div>
            </GlassCard>
          </div>
        </Section>

        {/* Interactive Editor Mockup Section */}
        <Section className="py-stack-xl bg-surface-container-lowest/30 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/3 space-y-6">
              <h2 className="text-headline-xl font-bold">{t("interactiveTitle")}</h2>
              <p className="text-body-lg text-on-surface-variant">
                {t("interactiveSub")}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <CheckCircle size={20} className="text-primary" />
                  {t("interactivePoint1")}
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <CheckCircle size={20} className="text-primary" />
                  {t("interactivePoint2")}
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <CheckCircle size={20} className="text-primary" />
                  {t("interactivePoint3")}
                </li>
              </ul>
            </div>

            {/* Simulated Live Generation Dashboard */}
            <div className="lg:w-2/3 w-full">
              <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video flex flex-col">
                <div className="bg-surface-container-high px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/30" />
                  </div>
                  <div className="px-4 py-1 rounded bg-background/50 border border-white/5 text-[10px] text-on-surface-variant">
                    qevora.ai/preview/restaurant-modern
                  </div>
                  <div className="w-12" />
                </div>
                <div className="flex-grow flex">
                  {/* Left Sidebar Mockup */}
                  <div className="w-64 border-r border-white/10 bg-surface/50 p-4 space-y-4 hidden md:block">
                    <div className="text-label-xs text-on-surface-variant/50 uppercase font-bold">
                      {t("copilotTitle")}
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-[12px] text-primary border border-primary/20">
                      {t("copilotPrompt")}
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant italic text-[11px]">
                      <span className="animate-pulse w-2 h-2 rounded-full bg-primary" />
                      {t("copilotGenerating")}
                    </div>
                  </div>
                  {/* Preview Canvas with Shimmer skeleton */}
                  <div className="flex-grow bg-[#0f0f12] p-8 relative overflow-hidden">
                    <div className="space-y-8 animate-pulse">
                      <div className="h-10 w-48 bg-white/10 rounded" />
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-5/6 bg-white/5 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-white/5 rounded-xl border border-white/5" />
                        <div className="aspect-square bg-white/5 rounded-xl border border-white/5" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f12]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Templates Marketplace Preview */}
        <Section id="templates" className="py-stack-xl max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-headline-xl font-bold">{t("templatesTitle")}</h2>
              <p className="text-body-md text-on-surface-variant">
                {t("templatesSub")}
              </p>
            </div>
            <Button variant="ghost" href="/templates" className="p-0 hover:bg-transparent font-medium flex items-center gap-1">
              {t("templatesMore")} <ArrowRight size={16} className="rtl:rotate-180" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t("temp1Title"),
                category: t("temp1Cat"),
                img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: t("temp2Title"),
                category: t("temp2Cat"),
                img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: t("temp3Title"),
                category: t("temp3Cat"),
                img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
              },
            ].map((temp, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden glass border border-white/5 mb-6 relative">
                  <img
                    alt={temp.title}
                    src={temp.img}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                </div>
                <h3 className="text-headline-md font-bold group-hover:text-primary transition-colors">
                  {temp.title}
                </h3>
                <p className="text-label-xs text-on-surface-variant uppercase mt-1">
                  {temp.category}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Pricing Plan Cards */}
        <Section id="pricing" className="py-stack-xl max-w-container-max mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-headline-xl font-bold">{t("pricingTitle")}</h2>
            <p className="text-body-md text-on-surface-variant">
              {t("pricingSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Tier */}
            <GlassCard className="flex flex-col justify-between" hover>
              <div>
                <div className="text-label-xs text-on-surface-variant uppercase mb-2">
                  {t("pricingFreeName")}
                </div>
                <div className="text-headline-xl font-bold mb-6">
                  $0{" "}
                  <span className="text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {t("pricingFreeDesc")
                    .split(", ")
                    .map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-body-md text-on-surface-variant">
                        <CheckCircle size={14} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
              <Button variant="outline" href="/login" className="w-full">
                {t("pricingChooseFree")}
              </Button>
            </GlassCard>

            {/* Pro Tier (Popular) */}
            <div className="glass p-10 rounded-2xl relative border border-primary/40 shadow-ambient flex flex-col justify-between md:scale-105 z-10 bg-surfaceElevated">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                {t("pricingPopular")}
              </div>
              <div>
                <div className="text-label-xs text-primary uppercase mb-2 mt-2">
                  {t("pricingProName")}
                </div>
                <div className="text-headline-xl font-bold mb-6">
                  $19{" "}
                  <span className="text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {t("pricingProDesc")
                    .split(", ")
                    .map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-body-md text-on-surface">
                        <CheckCircle size={14} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
              <Button variant="glow" href="/login" className="w-full">
                {t("pricingChoosePro")}
              </Button>
            </div>

            {/* Scale Tier */}
            <GlassCard className="flex flex-col justify-between" hover>
              <div>
                <div className="text-label-xs text-on-surface-variant uppercase mb-2">
                  {t("pricingScaleName")}
                </div>
                <div className="text-headline-xl font-bold mb-6">
                  $49{" "}
                  <span className="text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {t("pricingScaleDesc")
                    .split(", ")
                    .map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-body-md text-on-surface-variant">
                        <CheckCircle size={14} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
              <Button variant="outline" href="/login" className="w-full">
                {t("pricingChooseScale")}
              </Button>
            </GlassCard>
          </div>
        </Section>

        {/* CTA Hero Section */}
        <Section className="py-stack-xl max-w-container-max mx-auto">
          <div className="glass rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <AmbientShader type="flowing" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl sm:text-display-lg font-bold">{t("ctaTitle")}</h2>
              <p className="text-body-lg text-on-surface-variant">
                {t("ctaSub")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="glow" size="lg" href="/login" className="w-full sm:w-auto">
                  {t("ctaTryFree")}
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("ctaWatchDemo")}
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return <LandingPageContent />;
}
