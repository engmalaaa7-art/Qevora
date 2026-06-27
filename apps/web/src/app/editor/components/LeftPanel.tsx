"use client";

import React from "react";
import { Search, ChevronDown, Layers, Type, Compass, Eye, EyeOff, Image as ImageIcon, Square, LayoutGrid, Clock, RotateCcw } from "lucide-react";
import { useLanguage } from "../../../components/LanguageContext";
import { useEditor } from "./EditorContext";

export const LeftPanel: React.FC = () => {
  const { t } = useLanguage();
  const {
    activeTab,
    setActiveTab,
    layerSearch,
    setLayerSearch,
    schema,
    selectedSectionId,
    setSelectedSectionId,
    saveSchema,
    versions,
    loadVersions,
    restoreVersion,
  } = useEditor();

  const getSectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "navbar":
        return <Square size={14} className="text-secondary" />;
      case "hero":
        return <Layers size={14} className="text-primary animate-pulse" />;
      case "features":
        return <LayoutGrid size={14} className="text-accent" />;
      case "footer":
        return <Square size={14} className="text-on-surface-variant" />;
      default:
        return <Layers size={14} className="text-primary" />;
    }
  };

  const handleToggleVisibility = async (sectionId: string, currentVal: boolean) => {
    if (!schema) return;
    const updatedSchema = { ...schema };
    const page = updatedSchema.pages[0]; // Assuming home page
    const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex !== -1) {
      page.sections[sectionIndex] = {
        ...page.sections[sectionIndex],
        isVisible: !currentVal,
      };
      await saveSchema(updatedSchema);
    }
  };

  const homePage = schema?.pages?.[0];
  const filteredSections = homePage?.sections.filter((sec) => {
    if (!layerSearch) return true;
    return sec.type.toLowerCase().includes(layerSearch.toLowerCase());
  }) || [];

  return (
    <aside className="w-72 glass border-r border-outline-variant flex flex-col z-35 shrink-0 font-rubik">
      <div className="flex border-b border-outline-variant/50">
        <button
          onClick={() => setActiveTab("layers")}
          className={`flex-1 py-3 text-[11px] uppercase tracking-wider border-b-2 font-bold transition ${
            activeTab === "layers" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab("components")}
          className={`flex-1 py-3 text-[11px] uppercase tracking-wider border-b-2 font-bold transition ${
            activeTab === "components" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Components
        </button>
        <button
          onClick={() => {
            setActiveTab("versions");
            loadVersions();
          }}
          className={`flex-1 py-3 text-[11px] uppercase tracking-wider border-b-2 font-bold transition ${
            activeTab === "versions" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Versions
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {activeTab === "layers" && (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/40 text-on-surface"
                placeholder="Find section layer..."
              />
            </div>

            {!schema ? (
              <div className="text-center py-8 text-xs text-on-surface-variant">
                No active layout. Generate a site first.
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 p-1.5 text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
                  <span>Home Page Sections</span>
                </div>

                <div className="space-y-1">
                  {filteredSections.map((sec) => {
                    const isVisible = sec.isVisible !== false;
                    const isSelected = selectedSectionId === sec.id;
                    
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSectionId(sec.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isSelected
                            ? "bg-primary/10 border border-primary/30 text-primary"
                            : "hover:bg-white/5 border border-transparent text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getSectionIcon(sec.type)}
                          <span className="font-semibold capitalize truncate">{sec.type}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(sec.id, isVisible);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition text-on-surface-variant hover:text-on-surface"
                        >
                          {isVisible ? <Eye size={12} /> : <EyeOff size={12} className="opacity-50" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "components" && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: "Navbar", icon: <Square size={18} /> },
              { name: "Hero Block", icon: <Layers size={18} /> },
              { name: "Features Grid", icon: <LayoutGrid size={18} /> },
              { name: "Footer Info", icon: <Square size={18} /> },
            ].map((comp, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-all text-on-surface-variant hover:text-on-surface"
              >
                {comp.icon}
                <span>{comp.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === "versions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Backup Versions
              </span>
              <button
                onClick={loadVersions}
                className="text-[10px] text-primary hover:underline transition"
              >
                Refresh
              </button>
            </div>
            
            {versions.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant">
                No versions logged yet.
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((ver) => (
                  <div
                    key={ver.versionNumber}
                    className="p-3 bg-surface-container border border-outline-variant/60 rounded-xl hover:border-primary/40 transition flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-on-surface">
                        Version #{ver.versionNumber}
                      </span>
                      <span className="text-[8px] uppercase font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {ver.createdBy === "ai_generation" ? "AI Generated" : ver.createdBy}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-on-surface-variant/80">
                      {new Date(ver.createdAt).toLocaleString()}
                    </span>

                    <button
                      onClick={() => restoreVersion(ver.versionNumber)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-primary hover:bg-primary-dark text-background text-[10px] font-bold rounded-lg transition active:scale-95 mt-1"
                    >
                      <RotateCcw size={10} />
                      Restore Version
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/50">
        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2 block font-bold">
          Quick Insert
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button className="py-2 px-1 rounded bg-surface-container hover:bg-surface-container-high text-center transition flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface">
            <Type size={12} />
            <span className="text-[9px]">Text</span>
          </button>
          <button className="py-2 px-1 rounded bg-surface-container hover:bg-surface-container-high text-center transition flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface">
            <ImageIcon size={12} />
            <span className="text-[9px]">Image</span>
          </button>
          <button className="py-2 px-1 rounded bg-surface-container hover:bg-surface-container-high text-center transition flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface">
            <Square size={12} />
            <span className="text-[9px]">Box</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
