import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage, type DisplayMode } from "@/src/context/LanguageContext";
import { MODULES } from "@/src/data/curriculum";
import { PRACTICES, countOptions, type PracticeDef } from "@/src/data/practice";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Modules() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { mode, setMode } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const pick = (m: DisplayMode) => { setMode(m); setMenuOpen(false); };

  const renderCard = (p: PracticeDef) => {
    const color = colors[p.color] as string;
    const n = countOptions(p);
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
        <View style={styles.footerRow}>
          <View style={styles.hPill}><Text style={[styles.hPillText, { color }]}>{p.initialKey ? "H1" : `H${n}`}</Text></View>
          <Text style={styles.tensesText} numberOfLines={1}>{p.initialKey ? "1 tiempo" : p.mode === "modal" ? "modales" : `${n} tiempos`}</Text>
          <View style={styles.flex} />
          <Ionicons name="chevron-forward" size={18} color={color} />
        </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.flex} testID="home-screen">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.roundBtn} testID="menu-button" onPress={() => setMenuOpen(true)}>
            <Ionicons name="menu" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <Text style={styles.title} testID="home-title">Módulos</Text>
        <Text style={styles.subtitle}>CalcuVerbs Advanced · Elige un módulo para comenzar</Text>

        {(["passive", "bat"] as const).map((mid) => (
          <View key={mid}>
            <View style={styles.groupHead}>
              <Text style={styles.groupTitle} testID={`group-${mid}`}>{MODULES[mid].title}</Text>
              <Text style={styles.groupSub}>{MODULES[mid].subtitle}</Text>
            </View>
            <View style={styles.grid}>{PRACTICES.filter((p) => p.module === mid).map(renderCard)}</View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} testID="menu-backdrop">
          <View style={[styles.menuCard, { top: insets.top + 58 }]}>
            <Text style={styles.menuTitle}>Mostrar frases</Text>
            <Pressable testID="lang-english" style={styles.menuItem} onPress={() => pick("en")}>
              <View style={styles.codeBadge}><Text style={styles.codeBadgeText}>EN</Text></View>
              <Text style={styles.menuItemText}>Solo inglés</Text>
              {mode === "en" ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable testID="lang-mixed-en-es" style={styles.menuItem} onPress={() => pick("mixed")}>
              <View style={styles.codeBadge}><Text style={styles.codeBadgeText}>EN→ES</Text></View>
              <Text style={styles.menuItemText}>Inglés → Español</Text>
              {mode === "mixed" ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: c.inkSoft, textAlign: "center", marginTop: 2, marginBottom: spacing.sm },
  groupHead: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  groupTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: c.ink },
  groupSub: { fontFamily: fonts.semibold, fontSize: 12, color: c.inkSoft, flexShrink: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardModule: { width: "48%", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, minHeight: 168 },
  pressed: { transform: [{ scale: 0.97 }] },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  moduleCode: { fontFamily: fonts.extrabold, fontSize: 22 },
  moduleTitle: { fontFamily: fonts.semibold, fontSize: 13, color: c.inkSoft, marginTop: 2 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: spacing.sm },
  hPill: { backgroundColor: c.pillWhite, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, minWidth: 30, alignItems: "center" },
  hPillText: { fontFamily: fonts.extrabold, fontSize: 12 },
  tensesText: { fontFamily: fonts.semibold, fontSize: 12, color: c.inkSoft, flexShrink: 1 },
  menuBackdrop: { flex: 1, backgroundColor: c.menuBackdrop },
  menuCard: {
    position: "absolute", left: spacing.md, width: 264, backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.sm,
    shadowColor: c.ink, shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  menuTitle: { fontFamily: fonts.extrabold, fontSize: 13, color: c.inkSoft, paddingHorizontal: 10, paddingTop: 6, paddingBottom: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius.md },
  codeBadge: { minWidth: 30, paddingHorizontal: 6, height: 24, borderRadius: 7, backgroundColor: c.brandSecondary, alignItems: "center", justifyContent: "center" },
  codeBadgeText: { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 0.5, color: c.primary },
  menuItemText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: c.ink },
  menuDivider: { height: 1, backgroundColor: c.border, marginHorizontal: 10 },
}));
