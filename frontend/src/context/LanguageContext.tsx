import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { storage } from "@/src/utils/storage";

// Display mode, same menu as the original CalcuVerbs:
// "en" = only English sentence, "mixed" = English → Español reference.
export type DisplayMode = "en" | "mixed";

type Ctx = { mode: DisplayMode; setMode: (m: DisplayMode) => void };
const LanguageContext = createContext<Ctx>({ mode: "mixed", setMode: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DisplayMode>("mixed");

  useEffect(() => {
    storage.getItem<string>("displayMode", "mixed").then((v) => {
      if (v === "en" || v === "mixed") setModeState(v);
    });
  }, []);

  const setMode = (m: DisplayMode) => {
    setModeState(m);
    storage.setItem("displayMode", m);
  };

  return <LanguageContext.Provider value={{ mode, setMode }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
