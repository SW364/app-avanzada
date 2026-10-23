import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CVLogo, PressableScale } from "@/src/components/ui";
import { MODULES, type ModuleId } from "@/src/data/curriculum";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Home() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const cards: { id: ModuleId; icon: "swap-horizontal" | "flash"; accent: string; tint: string }[] = [
    { id: "passive", icon: "swap-horizontal", accent: colors.brandPrimary, tint: colors.presentTint },
    { id: "bat", icon: "flash", accent: colors.brandTertiary, tint: colors.modalTint },
  ];

  return (
    <View style={styles.root} testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <CVLogo size={84} />
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Conjugación Avanzada</Text>
            <Text style={styles.title} testID="home-title">CalcuVerbs Advanced</Text>
            <Text style={styles.lead}>Verbos del idioma Inglés · Español</Text>
          </View>
        </Animated.View>

        <Text style={styles.section}>Elige un módulo</Text>

        {cards.map((c, i) => {
          const m = MODULES[c.id];
          return (
            <Animated.View key={c.id} entering={FadeInDown.delay(120 + i * 100).duration(400)}>
              <PressableScale testID={`home-module-${c.id}`} onPress={() => router.push(`/module/${c.id}`)} style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: c.tint }]}>
                  <Ionicons name={c.icon} size={28} color={c.accent} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{m.title}</Text>
                  <Text style={styles.cardSub}>{m.subtitle}</Text>
                  <Text style={styles.cardDesc}>{m.description}</Text>
                  <View style={styles.tags}>
                    {m.sections.map((s) => (
                      <View key={s.code} style={[styles.tag, { backgroundColor: s.mode === "modal" ? colors.modalTint : colors.pastTint }]}>
                        <Text style={styles.tagText}>{s.code} · {s.mode === "modal" ? "Modales" : "4 Tiempos"}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.borderStrong} />
              </PressableScale>
            </Animated.View>
          );
        })}

        <View style={styles.note}>
          <Ionicons name="book-outline" size={18} color={colors.brand} />
          <Text style={styles.noteText}>Basado en los manuales oficiales CalcuVerbs: Voz Pasiva (Partes 1 y 2) y BAT (Be able to).</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  hero: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, gap: spacing.lg },
  heroText: { flex: 1 },
  kicker: { fontFamily: fonts.textBold, fontSize: 12, color: c.brandPrimary, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: fonts.display, fontSize: 40, color: c.brand, lineHeight: 44 },
  lead: { fontFamily: fonts.text, fontSize: 14, color: c.muted },
  section: { fontFamily: fonts.display, fontSize: 28, color: c.brand, paddingHorizontal: spacing.lg, marginTop: spacing.xxl, marginBottom: spacing.sm },
  card: {
    marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: c.surfaceSecondary, flexDirection: "row", alignItems: "center", gap: spacing.md,
    borderWidth: 1, borderColor: c.border,
    shadowColor: c.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardIcon: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.textBold, fontSize: 20, color: c.onSurface },
  cardSub: { fontFamily: fonts.text, fontSize: 13, color: c.brandPrimary },
  cardDesc: { fontFamily: fonts.text, fontSize: 13, color: c.muted, marginTop: spacing.xs },
  tags: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  tagText: { fontFamily: fonts.textBold, fontSize: 11, color: c.onSurface },
  note: {
    flexDirection: "row", gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.md,
    borderRadius: radius.md, backgroundColor: c.pastTint,
  },
  noteText: { flex: 1, fontFamily: fonts.text, fontSize: 13, color: c.onSurface },
}));
