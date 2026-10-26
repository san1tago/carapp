import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { PaywallCard } from "../src/components/PaywallCard";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { useOfferings } from "../src/hooks/useOfferings";
import { colors } from "../src/theme/colors";

export default function Paywall_Custom() {
  const { packages, loading, error } = useOfferings();
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const monthly = packages.find((p) => p.packageType === "MONTHLY");
  const annual = packages.find((p) => p.packageType === "ANNUAL");

  function formatCurrency(amount: number, currencyCode?: string) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode ?? "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${Math.round(amount).toLocaleString()}`;
    }
  }

  const annualMonthlyEquivalent = annual
    ? formatCurrency(
        annual.product.price / 12,
        (annual.product as any).currencyCode,
      )
    : null;

  const savingsPercent =
    monthly && annual
      ? Math.round(
          (1 - annual.product.price / 12 / monthly.product.price) * 100,
        )
      : null;

  async function handleContinue() {
    if (!selected) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(selected);
      if (customerInfo.entitlements.active["premium"]) {
        router.replace("/home");
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        console.log("Purchase error", e);
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active["premium"]) {
        router.replace("/home");
      } else {
        console.log("No hay compras activas para restaurar");
      }
    } catch (e: any) {
      console.log("Restore error", e);
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.white} />
      </SafeAreaView>
    );
  }

  if (error || (!monthly && !annual)) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.foot}>
          No pudimos cargar los planes. Revisa tu conexión o la configuración de
          RevenueCat.
        </Text>
        <Text style={styles.foot}>
          Error: {error ?? "sin mensaje"}
          {"\n"}
          Packages encontrados: {packages.length}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>
          Te ayudamos a recordarte del vencimiento de{"\n"}tus documentos
          importantes
        </Text>

        <View style={{ height: 18 }} />

        <View style={styles.cards}>
          {annual && (
            <PaywallCard
              title="3 días gratis"
              price="$0"
              sub={`luego ${annual.product.priceString} año (${annualMonthlyEquivalent}/mes)`}
              footer="Puedes cancelar antes"
              selected={selected?.identifier === annual.identifier}
              onPress={() => setSelected(annual)}
            />
          )}

          {monthly && (
            <PaywallCard
              title="Plan Mensual"
              price={monthly.product.priceString}
              sub="por mes"
              selected={selected?.identifier === monthly.identifier}
              onPress={() => setSelected(monthly)}
            />
          )}

          {annual && (
            <PaywallCard
              title="Plan Anual"
              price={annualMonthlyEquivalent ?? annual.product.priceString}
              sub={`por mes\nfacturado anualmente (${annual.product.priceString})`}
              badge={
                savingsPercent && savingsPercent > 0
                  ? `Ahorra ${savingsPercent}%`
                  : "Ahorra"
              }
              selected={selected?.identifier === annual.identifier}
              onPress={() => setSelected(annual)}
            />
          )}
        </View>

        <Text style={styles.foot}>
          Tu pequeño aporte nos ayuda a seguir evitando multas{"\n"}
        </Text>

        <View style={{ height: 14 }} />

        <PrimaryButton
          title={purchasing ? "Procesando..." : "Continuar"}
          onPress={handleContinue}
          disabled={!selected || purchasing}
          style={{
            width: "100%",
            maxWidth: 520,
            opacity: selected && !purchasing ? 1 : 0.55,
          }}
        />

        <Pressable
          onPress={handleRestore}
          disabled={restoring}
          style={{ marginTop: 14 }}
        >
          <Text style={styles.restoreText}>
            {restoring ? "Restaurando..." : "Restaurar compras"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  h1: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 560,
  },
  cards: { width: "100%", maxWidth: 520, gap: 16 },
  foot: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
  restoreText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
