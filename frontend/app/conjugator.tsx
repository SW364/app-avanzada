import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChipRow, PressableScale, ScreenHeader, SectionLabel } from "@/src/components/ui";
import { VerbSheet } from "@/src/components/VerbSheet";
import { MODULES, isModuleId, type Mode } from "@/src/data/curriculum";
import { findVerb } from "@/src/data/verbs";
import { FORMS, PERSONS, conjugate, type Form } from "@/src/logic/conjugate";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Conjugator() {
  const params = useLocalSearchParams<{ module: string; mode: string; key: string }>();
  const moduleId = isModuleId(params.module) ? params.module : "passive";
  const mode: Mode = params.mode === "modal" ? "modal" : "tense";
  const m = MODULES[moduleId];
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const options = mode === "modal"
    ? m.modals.map((o) => ({ key: o.key, label: o.label, sub: o.es }))
    : m.chapters.map((c) => ({ key: c.key, label: c.title }));
  const [key, setKey] = useState(options.some((o) => o.key === params.key) ? params.key : options[0].key);
  const [personKey, setPersonKey] = useState("i");
  const [form, setForm] = useState<Form>("affirmative");
  const [verbId, setVerbId] = useState(m.defaultVerb);
  const [sheet, setSheet] = useState(false);

  const verb = findVerb(verbId)!;
  const person = PERSONS.find((p) => p.key === personKey)!;
  const chapter = m.chapters.find((c) => c.key === key);
  const section = m.sections.find((s) => s.mode === mode)!;
  const modalOpt = m.modals.find((o) => o.key === key);

  const formula = mode === "tense" ? chapter!.formula : section.formula.replace("Modal", modalOpt!.label);
  const tone = mode === "modal" ? "modal" : chapter!.tone;
  const tint = tone === "modal" ? colors.modalTint : tone === "present" ? colors.presentTint : colors.pastTint;
  const accent = tone === "modal" ? colors.brandTertiary : tone === "present" ? colors.brandPrimary : colors.warning;

  const result = useMemo(
    () => conjugate({ module: moduleId, mode, key, verb, person, form }),
    [moduleId, mode, key, verb, person, form],
  );

  const headerSub = mode === "tense"
    ? `${section.code} · ${chapter!.cap} (${chapter!.manualCode})`
    : `${section.code} · Capítulo 1 (${section.manualCode})`;

  return (
    <View style={styles.root} testID="conjugator-screen">
      <ScreenHeader title={`${m.title} · ${mode === "modal" ? "Modales" : "Tiempos"}`} subtitle={headerSub} testID="conjugator-title" />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SectionLabel>{mode === "modal" ? "Modal / Auxiliar" : "Tiempo verbal"}</SectionLabel>
        <ChipRow items={options} value={key} onChange={setKey} testPrefix="option" activeColor={accent} />

        <View style={[styles.formula, { backgroundColor: tint, borderColor: accent }]}>
          <Text style={styles.formulaLabel}>Estructura</Text>
          <Text style={styles.formulaText} testID="conjugator-formula">{formula}</Text>
        </View>

        <SectionLabel>Persona / Pronombre</SectionLabel>
        <ChipRow
          items={PERSONS.map((p) => ({ key: p.key, label: p.en, sub: p.es }))}
          value={personKey}
          onChange={setPersonKey}
          testPrefix="person"
        />

        <SectionLabel>Verbo</SectionLabel>
        <PressableScale testID="verb-selector-button" onPress={() => setSheet(true)} style={styles.verbBtn}>
          <View style={styles.verbBadge}><Text style={styles.verbBadgeText}>{verb.group}</Text></View>
          <View style={styles.flex}>
            <Text style={styles.verbEn} testID="selected-verb">{verb.en} · {verb.past} · {verb.pp}</Text>
            <Text style={styles.verbEs}>{verb.es}</Text>
          </View>
          <Ionicons name="chevron-down" size={22} color={colors.brand} />
        </PressableScale>

        <SectionLabel>Forma</SectionLabel>
        <View style={styles.segment}>
          {FORMS.map((f) => {
            const sel = f.key === form;
            return (
              <PressableScale
                key={f.key}
                testID={`form-${f.key}`}
                onPress={() => setForm(f.key)}
                containerStyle={styles.flex}
                style={[styles.segBtn, sel ? styles.segSel : null]}
              >
                <Text style={[styles.segText, sel ? styles.segTextSel : null]} numberOfLines={1}>{f.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        <Animated.View key={`${key}-${personKey}-${form}-${verbId}`} entering={FadeIn.duration(250)} style={styles.result} testID="result-card">
          <View style={styles.lang}>
            <Text style={styles.flag}>EN</Text>
            <Text style={styles.langLabel}>Inglés</Text>
          </View>
          <Text style={styles.en} testID="result-english">{result.en}</Text>
          {result.enAlt ? <Text style={styles.alt} testID="result-english-alt">También: {result.enAlt}</Text> : null}
          <View style={styles.divider} />
          <View style={styles.lang}>
            <Text style={[styles.flag, styles.flagEs]}>ES</Text>
            <Text style={styles.langLabel}>Español</Text>
          </View>
          <Text style={styles.es} testID="result-spanish">{result.es}</Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PressableScale
          testID="view-full-table-button"
          onPress={() => router.push({ pathname: "/table", params: { module: moduleId, mode, key, verb: verbId } })}
          style={styles.cta}
        >
          <Ionicons name="grid-outline" size={20} color={colors.onBrand} />
          <Text style={styles.ctaText}>Ver tabla completa</Text>
        </PressableScale>
      </View>

      <VerbSheet visible={sheet} selectedId={verbId} onSelect={(v) => setVerbId(v.id)} onClose={() => setSheet(false)} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  flex: { flex: 1 },
  formula: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md, borderLeftWidth: 4 },
  formulaLabel: { fontFamily: fonts.textBold, fontSize: 11, color: c.muted, textTransform: "uppercase", letterSpacing: 1 },
  formulaText: { fontFamily: fonts.textBold, fontSize: 16, color: c.onSurface },
  verbBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.sm,
    minHeight: 64, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: c.surfaceSecondary,
    borderWidth: 1.5, borderColor: c.border,
  },
  verbBadge: { backgroundColor: c.pastTint, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  verbBadgeText: { fontFamily: fonts.textBold, fontSize: 12, color: c.onBrandSecondary },
  verbEn: { fontFamily: fonts.textBold, fontSize: 16, color: c.onSurface },
  verbEs: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  segment: {
    flexDirection: "row", marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.xs,
    borderRadius: radius.pill, backgroundColor: c.surfaceTertiary, gap: spacing.xs,
  },
  segBtn: { height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm },
  segSel: { backgroundColor: c.brand },
  segText: { fontFamily: fonts.textBold, fontSize: 13, color: c.onSurface },
  segTextSel: { color: c.onBrand },
  result: {
    marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: c.surfaceSecondary, borderWidth: 2, borderColor: c.brand,
    shadowColor: c.shadow, shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  lang: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flag: {
    fontFamily: fonts.textBold, fontSize: 11, color: c.onBrandPrimary, backgroundColor: c.brandPrimary,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, overflow: "hidden",
  },
  flagEs: { backgroundColor: c.brandSecondary, color: c.onBrandSecondary },
  langLabel: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
  en: { fontFamily: fonts.textBold, fontSize: 24, color: c.brand, marginTop: spacing.sm },
  alt: { fontFamily: fonts.text, fontSize: 14, color: c.muted, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: c.border, marginVertical: spacing.md },
  es: { fontFamily: fonts.text, fontSize: 21, color: c.onSurface, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border },
  cta: {
    height: 56, borderRadius: radius.pill, backgroundColor: c.brand, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: spacing.sm,
  },
  ctaText: { fontFamily: fonts.textBold, fontSize: 16, color: c.onBrand },
}));
