"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { SiteSchema } from "@qevora/schemas";
import { config } from "../../../lib/config";
import { storage } from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/constants";

type DeviceType = "desktop" | "tablet" | "mobile";

interface EditorState {
  projectId: string | null;
  schema: SiteSchema | null;
  setSchema: (s: SiteSchema | null) => void;
  device: DeviceType;
  setDevice: (v: DeviceType) => void;
  layerSearch: string;
  setLayerSearch: (v: string) => void;
  activeTab: "layers" | "components" | "versions";
  setActiveTab: (v: "layers" | "components" | "versions") => void;
  aiCommand: string;
  setAiCommand: (v: string) => void;
  aiLoading: boolean;
  setAiLoading: (v: boolean) => void;
  statusMessage: string;
  setStatusMessage: (v: string) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (v: string | null) => void;
  
  // Actions
  loadSchema: () => Promise<void>;
  generateSite: (prompt: string) => Promise<void>;
  generateSiteStream: (prompt: string) => Promise<void>;
  editSite: (instruction: string) => Promise<void>;
  saveSchema: (newSchema: SiteSchema) => Promise<void>;
  publishSite: () => Promise<{ url: string; subdomain: string }>;
  connectDomain: (domain: string) => Promise<any>;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Versions
  versions: any[];
  loadVersions: () => Promise<void>;
  restoreVersion: (versionNumber: number) => Promise<void>;
}

const EditorContext = createContext<EditorState | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [schema, setSchema] = useState<SiteSchema | null>(null);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [layerSearch, setLayerSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"layers" | "components" | "versions">("layers");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const [aiCommand, setAiCommand] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Live Sync Active");

  // History & Versions
  const [history, setHistory] = useState<SiteSchema[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setProjectId(id);
      }
    }
  }, []);

  const loadSchema = async () => {
    if (!projectId) return;
    setAiLoading(true);
    setStatusMessage("Loading website layout...");
    try {
      const data = await api.get<SiteSchema>(`/projects/${projectId}/schema`);
      setSchema(data);
      setHistory([data]);
      setHistoryIndex(0);
      // Auto-select first section if available
      if (data?.pages?.[0]?.sections?.[0]) {
        setSelectedSectionId(data.pages[0].sections[0].id);
      }
      setStatusMessage("Layout loaded successfully");
      loadVersions();
    } catch (err: any) {
      if (err.status === 404) {
        setSchema(null);
        setStatusMessage("Ready to generate");
      } else {
        setStatusMessage(`Error loading layout: ${err.message}`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadSchema();
    }
  }, [projectId]);

  const generateSite = async (prompt: string) => {
    if (!projectId) return;
    setAiLoading(true);
    setStatusMessage("AI is generating website components...");
    try {
      const res = await api.post<any>(`/projects/${projectId}/generate`, {
        projectId,
        prompt,
      });
      if (res.success && res.schema) {
        setSchema(res.schema);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), res.schema]);
        setHistoryIndex(prev => prev + 1);
        if (res.schema.pages?.[0]?.sections?.[0]) {
          setSelectedSectionId(res.schema.pages[0].sections[0].id);
        }
        setStatusMessage("Website generated successfully!");
        loadVersions();
      }
    } catch (err: any) {
      setStatusMessage(`Generation failed: ${err.message}`);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const generateSiteStream = async (prompt: string) => {
    if (!projectId) return;
    setAiLoading(true);
    setStatusMessage("Initializing AI Compiler...");
    
    try {
      const token = storage.get(STORAGE_KEYS.TOKEN);
      const response = await fetch(`${config.apiUrl}/projects/${projectId}/generate/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, prompt })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      
      let currentPages = [{
        id: "page-home",
        slug: "/",
        title: { en: "Home", ar: "الرئيسية" },
        pageType: "home",
        isInNavigation: true,
        navigationOrder: 1,
        seo: { title: { en: "AI Website", ar: "موقع الذكاء الاصطناعي" }, noIndex: false, noFollow: false },
        sections: [] as any[]
      }];
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            
            try {
              if (currentEvent === "progress") {
                const progressObj = JSON.parse(dataStr);
                setStatusMessage(progressObj.message);
              } else if (currentEvent === "thinking") {
                setStatusMessage(`AI is thinking: ${JSON.parse(dataStr)}`);
              } else if (currentEvent === "section") {
                const sectionObj = JSON.parse(dataStr);
                currentPages[0].sections = [...currentPages[0].sections.filter(s => s.id !== sectionObj.id), sectionObj];
                setSchema(prev => {
                  let nextSchema: any;
                  if (!prev) {
                    nextSchema = {
                      schemaVersion: "1.0",
                      siteId: "00000000-0000-0000-0000-000000000000",
                      projectId: projectId || "00000000-0000-0000-0000-000000000000",
                      generatedAt: new Date().toISOString(),
                      metadata: {
                        siteName: { en: "Nova Space", ar: "نوفا سبيس" },
                        language: "bilingual",
                        direction: "ltr",
                        industry: "technology",
                        seo: { defaultTitle: { en: "Nova Space", ar: "نوفا سبيس" } }
                      },
                      theme: {
                        colorScheme: "dark",
                        colors: {
                          primary: "#7C3AED", primaryDark: "#5B21B6", primaryLight: "#EDE9FE",
                          secondary: "#10B981", secondaryDark: "#059669", secondaryLight: "#D1FAE5",
                          background: "#0B0F19", backgroundAlt: "#111827", surface: "#1F2937", surfaceElevated: "#374151",
                          text: "#F9FAFB", textSecondary: "#D1D5DB", textMuted: "#9CA3AF", textInverse: "#111827",
                          border: "#374151", borderStrong: "#4B5563", success: "#10B981", warning: "#F59E0B",
                          error: "#EF4444", info: "#3B82F6", overlay: "rgba(0,0,0,0.6)"
                        },
                        typography: {
                          fontFamily: { primary: "Rubik", arabic: "Cairo", mono: "Fira Code" },
                          fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
                          scale: { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem" },
                          lineHeights: { tight: 1.2, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 }
                        },
                        spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem", xl: "3rem", "2xl": "5rem", "3xl": "8rem" },
                        borderRadius: { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", "2xl": "1.5rem", full: "9999px" },
                        shadows: { none: "none", sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.1)" },
                        layout: { containerMaxWidth: "1280px", navbarHeight: "72px", sectionPaddingY: "5rem", gridColumns: 12, gutter: "1.5rem" }
                      },
                      pages: currentPages,
                      ecommerce: null,
                      assets: { images: [], fonts: [] }
                    };
                  } else {
                    nextSchema = {
                      ...prev,
                      pages: [{
                        ...prev.pages[0],
                        sections: currentPages[0].sections
                      }]
                    };
                  }
                  return nextSchema as SiteSchema;
                });
              } else if (currentEvent === "schema") {
                const finalSchema = JSON.parse(dataStr);
                setSchema(finalSchema);
                setHistory(prev => [...prev.slice(0, historyIndex + 1), finalSchema]);
                setHistoryIndex(prev => prev + 1);
                setStatusMessage("Website generated successfully!");
                loadVersions();
              } else if (currentEvent === "error") {
                throw new Error(JSON.parse(dataStr));
              }
            } catch (jsonErr) {
              console.error("SSE chunk error:", jsonErr);
            }
          }
        }
      }
    } catch (err: any) {
      setStatusMessage(`Streaming failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const editSite = async (instruction: string) => {
    if (!projectId || !schema) return;
    setAiLoading(true);
    setStatusMessage("AI is modifying website...");
    try {
      const res = await api.post<any>(`/projects/${projectId}/edit`, {
        projectId,
        instruction,
      });
      if (res.success && res.schema) {
        setSchema(res.schema);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), res.schema]);
        setHistoryIndex(prev => prev + 1);
        setStatusMessage("Changes applied by AI");
        loadVersions();
      }
    } catch (err: any) {
      setStatusMessage(`Edit failed: ${err.message}`);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const saveSchema = async (newSchema: SiteSchema) => {
    if (!projectId) return;
    setStatusMessage("Saving changes...");
    try {
      await api.post(`/projects/${projectId}/schema`, newSchema);
      setSchema(newSchema);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newSchema]);
      setHistoryIndex(prev => prev + 1);
      setStatusMessage("All changes saved");
      loadVersions();
    } catch (err: any) {
      setStatusMessage(`Failed to save: ${err.message}`);
    }
  };

  const publishSite = async () => {
    if (!projectId) throw new Error("No active project");
    setStatusMessage("Publishing website...");
    try {
      const res = await api.post<{ url: string; subdomain: string }>(`/projects/${projectId}/publish`);
      setStatusMessage("Website is now live!");
      return res;
    } catch (err: any) {
      setStatusMessage(`Publish failed: ${err.message}`);
      throw err;
    }
  };

  const connectDomain = async (domainName: string) => {
    if (!projectId) throw new Error("No active project");
    setStatusMessage("Mapping custom domain...");
    try {
      const res = await api.post(`/projects/${projectId}/domain`, { domainName });
      setStatusMessage("Domain mapped successfully");
      return res;
    } catch (err: any) {
      setStatusMessage(`Domain mapping failed: ${err.message}`);
      throw err;
    }
  };

  // Undo/Redo logic
  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setSchema(history[prevIdx]);
      api.post(`/projects/${projectId}/schema`, history[prevIdx]);
      setStatusMessage("Undo action completed");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setSchema(history[nextIdx]);
      api.post(`/projects/${projectId}/schema`, history[nextIdx]);
      setStatusMessage("Redo action completed");
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Versions logic
  const loadVersions = async () => {
    if (!projectId) return;
    try {
      const list = await api.get<any[]>(`/projects/${projectId}/versions`);
      setVersions(list);
    } catch (err: any) {
      console.error("Failed to load versions:", err);
    }
  };

  const restoreVersion = async (versionNumber: number) => {
    if (!projectId) return;
    setAiLoading(true);
    setStatusMessage(`Restoring version #${versionNumber}...`);
    try {
      const res = await api.post<any>(`/projects/${projectId}/versions/${versionNumber}/restore`);
      if (res.success && res.schema) {
        setSchema(res.schema);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), res.schema]);
        setHistoryIndex(prev => prev + 1);
        setStatusMessage(`Version #${versionNumber} restored!`);
        loadVersions();
      }
    } catch (err: any) {
      setStatusMessage(`Restore failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <EditorContext.Provider
      value={{
        projectId,
        schema,
        setSchema,
        device,
        setDevice,
        layerSearch,
        setLayerSearch,
        activeTab,
        setActiveTab,
        aiCommand,
        setAiCommand,
        aiLoading,
        setAiLoading,
        statusMessage,
        setStatusMessage,
        selectedSectionId,
        setSelectedSectionId,
        loadSchema,
        generateSite,
        generateSiteStream,
        editSite,
        saveSchema,
        publishSite,
        connectDomain,
        undo,
        redo,
        canUndo,
        canRedo,
        versions,
        loadVersions,
        restoreVersion,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
};
