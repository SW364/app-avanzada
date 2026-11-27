// Web preview version of tts.ts (same API). Uses the browser's built-in speech synthesis,
// so the Emergent web preview works without the native expo-speech module.
// On Android/iOS the native file src/utils/tts.ts (expo-speech) is used instead.
export type SpeechStatus = "idle" | "loading" | "playing" | "error";
type Listener = (status: SpeechStatus, id: string | null) => void;

const listeners = new Set<Listener>();
let currentId: string | null = null;
const emit = (s: SpeechStatus, id: string | null) => listeners.forEach((l) => l(s, id));

export function subscribeSpeech(l: Listener) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export async function speak(text: string, id: string) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) { emit("error", id); return; }
  synth.cancel();
  currentId = id;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  u.onstart = () => emit("playing", id);
  u.onend = () => { if (currentId === id) { currentId = null; emit("idle", null); } };
  u.onerror = () => { if (currentId === id) { currentId = null; emit("idle", null); } };
  emit("loading", id);
  synth.speak(u);
}

export function stopSpeech() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  currentId = null;
  emit("idle", null);
}

export function prefetchSpeech(_texts: string[]) { /* not needed */ }
export const speakingId = () => currentId;
