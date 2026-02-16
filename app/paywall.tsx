import { router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PaywallCard } from "../src/components/PaywallCard";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors } from "../src/theme/colors";

export default function Paywall() {
  const [selected, setSelected] = useState<"trial" | "monthly" | "annual" | null>(null);
const canContinue = selected !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>
          Te ayudamos a recordarte del vencimiento de{"\n"}tus documentos importantes
        </Text>

        <View style={{ height: 18 }} />

        <View style={styles.cards}>
          <PaywallCard
            title="3 días gratis"
            price="$0"
            sub="luego $10,000 año ($0.833/mes)"
            footer="Puedes cancelar antes"
            selected={selected === "trial"}
            onPress={() => setSelected("trial")}
          />

          <PaywallCard
            title="Plan Mensual"
            price="$5,000"
            sub="por mes"
            selected={selected === "monthly"}
            onPress={() => setSelected("monthly")}
          />

          <PaywallCard
            title="Plan Anual"
            price="$0.833"
            sub="por mes"
            footer="facturado anualmente ($10,000)"
            badge="Ahorra 83%"
            selected={selected === "annual"}
            onPress={() => setSelected("annual")}
          />
        </View>

        <Text style={styles.foot}>
          Tu pequeño aporte nos ayuda a seguir combatiendo las multas{"\n"}injustas
        </Text>

        <View style={{ height: 14 }} />

        <PrimaryButton
  title="Continuar"
  onPress={() => router.replace("/home")}
  disabled={!canContinue}
  style={{ width: "100%", maxWidth: 520, opacity: canContinue ? 1 : 0.55 }}
/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  cards: {
    width: "100%",
    maxWidth: 520,
    gap: 16,
  },
  foot: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
});
