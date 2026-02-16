import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingSlide } from "../src/components/OnboardingSlide";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { ProgressDots } from "../src/components/ProgressDots";
import { SecondaryButton } from "../src/components/SecondaryButton";
import { colors } from "../src/theme/colors";

export default function Onboarding() {
  const slides = useMemo(
    () => [
      {
        icon: "car-outline" as const,
        title: "¡Registra tu vehículo en segundos!",
        subtitle:
          "Dale un nombre único a tu carro, moto o camión. Personaliza tu experiencia desde el primer momento",
      },
      {
        icon: "document-text-outline" as const,
        title: "Digitaliza todos tus documentos",
        subtitle:
          "Captura fotos de tu SOAT, revisión técnica, y más. Todo organizado en un solo lugar",
      },
      {
        icon: "notifications-outline" as const,
        title: "¡Olvídate de las multas para siempre!",
        subtitle:
          "Recibe alertas inteligentes antes de que venzan tus documentos. CarApp cuida tu bolsillo",
      },
      {
        icon: "car-sport-outline" as const,
        title: "Gestiona todos tus vehículos",
        subtitle:
          "¿Tienes varios vehículos? Administra los documentos de todos desde una sola app",
      },
    ],
    []
  );

  const [i, setI] = useState(0);
  const isLast = i === slides.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
  <View style={styles.container}>
    <View style={styles.content}>
      <OnboardingSlide {...slides[i]} />
      <ProgressDots total={slides.length} index={i} />
    </View>

    <View
      style={[
        styles.bottomRow,
        i === 0 && { justifyContent: "center" }, // centra cuando solo hay un botón
      ]}
    >
      {i === 0 ? (
        <PrimaryButton
          title="Siguiente"
          onPress={() => setI(1)}
          style={{ width: "100%", maxWidth: 520 }}
        />
      ) : (
        <>
          <SecondaryButton
            title="Anterior"
            onPress={() => setI((p) => Math.max(0, p - 1))}
            style={{ flex: 1 }}
          />
          <View style={{ width: 14 }} />
          <PrimaryButton
            title={isLast ? "Continuar" : "Siguiente"}
            onPress={() => {
              if (isLast) router.replace("/questions");
              else setI((p) => Math.min(slides.length - 1, p + 1));
            }}
            style={{ flex: 1 }}
          />
        </>
      )}
    </View>
  </View>
</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingBottom: 90,
  },
  bottomRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 8,
    alignItems: "center",
  },
});
