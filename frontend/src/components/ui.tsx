import Ionicons from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export function haptic(kind: "light" | "selection" | "success" = "light") {
  if (Platform.OS === "web") return;
  if (kind === "selection") Haptics.selectionAsync();
  else if (kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function PressableScale({
  children, onPress, style, testID, disabled, containerStyle,
}: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; testID?: string; disabled?: boolean; containerStyle?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      testID={testID}
      style={containerStyle}
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 10 }))}
      onPress={() => { haptic("selection"); onPress?.(); }}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

export function CVLogo({ size = 72 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.rainbowBlue, colors.rainbowPurple, colors.rainbowPink, colors.rainbowYellow, colors.rainbowGreen]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ fontFamily: fonts.textBold, color: colors.onBrand, fontSize: size * 0.38, lineHeight: size * 0.45 }}>CV</Text>
      <Text style={{ fontFamily: fonts.textBold, color: colors.onBrand, fontSize: size * 0.1, letterSpacing: 1 }}>CALCU VERBS</Text>
    </LinearGradient>
  );
}

export function ScreenHeader({ title, subtitle, testID }: { title: string; subtitle?: string; testID?: string }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable testID="header-back-button" onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={colors.brand} />
      </Pressable>
      <View style={styles.headerText}>
        <Text testID={testID} style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export type Chip = { key: string; label: string; sub?: string };

export function ChipRow({
  items, value, onChange, testPrefix, activeColor,
}: { items: Chip[]; value: string; onChange: (k: string) => void; testPrefix: string; activeColor?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const active = activeColor ?? colors.brandPrimary;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
      {items.map((it) => {
        const sel = it.key === value;
        return (
          <Pressable
            key={it.key}
            testID={`${testPrefix}-${it.key}`}
            onPress={() => { haptic(); onChange(it.key); }}
            style={[styles.chip, sel ? { backgroundColor: active, borderColor: active } : null]}
          >
            <Text style={[styles.chipText, sel ? { color: colors.onBrandPrimary } : null]}>
              {it.label}{it.sub ? <Text style={[styles.chipSub, sel ? { color: colors.onBrandPrimary } : null]}>{`  ${it.sub}`}</Text> : null}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const useStyles = makeStyles((c) => ({
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  back: {
    width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center",
    backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border,
  },
  headerText: { flex: 1, marginLeft: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 32, color: c.brand, lineHeight: 36 },
  subtitle: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  chipScroll: { flexGrow: 0, height: 56 },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  chip: {
    height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.pill, flexShrink: 0,
    justifyContent: "center", backgroundColor: c.surfaceSecondary, borderWidth: 1.5, borderColor: c.border,
  },
  chipText: { fontFamily: fonts.textBold, fontSize: 14, color: c.onSurface },
  chipSub: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
  sectionLabel: {
    fontFamily: fonts.textBold, fontSize: 12, color: c.muted, letterSpacing: 1, textTransform: "uppercase",
    paddingHorizontal: spacing.lg, marginTop: spacing.lg,
  },
}));
