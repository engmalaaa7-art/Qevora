"use client";

import React, { useState } from "react";
import { Plus, LayoutGrid, Globe, ExternalLink, Sliders, Database, CreditCard } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState([
    { id: "1", name: "Nova Realty", description: "Bilingual real estate website", status: "published", url: "https://novarealty.qevora.site" },
    { id: "2", name: "Gourmet Bakery", description: "Arabic bakery landing page", status: "draft", url: "" }
  ]);

  return (
    <div className="min-h-screen bg-background-alt flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              Q
            </div>
            <span className="text-lg font-bold text-text">Qevora Console</span>
          </div>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary-light text-primary font-medium">
              <LayoutGrid size={18} /> Projects
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-text transition">
              <Sliders size={18} /> Templates
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-text transition">
              <CreditCard size={18} /> Billing
            </a>
          </nav>
        </div>
        <div className="p-4 bg-background-alt border border-border rounded-xl mt-8">
          <h4 className="font-semibold text-text text-sm mb-2 flex items-center gap-1.5"><Database size={14} /> Usage Quota</h4>
          <div className="w-full bg-border rounded-full h-2 mb-1.5">
            <div className="bg-primary h-2 rounded-full" style={{ width: "40%" }}></div>
          </div>
          <p className="text-xs text-text-secondary">40,000 / 100,000 Monthly Tokens</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-text">My Projects</h1>
            <p className="text-text-secondary">Manage and edit your generated websites</p>
          </div>
          <button className="bg-primary hover:bg-primary-dark text-text-inverse px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
            <Plus size={18} /> New Project
          </button>
        </header>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-48">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-text text-lg">{proj.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    proj.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-6">{proj.description}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/editor"
                  className="flex-grow text-center bg-background-alt border border-border hover:bg-surface-elevated text-text py-2 rounded-lg font-medium text-sm transition"
                >
                  Edit Site
                </a>
                {proj.status === "published" && (
                  <a
                    href={proj.url}
                    target="_blank"
                    className="p-2 border border-border hover:bg-surface-elevated rounded-lg text-text-secondary transition"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
