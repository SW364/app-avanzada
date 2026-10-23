import type { ThemeColors } from "@/src/theme";
import { MODULES, type ModuleId, type Mode } from "@/src/data/curriculum";

export type PracticeId = "pv-m1a" | "pv-m2a" | "bat-m1a" | "bat-m2a";

export type PracticeDef = {
  id: PracticeId;
  module: ModuleId;
  mode: Mode;
  code: string;
  title: string;
  icon: "book" | "create" | "flash" | "time";
  color: keyof ThemeColors;
  bg: keyof ThemeColors;
};

export const PRACTICES: PracticeDef[] = [
  { id: "pv-m1a", module: "passive", mode: "modal", code: "M1.A", title: "Modales + be + Participio", icon: "book", color: "blue", bg: "blueBg" },
  { id: "pv-m2a", module: "passive", mode: "tense", code: "M2.A", title: "Los 4 tiempos (To be + Participio)", icon: "create", color: "orange", bg: "orangeBg" },
  { id: "bat-m1a", module: "bat", mode: "modal", code: "M1.A", title: "Modales + be able to", icon: "flash", color: "teal", bg: "tealBg" },
  { id: "bat-m2a", module: "bat", mode: "tense", code: "M2.A", title: "Los 4 tiempos (be able to)", icon: "time", color: "purple", bg: "purpleBg" },
];

export function countOptions(p: PracticeDef) {
  const m = MODULES[p.module];
  return p.mode === "modal" ? m.modals.length : m.chapters.length;
}

export function findPractice(id?: string) {
  return PRACTICES.find((p) => p.id === id);
}
