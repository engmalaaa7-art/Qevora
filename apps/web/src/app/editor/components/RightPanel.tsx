"use client";

import React from "react";
import { Settings, ChevronDown, Palette, Type, Sliders } from "lucide-react";
import { useLanguage } from "../../../components/LanguageContext";
import { useEditor } from "./EditorContext";
import { LanguageToggle } from "../../../components/LanguageToggle";

export const RightPanel: React.FC = () => {
  const { t } = useLanguage();
  const {
    schema,
    setSchema,
    selectedSectionId,
    saveSchema
  } = useEditor();

  const handleColorChange = async (colorKey: string, value: string) => {
    if (!schema) return;
    const updatedSchema = {
      ...schema,
      theme: {
        ...schema.theme,
        colors: {
          ...schema.theme.colors,
          [colorKey]: value,
        },
      },
    };
    setSchema(updatedSchema);
    await saveSchema(updatedSchema);
  };

  const handleContentChange = async (keyPath: string[], value: string) => {
    if (!schema || !selectedSectionId) return;
    
    // Deep clone schema
    const updatedSchema = JSON.parse(JSON.stringify(schema));
    const page = updatedSchema.pages[0];
    const section = page.sections.find((s: any) => s.id === selectedSectionId);
    
    if (section) {
      // Traverse keyPath to set the value
      let current = section.content;
      for (let i = 0; i < keyPath.length - 1; i++) {
        if (!current[keyPath[i]]) current[keyPath[i]] = {};
        current = current[keyPath[i]];
      }
      current[keyPath[keyPath.length - 1]] = value;
      
      setSchema(updatedSchema);
    }
  };

  const handleBlurSave = async () => {
    if (schema) {
      await saveSchema(schema);
    }
  };

  const activeSection = schema?.pages?.[0]?.sections.find(
    (s) => s.id === selectedSectionId
  );

  return (
    <aside className="w-80 glass border-l border-outline-variant flex flex-col z-35 shrink-0 font-rubik text-xs">
      <div className="p-4 flex items-center justify-between border-b border-outline-variant/50">
        <span className="text-sm font-bold uppercase tracking-wider text-on-surface">Properties</span>
        <Settings size={16} className="text-on-surface-variant" />
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Global Design System Colors */}
        {schema && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Palette size={12} className="text-primary" />
                Global Theme Colors
              </span>
              <ChevronDown size={14} />
            </div>

            <div className="space-y-3 bg-surface-container/30 border border-outline-variant/40 rounded-xl p-3.5">
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-1">Primary Theme Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={schema.theme.colors.primary || "#6D28D9"}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-on-surface">{schema.theme.colors.primary}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant block mb-1">Secondary Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={schema.theme.colors.secondary || "#10B981"}
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-on-surface">{schema.theme.colors.secondary}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant block mb-1">Site Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={schema.theme.colors.background || "#F9FAFB"}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-on-surface">{schema.theme.colors.background}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section specific content editing */}
        {activeSection ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Sliders size={12} className="text-secondary" />
                {activeSection.type} Component Properties
              </span>
              <ChevronDown size={14} />
            </div>

            <div className="space-y-4 bg-surface-container/30 border border-outline-variant/40 rounded-xl p-3.5">
              {/* Navbar & Footer logo */}
              {(activeSection.type === "navbar" || activeSection.type === "footer") && activeSection.content?.logoText && (
                <>
                  <div>
                    <label className="text-[10px] text-on-surface-variant block mb-1">Logo / Brand Name (EN)</label>
                    <input
                      type="text"
                      value={activeSection.content.logoText.en || ""}
                      onChange={(e) => handleContentChange(["logoText", "en"], e.target.value)}
                      onBlur={handleBlurSave}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant block mb-1">Logo / Brand Name (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={activeSection.content.logoText.ar || ""}
                      onChange={(e) => handleContentChange(["logoText", "ar"], e.target.value)}
                      onBlur={handleBlurSave}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                </>
              )}

              {/* Hero block copywriting */}
              {activeSection.type === "hero" && (
                <>
                  {activeSection.content?.headline && (
                    <>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">Hero Title (EN)</label>
                        <textarea
                          rows={3}
                          value={activeSection.content.headline.en || ""}
                          onChange={(e) => handleContentChange(["headline", "en"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">Hero Title (AR)</label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          value={activeSection.content.headline.ar || ""}
                          onChange={(e) => handleContentChange(["headline", "ar"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {activeSection.content?.subheadline && (
                    <>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">Hero Subtitle (EN)</label>
                        <input
                          type="text"
                          value={activeSection.content.subheadline.en || ""}
                          onChange={(e) => handleContentChange(["subheadline", "en"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">Hero Subtitle (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={activeSection.content.subheadline.ar || ""}
                          onChange={(e) => handleContentChange(["subheadline", "ar"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                    </>
                  )}

                  {activeSection.content?.primaryCta?.label && (
                    <>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">CTA Action Button (EN)</label>
                        <input
                          type="text"
                          value={activeSection.content.primaryCta.label.en || ""}
                          onChange={(e) => handleContentChange(["primaryCta", "label", "en"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant block mb-1">CTA Action Button (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={activeSection.content.primaryCta.label.ar || ""}
                          onChange={(e) => handleContentChange(["primaryCta", "label", "ar"], e.target.value)}
                          onBlur={handleBlurSave}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Catch-all for basic content properties */}
              {activeSection.type !== "hero" && activeSection.type !== "navbar" && activeSection.type !== "footer" && (
                <div className="text-center py-4 text-[10px] text-on-surface-variant">
                  Settings are auto-configured by AI generation. Modify via prompt command.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-on-surface-variant">
            Select a layer layer to configure its content properties.
          </div>
        )}
      </div>

      <div className="p-4 flex gap-2 border-t border-outline-variant/50">
        <LanguageToggle />
      </div>
    </aside>
  );
};
