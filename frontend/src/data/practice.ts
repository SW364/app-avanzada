import type { ThemeColors } from "@/src/theme";
import type { ModuleId, Mode, TenseKey } from "@/src/data/curriculum";
import type { VerbGroup } from "@/src/data/verbs";

export type PracticeId =
  | "pv-mm1aa" | "pv-mm2aa" | "pv-mm3aa" | "pv-mm4aa"
  | "pv-mm5ab" | "pv-mm6ab" | "pv-mm7ab" | "pv-mm8ab"
  | "bat-mm1b" | "bat-mm2b" | "bat-mm3b" | "bat-mm4b" | "bat-mm5b";

export type PracticeDef = {
  id: PracticeId;
  module: ModuleId;
  subsection?: "AA" | "AB";
  mode: Mode;
  code: string;
  title: string;
  formula: string;
  icon: "book" | "create" | "flash" | "time" | "star" | "flag" | "hourglass" | "layers" | "sync" | "infinite" | "repeat";
  color: keyof ThemeColors;
  bg: keyof ThemeColors;
  verbGroups: VerbGroup[];
  defaultVerb: string;
  initialKey?: TenseKey; // fixed tense of the chapter (no selector)
  fixed?: boolean;
};

// Verb catalogs: M1 = 160 list, M2 = invariables (bet, cut…), M3 = regulares, M4 = irregulares.
const M1: VerbGroup[] = ["M1.A"];
const M2: VerbGroup[] = ["M2.A"];
const M3: VerbGroup[] = ["M3.A"];
const M4: VerbGroup[] = ["M4.A"];

const PP = "Pasado Participio";
const INF = "able to + Verbo en Infinitivo";

export const PRACTICES: PracticeDef[] = [
  // Voz Pasiva — A: Auxiliar Avanzado (AA)
  { id: "pv-mm1aa", module: "passive", subsection: "AA", mode: "tense", code: "Mm1.AA", title: "Presente Simple", formula: `Am / Is / Are + ${PP}`, icon: "create", color: "blue", bg: "blueBg", verbGroups: M1, defaultVerb: "M1.A-play", initialKey: "present", fixed: true },
  { id: "pv-mm2aa", module: "passive", subsection: "AA", mode: "tense", code: "Mm2.AA", title: "Pasado Simple", formula: `Was / Were + ${PP}`, icon: "time", color: "orange", bg: "orangeBg", verbGroups: M2, defaultVerb: "M2.A-cut", initialKey: "past", fixed: true },
  { id: "pv-mm3aa", module: "passive", subsection: "AA", mode: "tense", code: "Mm3.AA", title: "Presente Perfecto", formula: `Has / Have been + ${PP}`, icon: "flag", color: "green", bg: "greenBg", verbGroups: M3, defaultVerb: "M3.A-play", initialKey: "presentPerfect", fixed: true },
  { id: "pv-mm4aa", module: "passive", subsection: "AA", mode: "tense", code: "Mm4.AA", title: "Pasado Perfecto", formula: `Had been + ${PP}`, icon: "hourglass", color: "coral", bg: "coralBg", verbGroups: M4, defaultVerb: "M4.A-break", initialKey: "pastPerfect", fixed: true },
  // Voz Pasiva — B: Verbo To Be Avanzado (AB)
  { id: "pv-mm5ab", module: "passive", subsection: "AB", mode: "tense", code: "Mm5.AB", title: "Presente Continuo / Simple Avanzado", formula: `Am being / Is being / Are being + ${PP}`, icon: "layers", color: "purple", bg: "purpleBg", verbGroups: M1, defaultVerb: "M1.A-play", initialKey: "presentBeing", fixed: true },
  { id: "pv-mm6ab", module: "passive", subsection: "AB", mode: "tense", code: "Mm6.AB", title: "Pasado Continuo / Simple Avanzado", formula: `Was being / Were being + ${PP}`, icon: "sync", color: "pink", bg: "pinkBg", verbGroups: M2, defaultVerb: "M2.A-cut", initialKey: "pastBeing", fixed: true },
  { id: "pv-mm7ab", module: "passive", subsection: "AB", mode: "tense", code: "Mm7.AB", title: "Presente Perfecto Avanzado", formula: `Has been being / Have been being + ${PP}`, icon: "infinite", color: "teal", bg: "tealBg", verbGroups: M3, defaultVerb: "M3.A-play", initialKey: "presentPerfectBeing", fixed: true },
  { id: "pv-mm8ab", module: "passive", subsection: "AB", mode: "tense", code: "Mm8.AB", title: "Pasado Perfecto Avanzado", formula: `Had been being + ${PP}`, icon: "repeat", color: "blue", bg: "blueBg", verbGroups: M4, defaultVerb: "M4.A-break", initialKey: "pastPerfectBeing", fixed: true },
  // Modo BAT
  { id: "bat-mm1b", module: "bat", mode: "modal", code: "MM1.B", title: "Modales BAT", formula: `Modal + be ${INF}`, icon: "flash", color: "teal", bg: "tealBg", verbGroups: M1, defaultVerb: "M1.A-cut" },
  { id: "bat-mm2b", module: "bat", mode: "tense", code: "MM2.B", title: "Presente Simple", formula: `Am / Is / Are + ${INF}`, icon: "star", color: "purple", bg: "purpleBg", verbGroups: M2, defaultVerb: "M2.A-cut", initialKey: "present", fixed: true },
  { id: "bat-mm3b", module: "bat", mode: "tense", code: "MM3.B", title: "Pasado Simple", formula: `Was / Were + ${INF}`, icon: "time", color: "coral", bg: "coralBg", verbGroups: M3, defaultVerb: "M3.A-play", initialKey: "past", fixed: true },
  { id: "bat-mm4b", module: "bat", mode: "tense", code: "MM4.B", title: "Presente Perfecto", formula: `Has / Have been + ${INF}`, icon: "flag", color: "green", bg: "greenBg", verbGroups: M4, defaultVerb: "M4.A-break", initialKey: "presentPerfect", fixed: true },
  // MM5.B: provisional, same verbs as MM2.B until the official list is defined
  { id: "bat-mm5b", module: "bat", mode: "tense", code: "MM5.B", title: "Pasado Perfecto", formula: `Had been + ${INF}`, icon: "hourglass", color: "pink", bg: "pinkBg", verbGroups: M2, defaultVerb: "M2.A-cut", initialKey: "pastPerfect", fixed: true },
];

export function findPractice(id?: string) {
  return PRACTICES.find((p) => p.id === id);
}
