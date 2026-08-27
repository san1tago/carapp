import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export function initRevenueCat() {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
  });
  if (!apiKey) return;
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE); // 👈 más detalle en logs
  Purchases.configure({ apiKey });
}
