import { storage } from "@/src/utils/storage";

// Local progress: XP + levels, daily goal, rounds of 10 and streaks. No server.
export const DAILY_GOAL = 15;
export const ROUND_SIZE = 10;
export const XP_PER_LEVEL = 100;

export type PracticeStats = {
  correct: number; total: number; streak: number; best: number;
  xp: number; day: string; today: number; todayCorrect: number;
  round: ("correct" | "close" | "wrong")[]; roundsDone: number; bestRound: number;
};

const KEY = "practice.stats.v2";
const todayKey = () => new Date().toISOString().slice(0, 10);

export const EMPTY_STATS: PracticeStats = {
  correct: 0, total: 0, streak: 0, best: 0, xp: 0, day: todayKey(), today: 0, todayCorrect: 0,
  round: [], roundsDone: 0, bestRound: 0,
};

function rollDay(s: PracticeStats): PracticeStats {
  return s.day === todayKey() ? s : { ...s, day: todayKey(), today: 0, todayCorrect: 0 };
}

export async function loadStats(): Promise<PracticeStats> {
  try {
    const raw = await storage.getItem<string>(KEY, "");
    return rollDay(raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS);
  } catch {
    return EMPTY_STATS;
  }
}

const XP = { correct: 10, close: 4, wrong: 1 } as const;

export function recordResult(prev: PracticeStats, verdict: "correct" | "close" | "wrong"): PracticeStats {
  const s = rollDay(prev);
  const ok = verdict === "correct";
  const streak = ok ? s.streak + 1 : 0;
  const bonus = ok && streak > 0 && streak % 5 === 0 ? 10 : 0; // streak bonus every 5
  const round = s.round.length >= ROUND_SIZE ? [verdict] : [...s.round, verdict];
  const next: PracticeStats = {
    ...s,
    correct: s.correct + (ok ? 1 : 0), total: s.total + 1, streak, best: Math.max(s.best, streak),
    xp: s.xp + XP[verdict] + bonus, today: s.today + 1, todayCorrect: s.todayCorrect + (ok ? 1 : 0), round,
  };
  if (round.length === ROUND_SIZE) {
    const score = round.filter((r) => r === "correct").length;
    next.roundsDone = s.roundsDone + 1;
    next.bestRound = Math.max(s.bestRound, score);
  }
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function startNewRound(s: PracticeStats): PracticeStats {
  const next = { ...s, round: [] };
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}

export const levelOf = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const TITLES = ["Principiante", "Aprendiz", "Explorador", "Avanzado", "Experto", "Maestro CalcuVerbs"];
export const levelTitle = (lvl: number) => TITLES[Math.min(lvl - 1, TITLES.length - 1)];
