import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const MANUAL_DOCS = [
  "Licencia de conducción",
  "Licencia de tránsito (tarjeta de propiedad)",
  "Cédula de ciudadanía",
];

export default function DocumentosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();

  const v = getVehicle(String(id));
  if (!v) return null;

  const [items, setItems] = useState<string[]>(v.documentos?.items ?? []);

  const toggleItem = (item: string) => {
    setItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const soatOK = !!v.soat?.purchaseDate;
  const tecnoOK = !!v.tecnomecanica?.reviewDate;

  const progress = useMemo(() => {
    let count = items.length;

    if (soatOK) count += 1;
    if (tecnoOK) count += 1;

    return count;
  }, [items, soatOK, tecnoOK]);

  const percent = progress / 5;

  const save = () => {
    updateVehicle(v.id, {
      documentos: {
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

        <Text style={styles.title}>Documentos necesarios - {v.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* PROGRESS */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progreso documentos</Text>

            <Text style={styles.progressCount}>{progress}/5</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBar, { width: `${percent * 100}%` }]}
            />
          </View>
        </View>

        <Text style={styles.section}>
          Documentos que debes tener siempre contigo:
        </Text>

        {/* MANUAL */}

        {MANUAL_DOCS.map((doc) => {
          const selected = items.includes(doc);

          return (
            <Pressable
              key={doc}
              onPress={() => toggleItem(doc)}
              style={styles.itemCard}
            >
              <View style={[styles.circle, selected && styles.circleOn]}>
                {selected && <Text style={styles.check}>✓</Text>}
              </View>

              <Text style={[styles.itemText, selected && styles.itemTextOn]}>
                {doc}
              </Text>
            </Pressable>
          );
        })}

        {/* SOAT */}

        <View style={styles.lockedCard}>
          <View style={styles.circle} />

          <View>
            <Text style={styles.lockedTitle}>SOAT vigente</Text>
            <Text style={styles.lockedSub}>Registra tu SOAT primero</Text>
          </View>
        </View>

        {/* TECNICO MECANICA */}

        <View style={styles.lockedCard}>
          <View style={styles.circle} />

          <View>
            <Text style={styles.lockedTitle}>
              Revisión técnico mecánica vigente
            </Text>
            <Text style={styles.lockedSub}>
              Registra tu revisión técnica primero
            </Text>
          </View>
        </View>

        {/* TIP */}

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 Tip: Mantén siempre estos documentos actualizados y a la mano.
            Los documentos registrados en la app (SOAT y revisión técnica) se
            marcan automáticamente.
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

  lockedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card2,
    padding: 14,
    borderRadius: 12,
    opacity: 0.55,
  },

  lockedTitle: {
    color: "rgba(255,255,255,0.45)",
    fontWeight: "900",
  },

  lockedSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontStyle: "italic",
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
