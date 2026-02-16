import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
