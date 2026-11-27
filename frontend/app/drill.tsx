import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { evaluate, type Verdict } from "@/src/practice/evaluate";
import { TOPICS, generateExercise, type Exercise, type ExerciseKind, type TopicId } from "@/src/practice/generator";
import { DAILY_GOAL, EMPTY_STATS, ROUND_SIZE, XP_PER_LEVEL, levelOf, levelTitle, loadStats, recordResult, startNewRound, type PracticeStats } from "@/src/practice/stats";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { openAppSettings, sttMessage, useSpeechToText } from "@/src/utils/stt";
import { speak, stopSpeech, subscribeSpeech, type SpeechStatus } from "@/src/utils/tts";

type Mode = ExerciseKind | "mixed";
type Result = { verdict: Verdict; heard: string; expected: string };

const MODES: { key: Mode; label: string }[] = [
  { key: "mixed", label: "Mixto" },
  { key: "fill", label: "Completar" },
  { key: "say", label: "Pronunciar" },
];

const VERDICT_TEXT: Record<Verdict, string> = { correct: "¡Correcto!", close: "¡Casi! Revisa los detalles", wrong: "Inténtalo de nuevo" };

export default function DrillScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  const [topic, setTopic] = useState<TopicId>("all");
  const [mode, setMode] = useState<Mode>("mixed");
  const [ex, setEx] = useState<Exercise>(() => generateExercise("all", "mixed"));
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [counted, setCounted] = useState(false);
  const [stats, setStats] = useState<PracticeStats>(EMPTY_STATS);
  const [tts, setTts] = useState<SpeechStatus>("idle");

  useEffect(() => { loadStats().then(setStats); }, []);
  useEffect(() => subscribeSpeech((s) => setTts(s)), []);

  const [chosen, setChosen] = useState<number | null>(null);
  const check = useCallback((heard: string[]) => {
    if (counted) return; // only ONE answer per exercise
    const accepted = ex.kind === "fill" ? [...ex.accepted, ex.full] : ex.accepted;
    const r = evaluate(heard, accepted);
    setResult({ verdict: r.verdict, heard: r.best, expected: ex.kind === "fill" ? ex.answer : ex.full });
    setCounted(true);
    setStats((s) => recordResult(s, r.verdict));
  }, [ex, counted]);

  const stt = useSpeechToText(check);
  const sttReset = stt.reset;

  useFocusEffect(useCallback(() => () => { stopSpeech(); sttReset(); }, [sttReset]));

  const next = (t: TopicId = topic, m: Mode = mode) => {
    stopSpeech();
    stt.reset();
    setEx((prev) => generateExercise(t, m, prev));
    setTyped("");
    setResult(null);
    setCounted(false);
    setChosen(null);
  };

  const method = ex.method ?? "choose";
  const locked = counted;
  const METHOD_LABEL = { speak: "Responde hablando", type: "Responde escribiendo", choose: "Elige una opción" } as const;
  const onMic = () => (stt.status === "listening" ? stt.stop() : (stopSpeech(), stt.start()));
  const sttInfo = sttMessage(stt.status);
  const level = levelOf(stats.xp);
  const xpInLevel = stats.xp % XP_PER_LEVEL;
  const goalPct = Math.min(stats.today / DAILY_GOAL, 1);
  const roundDone = stats.round.length === ROUND_SIZE;
  const roundScore = stats.round.filter((r) => r === "correct").length;
  const vColor = result ? (result.verdict === "correct" ? colors.affirmative : result.verdict === "close" ? colors.warning : colors.negative) : colors.ink;
  const vBg = result ? (result.verdict === "correct" ? colors.affirmativeBg : result.verdict === "close" ? colors.orangeBg : colors.negativeBg) : colors.card;

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={[styles.flex, { paddingTop: insets.top + spacing.sm }]} testID="drill-screen">
      {/* Header + stats */}
      <View style={styles.header}>
        <Pressable style={styles.roundBtn} testID="back-button" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Practice</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.progress} testID="progress-panel">
        <View style={styles.progRow}>
          <View style={styles.levelBadge}><Text style={styles.levelNum} testID="level-number">{level}</Text></View>
          <View style={styles.flex}>
            <Text style={styles.levelTitle}>{`Nivel ${level} · ${levelTitle(level)}`}</Text>
            <View style={styles.bar}><View style={[styles.barFill, { width: `${xpInLevel}%`, backgroundColor: colors.purple }]} /></View>
            <Text style={styles.progSmall} testID="xp-text">{`${xpInLevel}/${XP_PER_LEVEL} XP para el nivel ${level + 1}`}</Text>
          </View>
          <View style={styles.streakBox} testID="stat-streak">
            <Ionicons name="flame" size={18} color={colors.orange} />
            <Text style={styles.streakNum}>{stats.streak}</Text>
          </View>
        </View>
        <View style={styles.progRow}>
          <Ionicons name={goalPct >= 1 ? "trophy" : "flag"} size={16} color={goalPct >= 1 ? colors.orange : colors.affirmative} />
          <View style={styles.flex}>
            <View style={styles.bar}><View style={[styles.barFill, { width: `${goalPct * 100}%`, backgroundColor: colors.affirmative }]} /></View>
          </View>
          <Text style={styles.progSmall} testID="daily-goal">{goalPct >= 1 ? "¡Meta diaria cumplida!" : `Meta de hoy ${stats.today}/${DAILY_GOAL}`}</Text>
        </View>
        <View style={styles.dots} testID="round-dots">
          <Text style={styles.progSmall}>{`Ronda ${stats.roundsDone + (roundDone ? 0 : 1)}`}</Text>
          {Array.from({ length: ROUND_SIZE }).map((_, i) => {
            const r = stats.round[i];
            const bg = r === "correct" ? colors.affirmative : r === "close" ? colors.warning : r === "wrong" ? colors.negative : colors.border;
            return <View key={i} style={[styles.dot, { backgroundColor: bg }]} />;
          })}
        </View>
      </View>

      {/* Topic chips (sticky) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        {TOPICS.map((t) => (
          <Pressable key={t.id} testID={`topic-${t.id}`} onPress={() => { setTopic(t.id); next(t.id, mode); }}
            style={[styles.chip, topic === t.id && styles.chipActive]}>
            <Text style={[styles.chipText, topic === t.id && styles.chipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.segment}>
        {MODES.map((m) => (
          <Pressable key={m.key} testID={`mode-${m.key}`} onPress={() => { setMode(m.key); next(topic, m.key); }}
            style={[styles.segBtn, mode === m.key && styles.segActive]}>
            <Text style={[styles.segText, mode === m.key && styles.segTextActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Animated.View key={ex.id} entering={FadeInDown.duration(300)} style={styles.card} testID="exercise-card">
          <View style={styles.cardTop}>
            <View style={styles.tag}><Text style={styles.tagText} testID="exercise-tag">{ex.tag}</Text></View>
            <Text style={styles.kind}>{ex.kind === "fill" ? "Completar" : "Pronunciar"}</Text>
          </View>
          <View style={styles.taskBox} testID="exercise-task">
            <Text style={styles.taskLabel}>TU TAREA</Text>
            <Text style={styles.instruction} testID="exercise-instruction">{ex.instruction}</Text>
            {ex.blankLabel ? <Text style={styles.blankLabel} testID="exercise-blank-label">{`El hueco ___ es: ${ex.blankLabel}`}</Text> : null}
          </View>
          <View style={styles.methodPill} testID="answer-method"><Ionicons name={method === "speak" ? "mic" : method === "type" ? "create" : "list"} size={14} color={colors.purple} /><Text style={styles.methodText}>{METHOD_LABEL[method]}</Text></View>

          {ex.kind === "fill" ? (
            <Text style={styles.sentence} testID="exercise-sentence">
              {ex.before}<Text style={styles.blank}>{result?.verdict === "correct" ? ex.answer : " ___ "}</Text>{ex.after}
            </Text>
          ) : (
            <Text style={styles.sentence} testID="exercise-sentence">{ex.target}</Text>
          )}
          {ex.hint ? <Text style={styles.hint} testID="exercise-hint">{ex.hint}</Text> : null}

          {/* Listen (native voice, local) */}
          {(ex.kind === "say" || result) ? (
            <Pressable testID="listen-button" onPress={() => (tts === "playing" ? stopSpeech() : speak(ex.full, "drill"))} style={styles.listenBtn}>
              {tts === "loading" ? <ActivityIndicator size="small" color={colors.question} /> : <Ionicons name={tts === "playing" ? "stop" : "volume-high"} size={18} color={colors.question} />}
              <Text style={styles.listenText}>{tts === "playing" ? "Detener" : "Escuchar"}</Text>
            </Pressable>
          ) : null}

          {/* Touch options */}
          {ex.kind === "fill" && method === "choose" && ex.options ? (
            <View style={styles.options}>
              {ex.options.map((o, i) => {
                const right = locked && o === ex.answer;
                const wrongPick = locked && chosen === i && o !== ex.answer;
                return (
                  <Pressable key={`${o}-${i}`} testID={`option-${i}`} disabled={locked}
                    onPress={() => { setChosen(i); check([o]); }}
                    style={[styles.option, right && styles.optionRight, wrongPick && styles.optionWrong, locked && !right && !wrongPick && styles.optionDim]}>
                    <Text style={[styles.optionText, right && styles.optionTextRight, wrongPick && styles.optionTextWrong]}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* Type answer */}
          {ex.kind === "fill" && method === "type" ? (
            <View style={styles.typeRow}>
              <TextInput testID="answer-input" editable={!locked} value={typed} onChangeText={setTyped} placeholder="Escribe tu respuesta…"
                placeholderTextColor={colors.inkSoft} style={styles.input} autoCapitalize="none" autoCorrect={false}
                returnKeyType="done" onSubmitEditing={() => typed.trim() && check([typed])} />
              <Pressable testID="check-button" disabled={locked} onPress={() => typed.trim() && check([typed])} style={[styles.checkBtn, locked && styles.optionDim]}>
                <Ionicons name="checkmark" size={22} color={colors.onBrand} />
              </Pressable>
            </View>
          ) : null}

          {/* Microphone */}
          {method === "speak" && !locked ? (<>
          <Pressable testID="mic-button" onPress={onMic} style={[styles.micBtn, stt.status === "listening" && styles.micActive]}>
            <Ionicons name={stt.status === "listening" ? "stop" : "mic"} size={24} color={colors.onBrand} />
            <Text style={styles.micText}>{stt.status === "listening" ? "Escuchando… toca para terminar" : ex.kind === "fill" ? "Decir la respuesta" : "Repetir en voz alta"}</Text>
          </Pressable>
          {stt.status === "listening" && stt.partial ? <Text style={styles.partial} testID="mic-partial">{`“${stt.partial}”`}</Text> : null}
          {sttInfo ? (
            <View style={styles.sttInfo} testID="mic-message">
              <Text style={styles.sttInfoText}>{sttInfo}</Text>
              {stt.status === "blocked" ? (
                <Pressable testID="open-settings-button" onPress={openAppSettings} style={styles.settingsBtn}>
                  <Text style={styles.settingsText}>Abrir Ajustes</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          </>) : null}
        </Animated.View>

        {/* Feedback */}
        {result ? (
          <Animated.View entering={FadeIn.duration(250)} style={[styles.feedback, { backgroundColor: vBg, borderColor: vColor }]} testID="feedback-card">
            <Text style={[styles.verdict, { color: vColor }]} testID="feedback-verdict">{VERDICT_TEXT[result.verdict]}</Text>
            <Text style={styles.fbLabel}>Escuché / respondiste</Text>
            <Text style={styles.fbValue} testID="feedback-heard">{result.heard || "—"}</Text>
            <Text style={styles.fbLabel}>Respuesta esperada</Text>
            <Text style={[styles.fbValue, { color: colors.affirmative }]} testID="feedback-expected">{result.expected}</Text>
            {ex.kind === "fill" ? <Text style={styles.fbFull}>{ex.full}</Text> : null}
            <View style={styles.noteBox}>
              <Ionicons name="bulb" size={16} color={colors.orange} />
              <Text style={styles.noteText} testID="feedback-note">{ex.note}</Text>
            </View>
          </Animated.View>
        ) : null}

        {roundDone && result ? (
          <View style={styles.roundCard} testID="round-complete">
            <Ionicons name={roundScore >= 8 ? "trophy" : roundScore >= 5 ? "ribbon" : "fitness"} size={36} color={colors.orange} />
            <Text style={styles.roundTitle}>{`¡Ronda completada! ${roundScore}/${ROUND_SIZE}`}</Text>
            <Text style={styles.roundMsg}>{roundScore >= 8 ? "¡Excelente! Dominas este tema." : roundScore >= 5 ? "¡Bien! Un poco más de práctica y lo dominas." : "Sigue practicando, cada ronda suma XP."}</Text>
            <Text style={styles.progSmall}>{`Mejor ronda: ${stats.bestRound}/${ROUND_SIZE}`}</Text>
          </View>
        ) : null}
        <Pressable testID="next-exercise-button" onPress={() => { if (roundDone) setStats((st) => startNewRound(st)); next(); }} style={styles.nextBtn}>
          <Ionicons name="shuffle" size={18} color={colors.onBrand} />
          <Text style={styles.nextText}>{roundDone && result ? "Nueva ronda" : "Siguiente ejercicio"}</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => {
  const shadow = { shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return {
    flex: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md },
    roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow },
    title: { flex: 1, fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, textAlign: "center" },
    spacer: { width: 44 },
    statsRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.sm, paddingHorizontal: spacing.md },
    stat: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.card, borderRadius: radius.pill, paddingHorizontal: 10, height: 30 },
    statText: { fontFamily: fonts.bold, fontSize: 12, color: c.ink },
    chipScroll: { flexGrow: 0, height: 56 },
    chipRow: { gap: spacing.sm, paddingHorizontal: spacing.md, alignItems: "center" },
    chip: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border, justifyContent: "center", flexShrink: 0 },
    chipActive: { backgroundColor: c.purple, borderColor: c.purple },
    chipText: { fontFamily: fonts.bold, fontSize: 13, color: c.ink },
    chipTextActive: { color: c.onBrand },
    segment: { flexDirection: "row", marginHorizontal: spacing.md, backgroundColor: c.tabTrack, borderRadius: radius.md, padding: 4 },
    segBtn: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
    segActive: { backgroundColor: c.card },
    segText: { fontFamily: fonts.bold, fontSize: 14, color: c.inkSoft },
    segTextActive: { color: c.ink, fontFamily: fonts.extrabold },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
    card: { backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, ...shadow },
    cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    tag: { backgroundColor: c.purpleBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
    tagText: { fontFamily: fonts.extrabold, fontSize: 12, color: c.purple },
    kind: { fontFamily: fonts.bold, fontSize: 12, color: c.inkSoft },
    taskBox: { marginTop: spacing.sm, backgroundColor: c.purpleBg, borderRadius: radius.md, padding: spacing.sm + 4, borderLeftWidth: 4, borderLeftColor: c.purple },
    taskLabel: { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 1, color: c.purple },
    instruction: { fontFamily: fonts.extrabold, fontSize: 17, color: c.ink, marginTop: 2 },
    blankLabel: { fontFamily: fonts.bold, fontSize: 14, color: c.purple, marginTop: 4 },
    progress: { marginHorizontal: spacing.md, marginTop: spacing.sm, backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.sm + 4, gap: 8, ...shadow },
    progRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    levelBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.purple, alignItems: "center", justifyContent: "center" },
    levelNum: { fontFamily: fonts.extrabold, fontSize: 18, color: c.onBrand },
    levelTitle: { fontFamily: fonts.extrabold, fontSize: 14, color: c.ink },
    bar: { height: 8, borderRadius: 4, backgroundColor: c.tabTrack, overflow: "hidden", marginTop: 4 },
    barFill: { height: 8, borderRadius: 4 },
    progSmall: { fontFamily: fonts.bold, fontSize: 11, color: c.inkSoft, marginTop: 2 },
    streakBox: { alignItems: "center", backgroundColor: c.orangeBg, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4 },
    streakNum: { fontFamily: fonts.extrabold, fontSize: 14, color: c.orange },
    dots: { flexDirection: "row", alignItems: "center", gap: 5 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    roundCard: { backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 4, borderWidth: 2, borderColor: c.orange },
    roundTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: c.ink },
    roundMsg: { fontFamily: fonts.semibold, fontSize: 14, color: c.inkSoft, textAlign: "center" },
    sentence: { fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, marginTop: spacing.sm, lineHeight: 30 },
    blank: { color: c.purple, textDecorationLine: "underline" },
    hint: { fontFamily: fonts.semibold, fontStyle: "italic", fontSize: 14, color: c.inkSoft, marginTop: 4 },
    listenBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: spacing.sm, backgroundColor: c.questionBg, borderRadius: radius.pill, paddingHorizontal: 14, height: 40 },
    listenText: { fontFamily: fonts.extrabold, fontSize: 14, color: c.question },
    options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
    option: { minWidth: "47%", flexGrow: 1, minHeight: 48, borderRadius: radius.md, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
    optionRight: { backgroundColor: c.affirmativeBg },
    optionText: { fontFamily: fonts.bold, fontSize: 15, color: c.ink, textAlign: "center" },
    optionTextRight: { color: c.affirmative },
    optionWrong: { backgroundColor: c.negativeBg },
    optionTextWrong: { color: c.negative },
    optionDim: { opacity: 0.5 },
    methodPill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 6, backgroundColor: c.purpleBg, borderRadius: radius.pill, paddingHorizontal: 10, height: 26 },
    methodText: { fontFamily: fonts.bold, fontSize: 12, color: c.purple },
    typeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    input: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: c.surfaceTertiary, paddingHorizontal: 12, fontFamily: fonts.semibold, fontSize: 15, color: c.ink },
    checkBtn: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: c.affirmative, alignItems: "center", justifyContent: "center" },
    micBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.md, height: 54, borderRadius: radius.pill, backgroundColor: c.purple },
    micActive: { backgroundColor: c.negative },
    micText: { fontFamily: fonts.extrabold, fontSize: 15, color: c.onBrand },
    partial: { fontFamily: fonts.semibold, fontSize: 14, color: c.inkSoft, textAlign: "center", marginTop: 6 },
    sttInfo: { marginTop: spacing.sm, backgroundColor: c.orangeBg, borderRadius: radius.md, padding: spacing.sm, gap: 6 },
    sttInfoText: { fontFamily: fonts.semibold, fontSize: 13, color: c.ink },
    settingsBtn: { alignSelf: "flex-start", backgroundColor: c.orange, borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: "center" },
    settingsText: { fontFamily: fonts.extrabold, fontSize: 13, color: c.onBrand },
    feedback: { borderRadius: radius.lg, padding: spacing.md, borderWidth: 2 },
    verdict: { fontFamily: fonts.extrabold, fontSize: 20 },
    fbLabel: { fontFamily: fonts.bold, fontSize: 11, color: c.inkSoft, marginTop: spacing.sm, textTransform: "uppercase" },
    fbValue: { fontFamily: fonts.extrabold, fontSize: 16, color: c.ink },
    fbFull: { fontFamily: fonts.semibold, fontSize: 14, color: c.ink, marginTop: 4 },
    noteBox: { flexDirection: "row", gap: 6, marginTop: spacing.sm, backgroundColor: c.card, borderRadius: radius.md, padding: spacing.sm },
    noteText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, color: c.ink },
    nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: radius.pill, backgroundColor: c.primary, ...shadow },
    nextText: { fontFamily: fonts.extrabold, fontSize: 16, color: c.onBrand },
  };
});
