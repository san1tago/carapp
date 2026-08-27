import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useEntitlement } from "./useEntitlement";

const PROTECTED_SEGMENTS = ["home", "add-vehicle", "vehicle"];

export function useProtectedRoute() {
  const { isActive, loading } = useEntitlement();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const currentRoute = segments[0];

    // PREMIUM → siempre va directamente a Home
    if (isActive) {
      if (currentRoute !== "home") {
        router.replace("/home");
      }
      return;
    }

    // NO PREMIUM → proteger las rutas de la app
    const inProtectedRoute = segments.some((s) =>
      PROTECTED_SEGMENTS.includes(s),
    );

    if (inProtectedRoute) {
      router.replace("/paywall");
    }
  }, [isActive, loading, segments]);
}
