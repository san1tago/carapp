import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicles } from "../../src/store/vehicles";
import { colors } from "../../src/theme/colors";

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));
  if (!v) return null;

  const initial = useMemo(
    () => ({
      name: v.name ?? "",
      model: v.model ?? "",
      plate: v.plate ?? "",
    }),
    [v.id]
  );

  const [name, setName] = useState(initial.name);
  const [model, setModel] = useState(initial.model);
  const [plate, setPlate] = useState(initial.plate);

  const canSave =
    name !== initial.name || model !== initial.model || plate !== initial.plate;

  const save = () => {
    updateVehicle(v.id, { name, model, plate });
  };

  const goSoat = () => {
    router.push({
      pathname: "/vehicle/[id]/soat",
      params: { id: String(v.id) },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.title}>{name?.trim() ? name : "Nuevo vehículo"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre del vehículo (Ej: Mi Carro)"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Modelo del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <TextInput
          value={plate}
          onChangeText={setPlate}
          placeholder="Placa del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
          autoCapitalize="characters"
        />

        <Pressable style={styles.photoBox}>
          <Text style={styles.photoTitle}>Tomar foto del vehículo</Text>
          <Text style={styles.photoSub}>Añade una foto de tu carro</Text>
        </Pressable>

        <View style={{ height: 18 }} />

        <Pressable style={styles.bigCard} onPress={goSoat}>
          <Text style={styles.cardTitle}>SOAT</Text>
          <View style={styles.cardBtn}>
            <Text style={styles.cardBtnTxt}>Añadir SOAT</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.bigCard}
          onPress={() =>
            router.push({ pathname: "/vehicle/[id]/tecnicomecanica", params: { id: String(v.id) } })
          }
        >
          <Text style={styles.cardTitle}>Revisión Técnico Mecánica</Text>
          <View style={styles.cardBtn}>
            <Text style={styles.cardBtnTxt}>Añadir Revisión</Text>
          </View>
        </Pressable>

        {/* luego agregamos Extintor, Kit, etc. */}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.save, { opacity: canSave ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>Guardar cambios</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  back: { padding: 6 },
  backTxt: { color: colors.white, fontSize: 22, fontWeight: "900" },
  title: { color: colors.white, fontSize: 22, fontWeight: "900", fontStyle: "italic" },

  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 4,
    color: colors.white,
    fontWeight: "800",
    fontStyle: "italic",
  },

  photoBox: {
    marginTop: 10,
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic", fontSize: 18 },
  photoSub: { color: "rgba(255,255,255,0.55)", fontWeight: "800", fontStyle: "italic" },

  bigCard: {
    borderRadius: 18,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 16,
    gap: 14,
  },
  cardTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic", fontSize: 18 },
  cardBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },

  footer: { padding: 18, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  save: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
});
