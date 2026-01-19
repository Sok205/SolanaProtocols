// src/protocols/index.ts
import { ProtocolManifest } from "./types";
import { cpmm } from "./cpmm/manifest";

export const protocols: ProtocolManifest[] = [cpmm];

export const getProtocol = (id: string): ProtocolManifest | undefined =>
  protocols.find((p) => p.id === id);
