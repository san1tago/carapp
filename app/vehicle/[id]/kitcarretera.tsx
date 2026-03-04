import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const REQUIRED_ITEMS = [
  "Un gato con capacidad de elevar el vehículo",
  "Una cruceta",
  "Señales de carretera",
  "Botiquín de primeros auxilios",
  "Tacos para bloquear el carro",
  "Caja de herramientas básica",
  "Llanta de repuesto",
  "Linterna",
];

const OPTIONAL_ITEMS = ["Chaleco reflectivo", "Cables de arranque", "Agua"];

export default function KitCarreteraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();

  const v = getVehicle(String(id));
  if (!v) return null;

  const [items, setItems] = useState<string[]>(v.kitCarretera?.items ?? []);

  const toggleItem = (item: string) => {
    setItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const progress = useMemo(() => {
    const count = REQUIRED_ITEMS.filter((i) => items.includes(i)).length;
    return count;
  }, [items]);

  const percent = progress / REQUIRED_ITEMS.length;

  const save = () => {
    updateVehicle(v.id, {
      kitCarretera: {
        items,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Kit de carretera - {v.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* PROGRESS */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Progreso elementos obligatorios
            </Text>

            <Text style={styles.progressCount}>
              {progress}/{REQUIRED_ITEMS.length}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBar, { width: `${percent * 100}%` }]}
            />
          </View>
        </View>

        {/* REQUIRED */}

        <Text style={styles.section}>
          Elementos obligatorios del kit de carretera:
        </Text>

        {REQUIRED_ITEMS.map((item) => {
          const selected = items.includes(item);

          return (
            <Pressable
              key={item}
              onPress={() => toggleItem(item)}
              style={styles.itemCard}
            >
              <View style={[styles.circle, selected && styles.circleOn]}>
                {selected && <Text style={styles.check}>✓</Text>}
              </View>

              <Text style={[styles.itemText, selected && styles.itemTextOn]}>
                {item}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.extintorCard}>
          <Text style={styles.extintorIcon}>✕</Text>

          <View>
            <Text style={styles.extintorTitle}>Extintor</Text>
            <Text style={styles.extintorSub}>
              Tiene su propia sección arriba
            </Text>
          </View>
        </View>

        {/* OPTIONAL */}

        <Text style={styles.section}>
          Elementos no obligatorios pero recomendados:
        </Text>

        {OPTIONAL_ITEMS.map((item) => {
          const selected = items.includes(item);

          return (
            <Pressable
              key={item}
              onPress={() => toggleItem(item)}
              style={styles.itemCard}
            >
              <View style={[styles.circle, selected && styles.circleOn]}>
                {selected && <Text style={styles.check}>✓</Text>}
              </View>

              <Text style={[styles.itemText, selected && styles.itemTextOn]}>
                {item}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 Tip: Mantén estos elementos siempre en tu vehículo para estar
            preparado ante cualquier emergencia en carretera.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            save();
            router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnTxt}>← Volver al vehículo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  back: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },

  extintorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card2,
    padding: 14,
    borderRadius: 12,
    opacity: 0.75,
  },

  extintorIcon: {
    color: "#ef4444",
    fontWeight: "900",
    fontSize: 18,
  },

  extintorTitle: {
    color: "#ef4444",
    fontWeight: "900",
  },

  extintorSub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontStyle: "italic",
  },

  title: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 20,
    fontStyle: "italic",
  },

  body: {
    padding: 18,
    gap: 12,
  },

  progressCard: {
    backgroundColor: colors.card2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressTitle: {
    color: colors.white,
    fontWeight: "900",
  },

  progressCount: {
    color: "#22c55e",
    fontWeight: "900",
  },

  progressBarBg: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 10,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#22c55e",
    borderRadius: 10,
  },

  section: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "900",
    marginTop: 10,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card2,
    padding: 14,
    borderRadius: 12,
  },

  circle: {
    width: 24,
    height: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },

  circleOn: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  check: {
    color: "white",
    fontWeight: "900",
  },

  itemText: {
    color: colors.white,
    fontWeight: "800",
  },

  itemTextOn: {
    color: "#22c55e",
  },

  tip: {
    marginTop: 16,
    backgroundColor: "#3b2400",
    borderRadius: 12,
    padding: 12,
  },

  tipText: {
    color: "#facc15",
    fontWeight: "800",
  },

  footer: {
    padding: 18,
  },

  backBtn: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  backBtnTxt: {
    fontWeight: "900",
  },
});
