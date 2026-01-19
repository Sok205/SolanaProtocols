// src/protocols/types.ts
import { ComponentType } from "react";

export interface ProtocolManifest {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Educational metadata
  concepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];

  // Entry point - receives slug for internal routing
  RootComponent: ComponentType<{ slug: string[] }>;
}
