// Design tokens for this app. Light theme only.Always modify the colors and theme to Dark, Light or Dark and Light according to the design guidelines.
//
// The keys match the "color" block of /app/design_guidelines.json. Fill the
// values from that file (or from the user's brand colors). Keep every key; do
// not add a second theme or colors file; do not write color literals in
// components.
//
// How the names work: a plain key is a background, and its `on` partner is the
// text or icon color that sits on top of it. Always use them as a pair.
//   <View style={{ backgroundColor: colors.brandPrimary }}>
//     <Text style={{ color: colors.onBrandPrimary }}>Continue</Text>
//   </View>
//
// Styling a screen or component: build the sheet with makeStyles so colors
// and layout live together and follow the active scheme:
//   const useStyles = makeStyles((colors) => ({
//     card: { backgroundColor: colors.surfaceSecondary, padding: 16 },
//     title: { color: colors.onSurfaceSecondary, fontSize: 16 },
//   }));
//   function Screen() {
//     const styles = useStyles();
//     return <View style={styles.card}><Text style={styles.title}>Hi</Text></View>;
//   }
// For color props that are not styles (icon color, placeholderTextColor,
// ActivityIndicator) read useTheme().colors inside the component.
// Never call StyleSheet.create with color values at module level; it cannot
// follow the scheme.
//
// To support dark mode later: add `dark` to `themes` with every key filled.
// Nothing else changes; the device setting takes over automatically.
// Feel free to add as many new colors as you need to support the design guidelines.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Original CalcuVerbs palette (github.com/SW364/calcuverbsApk)
  surface: "#F7F5FF",
  onSurface: "#2A2E45",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#2A2E45",
  surfaceTertiary: "#F5F6FA",
  onSurfaceTertiary: "#2A2E45",
  surfaceInverse: "#2A2E45",
  onSurfaceInverse: "#FFFFFF",
  muted: "#8A90A6",

  brand: "#4A7DF0",
  onBrand: "#FFFFFF",
  brandPrimary: "#4A7DF0",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#EEF2FE",
  onBrandSecondary: "#4A7DF0",
  brandTertiary: "#E8F0FE",
  onBrandTertiary: "#3B82F6",

  success: "#22B573",
  onSuccess: "#FFFFFF",
  warning: "#F5A623",
  onWarning: "#FFFFFF",
  error: "#F0574A",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",

  border: "#EBEDF5",
  borderStrong: "#D5D9E6",
  divider: "#EBEDF5",

  // CalcuVerbs specific
  bgTop: "#EEF2FE",
  bgBottom: "#F7F5FF",
  card: "#FFFFFF",
  ink: "#2A2E45",
  inkSoft: "#8A90A6",
  primary: "#4A7DF0",
  affirmative: "#22B573",
  affirmativeBg: "#E7F8EF",
  negative: "#F0574A",
  negativeBg: "#FDECEA",
  question: "#3B82F6",
  questionBg: "#E8F0FE",
  tabTrack: "#F1F3F9",
  shadow: "#8A90A6",
  pillWhite: "rgba(255,255,255,0.75)",
  frameFill: "rgba(74,125,240,0.04)",
  backdrop: "rgba(20,22,40,0.4)",
  menuBackdrop: "rgba(20,22,40,0.25)",
  // module card accents
  blue: "#4A7DF0", blueBg: "#E8F1FC",
  teal: "#1FB6A6", tealBg: "#E4F6F3",
  orange: "#F5A623", orangeBg: "#FDF3E1",
  coral: "#F0654A", coralBg: "#FDECE8",
  purple: "#8B5CF6", purpleBg: "#F0EAFB",
  pink: "#EC4899", pinkBg: "#FCE7F1",
  green: "#22B573", greenBg: "#E7F8EF",
};

export const fonts = {
  regular: "Nunito",
  semibold: "Nunito-SemiBold",
  bold: "Nunito-Bold",
  extrabold: "Nunito-ExtraBold",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 12, md: 18, lg: 24, pill: 999 };

export const colors = light;

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

// In-app theme toggle, only after `dark` exists in `themes`. Call
// setColorScheme("dark"), setColorScheme("light"), or setColorScheme(null) to
// follow the device. Every useTheme() consumer re-renders. Persisting the
// choice and re-applying it on launch is the toggle's job.
export function setColorScheme(scheme: ColorScheme | null) {
  // RN 0.86 re-reads the device scheme only for the literal "unspecified";
  // null would pin useColorScheme() to null and the app to light.
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

// Keep native surfaces (alerts, pickers, navigation chrome) on the schemes this
// app ships: light only forces light; once `dark` exists the device decides.
// Optional call because react-native-web does not implement it.
setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = (system === "light" || system === "dark") && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

// Themed StyleSheet: returns a hook that builds the sheet from the active
// scheme's colors and memoizes it until the scheme changes.
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}


