import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { deleteNote, getNote, upsertNote } from "@/src/data/notes";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [exists, setExists] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getNote(id).then((n) => {
      if (n) { setTitle(n.title); setBody(n.body); setExists(true); }
      setLoaded(true);
    });
  }, [id]);

  // Autosave shortly after typing stops (only once there is content).
  useEffect(() => {
    if (!loaded) return;
    if (timer.current) clearTimeout(timer.current);
    const empty = !title.trim() && !body.trim();
    if (empty && !exists) return;
    timer.current = setTimeout(() => {
      if (empty) deleteNote(id).then(() => { setExists(false); setSaved(false); });
      else upsertNote({ id, title: title.trim(), body }).then(() => { setExists(true); setSaved(true); });
    }, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, loaded, id]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/notes"));

  const saveAndClose = async () => {
    if (timer.current) clearTimeout(timer.current);
    if (title.trim() || body.trim()) await upsertNote({ id, title: title.trim(), body });
    else await deleteNote(id); // an emptied note is removed
    goBack();
  };

  const remove = async () => {
    setConfirm(false);
    if (timer.current) clearTimeout(timer.current);
    await deleteNote(id);
    goBack();
  };

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={[styles.flex, { paddingTop: insets.top + spacing.sm }]} testID="note-editor">
      <View style={styles.header}>
        <Pressable style={styles.roundBtn} testID="note-back-button" onPress={saveAndClose}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.status} testID="note-status">{saved ? "Guardado" : exists ? "" : "Nueva nota"}</Text>
        {exists ? (
          <Pressable style={styles.roundBtn} testID="note-delete-button" onPress={() => setConfirm(true)}>
            <Ionicons name="trash-outline" size={20} color={colors.negative} />
          </Pressable>
        ) : <View style={styles.spacer} />}
      </View>

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <View style={styles.paper}>
          <TextInput
            testID="note-title-input"
            value={title}
            onChangeText={(t) => { setTitle(t); setSaved(false); }}
            placeholder="Título"
            placeholderTextColor={colors.inkSoft}
            style={styles.titleInput}
            maxLength={120}
            returnKeyType="next"
          />
          <View style={styles.divider} />
          <TextInput
            testID="note-body-input"
            value={body}
            onChangeText={(t) => { setBody(t); setSaved(false); }}
            placeholder="Escribe tus apuntes aquí…"
            placeholderTextColor={colors.inkSoft}
            style={styles.bodyInput}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </View>
      </KeyboardAwareScrollView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]} testID="delete-confirm-sheet">
            <Text style={styles.sheetTitle}>¿Eliminar esta nota?</Text>
            <Text style={styles.sheetMsg}>Esta acción no se puede deshacer.</Text>
            <View style={styles.sheetRow}>
              <Pressable testID="delete-cancel" style={[styles.sheetBtn, styles.sheetCancel]} onPress={() => setConfirm(false)}>
                <Text style={styles.sheetCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable testID="delete-confirm" style={[styles.sheetBtn, styles.sheetDelete]} onPress={remove}>
                <Text style={styles.sheetDeleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => {
  const shadow = { shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return {
    flex: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow },
    spacer: { width: 44 },
    status: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 14, color: c.inkSoft },
    content: { paddingHorizontal: spacing.md, flexGrow: 1 },
    paper: { flexGrow: 1, backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, minHeight: 420, ...shadow },
    titleInput: { fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, paddingVertical: spacing.xs },
    divider: { height: 1, backgroundColor: c.border, marginVertical: spacing.sm },
    bodyInput: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: c.ink, minHeight: 320 },
    backdrop: { flex: 1, backgroundColor: c.backdrop, justifyContent: "flex-end" },
    sheet: { backgroundColor: c.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
    sheetTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: c.ink },
    sheetMsg: { fontFamily: fonts.semibold, fontSize: 14, color: c.inkSoft, marginTop: 4 },
    sheetRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
    sheetBtn: { flex: 1, height: 50, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
    sheetCancel: { backgroundColor: c.surfaceTertiary },
    sheetDelete: { backgroundColor: c.negative },
    sheetCancelText: { fontFamily: fonts.extrabold, fontSize: 16, color: c.ink },
    sheetDeleteText: { fontFamily: fonts.extrabold, fontSize: 16, color: c.onError },
  };
});
