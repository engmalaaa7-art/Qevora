"use client";

import React, { useState, useEffect } from "react";
import { executeGenerationPipeline } from "@qevora/ai-engine";
import { renderSite } from "@qevora/qevora-renderer";
import { injectThemeCSS } from "@qevora/design-system";
import { Send, Globe, Code, ArrowUpRight, Play, RefreshCw, Smartphone, Monitor } from "lucide-react";

export default function Editor() {
  const [projectId, setProjectId] = useState("proj_demo_123");
  const [token, setToken] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "أهلاً بك في Qevora! صف الموقع الذي تود إنشاءه باللغة العربية أو الإنجليزية وسأقوم بتوليده في ثوانٍ." }
  ]);
  const [currentSchema, setCurrentSchema] = useState<any>(null);
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("ar");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState("");

  const API_BASE = "http://localhost:8000";

  // Check auth credentials from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeToken = localStorage.getItem("qevora_token");
      setToken(activeToken);
    }
  }, []);

  // Inject theme styles when schema changes
  useEffect(() => {
    if (currentSchema?.theme) {
      injectThemeCSS(currentSchema.theme);
      if (currentSchema.metadata.language === "en") {
        setPreviewLang("en");
      } else {
        setPreviewLang("ar");
      }
    }
  }, [currentSchema]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setPrompt("");
    setIsGenerating(true);

    try {
      // 1. Try backend API Call
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const endpoint = currentSchema 
        ? `${API_BASE}/projects/${projectId}/edit` 
        : `${API_BASE}/projects/${projectId}/generate`;

      const payload = currentSchema
        ? { projectId, instruction: userMsg }
        : { projectId, prompt: userMsg };

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSchema(data.schema);
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: `تم تحديث المخطط بنجاح عبر الخادم! استغرق التوليد ${data.latencyMs}ms.` }
        ]);
        setIsGenerating(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API not reachable, falling back to local ai-engine", err);
    }

    // 2. Local Fallback Execution (Offline Mode)
    setTimeout(() => {
      try {
        if (!currentSchema) {
          const { schema } = executeGenerationPipeline(projectId, "user_uuid", userMsg);
          setCurrentSchema(schema);
        } else {
          // Local fallback edit
          const isDark = userMsg.includes("dark") || userMsg.includes("ألوان");
          const updated = JSON.parse(JSON.stringify(currentSchema));
          if (isDark) {
            updated.theme.colors.primary = "#1E40AF";
            updated.theme.colors.background = "#0F1117";
            updated.theme.colors.text = "#FFFFFF";
          }
          setCurrentSchema(updated);
        }

        setMessages(prev => [
          ...prev,
          { role: "assistant", text: "تم التوليد بنجاح عبر محرك الذكاء الاصطناعي المحلي (موضع الأوفلاين)." }
        ]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: "assistant", text: `خطأ: ${err.message}` }]);
      } finally {
        setIsGenerating(false);
      }
    }, 1200);
  };

  const handlePublish = async () => {
    if (!currentSchema) return;
    setIsGenerating(true);

    try {
      // Try publishing via Backend
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/projects/${projectId}/publish`, {
        method: "POST",
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setDeploymentUrl(data.url);
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: `تم نشر الموقع بنجاح على الرابط الفعلي: ${data.url}` }
        ]);
        setIsGenerating(false);
        return;
      }
    } catch (err) {
      console.warn("Backend publishing failed, falling back to mock deployment", err);
    }

    // Offline Mock Publishing
    setTimeout(() => {
      const result = renderSite(currentSchema, { mode: "publish", activeLanguage: previewLang });
      if (result.success && result.files) {
        const mockUrl = `https://site-${projectId.substring(0, 8)}.qevora.site`;
        setDeploymentUrl(mockUrl);
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: `تم محاكاة نشر الموقع بنجاح على الرابط: ${mockUrl}` }
        ]);
      }
      setIsGenerating(false);
    }, 1000);
  };

  const renderPreview = () => {
    if (!currentSchema) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4">
          <Play size={48} className="text-primary animate-pulse" />
          <p className="text-center font-medium">اكتب وصف الموقع لبدء التوليد التلقائي</p>
        </div>
      );
    }

    const preview = renderSite(currentSchema, { mode: "preview", activeLanguage: previewLang });
    const currentPageElement = preview.pages?.[currentSchema.pages[0].slug];

    return (
      <div className="w-full h-full overflow-y-auto bg-[var(--color-background)]">
        {currentPageElement}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-16 border-b border-border px-6 flex justify-between items-center bg-surface z-10">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-text-secondary hover:text-text font-medium text-sm">
            ← Dashboard
          </a>
          <span className="text-border">|</span>
          <h2 className="font-bold text-text">Qevora Editor Workspace</h2>
        </div>

        <div className="flex items-center gap-4">
          {currentSchema && (
            <>
              <div className="flex bg-background-alt border border-border rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setPreviewLang("ar")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    previewLang === "ar" ? "bg-primary text-text-inverse" : "text-text-secondary hover:text-text"
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setPreviewLang("en")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    previewLang === "en" ? "bg-primary text-text-inverse" : "text-text-secondary hover:text-text"
                  }`}
                >
                  English
                </button>
              </div>

              <div className="flex bg-background-alt border border-border rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setViewMode("desktop")}
                  className={`p-1.5 rounded-md transition ${viewMode === "desktop" ? "bg-primary text-text-inverse" : "text-text-secondary"}`}
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`p-1.5 rounded-md transition ${viewMode === "mobile" ? "bg-primary text-text-inverse" : "text-text-secondary"}`}
                >
                  <Smartphone size={16} />
                </button>
              </div>

              <button
                onClick={() => setShowCode(!showCode)}
                className={`p-2 border border-border rounded-lg text-text-secondary hover:bg-surface-elevated transition ${
                  showCode ? "bg-primary-light text-primary" : ""
                }`}
                title="View Schema Code"
              >
                <Code size={18} />
              </button>

              <button
                onClick={handlePublish}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-text-inverse px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 text-sm"
              >
                Publish Site <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left pane */}
        <div className="w-96 border-r border-border flex flex-col justify-between bg-surface">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl max-w-[85%] text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-text-inverse ml-auto rounded-tr-none"
                    : "bg-background-alt text-text mr-auto rounded-tl-none border border-border"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isGenerating && (
              <div className="bg-background-alt text-text mr-auto rounded-2xl rounded-tl-none border border-border p-4 flex items-center gap-2 max-w-[50%] text-sm">
                <RefreshCw size={14} className="animate-spin text-primary" />
                <span>جاري التوليد...</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-surface">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="أدخل وصفاً للموقع (مثال: موقع مقهى ثنائي اللغة)..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-grow border border-border-strong rounded-xl px-4 py-2 text-sm bg-background-alt text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !prompt.trim()}
                className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-text-inverse p-2.5 rounded-xl transition"
              >
                <Send size={18} />
              </button>
            </div>
            {deploymentUrl && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs flex justify-between items-center text-green-800">
                <span>الموقع متاح الآن!</span>
                <a href={deploymentUrl} target="_blank" rel="noreferrer" className="font-bold underline flex items-center gap-0.5">
                  عرض الموقع <ArrowUpRight size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="flex-grow bg-background-alt p-8 flex items-center justify-center overflow-hidden relative">
          {showCode && currentSchema ? (
            <div className="absolute inset-0 bg-zinc-950 p-6 overflow-y-auto text-green-400 font-mono text-xs z-20">
              <pre>{JSON.stringify(currentSchema, null, 2)}</pre>
            </div>
          ) : null}

          <div
            className={`bg-[var(--color-background)] rounded-2xl border border-border shadow-2xl overflow-hidden transition-all duration-300 ${
              viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
            }`}
          >
            <div className="w-full h-full bg-[var(--color-background)]">
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
