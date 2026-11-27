// Web preview version of stt.ts (same API). Uses the browser Speech API when present;
// otherwise reports "unavailable". Native builds use src/utils/stt.ts (expo-speech-recognition).
import { useCallback, useRef, useState } from "react";

export type SttStatus = "idle" | "listening" | "unavailable" | "denied" | "blocked" | "error";

const MESSAGES: Record<string, string> = {
  unavailable: "Este navegador no tiene reconocimiento de voz. Puedes escribir o elegir tu respuesta.",
  denied: "Necesitamos el micrófono para escuchar tu respuesta. Toca el micrófono para intentarlo de nuevo.",
  blocked: "El micrófono está bloqueado en el navegador.",
  error: "No te escuché bien. Toca el micrófono e inténtalo de nuevo.",
};

export const sttMessage = (s: SttStatus) => MESSAGES[s] ?? "";
export const openAppSettings = () => {};

export function useSpeechToText(onFinal: (alternatives: string[]) => void) {
  const [status, setStatus] = useState<SttStatus>("idle");
  const [partial, setPartial] = useState("");
  const rec = useRef<any>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  const start = useCallback(async () => {
    setPartial("");
    const w = typeof window !== "undefined" ? (window as any) : undefined;
    const Ctor = w?.SpeechRecognition || w?.webkitSpeechRecognition;
    if (!Ctor) { setStatus("unavailable"); return; }
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = true;
    r.maxAlternatives = 5;
    r.onstart = () => setStatus("listening");
    r.onresult = (e: any) => {
      const res = e.results[e.results.length - 1];
      const alts: string[] = Array.from(res).map((a: any) => a.transcript).filter(Boolean);
      if (alts[0]) setPartial(alts[0]);
      if (res.isFinal && alts.length) { setStatus("idle"); finalRef.current(alts); }
    };
    r.onerror = (e: any) => setStatus(e.error === "not-allowed" ? "denied" : e.error === "aborted" ? "idle" : "error");
    r.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
    rec.current = r;
    try { r.start(); } catch { setStatus("unavailable"); }
  }, []);

  const stop = useCallback(() => { try { rec.current?.stop(); } catch { /* idle */ } }, []);
  const reset = useCallback(() => {
    try { rec.current?.abort(); } catch { /* idle */ }
    setPartial("");
    setStatus("idle");
  }, []);

  return { status, partial, start, stop, reset };
}
