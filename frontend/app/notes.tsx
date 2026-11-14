import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { loadNotes, newNoteId, type Note } from "@/src/data/notes";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[] | null>(null);

  useFocusEffect(useCallback(() => { loadNotes().then(setNotes); }, []));

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={[styles.flex, { paddingTop: insets.top + spacing.sm }]} testID="notes-screen">
      <View style={styles.header}>
        <Pressable style={styles.roundBtn} testID="back-button" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Mis Notas</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={notes ?? []}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        ListEmptyComponent={
          notes ? (
            <View style={styles.empty} testID="notes-empty">
              <View style={styles.emptyIcon}><Ionicons name="create" size={40} color={colors.primary} /></View>
              <Text style={styles.emptyTitle}>Aún no tienes notas</Text>
              <Text style={styles.emptyMsg}>Toca “Nueva nota” para escribir tus apuntes de CalcuVerbs.</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`note-item-${item.id}`}
            onPress={() => router.push(`/note/${item.id}`)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title || "Sin título"}</Text>
            {item.body ? <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text> : null}
            <Text style={styles.cardDate}>{fmt(item.updatedAt)}</Text>
          </Pressable>
        )}
      />

      <Pressable
        testID="new-note-button"
        onPress={() => router.push(`/note/${newNoteId()}?new=1`)}
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + spacing.md }, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={22} color={colors.onBrand} />
        <Text style={styles.fabText}>Nueva nota</Text>
      </Pressable>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => {
  const shadow = { shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return {
    flex: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow },
    title: { flex: 1, fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, textAlign: "center" },
    spacer: { width: 44 },
    list: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.md, flexGrow: 1 },
    card: { backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, ...shadow },
    pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
    cardTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: c.ink },
    cardBody: { fontFamily: fonts.regular, fontSize: 14, color: c.inkSoft, marginTop: 4 },
    cardDate: { fontFamily: fonts.semibold, fontSize: 12, color: c.primary, marginTop: spacing.sm },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
    emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: c.brandSecondary, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: c.ink, marginTop: spacing.md },
    emptyMsg: { fontFamily: fonts.semibold, fontSize: 14, color: c.inkSoft, textAlign: "center", marginTop: 4 },
    fab: {
      position: "absolute", right: spacing.md, height: 52, paddingHorizontal: spacing.md + 4, borderRadius: radius.pill,
      backgroundColor: c.primary, flexDirection: "row", alignItems: "center", gap: 8,
      shadowColor: c.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5,
    },
    fabText: { fontFamily: fonts.extrabold, fontSize: 16, color: c.onBrand },
  };
});
