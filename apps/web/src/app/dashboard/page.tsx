"use client";

import React, { useState, useEffect } from "react";
import { Plus, ExternalLink, Edit2, Trash2, Copy, MoreVertical, X, Globe } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useLanguage } from "../../components/LanguageContext";
import { Button } from "../../components/ui";
import { EmptyState } from "../../components/EmptyState";
import { api } from "../../lib/api";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form inputs
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Active dots menu project ID
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<Project[]>("/projects");
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const newProj = await api.post<Project>("/projects", {
        name: projectName,
        description: projectDescription || undefined,
      });
      setProjects((prev) => [newProj, ...prev]);
      setIsCreateOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !projectName.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const updated = await api.put<Project>(`/projects/${selectedProject.id}`, {
        name: projectName,
        description: projectDescription || undefined,
      });
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? updated : p)));
      setIsRenameOpen(false);
      setSelectedProject(null);
      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to rename project.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    setError("");
    try {
      await api.delete<{ success: boolean }>(`/projects/${selectedProject.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      setIsDeleteConfirmOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete project.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateProject = async (proj: Project) => {
    setError("");
    try {
      const duplicated = await api.post<Project>(`/projects/${proj.id}/duplicate`);
      setProjects((prev) => [duplicated, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to duplicate project.");
    }
  };

  const openRenameModal = (proj: Project) => {
    setSelectedProject(proj);
    setProjectName(proj.name);
    setProjectDescription(proj.description || "");
    setIsRenameOpen(true);
    setMenuOpenId(null);
  };

  const openDeleteModal = (proj: Project) => {
    setSelectedProject(proj);
    setIsDeleteConfirmOpen(true);
    setMenuOpenId(null);
  };

  const formatLocaleDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">
              {t("dashProjects") || "Projects"}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              {t("dashProjectsDesc") || "Manage and generate your web experiences"}
            </p>
          </div>
          <Button variant="glow" size="md" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} className="mr-1.5 rtl:ml-1.5" />
            {t("dashNewProject") || "New Project"}
          </Button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-sm text-error flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          // Loading Skeletons
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface/50 border border-outline-variant rounded-2xl p-6 min-h-[200px] animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-6 w-3/4 bg-on-surface/10 rounded mb-4" />
                  <div className="h-4 w-5/6 bg-on-surface/10 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-on-surface/10 rounded" />
                </div>
                <div className="h-9 w-full bg-on-surface/10 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title={t("dashEmptyTitle") || "No projects found"}
            description={t("dashEmptyDesc") || "Create a new project using the button above or get started immediately."}
            actionLabel={t("dashNewProject") || "New Project"}
            onAction={() => setIsCreateOpen(true)}
            icon={<Globe size={48} />}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-surface border border-outline-variant rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between min-h-[220px] relative group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-on-surface text-lg truncate w-[80%]">
                      {proj.name}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenId(menuOpenId === proj.id ? null : proj.id)
                        }
                        className="p-1 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuOpenId === proj.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-surface-container border border-outline-variant rounded-xl shadow-xl z-20 overflow-hidden">
                          <button
                            onClick={() => openRenameModal(proj)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                          >
                            <Edit2 size={14} /> Rename
                          </button>
                          <button
                            onClick={() => handleDuplicateProject(proj)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <button
                            onClick={() => openDeleteModal(proj)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-error/10 text-error flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                    {proj.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant">
                    <span>
                      Created: {formatLocaleDate(proj.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === "published"
                          ? "bg-tertiary/20 text-tertiary border border-tertiary/30"
                          : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                      }`}
                    >
                      {proj.status === "published"
                        ? t("dashStatusPublished") || "Published"
                        : t("dashStatusDraft") || "Draft"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      href={`/editor?id=${proj.id}`}
                      variant="outline"
                      className="flex-grow justify-center font-semibold"
                      size="sm"
                    >
                      {t("dashEditSite") || "Edit Website"}
                    </Button>
                    {proj.status === "published" && (
                      <Button
                        href={`https://site-${proj.id.substring(0, 8)}.qevora.site`}
                        variant="outline"
                        className="px-3 border border-outline-variant bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                        size="sm"
                        target="_blank"
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Portfolio"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What is this website about?"
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-on-surface resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rename Project Modal */}
        {isRenameOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsRenameOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold mb-4">Rename Project</h2>
              <form onSubmit={handleRenameProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="New Name"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary text-on-surface resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRenameOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold mb-2">Delete Project</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Are you sure you want to delete <span className="font-bold text-on-surface">"{selectedProject?.name}"</span>? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleDeleteProject}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-error text-white hover:bg-error/90 font-bold text-sm transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
