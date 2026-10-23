// Verb catalogs from the official CalcuVerbs manuals (Voz Pasiva / BAT).
// Format: "base|simple past|past participle|español (infinitivo)|participio ES (opcional)"

export type VerbGroup = "M2.A" | "M3.A" | "M4.A";

export type Verb = {
  id: string;
  en: string;
  past: string;
  pp: string;
  es: string;
  esPp: string;
  group: VerbGroup;
};

export const VERB_GROUPS: { id: VerbGroup; label: string; hint: string }[] = [
  { id: "M2.A", label: "M2.A", hint: "Irregulares (misma forma)" },
  { id: "M3.A", label: "M3.A", hint: "Regulares (-ed)" },
  { id: "M4.A", label: "M4.A", hint: "Irregulares" },
];

const M2A = [
  "bet|bet|bet|apostar",
  "broadcast|broadcast|broadcast|transmitir",
  "burst|burst|burst|estallar",
  "cut|cut|cut|cortar",
  "cost|cost|cost|costar",
  "cast|cast|cast|lanzar",
  "fit|fit|fit|encajar",
  "forecast|forecast|forecast|pronosticar",
  "hit|hit|hit|pegar",
  "hurt|hurt|hurt|herir",
  "let|let|let|dejar",
  "miscast|miscast|miscast|interpretar mal|mal interpretado",
  "offset|offset|offset|compensar",
  "put|put|put|poner",
  "quit|quit|quit|renunciar",
  "recast|recast|recast|refundir",
  "reset|reset|reset|reiniciar",
  "retrofit|retrofit|retrofit|reacondicionar",
  "set|set|set|colocar",
  "shed|shed|shed|derramar",
  "shut|shut|shut|cerrar",
  "slide|slid|slid|deslizar",
  "split|split|split|separar",
  "sublet|sublet|sublet|subarrendar",
  "spread|spread|spread|untar",
  "typecast|typecast|typecast|encasillar",
  "undercut|undercut|undercut|vender a menor precio|vendido a menor precio",
  "upset|upset|upset|disgustar",
  "wed|wed|wed|casarse",
  "wet|wet|wet|mojar",
];

const M3A = [
  "act|acted|acted|actuar",
  "add|added|added|sumar",
  "ask|asked|asked|preguntar",
  "answer|answered|answered|responder",
  "arrive|arrived|arrived|llegar",
  "brush|brushed|brushed|cepillar",
  "belong|belonged|belonged|pertenecer",
  "beg|begged|begged|suplicar",
  "believe|believed|believed|creer",
  "close|closed|closed|cerrar",
  "cook|cooked|cooked|cocinar",
  "call|called|called|llamar",
  "change|changed|changed|cambiar",
  "charge|charged|charged|cargar",
  "clean|cleaned|cleaned|limpiar",
  "cry|cried|cried|llorar",
  "dance|danced|danced|bailar",
  "dress|dressed|dressed|vestir",
  "die|died|died|morir",
  "dry|dried|dried|secar",
  "enjoy|enjoyed|enjoyed|disfrutar",
  "explain|explained|explained|explicar",
  "follow|followed|followed|seguir",
  "finish|finished|finished|terminar",
  "help|helped|helped|ayudar",
  "hope|hoped|hoped|desear",
  "happen|happened|happened|suceder",
  "imagine|imagined|imagined|imaginar",
  "kiss|kissed|kissed|besar",
  "kill|killed|killed|matar",
  "laugh|laughed|laughed|reír",
  "like|liked|liked|gustar",
  "look|looked|looked|mirar",
  "miss|missed|missed|extrañar",
  "marry|married|married|casarse",
  "open|opened|opened|abrir",
  "play|played|played|jugar",
  "prefer|preferred|preferred|preferir",
  "promise|promised|promised|prometer",
  "repeat|repeated|repeated|repetir",
  "rain|rained|rained|llover",
  "remember|remembered|remembered|recordar",
  "smile|smiled|smiled|sonreír",
  "study|studied|studied|estudiar",
  "smoke|smoked|smoked|fumar",
  "stop|stopped|stopped|detener",
  "talk|talked|talked|conversar",
  "thank|thanked|thanked|agradecer",
  "touch|touched|touched|tocar",
  "use|used|used|usar",
  "visit|visited|visited|visitar",
  "wait|waited|waited|esperar",
  "want|wanted|wanted|querer",
  "walk|walked|walked|caminar",
  "wash|washed|washed|lavar",
  "watch|watched|watched|observar",
  "wish|wished|wished|desear",
  "work|worked|worked|trabajar",
];

const M4A = [
  "be|was / were|been|ser",
  "awake|awoke|awoken|despertar",
  "become|became|become|convertirse",
  "bite|bit|bitten|morder",
  "break|broke|broken|romper",
  "bring|brought|brought|traer",
  "buy|bought|bought|comprar",
  "creep|crept|crept|arrastrarse",
  "do|did|done|hacer",
  "drink|drank|drunk|beber",
  "eat|ate|eaten|comer",
  "feel|felt|felt|sentir",
  "fly|flew|flown|volar",
  "forget|forgot|forgotten|olvidar",
  "go|went|gone|ir",
  "have|had|had|tener",
  "hear|heard|heard|oír",
  "know|knew|known|conocer",
  "lay|laid|laid|poner",
  "learn|learned|learned|aprender",
  "leave|left|left|dejar",
  "light|lit|lit|encender",
  "lose|lost|lost|perder",
  "make|made|made|hacer",
  "pay|paid|paid|pagar",
  "ring|rang|rung|llamar",
  "run|ran|run|correr",
  "say|said|said|decir",
  "see|saw|seen|ver",
  "sell|sold|sold|vender",
  "send|sent|sent|enviar",
  "shake|shook|shaken|sacudir",
  "sing|sang|sung|cantar",
  "sleep|slept|slept|dormir",
  "smell|smelt|smelt|oler",
  "spend|spent|spent|gastar",
  "steal|stole|stolen|robar",
  "strike|struck|struck|golpear",
  "swim|swam|swum|nadar",
  "teach|taught|taught|enseñar",
  "understand|understood|understood|entender",
  "win|won|won|ganar",
];

const IRREGULAR_ES: Record<string, string> = {
  hacer: "hecho",
  decir: "dicho",
  ver: "visto",
  poner: "puesto",
  romper: "roto",
  abrir: "abierto",
  morir: "muerto",
  escribir: "escrito",
  volver: "vuelto",
  cubrir: "cubierto",
};

// Spanish past participle (masculine singular) from an infinitive.
export function spanishParticiple(infinitive: string): string {
  let inf = infinitive.toLowerCase().trim();
  if (inf.endsWith("se") && /(ar|er|ir|ír)se$/.test(inf)) inf = inf.slice(0, -2);
  if (IRREGULAR_ES[inf]) return IRREGULAR_ES[inf];
  if (inf.endsWith("ar")) return inf.slice(0, -2) + "ado";
  const stem = inf.slice(0, -2);
  return /[aeo]$/.test(stem) ? stem + "ído" : stem + "ido";
}

function parse(list: string[], group: VerbGroup): Verb[] {
  return list.map((row) => {
    const [en, past, pp, es, esPp] = row.split("|");
    return { id: `${group}-${en}`, en, past, pp, es, esPp: esPp ?? spanishParticiple(es), group };
  });
}

export const VERBS: Verb[] = [...parse(M2A, "M2.A"), ...parse(M3A, "M3.A"), ...parse(M4A, "M4.A")];

export function findVerb(id?: string): Verb | undefined {
  return VERBS.find((v) => v.id === id);
}
