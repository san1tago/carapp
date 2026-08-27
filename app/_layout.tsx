import { initRevenueCat } from "@/src/lib/revenuecat";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  configureNotifications,
  setupAndroidChannel,
} from "../src/notifications/reminderEngine";
import { VehiclesProvider } from "../src/store/vehicles";

initRevenueCat();

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
    setupAndroidChannel();
  }, []);

  return (
    <VehiclesProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="questions" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="home" />
        <Stack.Screen name="add-vehicle" />
        <Stack.Screen name="vehicle/[id]" />
        <Stack.Screen name="vehicle/[id]/soat" />
        <Stack.Screen name="vehicle/[id]/tecnomecanica" />
        <Stack.Screen name="vehicle/[id]/tarjeta-operacion" />
      </Stack>
    </VehiclesProvider>
  );
}
