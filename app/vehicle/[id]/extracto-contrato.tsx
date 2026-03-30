import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import PhotoInput from "../../../components/PhotoInput";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

export default function ExtractoContratoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();

  const v = getVehicle(String(id));
  if (!v) return null;

  const initial = useMemo(() => {
    return {
      info: v.extractoContrato?.info ?? "",
    };
  }, [v]);

  const [info, setInfo] = useState(initial.info);

  const canSave = info !== initial.info;

  useEffect(() => {
    setInfo(initial.info);
  }, [initial.info]);

  const save = () => {
    updateVehicle(v.id, {
      extractoContrato: {
        info,
      },
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>

        <Text style={styles.h1}>Extracto de contrato - {v.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Información del extracto de contrato</Text>

        <TextInput
          value={info}
          onChangeText={setInfo}
          placeholder="Ej: Número de contrato, empresa, vigencia, etc."
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <Text style={styles.help}>
          Registra la información relevante del extracto de contrato
        </Text>

        <Text style={styles.label}>Foto del extracto de contrato</Text>

       <PhotoInput
          value={v.extractoContrato?.photoUri}
          fileName={`extracto_contrato_${v.id}.jpg`}
          onChange={(uri) =>
            updateVehicle(v.id, {
              extractoContrato: { ...v.extractoContrato, photoUri: uri },
            })
          }
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTxt}>
            💡 Información: El extracto de contrato es requerido para vehículos
            de servicio público. Este documento certifica la relación
            contractual con la empresa de transporte.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.save, { opacity: canSave ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>Guardar extracto de contrato</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  back: { padding: 6 },

  backTxt: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },

  h1: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
  },

  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  label: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 8,
  },

  help: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    fontStyle: "italic",
  },

  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    color: colors.white,
    fontWeight: "800",
    fontStyle: "italic",
  },

  photoBox: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  photoTxt: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  infoBox: {
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#0b1e3b",
    borderWidth: 1,
    borderColor: "#1e3a8a",
  },

  infoTxt: {
    color: "#60a5fa",
    fontWeight: "900",
    fontStyle: "italic",
  },

  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },

  save: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  saveTxt: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },
});
