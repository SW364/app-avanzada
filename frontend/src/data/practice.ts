import type { ThemeColors } from "@/src/theme";
import { MODULES, type ModuleId, type Mode, type TenseKey } from "@/src/data/curriculum";
import type { VerbGroup } from "@/src/data/verbs";

export type PracticeId =
  | "pv-m1a" | "pv-m2a"
  | "bat-mm1b" | "bat-mm2b" | "bat-mm3b" | "bat-mm4b" | "bat-mm5b";

export type PracticeDef = {
  id: PracticeId;
  module: ModuleId;
  mode: Mode;
  code: string;
  title: string;
  icon: "book" | "create" | "flash" | "time" | "star" | "flag" | "hourglass";
  color: keyof ThemeColors;
  bg: keyof ThemeColors;
  verbGroups: VerbGroup[];
  defaultVerb: string;
  initialKey?: TenseKey; // BAT chapters MM2.B–MM5.B open on their own tense
};

const TENSE_GROUPS: VerbGroup[] = ["M2.A", "M3.A", "M4.A"];

export const PRACTICES: PracticeDef[] = [
  { id: "pv-m1a", module: "passive", mode: "modal", code: "M1.A", title: "Modales + be + Participio", icon: "book", color: "blue", bg: "blueBg", verbGroups: ["M1.A"], defaultVerb: "M1.A-play" },
  { id: "pv-m2a", module: "passive", mode: "tense", code: "M2.A", title: "Los 4 tiempos (To be + Participio)", icon: "create", color: "orange", bg: "orangeBg", verbGroups: TENSE_GROUPS, defaultVerb: "M3.A-play" },
  { id: "bat-mm1b", module: "bat", mode: "modal", code: "MM1.B", title: "Modales + be able to", icon: "flash", color: "teal", bg: "tealBg", verbGroups: ["M1.A"], defaultVerb: "M1.A-cut" },
  { id: "bat-mm2b", module: "bat", mode: "tense", code: "MM2.B", title: "Presente · Am / Is / Are able to", icon: "star", color: "purple", bg: "purpleBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "present" },
  { id: "bat-mm3b", module: "bat", mode: "tense", code: "MM3.B", title: "Pasado · Was / Were able to", icon: "time", color: "coral", bg: "coralBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "past" },
  { id: "bat-mm4b", module: "bat", mode: "tense", code: "MM4.B", title: "Presente Perfecto · Has / Have been able to", icon: "flag", color: "green", bg: "greenBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "presentPerfect" },
  { id: "bat-mm5b", module: "bat", mode: "tense", code: "MM5.B", title: "Pasado Perfecto · Had been able to", icon: "hourglass", color: "pink", bg: "pinkBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "pastPerfect" },
];

export function countOptions(p: PracticeDef) {
  const m = MODULES[p.module];
  return p.mode === "modal" ? m.modals.length : m.chapters.length;
}

export function findPractice(id?: string) {
  return PRACTICES.find((p) => p.id === id);
}
