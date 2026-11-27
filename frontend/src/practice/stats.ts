import { storage } from "@/src/utils/storage";

export type PracticeStats = { correct: number; total: number; streak: number; best: number };
const KEY = "practice.stats.v1";
export const EMPTY_STATS: PracticeStats = { correct: 0, total: 0, streak: 0, best: 0 };

export async function loadStats(): Promise<PracticeStats> {
  try {
    const raw = await storage.getItem<string>(KEY, "");
    return raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS;
  } catch {
    return EMPTY_STATS;
  }
}

export function recordResult(s: PracticeStats, ok: boolean): PracticeStats {
  const streak = ok ? s.streak + 1 : 0;
  const next = { correct: s.correct + (ok ? 1 : 0), total: s.total + 1, streak, best: Math.max(s.best, streak) };
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}
