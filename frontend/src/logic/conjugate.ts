import type { ModalKey, ModuleId, Mode, TenseKey } from "@/src/data/curriculum";
import type { Verb } from "@/src/data/verbs";

export type Form = "affirmative" | "negative" | "interrogative";

export const FORMS: { key: Form; label: string }[] = [
  { key: "affirmative", label: "Afirmativa" },
  { key: "negative", label: "Negativa" },
  { key: "interrogative", label: "Interrogativa" },
];

// Spanish conjugation slot: 0 yo, 1 tú, 2 él/ella/esto, 3 nosotros, 4 ellos
type Slot = 0 | 1 | 2 | 3 | 4;

export type Person = {
  key: string;
  en: string;
  es: string;
  slot: Slot;
  third: boolean;
  plural: boolean;
  fem: boolean;
};

export const PERSONS: Person[] = [
  { key: "i", en: "I", es: "Yo", slot: 0, third: false, plural: false, fem: false },
  { key: "you", en: "You", es: "Tú", slot: 1, third: false, plural: false, fem: false },
  { key: "he", en: "He", es: "Él", slot: 2, third: true, plural: false, fem: false },
  { key: "she", en: "She", es: "Ella", slot: 2, third: true, plural: false, fem: true },
  { key: "it", en: "It", es: "Esto", slot: 2, third: true, plural: false, fem: false },
  { key: "we", en: "We", es: "Nosotros", slot: 3, third: false, plural: true, fem: false },
  { key: "they", en: "They", es: "Ellos", slot: 4, third: true, plural: true, fem: false },
];

export type Conjugation = { en: Segment[]; enFull: string; enAlt?: string; es: string };

// ---------- English ----------

function bePresent(p: Person) {
  if (p.key === "i") return "am";
  return p.third && !p.plural ? "is" : "are";
}
function bePast(p: Person) {
  return p.key === "i" || (p.third && !p.plural) ? "was" : "were";
}
function haveForm(p: Person) {
  return p.third && !p.plural ? "has" : "have";
}

// English chain: first word is the operator (moves in questions, takes "not").
type EnChain = { aux: string; rest: string[]; negAux?: string };

function enTenseChain(tense: TenseKey, p: Person, tail: string[]): EnChain {
  switch (tense) {
    case "present": return { aux: bePresent(p), rest: tail };
    case "past": return { aux: bePast(p), rest: tail };
    case "presentPerfect": return { aux: haveForm(p), rest: ["been", ...tail] };
    case "pastPerfect": return { aux: "had", rest: ["been", ...tail] };
  }
}

function enModalChain(modal: ModalKey, p: Person, tail: string[]): EnChain {
  const be = ["be", ...tail];
  switch (modal) {
    case "gonna": return { aux: bePresent(p), rest: ["gonna", ...be] };
    case "goingTo": return { aux: bePresent(p), rest: ["going to", ...be] };
    case "wanna": return { aux: "wanna", rest: be, negAux: p.third && !p.plural ? "does" : "do" };
    default: return { aux: modal, rest: be };
  }
}

function subjectLower(p: Person) {
  return p.key === "i" ? "I" : p.en.toLowerCase();
}

// Segment = piece of a sentence; hl=true pieces are colored (auxiliary chain), like the original app.
export type Segment = { t: string; hl?: boolean };

function buildEnglish(chain: EnChain, p: Person, form: Form): Segment[] {
  const last = chain.rest[chain.rest.length - 1];
  const mid = chain.rest.slice(0, -1).join(" ");
  const midHl = mid ? ` ${mid}` : "";
  const isWanna = chain.aux === "wanna" && chain.negAux;
  if (form === "affirmative") return [{ t: `${p.en} ` }, { t: `${chain.aux}${midHl}`, hl: true }, { t: ` ${last}.` }];
  if (form === "negative") {
    const neg = isWanna
      ? `${chain.negAux === "does" ? "doesn't" : "don't"} wanna`
      : chain.aux === "can" ? "cannot" : `${chain.aux} not`;
    return [{ t: `${p.en} ` }, { t: `${neg}${midHl}`, hl: true }, { t: ` ${last}.` }];
  }
  const op = isWanna ? chain.negAux! : chain.aux;
  const after = isWanna ? `wanna${midHl}` : mid;
  return [
    { t: cap(op), hl: true },
    { t: ` ${subjectLower(p)} ` },
    ...(after ? [{ t: after, hl: true }, { t: ` ${last}?` }] : [{ t: `${last}?` }]),
  ];
}

export const joinSegments = (s: Segment[]) => s.map((x) => x.t).join("");

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Spanish ----------

const ES_TENSE: Record<TenseKey, string[][]> = {
  present: [["soy"], ["eres"], ["es"], ["somos"], ["son"]],
  past: [["fui"], ["fuiste"], ["fue"], ["fuimos"], ["fueron"]],
  presentPerfect: [["he", "sido"], ["has", "sido"], ["ha", "sido"], ["hemos", "sido"], ["han", "sido"]],
  pastPerfect: [["había", "sido"], ["habías", "sido"], ["había", "sido"], ["habíamos", "sido"], ["habían", "sido"]],
};

const ES_MODAL: Record<ModalKey, { forms: string[]; ser: boolean; prefix?: string }> = {
  can: { forms: ["puedo", "puedes", "puede", "podemos", "pueden"], ser: true },
  could: { forms: ["podría", "podrías", "podría", "podríamos", "podrían"], ser: true },
  may: { forms: ["podría", "podrías", "podría", "podríamos", "podrían"], ser: true },
  might: { forms: ["podría", "podrías", "podría", "podríamos", "podrían"], ser: true, prefix: "quizás" },
  must: { forms: ["debo", "debes", "debe", "debemos", "deben"], ser: true },
  should: { forms: ["debería", "deberías", "debería", "deberíamos", "deberían"], ser: true },
  would: { forms: ["sería", "serías", "sería", "seríamos", "serían"], ser: false },
  will: { forms: ["seré", "serás", "será", "seremos", "serán"], ser: false },
  shall: { forms: ["seré", "serás", "será", "seremos", "serán"], ser: false },
  gonna: { forms: ["voy a", "vas a", "va a", "vamos a", "van a"], ser: true },
  goingTo: { forms: ["voy a", "vas a", "va a", "vamos a", "van a"], ser: true },
  wanna: { forms: ["quiero", "quieres", "quiere", "queremos", "quieren"], ser: true },
};

function agreeParticiple(pp: string, p: Person): string {
  // Only the final word agrees (e.g. "mal interpretado", "vendido a menor precio" keeps first word)
  const words = pp.split(" ");
  const idx = words.findIndex((w) => /(ado|ido|ído|cho|sto|to|rto)$/.test(w));
  const i = idx === -1 ? words.length - 1 : idx;
  let w = words[i];
  if (p.fem && w.endsWith("o")) w = w.slice(0, -1) + "a";
  if (p.plural) w = w + "s";
  words[i] = w;
  return words.join(" ");
}

function buildSpanish(verbs: string[], complement: string, p: Person, form: Form, splitAfterFirst: boolean, prefix?: string): string {
  const pre = prefix ? `${prefix} ` : "";
  if (form === "affirmative") return `${p.es} ${pre}${verbs.join(" ")} ${complement}`;
  if (form === "negative") return `${p.es} ${pre}no ${verbs.join(" ")} ${complement}`;
  const q = splitAfterFirst
    ? `${pre}${verbs[0]} ${p.es.toLowerCase()} ${[...verbs.slice(1), complement].join(" ")}`
    : `${pre}${verbs.join(" ")} ${p.es.toLowerCase()} ${complement}`;
  return `¿${cap(q.trim())}?`;
}

// Reflexive infinitives agree with the subject: disculparse → disculparme / disculparnos…
const REFLEXIVE = ["me", "te", "se", "nos", "se"];
function reflexive(es: string, p: Person): string {
  return es.replace(/(ar|er|ir|ír)se\b/, (_m, end) => `${end}${REFLEXIVE[p.slot]}`);
}

// ---------- Public API ----------

export type ConjugateInput = {
  module: ModuleId;
  mode: Mode;
  key: string; // TenseKey or ModalKey
  verb: Verb;
  person: Person;
  form: Form;
};

export function conjugate({ module, mode, key, verb, person, form }: ConjugateInput): Conjugation {
  const isBat = module === "bat";
  const enTail = isBat ? ["able to", verb.en] : [verb.pp];
  const chain = mode === "tense"
    ? enTenseChain(key as TenseKey, person, enTail)
    : enModalChain(key as ModalKey, person, enTail);
  const en = buildEnglish(chain, person, form);
  const enFull = joinSegments(en);

  let enAlt: string | undefined;
  if (isBat && form === "negative" && key !== "wanna") {
    const unableChain = { ...chain, rest: chain.rest.map((w) => (w === "able to" ? "unable to" : w)) };
    enAlt = joinSegments(buildEnglish(unableChain, person, "affirmative"));
  }

  const complement = isBat
    ? `${person.plural ? "capaces" : "capaz"} de ${reflexive(verb.es, person)}`
    : agreeParticiple(verb.esPp, person);

  let es: string;
  if (mode === "tense") {
    es = buildSpanish(ES_TENSE[key as TenseKey][person.slot], complement, person, form, false);
  } else {
    const m = ES_MODAL[key as ModalKey];
    const verbs = [...m.forms[person.slot].split(" "), ...(m.ser ? ["ser"] : [])];
    es = buildSpanish(verbs, complement, person, form, true, m.prefix);
  }
  return { en, enFull, enAlt, es: form === "interrogative" ? es : `${es}.` };
}
