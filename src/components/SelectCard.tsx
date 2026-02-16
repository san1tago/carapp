import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

export function SelectCard({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
        pressed ? { opacity: 0.95 } : null,
        style,
      ]}
    >
      <Text style={[styles.txt, selected ? styles.txtSelected : styles.txtDefault]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 64,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  cardDefault: {
    backgroundColor: "transparent",
    borderColor: colors.outline,
  },
  cardSelected: {
    backgroundColor: colors.white,
    borderColor: "rgba(255,255,255,0.85)",
  },
  txt: {
    fontSize: 15,
    fontWeight: "800",
    fontStyle: "italic",
    textAlign: "center",
  },
  txtDefault: {
    color: colors.white,
  },
  txtSelected: {
    color: colors.black,
  },
});
