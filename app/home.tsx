import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Pressable 
        onPress={() => router.push("/add-vehicle")}
        style={({ pressed }) => [styles.card, pressed ? { opacity: 0.9 } : null]}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.txt}>Añadir vehículo</Text>
          
        </Pressable>
      </View>

      {/* Barra inferior “fake” como en tu screenshot */}
      <View style={styles.bottomBar}>
        <Text style={styles.userIcon}>⦿</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  card: {
    width: 140,
    height: 170,
    borderRadius: 16,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  plus: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
  },
  txt: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
  },

  bottomBar: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  userIcon: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
  },
});
