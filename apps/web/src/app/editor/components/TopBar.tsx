"use client";

import React, { useState } from "react";
import { Undo, Redo, Laptop, Tablet, Smartphone, Sparkles, Play, Loader2, X, Globe, Copy, Check } from "lucide-react";
import { useLanguage } from "../../../components/LanguageContext";
import { useEditor } from "./EditorContext";
import Link from "next/link";
import { ROUTES } from "../../../lib/routes";
import { Button } from "../../../components/ui";

export const TopBar: React.FC = () => {
  const { t } = useLanguage();
  const { device, setDevice, publishSite, connectDomain, projectId, schema, undo, redo, canUndo, canRedo } = useEditor();

  const [publishing, setPublishing] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  
  // Custom Domain state
  const [customDomain, setCustomDomain] = useState("");
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappedInfo, setMappedInfo] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  const handlePublish = async () => {
    if (!schema) return;
    setPublishing(true);
    try {
      const res = await publishSite();
      setPublishedUrl(res.url);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleMapDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;
    setMappingLoading(true);
    try {
      const res = await connectDomain(customDomain);
      setMappedInfo(res);
    } catch (err) {
      console.error(err);
    } finally {
      setMappingLoading(false);
    }
  };

  const handleCopyVerification = () => {
    if (!mappedInfo?.verificationTxt) return;
    navigator.clipboard.writeText(mappedInfo.verificationTxt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <>
      <header className="h-14 glass border-b border-outline-variant flex items-center justify-between px-6 z-40 shrink-0 font-rubik">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.DASHBOARD} className="font-rubik text-headline-md font-bold tracking-tight text-white hover:text-primary transition-colors">
            Qevora Console
          </Link>
          <div className="h-6 w-px bg-outline-variant/30" />
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 hover:bg-white/5 rounded-lg transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                canUndo ? "text-on-surface-variant hover:text-on-surface" : "text-on-surface-variant/40"
              }`}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 hover:bg-white/5 rounded-lg transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                canRedo ? "text-on-surface-variant hover:text-on-surface" : "text-on-surface-variant/40"
              }`}
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center bg-white/5 rounded-xl p-0.5 border border-outline-variant/50">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center justify-center w-10 h-8 rounded-lg transition ${
              device === "desktop" ? "bg-primary text-background font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
            title="Desktop view"
          >
            <Laptop size={16} />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center justify-center w-10 h-8 rounded-lg transition ${
              device === "tablet" ? "bg-primary text-background font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
            title="Tablet view"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center justify-center w-10 h-8 rounded-lg transition ${
              device === "mobile" ? "bg-primary text-background font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
            title="Mobile view"
          >
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 text-primary font-medium hover:bg-primary/10 transition-all text-xs">
            <Sparkles size={14} className="animate-float" />
            AI Assistant
          </button>
          <div className="h-6 w-px bg-outline-variant/30" />
          {!!publishedUrl && (
            <Link
              href={publishedUrl || `https://site-${projectId?.substring(0, 8)}.qevora.site`}
              target="_blank"
              className="p-2 text-on-surface-variant hover:text-on-surface"
              title="Preview Live Site"
            >
              <Play size={16} />
            </Link>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || !schema}
            className="px-5 py-1.5 bg-primary text-background font-bold rounded-lg shadow-glow-sm hover:brightness-110 active:scale-95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {publishing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </header>

      {/* Publish Success & Domain Mapping Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-rubik">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSuccessModalOpen(false);
                setMappedInfo(null);
                setCustomDomain("");
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-2">
                <Globe size={24} />
              </div>
              <h2 className="text-xl font-bold">Your Website is Live!</h2>
              <p className="text-sm text-on-surface-variant">
                We've compiled your layout and deployed it globally.
              </p>
            </div>

            {/* Published URL card */}
            <div className="bg-surface-container border border-outline-variant/60 rounded-xl p-4 flex justify-between items-center mb-6">
              <div className="truncate pr-4">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Live Address</span>
                <Link
                  href={publishedUrl}
                  target="_blank"
                  className="text-primary hover:underline text-sm font-semibold truncate block"
                >
                  {publishedUrl}
                </Link>
              </div>
              <Button href={publishedUrl} target="_blank" variant="outline" size="sm">
                Open Site
              </Button>
            </div>

            {/* Custom Domain Section */}
            <div className="border-t border-outline-variant/50 pt-6 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white">Connect Custom Domain</h3>
                <p className="text-xs text-on-surface-variant">
                  Map your own domain name (e.g. brand.com) to this project.
                </p>
              </div>

              {!mappedInfo ? (
                <form onSubmit={handleMapDomain} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="mybrand.com"
                    className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 outline-none focus:border-primary text-sm text-on-surface"
                  />
                  <Button type="submit" disabled={mappingLoading} size="sm">
                    {mappingLoading ? "Connecting..." : "Connect Domain"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Configured Domain</span>
                      <span className="text-sm font-semibold text-white">{mappedInfo.domainName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/20 text-warning border border-warning/30 uppercase tracking-wider">
                      {mappedInfo.sslStatus || "Pending Verification"}
                    </span>
                  </div>

                  <div className="border-t border-outline-variant/50 pt-3">
                    <p className="text-xs text-on-surface-variant mb-2">
                      Please add this TXT record to your domain registrar (GoDaddy, Namecheap, etc.) to verify ownership:
                    </p>
                    <div className="bg-surface border border-outline-variant rounded-lg p-2.5 flex justify-between items-center text-xs">
                      <div className="font-mono">
                        <span className="text-on-surface-variant">Host: </span>
                        <span className="text-white font-bold">@</span>
                        <br />
                        <span className="text-on-surface-variant">Value: </span>
                        <span className="text-white font-bold truncate inline-block max-w-[200px] align-bottom">
                          {mappedInfo.verificationTxt}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyVerification}
                        className="p-2 hover:bg-white/5 rounded-lg text-primary transition"
                        title="Copy Value"
                      >
                        {copiedText ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
