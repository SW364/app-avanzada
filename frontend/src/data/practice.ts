import type { ThemeColors } from "@/src/theme";
import { MODULES, type ModuleId, type Mode, type TenseKey } from "@/src/data/curriculum";
import type { VerbGroup } from "@/src/data/verbs";

export type PracticeId =
  | "pv-m1a" | "pv-mm1aa" | "pv-mm2aa" | "pv-mm3aa" | "pv-mm4aa"
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
  initialKey?: TenseKey; // chapter opens on its own tense
  fixed?: boolean; // tense is fixed: no auxiliary/tense selector (Voz Pasiva Mm1.AA–Mm4.AA)
};

// M2 chapters (Voz Pasiva AA and BAT MM2.B–MM5.B) use the M2.A list (same form in all 3 columns).
const TENSE_GROUPS: VerbGroup[] = ["M2.A"];

export const PRACTICES: PracticeDef[] = [
  { id: "pv-m1a", module: "passive", mode: "modal", code: "M1.A", title: "Modales + be + Participio", icon: "book", color: "blue", bg: "blueBg", verbGroups: ["M1.A"], defaultVerb: "M1.A-play" },
  { id: "pv-mm1aa", module: "passive", mode: "tense", code: "Mm1.AA", title: "Presente · Am / Is / Are + Participio", icon: "create", color: "orange", bg: "orangeBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "present", fixed: true },
  { id: "pv-mm2aa", module: "passive", mode: "tense", code: "Mm2.AA", title: "Pasado · Was / Were + Participio", icon: "time", color: "coral", bg: "coralBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "past", fixed: true },
  { id: "pv-mm3aa", module: "passive", mode: "tense", code: "Mm3.AA", title: "Presente Perfecto · Has / Have been + Participio", icon: "flag", color: "green", bg: "greenBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "presentPerfect", fixed: true },
  { id: "pv-mm4aa", module: "passive", mode: "tense", code: "Mm4.AA", title: "Pasado Perfecto · Had been + Participio", icon: "hourglass", color: "pink", bg: "pinkBg", verbGroups: TENSE_GROUPS, defaultVerb: "M2.A-cut", initialKey: "pastPerfect", fixed: true },
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
