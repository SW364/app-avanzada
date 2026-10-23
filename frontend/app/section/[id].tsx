import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MODULES, isModuleId } from "@/src/data/curriculum";
import { PRACTICES, type PracticeDef } from "@/src/data/practice";
import { VERB_GROUPS } from "@/src/data/verbs";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const SUBSECTIONS = [
  { key: "AA" as const, title: "A · Auxiliar Avanzado (AA)" },
  { key: "AB" as const, title: "B · Verbo To Be Avanzado (AB)" },
];

export default function SectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const moduleId = isModuleId(id) ? id : "passive";
  const m = MODULES[moduleId];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const list = PRACTICES.filter((p) => p.module === moduleId);

  const renderCard = (p: PracticeDef) => {
    const color = colors[p.color] as string;
    const catalog = VERB_GROUPS.find((g) => g.id === p.verbGroups[0])?.label ?? "";
    return (
      <Pressable
        key={p.id}
        testID={`module-${p.id}`}
        onPress={() => router.push(`/practice/${p.id}`)}
        style={({ pressed }) => [styles.cardModule, { backgroundColor: colors[p.bg] as string }, pressed && styles.pressed]}
      >
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Ionicons name={p.icon} size={22} color={colors.onBrand} />
        </View>
        <Text style={[styles.moduleCode, { color }]}>{p.code}</Text>
        <Text style={styles.moduleTitle} numberOfLines={2}>{p.title}</Text>
        <Text style={styles.moduleFormula} numberOfLines={3}>{p.formula}</Text>
        <View style={styles.footerRow}>
          <View style={styles.hPill}><Text style={[styles.hPillText, { color }]}>{`Verbos ${catalog}`}</Text></View>
          <View style={styles.flex} />
          <Ionicons name="chevron-forward" size={18} color={color} />
        </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.flex} testID={`section-screen-${moduleId}`}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.roundBtn}
            testID="back-button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
        </View>
        <Text style={styles.title} testID="section-title">{m.title}</Text>
        <Text style={styles.subtitle}>{m.subtitle}</Text>

        {moduleId === "passive" ? (
          SUBSECTIONS.map((sub) => (
            <View key={sub.key}>
              <Text style={styles.groupTitle} testID={`subsection-${sub.key}`}>{sub.title}</Text>
              <View style={styles.grid}>{list.filter((p) => p.subsection === sub.key).map(renderCard)}</View>
            </View>
          ))
        ) : (
          <View style={[styles.grid, styles.gridTop]}>{list.map(renderCard)}</View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  roundBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center",
    shadowColor: c.shadow, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 30, color: c.ink, textAlign: "center" },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: c.inkSoft, textAlign: "center", marginTop: 2 },
  groupTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: c.ink, marginTop: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridTop: { marginTop: spacing.md },
  cardModule: { width: "48%", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, minHeight: 190 },
  pressed: { transform: [{ scale: 0.97 }] },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  moduleCode: { fontFamily: fonts.extrabold, fontSize: 22 },
  moduleTitle: { fontFamily: fonts.bold, fontSize: 14, color: c.ink, marginTop: 2 },
  moduleFormula: { fontFamily: fonts.semibold, fontSize: 12, color: c.inkSoft, marginTop: 2 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: spacing.sm },
  hPill: { backgroundColor: c.pillWhite, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  hPillText: { fontFamily: fonts.extrabold, fontSize: 12 },
}));
