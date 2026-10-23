// Pedagogical structure replicated from the CalcuVerbs manuals.

export type ModuleId = "passive" | "bat";
export type Mode = "modal" | "tense";
export type TenseKey = "present" | "past" | "presentPerfect" | "pastPerfect";
export type ModalKey =
  | "can" | "could" | "may" | "will" | "should" | "would"
  | "must" | "shall" | "might" | "gonna" | "wanna" | "goingTo";

export type Option = { key: string; label: string; es: string };

export type Chapter = {
  key: TenseKey;
  cap: string;
  manualCode: string;
  title: string;
  formula: string;
  tone: "present" | "past";
};

export type Section = {
  code: string;
  manualCode: string;
  mode: Mode;
  title: string;
  description: string;
  formula: string;
};

export type LearningModule = {
  id: ModuleId;
  title: string;
  subtitle: string;
  description: string;
  defaultVerb: string;
  sections: Section[];
  modals: Option[];
  chapters: Chapter[];
};

const MODAL_LABELS: Record<ModalKey, Option> = {
  can: { key: "can", label: "Can", es: "Poder" },
  could: { key: "could", label: "Could", es: "Podría" },
  may: { key: "may", label: "May", es: "Podría" },
  will: { key: "will", label: "Will", es: "Futuro" },
  should: { key: "should", label: "Should", es: "Debería" },
  would: { key: "would", label: "Would", es: "Terminación -ía" },
  must: { key: "must", label: "Must", es: "Deber" },
  shall: { key: "shall", label: "Shall", es: "Futuro" },
  might: { key: "might", label: "Might", es: "Quizás podría" },
  gonna: { key: "gonna", label: "Gonna", es: "Ir a (Going to)" },
  wanna: { key: "wanna", label: "Wanna", es: "Querer (Want to)" },
  goingTo: { key: "goingTo", label: "Going to", es: "Ir a (Futuro)" },
};

const pick = (keys: ModalKey[]) => keys.map((k) => MODAL_LABELS[k]);

export const MODULES: Record<ModuleId, LearningModule> = {
  passive: {
    id: "passive",
    title: "Voz Pasiva",
    subtitle: "Passive Voice",
    description: "El sujeto recibe la acción: To be + Pasado Participio.",
    defaultVerb: "M3.A-play",
    sections: [
      {
        code: "M1.A",
        manualCode: "MM1.B",
        mode: "modal",
        title: "Los verbos Auxiliares",
        description: "Modales / auxiliares + be + Pasado Participio",
        formula: "Modal + be + Pasado Participio",
      },
      {
        code: "M2.A",
        manualCode: "AA",
        mode: "tense",
        title: "Uso del Auxiliar Avanzado (AA)",
        description: "La forma del verbo to be simple en los 4 tiempos",
        formula: "To be + Pasado Participio",
      },
    ],
    modals: pick(["can", "could", "may", "will", "should", "would", "must", "shall", "might", "gonna", "wanna"]),
    chapters: [
      { key: "present", cap: "Capítulo 1", manualCode: "Mm 1.AA", title: "Presente", formula: "Am / Is / Are + Pasado Participio", tone: "present" },
      { key: "past", cap: "Capítulo 2", manualCode: "Mm 2.AA", title: "Pasado", formula: "Was / Were + Pasado Participio", tone: "past" },
      { key: "presentPerfect", cap: "Capítulo 3", manualCode: "Mm 3.AA", title: "Presente Perfecto", formula: "Has / Have been + Pasado Participio", tone: "present" },
      { key: "pastPerfect", cap: "Capítulo 4", manualCode: "Mm 4.AA", title: "Pasado Perfecto", formula: "Had been + Pasado Participio", tone: "past" },
    ],
  },
  bat: {
    id: "bat",
    title: "Modo BAT",
    subtitle: "Be able to · Ser capaz de",
    description: "Expresa la capacidad de hacer algo: be able to + Verbo.",
    defaultVerb: "M2.A-cut",
    sections: [
      {
        code: "M1.A",
        manualCode: "MM1.B",
        mode: "modal",
        title: "Modales + be able to",
        description: "Will, Must, Should, Would, Might… + be able to + Verbo",
        formula: "Modal + be able to + Verbo",
      },
      {
        code: "M2.A",
        manualCode: "MM2.B – MM5.B",
        mode: "tense",
        title: "Los 4 tiempos fundamentales",
        description: "Presente, Pasado, Presente Perfecto y Pasado Perfecto",
        formula: "To be + able to + Verbo",
      },
    ],
    modals: pick(["will", "must", "should", "would", "might", "may", "shall", "gonna", "wanna", "goingTo"]),
    chapters: [
      { key: "present", cap: "Capítulo 2", manualCode: "MM2.B", title: "Presente", formula: "Am / Is / Are + able to + Verbo", tone: "present" },
      { key: "past", cap: "Capítulo 3", manualCode: "MM3.B", title: "Pasado", formula: "Was / Were + able to + Verbo", tone: "past" },
      { key: "presentPerfect", cap: "Capítulo 4", manualCode: "MM4.B", title: "Presente Perfecto", formula: "Has / Have been + able to + Verbo", tone: "present" },
      { key: "pastPerfect", cap: "Capítulo 5", manualCode: "MM5.B", title: "Pasado Perfecto", formula: "Had been + able to + Verbo", tone: "past" },
    ],
  },
};

export function isModuleId(id: unknown): id is ModuleId {
  return id === "passive" || id === "bat";
}
