"use client";

import React from "react";
import { EditorProvider } from "./components/EditorContext";
import { TopBar } from "./components/TopBar";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { Canvas } from "./components/Canvas";
import { StatusBar } from "./components/StatusBar";
import { ProtectedRoute } from "../../components/ProtectedRoute";

function EditorContent() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col text-on-surface bg-background select-none font-rubik">
      <TopBar />
      <div className="flex-grow flex overflow-hidden min-h-0">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorProvider>
        <EditorContent />
      </EditorProvider>
    </ProtectedRoute>
  );
}
