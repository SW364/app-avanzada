import * as Speech from "expo-speech";

export type SpeechStatus = "idle" | "loading" | "playing" | "error";
type Listener = (status: SpeechStatus, id: string | null) => void;

const listeners = new Set<Listener>();
let currentId: string | null = null;
let voice: string | undefined;
let checkedVoice = false;
let seq = 0;

function emit(status: SpeechStatus, id: string | null) {
  listeners.forEach((l) => l(status, id));
}

export function subscribeSpeech(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

async function pickEnglishVoice(): Promise<string | undefined> {
  if (checkedVoice) return voice;
  checkedVoice = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const normalized = voices.map((v) => ({
      ...v,
      normLang: (v.language || "").toLowerCase().replace("_", "-"),
    }));

    const selected =
      normalized.find((v) => v.normLang.startsWith("en-us")) ??
      normalized.find((v) => v.normLang.startsWith("en"));

    voice = selected?.identifier;
  } catch {
    voice = undefined;
  }
  return voice;
}

export async function speak(text: string, id: string) {
  const mySeq = ++seq;
  Speech.stop();
  currentId = id;
  emit("loading", id);

  try {
    const selectedVoice = await pickEnglishVoice();
    if (mySeq !== seq) return;

    Speech.speak(text, {
      language: "en-US",
      voice: selectedVoice,
      rate: 0.9,
      pitch: 1.0,
      onStart: () => {
        if (mySeq === seq && currentId === id) {
          emit("playing", id);
        }
      },
      onDone: () => {
        if (mySeq === seq && currentId === id) {
          currentId = null;
          emit("idle", null);
        }
      },
      onStopped: () => {
        if (mySeq === seq) {
          if (currentId === id) currentId = null;
          emit("idle", null);
        }
      },
      onError: () => {
        if (mySeq === seq) {
          currentId = null;
          emit("error", id);
        }
      },
    });
  } catch {
    if (mySeq === seq) {
      currentId = null;
      emit("error", id);
    }
  }
}

export function stopSpeech() {
  seq++;
  Speech.stop();
  currentId = null;
  emit("idle", null);
}

export function prefetchSpeech(_texts: string[]) {
  // No necesario con el motor nativo del teléfono
}

export const speakingId = () => currentId;