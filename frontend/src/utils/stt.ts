// Local speech-to-text helper (expo-speech-recognition). Uses the phone's own recognition
// service; prefers on-device (offline) recognition when the device supports it.
// Never throws: unsupported devices / emulators / denied permission become a friendly status.
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useRef, useState } from "react";
import { Linking } from "react-native";

export type SttStatus = "idle" | "listening" | "unavailable" | "denied" | "blocked" | "error";

const MESSAGES: Record<string, string> = {
  unavailable: "Este dispositivo no tiene reconocimiento de voz disponible. Puedes escribir o elegir tu respuesta.",
  denied: "Necesitamos el micrófono para escuchar tu respuesta. Toca el micrófono para intentarlo de nuevo.",
  blocked: "El micrófono está bloqueado. Actívalo en Ajustes para practicar hablando.",
  error: "No te escuché bien. Toca el micrófono e inténtalo de nuevo.",
};

export const sttMessage = (s: SttStatus) => MESSAGES[s] ?? "";
export const openAppSettings = () => Linking.openSettings().catch(() => {});

function isAvailable(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

function supportsOffline(): boolean {
  try {
    return ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
  } catch {
    return false;
  }
}

export function useSpeechToText(onFinal: (alternatives: string[]) => void) {
  const [status, setStatus] = useState<SttStatus>("idle");
  const [partial, setPartial] = useState("");
  const triedOffline = useRef(false);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  useSpeechRecognitionEvent("start", () => setStatus("listening"));
  useSpeechRecognitionEvent("end", () => setStatus((s) => (s === "listening" ? "idle" : s)));
  useSpeechRecognitionEvent("result", (e) => {
    const alts = (e.results ?? []).map((r) => r.transcript).filter(Boolean);
    if (alts[0]) setPartial(alts[0]);
    if (e.isFinal && alts.length) {
      setStatus("idle");
      finalRef.current(alts);
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    // Offline language pack missing → retry once with the device's normal service.
    if (triedOffline.current && (e.error === "language-not-supported" || e.error === "network")) {
      triedOffline.current = false;
      startRecognition(false);
      return;
    }
    if (e.error === "aborted") { setStatus("idle"); return; }
    if (e.error === "not-allowed") { setStatus("denied"); return; }
    if (e.error === "service-not-allowed") { setStatus("unavailable"); return; }
    setStatus(e.error === "no-speech" || e.error === "speech-timeout" ? "error" : "error");
  });

  const startRecognition = (offline: boolean) => {
    try {
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 5,
        continuous: false,
        requiresOnDeviceRecognition: offline,
        addsPunctuation: false,
      });
    } catch {
      setStatus("unavailable");
    }
  };

  const start = useCallback(async () => {
    setPartial("");
    if (!isAvailable()) { setStatus("unavailable"); return; }
    try {
      let perm = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      if (!perm.granted) {
        if (!perm.canAskAgain) { setStatus("blocked"); return; }
        perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!perm.granted) { setStatus(perm.canAskAgain ? "denied" : "blocked"); return; }
      }
      const offline = supportsOffline();
      triedOffline.current = offline;
      startRecognition(offline);
    } catch {
      setStatus("unavailable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    try { ExpoSpeechRecognitionModule.stop(); } catch { /* not running */ }
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  const reset = useCallback(() => {
    try { ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ }
    setPartial("");
    setStatus("idle");
  }, []);

  return { status, partial, start, stop, reset };
}
