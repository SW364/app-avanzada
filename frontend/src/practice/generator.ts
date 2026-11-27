// Local, infinite exercise generator built on the app's conjugation engine and verb bank.
import { MODULES, type TenseKey, type ModalKey } from "@/src/data/curriculum";
import { VERBS, type Verb } from "@/src/data/verbs";
import { PERSONS, conjugate, joinSegments, type Form, type Person } from "@/src/logic/conjugate";

export type TopicId = "all" | "pv-aa" | "pv-ab" | "bat-modal" | "bat-tense" | "gerund-aint" | "verbs";
export type ExerciseKind = "fill" | "say";
export type AnswerMethod = "speak" | "type" | "choose";

export const TOPICS: { id: TopicId; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pv-aa", label: "Passive AA" },
  { id: "pv-ab", label: "Passive AB" },
  { id: "bat-modal", label: "BAT MM1.B" },
  { id: "bat-tense", label: "BAT MM2–MM5" },
  { id: "gerund-aint", label: "Gerundios & Ain't" },
  { id: "verbs", label: "Regulares / Irregulares" },
];

export type Exercise = {
  id: string;
  kind: ExerciseKind;
  tag: string;            // chapter code shown on the card
  instruction: string;
  before?: string;        // fill: text before the blank
  after?: string;         // fill: text after the blank
  target?: string;        // say: sentence to repeat
  hint?: string;          // Spanish meaning
  answer: string;         // main expected answer (blank text or full sentence)
  accepted: string[];     // all accepted variants
  options?: string[];     // fill: touch options
  full: string;           // full English sentence (for listening)
  note: string;           // short grammar note
  method?: AnswerMethod;  // the ONLY way to answer this exercise (always set by generateExercise)
};

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const uniq = (a: string[]) => [...new Set(a)];
const M1 = VERBS.filter((v) => v.group === "M1.A" && v.en !== "be");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// -ing form
const DOUBLE = new Set(["cut", "run", "swim", "stop", "sit", "put", "shut", "hit", "begin", "plan", "chop", "get", "set", "let", "forget", "prefer", "beg", "win", "skip", "shop"]);
export function ingForm(base: string): string {
  if (base === "be") return "being";
  if (base.endsWith("ie")) return base.slice(0, -2) + "ying";
  if (DOUBLE.has(base)) return base + base[base.length - 1] + "ing";
  if (base.endsWith("e") && !/(ee|ye|oe)$/.test(base)) return base.slice(0, -1) + "ing";
  return base + "ing";
}

const TENSE_NOTE: Record<TenseKey, string> = {
  present: "Mm1.AA · Presente: am (I) / is (he, she, it) / are (you, we, they) + pasado participio.",
  past: "Mm2.AA · Pasado: was (I, he, she, it) / were (you, we, they) + pasado participio.",
  presentPerfect: "Mm3.AA · Presente perfecto: has (he, she, it) / have (I, you, we, they) + been + pasado participio.",
  pastPerfect: "Mm4.AA · Pasado perfecto: had been + pasado participio para todas las personas.",
  presentBeing: "Mm5.AB · am / is / are + being + pasado participio (acción en progreso).",
  pastBeing: "Mm6.AB · was / were + being + pasado participio.",
  presentPerfectBeing: "Mm7.AB · has / have + been being + pasado participio.",
  pastPerfectBeing: "Mm8.AB · had been being + pasado participio para todas las personas.",
};
const BAT_NOTE: Record<string, string> = {
  present: "MM2.B · am / is / are + able to + verbo. Negativo: not able to = unable to.",
  past: "MM3.B · was / were + able to + verbo (fui capaz de…).",
  presentPerfect: "MM4.B · has / have been + able to + verbo (he sido capaz de…).",
  pastPerfect: "MM5.B · had been + able to + verbo (había sido capaz de…).",
};
const AA_KEYS: TenseKey[] = ["present", "past", "presentPerfect", "pastPerfect"];
const AB_KEYS: TenseKey[] = ["presentBeing", "pastBeing", "presentPerfectBeing", "pastPerfectBeing"];
const CODE: Record<TenseKey, string> = {
  present: "Mm1.AA", past: "Mm2.AA", presentPerfect: "Mm3.AA", pastPerfect: "Mm4.AA",
  presentBeing: "Mm5.AB", pastBeing: "Mm6.AB", presentPerfectBeing: "Mm7.AB", pastPerfectBeing: "Mm8.AB",
};
const BAT_CODE: Record<string, string> = { present: "MM2.B", past: "MM3.B", presentPerfect: "MM4.B", pastPerfect: "MM5.B" };
const FORMS: Form[] = ["affirmative", "negative", "interrogative"];

let n = 0;
const nextId = () => `ex-${Date.now()}-${n++}`;

// Build a fill/say exercise from one conjugation; the blank is the highlighted auxiliary chain.
function fromConjugation(opts: {
  module: "passive" | "bat"; mode: "tense" | "modal"; key: string; verb: Verb; person: Person; form: Form;
  tag: string; note: string; distractorKeys: string[]; kind: ExerciseKind;
}): Exercise {
  const base = { module: opts.module, mode: opts.mode, key: opts.key, verb: opts.verb, person: opts.person, form: opts.form };
  const c = conjugate(base);
  const full = c.enFull;
  const accepted = [full, ...(c.enAlt ? [c.enAlt] : [])];
  if (opts.kind === "say") {
    return {
      id: nextId(), kind: "say", tag: opts.tag, instruction: "Escucha y repite en voz alta",
      target: full, hint: c.es, answer: full, accepted, full, note: opts.note,
    };
  }
  // First highlighted segment is the blank; for questions only the first operator is blanked.
  const segs = c.en;
  const idx = segs.findIndex((s) => s.hl);
  const answer = segs[idx].t;
  const before = joinSegments(segs.slice(0, idx));
  const after = joinSegments(segs.slice(idx + 1));
  const wrong = opts.distractorKeys
    .filter((k) => k !== opts.key)
    .map((k) => conjugate({ ...base, key: k }).en.find((s) => s.hl)?.t ?? "")
    .filter((t) => t && t.toLowerCase() !== answer.toLowerCase());
  const options = shuffle(uniq([answer, ...shuffle(uniq(wrong)).slice(0, 3)]));
  return {
    id: nextId(), kind: "fill", tag: opts.tag, instruction: "Completa la frase",
    before, after, hint: c.es, answer, accepted: [answer], options, full, note: opts.note,
  };
}

function passive(keys: TenseKey[], kind: ExerciseKind): Exercise {
  const key = pick(keys);
  return fromConjugation({
    module: "passive", mode: "tense", key, verb: pick(M1), person: pick(PERSONS), form: pick(FORMS),
    tag: CODE[key], note: TENSE_NOTE[key], distractorKeys: keys, kind,
  });
}

function batModal(kind: ExerciseKind): Exercise {
  const modals = MODULES.bat.modals.map((m) => m.key as ModalKey);
  const key = pick(modals);
  const ex = fromConjugation({
    module: "bat", mode: "modal", key, verb: pick(M1), person: pick(PERSONS), form: pick(FORMS),
    tag: "MM1.B", note: "MM1.B · Modal + be able to + verbo. Nunca se combina can / could con be able to.",
    distractorKeys: modals, kind,
  });
  // Typical mistake as a distractor: "can be able to".
  if (ex.kind === "fill" && ex.options && ex.options.length >= 4 && !ex.before?.match(/^(Can|Could)/)) {
    ex.options[ex.options.findIndex((o) => o !== ex.answer)] = "can";
  }
  return ex;
}

function batTense(kind: ExerciseKind): Exercise {
  const key = pick(AA_KEYS);
  return fromConjugation({
    module: "bat", mode: "tense", key, verb: pick(M1), person: pick(PERSONS), form: pick(FORMS),
    tag: BAT_CODE[key], note: BAT_NOTE[key], distractorKeys: AA_KEYS, kind,
  });
}

const GERUND_TAILS = ["is good for health", "is fun", "is my favorite activity", "is important for students", "is not easy"];
const GERUND_VERBS = ["run", "swim", "dance", "walk", "study", "cook", "read", "sing", "skate", "climb", "work", "sleep", "write", "drive"];

function gerundOrAint(kind: ExerciseKind): Exercise {
  if (Math.random() < 0.5) {
    const v = pick(GERUND_VERBS);
    const verb = M1.find((x) => x.en === v)!;
    const ing = cap(ingForm(v));
    const tail = pick(GERUND_TAILS);
    const full = `${ing} ${tail}.`;
    const note = "Apéndice · Gerundio: el verbo + -ing funciona como sujeto (Running is good for health).";
    if (kind === "say") {
      return { id: nextId(), kind, tag: "Gerundio", instruction: "Escucha y repite en voz alta", target: full, hint: `${cap(verb.es)} (como actividad)`, answer: full, accepted: [full], full, note };
    }
    return {
      id: nextId(), kind, tag: "Gerundio", instruction: "Completa con el gerundio correcto", before: "", after: ` ${tail}.`,
      hint: `Verbo: ${v} (${verb.es})`, answer: ing, accepted: [ing],
      options: shuffle([ing, ...shuffle(uniq([cap(v), cap(verb.past.split(" ")[0]), `To ${v}s`, `${cap(v)}s`]).filter((o) => o !== ing)).slice(0, 3)]), full, note,
    };
  }
  // Ain't recognition
  const person = pick(PERSONS);
  const single = person.third && !person.plural;
  const useBe = Math.random() < 0.5;
  const adj = pick(["ready", "happy", "here", "tired", "at home", "busy"]);
  const verb = pick(M1);
  const answer = useBe ? (person.key === "i" ? "am not" : single ? "isn't" : "aren't") : (single ? "hasn't" : "haven't");
  const sentence = useBe ? `${person.en} ain't ${adj}.` : `${person.en} ain't ${verb.pp} it.`;
  const full = useBe ? `${person.en} ${answer} ${adj}.` : `${person.en} ${answer} ${verb.pp} it.`;
  const note = "Apéndice · Ain't (informal) = isn't / aren't / am not con to be, y hasn't / haven't con participio.";
  if (kind === "say") {
    return { id: nextId(), kind, tag: "Ain't", instruction: `Di la forma correcta de: “${sentence}”`, target: full, answer: full, accepted: [full], full, note };
  }
  return {
    id: nextId(), kind, tag: "Ain't", instruction: `¿Qué significa ain't en: “${sentence}”?`, before: `${person.en} `,
    after: useBe ? ` ${adj}.` : ` ${verb.pp} it.`, answer, accepted: [answer, answer.replace("n't", " not")],
    options: shuffle([answer, ...shuffle(["isn't", "aren't", "hasn't", "haven't", "am not"].filter((o) => o !== answer)).slice(0, 3)]), full, note,
  };
}

function verbForms(kind: ExerciseKind): Exercise {
  const v = pick(M1);
  const ing = ingForm(v.en);
  const forms = `${v.en}, ${v.past}, ${v.pp}, ${ing}`;
  const note = v.regular
    ? "Verbo regular: pasado y participio terminan en -ed."
    : "Verbo irregular: el pasado y el participio se aprenden de memoria.";
  const tag = v.regular ? "Regular" : "Irregular";
  if (kind === "say") {
    return { id: nextId(), kind, tag, instruction: "Escucha y repite las 4 formas", target: forms, hint: v.es, answer: forms, accepted: [forms], full: forms, note };
  }
  const which = pick(["past", "pp", "ing"] as const);
  const label = which === "past" ? "Simple past" : which === "pp" ? "Past participle" : "Forma -ing";
  const answer = which === "past" ? v.past.split(" / ")[0] : which === "pp" ? v.pp : ing;
  const options = shuffle(uniq([answer, v.en, v.past.split(" / ")[0], v.pp, ing, `${v.en}ed`])).filter((o) => o !== answer).slice(0, 3);
  return {
    id: nextId(), kind, tag, instruction: `${label} de “${v.en}” (${v.es})`, before: `${v.en} → `, after: "",
    answer, accepted: v.past.includes(" / ") && which === "past" ? v.past.split(" / ") : [answer],
    options: shuffle([answer, ...options]), hint: forms.replace(answer, "___"), full: forms, note,
  };
}

const KEY_EXAMPLES: Exercise[] = [
  ["The ball is played by the child.", "La pelota es jugada por el niño.", "Mm1.AA"],
  ["I was born.", "Yo nací.", "Mm2.AA"],
  ["I have been promoted.", "Yo he sido promovido.", "Mm3.AA"],
  ["She is being loved.", "Ella está siendo amada.", "Mm5.AB"],
  ["I have been able to cut.", "Yo he sido capaz de cortar.", "MM4.B"],
  ["Running is good for health.", "Correr es bueno para la salud.", "Gerundio"],
  ["Swimming is good for health.", "Nadar es bueno para la salud.", "Gerundio"],
].map(([t, es, tag]) => ({
  id: tag, kind: "say" as const, tag, instruction: "Ejemplo clave · Escucha y repite", target: t, hint: es, answer: t,
  accepted: [t], full: t, note: "Ejemplo clave del manual CalcuVerbs.",
}));

const GENERATORS: Record<Exclude<TopicId, "all">, (k: ExerciseKind) => Exercise> = {
  "pv-aa": (k) => passive(AA_KEYS, k),
  "pv-ab": (k) => passive(AB_KEYS, k),
  "bat-modal": batModal,
  "bat-tense": batTense,
  "gerund-aint": gerundOrAint,
  verbs: verbForms,
};

export function generateExercise(topic: TopicId, kind: ExerciseKind | "mixed", previous?: Exercise): Exercise {
  for (let i = 0; i < 6; i++) {
    const k: ExerciseKind = kind === "mixed" ? (Math.random() < 0.6 ? "fill" : "say") : kind;
    let ex: Exercise;
    if (k === "say" && (topic === "all" || topic === "pv-aa") && Math.random() < 0.12) {
      const ex0 = pick(KEY_EXAMPLES);
      ex = { ...ex0, id: nextId() };
    } else {
      const t = topic === "all" ? pick(Object.keys(GENERATORS) as Exclude<TopicId, "all">[]) : topic;
      ex = GENERATORS[t](k);
    }
    // Fill exercises get one random answer method; pronunciation is always spoken.
    ex.method = ex.kind === "say" ? "speak" : pick<AnswerMethod>(["speak", "type", "choose"]);
    if (!previous || ex.full !== previous.full) return ex; // never repeat the same one immediately
  }
  return { ...GENERATORS["pv-aa"]("fill"), method: "choose" };
}
