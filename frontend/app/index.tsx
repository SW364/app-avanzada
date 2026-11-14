import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const SITE_URL = "https://www.calcuverbs.com";

type MenuItem = {
  key: string;
  label: string;
  sub: string;
  icon: "grid" | "play-circle" | "create";
  href: Href;
  color: "blue" | "coral" | "teal";
  bg: "blueBg" | "coralBg" | "tealBg";
};

const ITEMS: MenuItem[] = [
  { key: "modules", label: "Módulos", sub: "Voz Pasiva y Modo BAT", icon: "grid", href: "/modules", color: "blue", bg: "blueBg" },
  { key: "videos", label: "Videos", sub: "Clases y explicaciones", icon: "play-circle", href: "/videos", color: "coral", bg: "coralBg" },
  { key: "notes", label: "Mis Notas", sub: "Tus apuntes personales", icon: "create", href: "/notes", color: "teal", bg: "tealBg" },
];

export default function MainMenu() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.flex} testID="main-menu">
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <View style={styles.logoRing}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} contentFit="contain" testID="main-logo" />
          </View>
          <Text style={styles.hello}>Hola y Bienvenidos a</Text>
          <Text style={styles.brand} testID="main-title">CalcuVerbs-Advanced</Text>
        </Animated.View>

        <View style={styles.list}>
          {ITEMS.map((it, i) => {
            const color = colors[it.color];
            return (
              <Animated.View key={it.key} entering={FadeInDown.delay(120 + i * 90).duration(400)}>
                <Pressable
                  testID={`menu-${it.key}`}
                  onPress={() => router.push(it.href)}
                  style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors[it.bg] }]}>
                    <Ionicons name={it.icon} size={26} color={color} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.itemLabel, { color }]}>{it.label}</Text>
                    <Text style={styles.itemSub}>{it.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={color} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.flex} />

        <Pressable
          testID="website-link"
          onPress={() => Linking.openURL(SITE_URL)}
          style={({ pressed }) => [styles.site, pressed && styles.pressed]}
        >
          <Ionicons name="globe-outline" size={18} color={colors.primary} />
          <Text style={styles.siteText}>www.CalcuVerbs.com</Text>
          <Ionicons name="open-outline" size={16} color={colors.inkSoft} />
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => {
  const shadow = { shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return {
    flex: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: spacing.md },
    hero: { alignItems: "center" },
    logoRing: { width: 132, height: 132, borderRadius: 66, backgroundColor: c.card, alignItems: "center", justifyContent: "center", ...shadow },
    logo: { width: 120, height: 120 },
    hello: { fontFamily: fonts.semibold, fontSize: 16, color: c.inkSoft, marginTop: spacing.md },
    brand: { fontFamily: fonts.extrabold, fontSize: 28, color: c.ink, textAlign: "center" },
    list: { marginTop: spacing.lg, gap: spacing.md },
    item: {
      flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: c.card,
      borderRadius: radius.lg, padding: spacing.md, minHeight: 84, ...shadow,
    },
    pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
    iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    itemLabel: { fontFamily: fonts.extrabold, fontSize: 20 },
    itemSub: { fontFamily: fonts.semibold, fontSize: 13, color: c.inkSoft },
    site: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "center",
      marginTop: spacing.lg, paddingHorizontal: spacing.lg, height: 48, borderRadius: radius.pill, backgroundColor: c.card, ...shadow,
    },
    siteText: { fontFamily: fonts.extrabold, fontSize: 16, color: c.primary },
  };
});
