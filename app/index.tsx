import { router } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors } from "../src/theme/colors";

export default function Index() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.brand}>CarApp</Text>
        <Text style={styles.tagline}>
          Tu asistente para mantener al día los documentos de tu vehículo
        </Text>

        <View style={{ height: 34 }} />

        <PrimaryButton
          title="Comenzar"
          onPress={() => router.push("/onboarding")}
          style={{ width: 180 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  brand: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: 520,
    lineHeight: 22,
  },
});
