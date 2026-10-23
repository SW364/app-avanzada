import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChipRow, ScreenHeader } from "@/src/components/ui";
import { MODULES, isModuleId, type Mode } from "@/src/data/curriculum";
import { findVerb } from "@/src/data/verbs";
import { FORMS, PERSONS, conjugate, type Form } from "@/src/logic/conjugate";
import { fonts, makeStyles, radius, spacing } from "@/src/theme";

export default function TableScreen() {
  const params = useLocalSearchParams<{ module: string; mode: string; key: string; verb: string }>();
  const moduleId = isModuleId(params.module) ? params.module : "passive";
  const mode: Mode = params.mode === "modal" ? "modal" : "tense";
  const m = MODULES[moduleId];
  const verb = findVerb(params.verb) ?? findVerb(m.defaultVerb)!;
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<Form>("affirmative");

  const label = mode === "modal"
    ? m.modals.find((o) => o.key === params.key)?.label ?? params.key
    : m.chapters.find((c) => c.key === params.key)?.title ?? params.key;

  return (
    <View style={styles.root} testID="table-screen">
      <ScreenHeader title={`Tabla · ${label}`} subtitle={`${m.title} · ${verb.en} (${verb.pp}) — ${verb.es}`} testID="table-title" />
      <ChipRow items={FORMS.map((f) => ({ key: f.key, label: f.label }))} value={form} onChange={(k) => setForm(k as Form)} testPrefix="table-form" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.table}>
          <View style={styles.headRow}>
            <Text style={[styles.th, styles.colP]}>Persona</Text>
            <Text style={[styles.th, styles.colT]}>Inglés / Español</Text>
          </View>
          {PERSONS.map((p, i) => {
            const r = conjugate({ module: moduleId, mode, key: params.key, verb, person: p, form });
            return (
              <View key={p.key} style={[styles.row, i % 2 ? styles.rowAlt : null]} testID={`table-row-${p.key}`}>
                <View style={styles.colP}>
                  <Text style={styles.pEn}>{p.en}</Text>
                  <Text style={styles.pEs}>{p.es}</Text>
                </View>
                <View style={styles.colT}>
                  <Text style={styles.en} testID={`table-en-${p.key}`}>{r.en}</Text>
                  {r.enAlt ? <Text style={styles.alt}>{r.enAlt}</Text> : null}
                  <Text style={styles.es} testID={`table-es-${p.key}`}>{r.es}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  table: { marginHorizontal: spacing.lg, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceSecondary },
  headRow: { flexDirection: "row", backgroundColor: c.brand, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  th: { fontFamily: fonts.textBold, color: c.onBrand, fontSize: 13 },
  row: { flexDirection: "row", paddingVertical: spacing.md, paddingHorizontal: spacing.md, alignItems: "center" },
  rowAlt: { backgroundColor: c.surfaceTertiary },
  colP: { width: 84 },
  colT: { flex: 1 },
  pEn: { fontFamily: fonts.textBold, fontSize: 16, color: c.brand },
  pEs: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
  en: { fontFamily: fonts.textBold, fontSize: 16, color: c.onSurface },
  alt: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  es: { fontFamily: fonts.text, fontSize: 15, color: c.brandPrimary, marginTop: 2 },
}));
