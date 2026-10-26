import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
} from "react-native";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { colors } from "../src/theme/colors";

// Exact offering ID of the paywall in the RevenueCat dashboard
const OFFERING_ID = "default";

export default function Paywall() {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const found = offerings.all[OFFERING_ID] ?? offerings.current;
        if (!found) {
          throw new Error(
            `Offering "${OFFERING_ID}" no encontrado. Disponibles: ${Object.keys(offerings.all).join(", ") || "ninguno"}`,
          );
        }
        setOffering(found);
      } catch (e: any) {
        setError(e?.message ?? "Error desconocido");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.white} />
      </SafeAreaView>
    );
  }

  if (error || !offering) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.foot}>
          No pudimos cargar los planes.{"\n"}
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <RevenueCatUI.Paywall
      options={{ offering }}
      onPurchaseCompleted={({ customerInfo }) => {
        if (customerInfo.entitlements.active["premium"]) {
          router.replace("/home");
        }
      }}
      onRestoreCompleted={({ customerInfo }) => {
        if (customerInfo.entitlements.active["premium"]) {
          router.replace("/home");
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  foot: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 22,
  },
});
