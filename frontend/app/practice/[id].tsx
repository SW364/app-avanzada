import Ionicons from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DragCarousel from "@/src/components/DragCarousel";
import { useLanguage } from "@/src/context/LanguageContext";
import { MODULES } from "@/src/data/curriculum";
import { findPractice } from "@/src/data/practice";
import { VERBS, findVerb, type Verb } from "@/src/data/verbs";
import { PERSONS, conjugate, type Conjugation, type Form, type Segment } from "@/src/logic/conjugate";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const EMOJI: Record<string, string> = { i: "🧒", you: "🧑", he: "👦", she: "👧", it: "🐱", we: "👨‍👩‍👦", they: "👥" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const tick = (k: "select" | "medium") => {
  if (Platform.OS === "web") return;
  if (k === "select") Haptics.selectionAsync().catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

type Trio = Record<Form, Conjugation>;

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const practice = findPractice(id) ?? findPractice("pv-m1a")!;
  const m = MODULES[practice.module];
  const isModal = practice.mode === "modal";
  const options = isModal
    ? m.modals.map((o) => ({ key: o.key, label: o.label, formula: m.sections[0].formula.replace("Modal", o.label), code: practice.code }))
    : m.chapters.map((c) => ({ key: c.key, label: c.title, formula: c.formula, code: practice.module === "bat" ? c.manualCode : practice.code }));
  const initialOpt = Math.max(options.findIndex((o) => o.key === practice.initialKey), 0);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { mode: display } = useLanguage();
  const accent = colors[practice.color] as string;

  const [subj, setSubj] = useState(0);
  const [opt, setOpt] = useState(initialOpt);
  const [verbId, setVerbId] = useState(practice.defaultVerb);
  const [verbModal, setVerbModal] = useState(false);
  const groupVerbs = useMemo(() => VERBS.filter((v) => practice.verbGroups.includes(v.group)), [practice.verbGroups]);
  const hasRegular = groupVerbs.some((v) => v.regular);
  const showTabs = hasRegular && groupVerbs.some((v) => !v.regular);
  const [verbTab, setVerbTab] = useState<"regular" | "irregular">(hasRegular ? "regular" : "irregular");
  const [search, setSearch] = useState("");

  const build = useCallback((s: number, o: number, v: string): Trio => {
    const verb = findVerb(v)!;
    const base = { module: practice.module, mode: practice.mode, key: options[o].key, verb, person: PERSONS[s] };
    return {
      affirmative: conjugate({ ...base, form: "affirmative" }),
      negative: conjugate({ ...base, form: "negative" }),
      interrogative: conjugate({ ...base, form: "interrogative" }),
    };
    // options derive from practice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice.id]);

  const [cards, setCards] = useState<Trio>(() => build(0, initialOpt, practice.defaultVerb));
  const verb = findVerb(verbId)!;

  const generate = () => {
    tick("medium");
    setCards(build(subj, opt, verbId));
  };

  const q = search.trim().toLowerCase();
  const verbList = useMemo(() => {
    const base = groupVerbs.filter((v) => v.regular === (verbTab === "regular"));
    return q ? base.filter((v) => v.en.includes(q) || v.es.includes(q)) : base;
  }, [verbTab, q, groupVerbs]);

  // Fixed chapters (Mm1.AA…): structure is applied automatically from the chosen subject.
  const liveAux = practice.fixed
    ? conjugate({ module: practice.module, mode: practice.mode, key: options[opt].key, verb, person: PERSONS[subj], form: "affirmative" }).en.find((x) => x.hl)?.t
    : undefined;

  const showEs = display === "mixed";

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.flex} testID={`practice-${practice.id}`}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.roundBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} testID="back-button">
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.kicker}>{`${m.title.toUpperCase()} · ${options[opt].code}`}</Text>
            <Text style={styles.headerTitle} testID="practice-title">{practice.title}</Text>
          </View>
          <View style={styles.roundBtn}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Subject carousel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Elige tu sujeto</Text>
          <DragCarousel
            testID="carousel-subject"
            data={PERSONS}
            index={subj}
            onChange={(i) => { tick("select"); setSubj(i); }}
            itemWidth={78}
            itemHeight={92}
            accent={colors.primary}
            itemTestID={(p) => `subject-${p.key}`}
            renderItem={(p) => (
              <View style={styles.subjectCard}>
                <Text style={styles.subjectEmoji}>{EMOJI[p.key]}</Text>
                <Text style={styles.subjectLabel} numberOfLines={1}>{p.en}</Text>
                <Text style={styles.subjectEs} numberOfLines={1}>{p.es}</Text>
              </View>
            )}
          />
        </View>

        {practice.fixed ? (
          <View style={styles.panel} testID="structure-panel">
            <Text style={styles.panelTitle}>{`Estructura · ${options[opt].label}`}</Text>
            <Text style={styles.formula} testID="option-formula">{options[opt].formula}</Text>
            <Text style={[styles.structureLive, { color: accent }]} testID="structure-live">
              {`${PERSONS[subj].en} + ${liveAux} + ${practice.module === "passive" ? "Pasado Participio" : "Verbo"}`}
            </Text>
          </View>
        ) : (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{isModal ? "Elige tu verbo auxiliar" : "Elige el tiempo"}</Text>
          <DragCarousel
            testID="carousel-option"
            data={options}
            index={opt}
            onChange={(i) => { tick("select"); setOpt(i); }}
            itemWidth={isModal ? 104 : 130}
            itemHeight={58}
            accent={accent}
            itemTestID={(o) => `option-${o.key}`}
            renderItem={(o, active) => (
              <View style={styles.pill}>
                <Text style={[styles.pillText, active && styles.pillTextActive]} numberOfLines={2} adjustsFontSizeToFit>{o.label}</Text>
              </View>
            )}
          />
          <Text style={styles.formula} testID="option-formula">{options[opt].formula}</Text>
        </View>
        )}

        {/* Verb selector */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Elige tu verbo</Text>
          <Pressable testID="verb-selector-button" onPress={() => setVerbModal(true)} style={({ pressed }) => [styles.verbButton, pressed && styles.dim]}>
            <Text style={styles.verbButtonText} testID="selected-verb">{cap(verb.en)}</Text>
            <Text style={styles.verbButtonSub}>{practice.module === "passive" ? verb.pp : verb.es}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.question} />
          </Pressable>
        </View>

        {/* Generate */}
        <Pressable testID="generate-button" onPress={generate} style={({ pressed }) => [styles.generateBtn, pressed && styles.generatePressed]}>
          <Ionicons name="sparkles" size={18} color={colors.onBrand} />
          <Text style={styles.generateText}>Generar</Text>
        </Pressable>

        <View style={styles.cardsWrap}>
          <View style={[styles.card, styles.cardAff]} testID="card-affirmative">
            <View style={styles.cardHeaderRow}>
              <View style={[styles.tag, { backgroundColor: colors.affirmativeBg }]}>
                <Text style={[styles.tagText, { color: colors.affirmative }]}>AFIRMATIVA</Text>
              </View>
              <View style={[styles.statusCircle, { backgroundColor: colors.affirmative }]}>
                <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
              </View>
            </View>
            <SentenceText segs={cards.affirmative.en} color={colors.affirmative} testID="sentence-affirmative" />
            {showEs ? <Text style={styles.refSentence} testID="ref-affirmative">{cards.affirmative.es}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardHalf]} testID="card-negative">
              <View style={[styles.tag, styles.tagStart, { backgroundColor: colors.negativeBg }]}>
                <Text style={[styles.tagText, { color: colors.negative }]}>NEGATIVA</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusCircleSm, { backgroundColor: colors.negative }]}>
                  <Ionicons name="close" size={13} color={colors.onError} />
                </View>
                <SentenceText segs={cards.negative.en} color={colors.negative} small testID="sentence-negative" />
              </View>
              {cards.negative.enAlt ? <Text style={styles.altSentence} testID="alt-negative">{cards.negative.enAlt}</Text> : null}
              {showEs ? <Text style={styles.refSentenceSm} testID="ref-negative">{cards.negative.es}</Text> : null}
            </View>

            <View style={[styles.card, styles.cardHalf]} testID="card-question">
              <View style={[styles.tag, styles.tagStart, { backgroundColor: colors.questionBg }]}>
                <Text style={[styles.tagText, { color: colors.question }]}>PREGUNTA</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusCircleSm, { backgroundColor: colors.question }]}>
                  <Ionicons name="help" size={13} color={colors.onInfo} />
                </View>
                <SentenceText segs={cards.interrogative.en} color={colors.question} small testID="sentence-question" />
              </View>
              {showEs ? <Text style={styles.refSentenceSm} testID="ref-question">{cards.interrogative.es}</Text> : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Verb list modal */}
      <Modal visible={verbModal} animationType="slide" transparent onRequestClose={() => setVerbModal(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVerbModal(false)} testID="verb-modal-backdrop" />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHandle} />
            {showTabs ? (
              <View style={styles.tabRow}>
                {(["regular", "irregular"] as const).map((tb) => (
                  <Pressable key={tb} testID={`tab-${tb}`} style={[styles.tab, verbTab === tb && styles.tabActive]} onPress={() => setVerbTab(tb)}>
                    <Text style={[styles.tabText, verbTab === tb && styles.tabTextActive]}>{tb === "regular" ? "Regulares" : "Irregulares"}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.sheetTitle} testID="verb-list-title">Verbos M2.A · Lista oficial (30 verbos)</Text>
            )}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.inkSoft} />
              <TextInput
                testID="verb-search"
                placeholder="Buscar verbo…"
                placeholderTextColor={colors.inkSoft}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            <FlatList
              data={verbList}
              keyExtractor={(v) => v.id}
              numColumns={3}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.colGap}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.empty} testID="verb-empty">Sin resultados</Text>}
              renderItem={({ item }: { item: Verb }) => {
                const sel = item.id === verbId;
                return (
                  <Pressable
                    testID={`verb-option-${item.en}`}
                    style={[styles.verbChip, sel && styles.verbChipActive]}
                    onPress={() => { tick("select"); setVerbId(item.id); setVerbModal(false); setSearch(""); }}
                  >
                    <Text style={[styles.verbChipText, sel && styles.verbChipTextActive]} numberOfLines={1}>{cap(item.en)}</Text>
                    <Text style={[styles.verbChipSub, sel && styles.verbChipTextActive]} numberOfLines={1}>
                      {practice.module === "passive" ? item.pp : item.es}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function SentenceText({ segs, color, small, testID }: { segs: Segment[]; color: string; small?: boolean; testID: string }) {
  const styles = useStyles();
  return (
    <Text style={small ? styles.sentenceSm : styles.sentence} testID={testID}>
      {segs.map((s, i) => (s.hl ? <Text key={i} style={{ color, fontFamily: fonts.extrabold }}>{s.t}</Text> : s.t))}
    </Text>
  );
}

const useStyles = makeStyles((c) => {
  const shadow = { shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return {
    flex: { flex: 1 },
    dim: { opacity: 0.85 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
    headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: spacing.xs },
    roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow },
    kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, color: c.primary, textAlign: "center" },
    headerTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: c.ink, textAlign: "center" },
    panel: { backgroundColor: c.card, borderRadius: radius.lg, paddingVertical: spacing.md, marginBottom: spacing.md, ...shadow },
    panelTitle: { fontFamily: fonts.bold, fontSize: 14, color: c.ink, textAlign: "center", marginBottom: spacing.sm },
    subjectCard: { flex: 1, alignItems: "center", justifyContent: "center" },
    subjectEmoji: { fontSize: 30 },
    subjectLabel: { fontFamily: fonts.bold, fontSize: 15, color: c.ink, marginTop: 2 },
    subjectEs: { fontFamily: fonts.semibold, fontSize: 11, color: c.inkSoft },
    pill: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
    pillText: { fontFamily: fonts.bold, fontSize: 16, color: c.inkSoft, textAlign: "center" },
    pillTextActive: { color: c.ink, fontFamily: fonts.extrabold },
    formula: { fontFamily: fonts.extrabold, fontSize: 14, color: c.ink, textAlign: "center", marginTop: spacing.xs, paddingHorizontal: spacing.md },
    verbButton: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: spacing.md,
      backgroundColor: c.questionBg, borderRadius: radius.md, paddingVertical: 12,
    },
    verbButtonText: { fontFamily: fonts.extrabold, fontSize: 20, color: c.question },
    verbButtonSub: { fontFamily: fonts.semibold, fontSize: 14, color: c.inkSoft },
    generateBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.primary,
      borderRadius: radius.pill, paddingVertical: 15,
      shadowColor: c.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5,
    },
    generatePressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
    generateText: { fontFamily: fonts.extrabold, fontSize: 17, color: c.onBrand },
    cardsWrap: { marginTop: spacing.md },
    card: { backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, ...shadow },
    cardAff: { alignItems: "center", marginBottom: spacing.md },
    cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
    statusCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    statusCircleSm: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.sm },
    row: { flexDirection: "row", gap: spacing.md },
    cardHalf: { flex: 1 },
    sentence: { fontFamily: fonts.bold, fontSize: 22, color: c.ink, textAlign: "center", marginTop: spacing.sm },
    sentenceSm: { fontFamily: fonts.bold, fontSize: 15, color: c.ink, flexShrink: 1 },
    refSentence: { fontFamily: fonts.semibold, fontSize: 15, fontStyle: "italic", color: c.inkSoft, textAlign: "center", marginTop: 4 },
    refSentenceSm: { fontFamily: fonts.semibold, fontSize: 12, fontStyle: "italic", color: c.inkSoft, marginTop: 6 },
    altSentence: { fontFamily: fonts.semibold, fontSize: 12, color: c.negative, marginTop: 4 },
    tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
    tagStart: { alignSelf: "flex-start" },
    tagText: { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 0.5 },
    modalBackdrop: { flex: 1, backgroundColor: c.backdrop, justifyContent: "flex-end" },
    sheet: { height: "82%", backgroundColor: c.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.md, paddingTop: 10 },
    sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: c.border, alignSelf: "center", marginBottom: spacing.md },
    structureLive: { fontFamily: fonts.extrabold, fontSize: 18, textAlign: "center", marginTop: spacing.sm },
    sheetTitle: { fontFamily: fonts.extrabold, fontSize: 14, color: c.ink, textAlign: "center" },
    tabRow: { flexDirection: "row", backgroundColor: c.tabTrack, borderRadius: radius.md, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: "center" },
    tabActive: { backgroundColor: c.card, shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    tabText: { fontFamily: fonts.bold, fontSize: 15, color: c.inkSoft },
    tabTextActive: { color: c.ink, fontFamily: fonts.extrabold },
    searchBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 12, height: 44, marginTop: spacing.md },
    searchInput: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: c.ink, paddingVertical: 0 },
    colGap: { gap: 8 },
    listContent: { gap: 8, paddingTop: 12, paddingBottom: 8 },
    verbChip: { flex: 1 / 3, minHeight: 52, borderRadius: radius.md, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
    verbChipActive: { backgroundColor: c.question },
    verbChipText: { fontFamily: fonts.bold, fontSize: 14, color: c.ink, textAlign: "center" },
    verbChipSub: { fontFamily: fonts.semibold, fontSize: 11, color: c.inkSoft, textAlign: "center" },
    verbChipTextActive: { color: c.onBrand },
    empty: { fontFamily: fonts.semibold, color: c.inkSoft, textAlign: "center", padding: spacing.lg },
  };
});
