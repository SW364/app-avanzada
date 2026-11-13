import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

// Simple "coming soon" screen used by Videos and Mis Notas until their content exists.
export function Placeholder({ title, icon, message, testID }: {
  title: string; icon: "play-circle" | "create"; message: string; testID: string;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={[styles.flex, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]} testID={testID}>
      <View style={styles.header}>
        <Pressable style={styles.roundBtn} testID="back-button" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.center}>
        <View style={styles.iconCircle}><Ionicons name={icon} size={44} color={colors.primary} /></View>
        <Text style={styles.soon} testID={`${testID}-message`}>Próximamente</Text>
        <Text style={styles.msg}>{message}</Text>
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1, paddingHorizontal: spacing.md },
  header: { flexDirection: "row", alignItems: "center" },
  roundBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center",
    shadowColor: c.shadow, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  title: { flex: 1, fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, textAlign: "center" },
  spacer: { width: 44 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.brandSecondary, alignItems: "center", justifyContent: "center" },
  soon: { fontFamily: fonts.extrabold, fontSize: 22, color: c.ink, marginTop: spacing.md },
  msg: { fontFamily: fonts.semibold, fontSize: 15, color: c.inkSoft, textAlign: "center", marginTop: spacing.xs, borderRadius: radius.md },
}));
