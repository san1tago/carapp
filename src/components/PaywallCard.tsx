import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function PaywallCard({
  title,
  price,
  sub,
  footer,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  sub?: string;
  footer?: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: selected ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.10)" },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
      {!!footer && <Text style={styles.footer}>{footer}</Text>}

      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card2,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
    fontStyle: "italic",
  },
  price: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
    fontStyle: "italic",
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: {
    color: colors.muted2,
    fontSize: 12,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 2,
  },
  badge: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeTxt: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
    fontStyle: "italic",
  },
});
