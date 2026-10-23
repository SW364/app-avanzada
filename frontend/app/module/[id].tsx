import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, ScreenHeader } from "@/src/components/ui";
import { MODULES, isModuleId } from "@/src/data/curriculum";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  if (!isModuleId(id)) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Módulo" />
        <Text style={styles.empty} testID="module-not-found">Módulo no encontrado.</Text>
      </View>
    );
  }
  const m = MODULES[id];
  const modalSection = m.sections.find((s) => s.mode === "modal")!;
  const tenseSection = m.sections.find((s) => s.mode === "tense")!;

  const go = (mode: string, key: string) =>
    router.push({ pathname: "/conjugator", params: { module: id, mode, key } });

  return (
    <View style={styles.root} testID={`module-screen-${id}`}>
      <ScreenHeader title={m.title} subtitle={m.subtitle} testID="module-title" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        {/* M1.A — Modales */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <View style={styles.sectionHead}>
            <View style={[styles.code, { backgroundColor: colors.brandTertiary }]}>
              <Text style={styles.codeText}>{modalSection.code}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>{modalSection.title}</Text>
              <Text style={styles.sectionDesc}>Capítulo 1 · {modalSection.manualCode}</Text>
            </View>
          </View>
          <View style={[styles.formula, { backgroundColor: colors.modalTint }]}>
            <Text style={styles.formulaText} testID="modal-formula">{modalSection.formula}</Text>
          </View>
          <View style={styles.grid}>
            {m.modals.map((md) => (
              <PressableScale key={md.key} testID={`modal-option-${md.key}`} onPress={() => go("modal", md.key)} style={styles.modalCard}>
                <Text style={styles.modalLabel}>{md.label}</Text>
                <Text style={styles.modalEs} numberOfLines={1}>{md.es}</Text>
              </PressableScale>
            ))}
          </View>
        </Animated.View>

        {/* M2.A — 4 Tiempos */}
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <View style={[styles.sectionHead, { marginTop: spacing.xl }]}>
            <View style={[styles.code, { backgroundColor: colors.brandPrimary }]}>
              <Text style={styles.codeText}>{tenseSection.code}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>{tenseSection.title}</Text>
              <Text style={styles.sectionDesc}>{tenseSection.description}</Text>
            </View>
          </View>
          {m.chapters.map((ch) => {
            const isPresent = ch.tone === "present";
            return (
              <PressableScale
                key={ch.key}
                testID={`chapter-${ch.key}`}
                onPress={() => go("tense", ch.key)}
                style={[styles.chapter, { backgroundColor: isPresent ? colors.presentTint : colors.pastTint, borderColor: isPresent ? colors.brandPrimary : colors.brandSecondary }]}
              >
                <View style={styles.flex}>
                  <Text style={styles.chapterCap}>{ch.cap} · ({ch.manualCode})</Text>
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                  <Text style={styles.chapterFormula}>{ch.formula}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={32} color={isPresent ? colors.brandPrimary : colors.warning} />
              </PressableScale>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  flex: { flex: 1 },
  empty: { fontFamily: fonts.text, color: c.muted, padding: spacing.lg },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  code: { paddingHorizontal: spacing.md, height: 36, borderRadius: radius.md, justifyContent: "center" },
  codeText: { fontFamily: fonts.textBold, color: c.onBrand, fontSize: 15 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 26, color: c.brand, lineHeight: 30 },
  sectionDesc: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  formula: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md },
  formulaText: { fontFamily: fonts.textBold, color: c.onSurface, fontSize: 15, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  modalCard: {
    width: 104, minHeight: 64, padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surfaceSecondary,
    borderWidth: 1.5, borderColor: c.border, justifyContent: "center",
  },
  modalLabel: { fontFamily: fonts.textBold, fontSize: 16, color: c.onSurface },
  modalEs: { fontFamily: fonts.text, fontSize: 11, color: c.muted },
  chapter: {
    flexDirection: "row", alignItems: "center", marginHorizontal: spacing.lg, marginTop: spacing.md,
    padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2,
  },
  chapterCap: { fontFamily: fonts.textBold, fontSize: 12, color: c.muted },
  chapterTitle: { fontFamily: fonts.display, fontSize: 28, color: c.brand, lineHeight: 32 },
  chapterFormula: { fontFamily: fonts.textBold, fontSize: 14, color: c.onSurface },
}));
