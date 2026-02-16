import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicles, Vehicle, VehicleType } from "../src/store/vehicles";
import { colors } from "../src/theme/colors";

type Option = {
  type: VehicleType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OPTIONS: Option[] = [
  { type: "carro", label: "Carro", icon: "car-outline" },
  { type: "moto", label: "Moto", icon: "bicycle-outline" },
  { type: "camion", label: "Camión", icon: "car-outline" },
  { type: "van", label: "Van", icon: "bus-outline" },
  { type: "bus", label: "Bus", icon: "bus-outline" },
  { type: "taxi", label: "Taxi", icon: "car-outline" },
];

export default function AddVehicle() {
  const { addVehicle } = useVehicles();
  const [selected, setSelected] = useState<VehicleType | null>(null);

  const { width } = useWindowDimensions();

  // ✅ si es muy angosto, 1 columna; si no, 2 columnas
  const numColumns = width < 360 ? 1 : 2;

  const { itemSize, circleSize } = useMemo(() => {
    const paddingX = 18 * 2;
    const gap = numColumns === 1 ? 0 : 18;
    const colW = (width - paddingX - gap) / numColumns;

    // En 1 columna se ve mejor un círculo un poco más grande
    const cSize =
      numColumns === 1
        ? Math.min(160, colW * 0.78)
        : Math.min(130, Math.max(108, colW * 0.78));

    return { itemSize: colW, circleSize: cSize };
  }, [width, numColumns]);

  const create = () => {
    if (!selected) return;

    const id = String(Date.now());

    const v: Vehicle = {
      id,
      type: selected,
      name: "", // nombre se pide en la siguiente pantalla
      model: "",
      plate: "",
      soat: { remindersDaysBefore: [], notificationIds: [] },
    };

    addVehicle(v);

    router.replace({
      pathname: "/vehicle/[id]",
      params: { id },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>¿Qué vehículo quieres añadir?</Text>

        {/* Spacer para centrar título */}
        <View style={{ width: 34 }} />
      </View>

      {/* Grid */}
      <FlatList
        key={numColumns} // 🔑 obliga re-render cuando cambia columnas
        data={OPTIONS}
        keyExtractor={(o) => o.type}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns === 2 ? styles.colWrap : undefined}
        renderItem={({ item }) => {
          const isOn = selected === item.type;

          return (
            <Pressable
              onPress={() => setSelected(item.type)}
              style={[
                styles.item,
                { width: numColumns === 1 ? "100%" : itemSize },
              ]}
            >
              <View
                style={[
                  styles.circle,
                  { width: circleSize, height: circleSize },
                  isOn && styles.circleOn,
                ]}
              >
                <Ionicons name={item.icon} size={22} color={colors.white} />
              </View>

              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      {/* Bottom button */}
      <View style={styles.bottom}>
        <Pressable
          onPress={create}
          disabled={!selected}
          style={[styles.continueBtn, { opacity: selected ? 1 : 0.45 }]}
        >
          <Text style={styles.continueTxt}>Continuar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 34, alignItems: "flex-start" },
  backTxt: { color: colors.white, fontSize: 22, fontWeight: "900" },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 110, // espacio para el botón fijo
  },
  colWrap: {
    justifyContent: "space-between",
    marginBottom: 22,
  },

  item: {
    alignItems: "center",
    marginBottom: 22, // usado en 1 columna; en 2 columnas igual ayuda
  },
  circle: {
    borderRadius: 999,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleOn: {
    borderColor: "rgba(255,255,255,0.55)",
  },
  label: {
    marginTop: 12,
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  continueBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  continueTxt: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "900",
    fontStyle: "italic",
  },
});
