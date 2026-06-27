"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Send, Globe, Monitor, Tablet, Smartphone, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "../../../components/LanguageContext";
import { useEditor } from "./EditorContext";
import { PageRenderer } from "@qevora/qevora-renderer";
import { injectThemeCSS } from "@qevora/design-system";
import { Button } from "../../../components/ui";

const PRESET_PROMPTS = [
  { label: "Bilingual Coffee Shop", text: "Create a bilingual specialty coffee shop landing page in Riyadh with a dark warm theme, product listings, and Arabic translations." },
  { label: "SaaS Analytics Platform", text: "A sleek dark-themed SaaS landing page for an AI analytics platform with pricing table, features list, and customer testimonials." },
  { label: "Real Estate Agency", text: "A luxury real estate landing page in Dubai with property showcase cards, contact form, and premium bright color scheme." },
];

export const Canvas: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    schema,
    device,
    aiCommand,
    setAiCommand,
    aiLoading,
    statusMessage,
    generateSiteStream,
    editSite,
  } = useEditor();

  const [promptInput, setPromptInput] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  // Rotate loading steps fallback if statusMessage is empty
  useEffect(() => {
    if (!aiLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [aiLoading]);

  // Inject CSS variables from schema theme
  useEffect(() => {
    if (schema?.theme) {
      injectThemeCSS(schema.theme);
    }
  }, [schema]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    try {
      await generateSiteStream(promptInput);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;
    try {
      await editSite(aiCommand);
      setAiCommand("");
    } catch (err) {
      console.error(err);
    }
  };

  const getLoadingMessage = () => {
    if (statusMessage) return statusMessage;
    switch (loadingStep) {
      case 0:
        return "AI is analyzing requirements and structuring pages...";
      case 1:
        return "Creating design system tokens and color themes...";
      case 2:
        return "Generating content, copywriting, and translations...";
      case 3:
        return "Injecting layout sections and polishing details...";
      default:
        return "Synthesizing details...";
    }
  };

  // 1. Loading State
  if (aiLoading && !schema) {
    return (
      <section className="flex-grow bg-background flex items-center justify-center p-8 relative">
        <div className="glass border border-outline-variant/30 rounded-3xl p-10 max-w-md w-full text-center space-y-6 animate-pulse-glow shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-glow-radial opacity-30 pointer-events-none" />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-glow-sm">
            <Loader2 className="animate-spin" size={32} />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="font-bold text-lg text-on-surface">Creating Website Layout</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {getLoadingMessage()}
            </p>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-premium h-full rounded-full transition-all duration-1000" style={{ width: `${(loadingStep + 1) * 25}%` }} />
          </div>
        </div>
      </section>
    );
  }

  // 2. Empty State (No Schema generated yet)
  if (!schema) {
    return (
      <section className="flex-grow bg-background flex items-center justify-center overflow-y-auto p-8 font-rubik">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary mb-2 shadow-glow-sm">
              <Sparkles size={24} className="animate-float" />
            </div>
            <h2 className="text-headline-lg font-extrabold text-on-surface">
              Generate Your Web Experience
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
              Describe the website you want to build. Qevora AI will design components, style themes, and generate translations instantly.
            </p>
          </div>

          <form onSubmit={handleGenerateSubmit} className="glass p-2 border border-outline-variant/50 rounded-2xl flex gap-2 items-center shadow-xl">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. A bilingual portfolio for a software architect with a dark scheme..."
              className="flex-grow bg-transparent outline-none border-none focus:ring-0 text-sm px-4 text-on-surface placeholder:text-on-surface-variant/40"
              required
            />
            <Button type="submit" variant="glow" size="md">
              Generate <ArrowRight size={16} className="ml-1.5 rtl:mr-1.5" />
            </Button>
          </form>

          <div className="space-y-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block text-center">
              Or start with a preset template
            </span>
            <div className="grid sm:grid-cols-3 gap-4">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptInput(preset.text)}
                  className="bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl p-4 text-left transition-all active:scale-[0.98] flex flex-col justify-between min-h-[120px]"
                >
                  <span className="font-bold text-xs text-primary mb-1">{preset.label}</span>
                  <span className="text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed">
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. Render Canvas with active schema
  const homePage = schema.pages.find((p) => p.slug === "/") || schema.pages[0];
  const activeLang = language === "ar" ? "ar" : "en";

  return (
    <section className="flex-grow bg-background-alt flex flex-col items-center justify-center overflow-hidden p-8 relative">
      <div className="absolute inset-0 bg-glow-radial opacity-10 pointer-events-none" />

      {/* Frame wrapper for sizing simulation */}
      <div
        className={`bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          device === "desktop"
            ? "w-full max-w-[1200px] h-[90%]"
            : device === "tablet"
            ? "w-[768px] h-[90%]"
            : "w-[390px] h-[90%]"
        }`}
      >
        {/* Browser TopBar frame */}
        <div className="px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs text-on-surface-variant shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
          </div>
          <div className="bg-surface border border-outline-variant px-4 py-1 rounded-lg text-[10px] w-1/2 text-center truncate select-all">
            {`https://site-${schema.projectId.substring(0, 8)}.qevora.site`}
          </div>
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-on-surface-variant/60" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{activeLang}</span>
          </div>
        </div>

        {/* Scrollable content canvas */}
        <div className="flex-grow overflow-y-auto min-h-0 bg-surface">
          <PageRenderer
            page={homePage}
            theme={schema.theme}
            metadata={schema.metadata}
            activeLanguage={activeLang}
            mode="preview"
          />
        </div>
      </div>

      {/* Floating AI Prompt Widget */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-[1px] bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl shadow-2xl z-40">
        <form onSubmit={handleAiEditSubmit} className="bg-surface p-1 rounded-2xl flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0">
            {aiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          </div>
          <input
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            className="flex-grow bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none px-2"
            placeholder={aiLoading ? "AI is reasoning..." : "Ask AI to edit this page (e.g. 'Make hero font larger', 'change colors to green')..."}
            disabled={aiLoading}
          />
          <button
            type="submit"
            disabled={aiLoading || !aiCommand.trim()}
            className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-primary transition shrink-0 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </section>
  );
};
