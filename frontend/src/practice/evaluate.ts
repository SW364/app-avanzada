// Local answer evaluation: normalisation + word-level similarity. No server involved.

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, "i am"], [/\byou're\b/g, "you are"], [/\bwe're\b/g, "we are"], [/\bthey're\b/g, "they are"],
  [/\bhe's\b/g, "he is"], [/\bshe's\b/g, "she is"], [/\bit's\b/g, "it is"],
  [/\bi've\b/g, "i have"], [/\byou've\b/g, "you have"], [/\bwe've\b/g, "we have"], [/\bthey've\b/g, "they have"],
  [/\bisn't\b/g, "is not"], [/\baren't\b/g, "are not"], [/\bwasn't\b/g, "was not"], [/\bweren't\b/g, "were not"],
  [/\bhasn't\b/g, "has not"], [/\bhaven't\b/g, "have not"], [/\bhadn't\b/g, "had not"],
  [/\bcan't\b/g, "cannot"], [/\bwon't\b/g, "will not"], [/\bshouldn't\b/g, "should not"], [/\bwouldn't\b/g, "would not"],
  [/\bmustn't\b/g, "must not"], [/\bmightn't\b/g, "might not"], [/\bdon't\b/g, "do not"], [/\bdoesn't\b/g, "does not"],
  [/\bgonna\b/g, "going to"], [/\bwanna\b/g, "want to"], [/\bunable to\b/g, "not able to"], [/\bcan not\b/g, "cannot"],
];

export function normalize(text: string): string {
  let t = text.toLowerCase().replace(/[’`]/g, "'");
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  return t.replace(/[^a-z' ]+/g, " ").replace(/'/g, "").replace(/\s+/g, " ").trim();
}

function wordDistance(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export type Verdict = "correct" | "close" | "wrong";

export function similarity(heard: string, expected: string): number {
  const a = normalize(heard).split(" ").filter(Boolean);
  const b = normalize(expected).split(" ").filter(Boolean);
  if (!a.length || !b.length) return 0;
  return 1 - wordDistance(a, b) / Math.max(a.length, b.length);
}

// Compares every recognised alternative against every accepted answer and keeps the best.
export function evaluate(heard: string[], accepted: string[]): { verdict: Verdict; score: number; best: string } {
  let score = 0;
  let best = heard[0] ?? "";
  for (const h of heard) {
    for (const ans of accepted) {
      const s = similarity(h, ans);
      if (s > score) { score = s; best = h; }
    }
  }
  const verdict: Verdict = score >= 0.999 ? "correct" : score >= 0.7 ? "close" : "wrong";
  return { verdict, score, best };
}
