"use client";

import React from "react";
import { AmbientShader } from "./AmbientShader";
import { cn } from "../lib/utils";

interface AmbientBackgroundProps {
  opacity?: number;
  className?: string;
  type?: "blobs" | "flowing";
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ 
  opacity = 40, 
  className,
  type = "blobs" 
}) => {
  return (
    <div className={cn(`absolute inset-0 z-0 pointer-events-none opacity-${opacity}`, className)}>
      <AmbientShader type={type} />
    </div>
  );
};
