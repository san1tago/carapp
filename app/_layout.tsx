import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { configureNotifications, setupAndroidChannel } from "../src/notifications/reminderEngine";
import { VehiclesProvider } from "../src/store/vehicles";


export default function RootLayout() {
    useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    configureNotifications();
    setupAndroidChannel(); // 
  }, []);
  return (
    <VehiclesProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* Onboarding */}
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="questions" />
        <Stack.Screen name="paywall" />

        {/* App */}
        <Stack.Screen name="home" />
        <Stack.Screen name="add-vehicle" />

        {/* Vehicle routes */}
        <Stack.Screen name="vehicle/[id]" />
        <Stack.Screen name="vehicle/[id]/soat" />
        <Stack.Screen name="vehicle/[id]/tecnomecanica" />
      </Stack>
    </VehiclesProvider>
  );
}
