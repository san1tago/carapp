import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Purchases from "react-native-purchases";
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
    [],
  );

  const [i, setI] = useState(0);
  const isLast = i === slides.length - 1;

  // =========================================================
  // BOTÓN "COMENZAR"
  // Aquí es donde ÚNICAMENTE comprobamos RevenueCat
  // =========================================================
  const handleStart = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      const isPremium = !!customerInfo.entitlements.active["premium"];

      if (isPremium) {
        // Usuario Premium → entra directamente a Home
        router.replace("/home");
        return;
      }

      // Usuario no Premium → continúa con el onboarding
      setI(1);
    } catch (error) {
      console.error("Error checking RevenueCat:", error);

      // Si RevenueCat falla, continuamos normalmente
      setI(1);
    }
  };

  // =========================================================
  // BOTÓN "SIGUIENTE"
  // NO consulta RevenueCat
  // =========================================================
  const handleNext = () => {
    setI((previous) => Math.min(slides.length - 1, previous + 1));
  };

  // =========================================================
  // BOTÓN "ANTERIOR"
  // =========================================================
  const handlePrevious = () => {
    setI((previous) => Math.max(0, previous - 1));
  };

  // =========================================================
  // BOTÓN "CONTINUAR" DE LA ÚLTIMA SLIDE
  // NO consulta RevenueCat
  // =========================================================
  const handleFinish = () => {
    router.replace("/questions");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <OnboardingSlide {...slides[i]} />

          <ProgressDots total={slides.length} index={i} />
        </View>

        <View style={[styles.bottomRow, i === 0 && styles.firstSlideRow]}>
          {i === 0 ? (
            // =================================================
            // PRIMERA SLIDE → BOTÓN "COMENZAR"
            // =================================================
            <PrimaryButton
              title="Comenzar"
              onPress={handleStart}
              style={{
                width: "100%",
                maxWidth: 520,
              }}
            />
          ) : (
            // =================================================
            // RESTO DE SLIDES
            // =================================================
            <>
              <SecondaryButton
                title="Anterior"
                onPress={handlePrevious}
                style={{ flex: 1 }}
              />

              <View style={styles.buttonSpacer} />

              <PrimaryButton
                title={isLast ? "Continuar" : "Siguiente"}
                onPress={isLast ? handleFinish : handleNext}
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
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  container: {
    flex: 1,
  },

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

  firstSlideRow: {
    justifyContent: "center",
  },

  buttonSpacer: {
    width: 14,
  },
});
