import Ionicons from "@react-native-vector-icons/ionicons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChipRow, haptic } from "@/src/components/ui";
import { VERBS, VERB_GROUPS, type Verb } from "@/src/data/verbs";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export function VerbSheet({
  visible, selectedId, onSelect, onClose,
}: { visible: boolean; selectedId: string; onSelect: (v: Verb) => void; onClose: () => void }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VERBS.filter((v) => (group === "all" || v.group === group) &&
      (!q || v.en.toLowerCase().includes(q) || v.es.toLowerCase().includes(q) || v.pp.toLowerCase().includes(q)));
  }, [query, group]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.flex} onPress={onClose} testID="verb-sheet-backdrop" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>Elige un verbo</Text>
            <Pressable testID="verb-sheet-close" onPress={onClose} style={styles.close} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              testID="verb-search-input"
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar en inglés o español…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <ChipRow
            testPrefix="verb-group"
            value={group}
            onChange={setGroup}
            items={[{ key: "all", label: "Todos" }, ...VERB_GROUPS.map((g) => ({ key: g.id, label: g.label, sub: g.hint }))]}
          />
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colEn]}>Infinitivo</Text>
            <Text style={[styles.th, styles.colPast]}>Pasado</Text>
            <Text style={[styles.th, styles.colPp]}>Participio</Text>
            <Text style={[styles.th, styles.colEs]}>Español</Text>
          </View>
          <FlatList
            data={data}
            keyExtractor={(v) => v.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
            ListEmptyComponent={<Text style={styles.empty} testID="verb-empty">Sin resultados</Text>}
            renderItem={({ item, index }) => {
              const sel = item.id === selectedId;
              return (
                <Pressable
                  testID={`verb-item-${item.id}`}
                  onPress={() => { haptic("selection"); onSelect(item); onClose(); }}
                  style={[styles.row, index % 2 ? styles.rowAlt : null, sel ? styles.rowSel : null]}
                >
                  <Text style={[styles.td, styles.colEn, styles.bold]} numberOfLines={1}>{item.en}</Text>
                  <Text style={[styles.td, styles.colPast]} numberOfLines={1}>{item.past}</Text>
                  <Text style={[styles.td, styles.colPp, styles.pp]} numberOfLines={1}>{item.pp}</Text>
                  <Text style={[styles.td, styles.colEs]} numberOfLines={1}>{item.es}</Text>
                </Pressable>
              );
            }}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: c.backdrop },
  sheet: { height: "80%", backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: "hidden" },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: c.borderStrong, marginTop: spacing.sm },
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 30, color: c.brand },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, backgroundColor: c.surfaceTertiary },
  search: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.sm,
    paddingHorizontal: spacing.md, height: 48, borderRadius: radius.md, backgroundColor: c.surfaceTertiary,
  },
  input: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: c.onSurface, height: 48 },
  tableHead: { flexDirection: "row", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: c.brand },
  th: { fontFamily: fonts.textBold, fontSize: 12, color: c.onBrand },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, minHeight: 48 },
  rowAlt: { backgroundColor: c.surfaceTertiary },
  rowSel: { backgroundColor: c.presentTint },
  td: { fontFamily: fonts.text, fontSize: 14, color: c.onSurface },
  bold: { fontFamily: fonts.textBold },
  pp: { color: c.brandPrimary, fontFamily: fonts.textBold },
  colEn: { flex: 1.1 },
  colPast: { flex: 1 },
  colPp: { flex: 1 },
  colEs: { flex: 1.3 },
  empty: { fontFamily: fonts.text, color: c.muted, textAlign: "center", padding: spacing.xl },
}));
