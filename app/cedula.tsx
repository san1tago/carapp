import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

export default function CedulaScreen() {
  const [openInfo, setOpenInfo] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Mi cédula</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* FOTO FRENTE */}
        <View style={styles.containerRelative}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Foto del frente de la cédula</Text>

            <Pressable onPress={() => setShowTips(!showTips)}>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </Pressable>
          </View>

          {showTips && (
            <View style={styles.tooltipFloating}>
              <Text style={styles.tooltipTitle}>
                📄 Consejos para una buena foto:
              </Text>

              <Text style={styles.tooltipText}>
                • Asegúrate de tener buena iluminación
              </Text>
              <Text style={styles.tooltipText}>
                • Mantén la cédula plana y sin reflejos
              </Text>
              <Text style={styles.tooltipText}>
                • Centra la cédula en el encuadre
              </Text>
              <Text style={styles.tooltipText}>
                • Verifica que todos los datos sean legibles
              </Text>
            </View>
          )}

          <Pressable style={styles.photoBox}>
            <Text style={styles.camera}>📷</Text>
            <Text style={styles.photoTitle}>Tomar foto del frente</Text>
            <Text style={styles.photoSub}>Lado con tu foto</Text>
          </Pressable>
        </View>

        {/* FOTO REVERSO */}
        <View>
          <Text style={styles.label}>Foto del reverso de la cédula</Text>

          <Pressable style={styles.photoBox}>
            <Text style={styles.camera}>📷</Text>
            <Text style={styles.photoTitle}>Tomar foto del reverso</Text>
            <Text style={styles.photoSub}>Lado posterior</Text>
          </Pressable>
        </View>

        {/* INFO DESPLEGABLE */}
        <Pressable
          style={styles.infoBox}
          onPress={() => setOpenInfo(!openInfo)}
        >
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>💡 Información</Text>
            <Text style={styles.chevron}>{openInfo ? "▲" : "▼"}</Text>
          </View>

          {openInfo && (
            <Text style={styles.infoText}>
              Guarda fotos claras de ambos lados de tu cédula para tenerla
              siempre disponible digitalmente. Asegúrate de que toda la
              información sea legible.
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.save}>
          <Text style={styles.saveTxt}>Guardar cédula</Text>
        </Pressable>

        <Pressable
          style={styles.backBtn}
          onPress={() => router.push("/perfil")}
        >
          <Text style={styles.backBtnTxt}>Volver al perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  back: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },

  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
  },

  body: {
    padding: 18,
    gap: 18,
  },

  label: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 8,
  },

  infoIcon: {
    color: "#facc15",
  },

  photoBox: {
    height: 150,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  camera: {
    fontSize: 18,
  },

  photoTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  photoSub: {
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    fontSize: 12,
  },

  infoBox: {
    marginTop: 10,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#0b1e3b",
    borderWidth: 1,
    borderColor: "#1e3a8a",
  },

  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoTitle: {
    color: "#60a5fa",
    fontWeight: "900",
    fontStyle: "italic",
  },

  chevron: {
    color: "#60a5fa",
    fontWeight: "900",
  },

  infoText: {
    marginTop: 10,
    color: "#60a5fa",
    fontWeight: "800",
  },

  footer: {
    padding: 18,
    gap: 10,
  },

  containerRelative: {
    position: "relative",
  },

  tooltipFloating: {
    position: "absolute",
    top: 30, // 🔥 justo debajo del título
    left: 50, // puedes ajustar si quieres más pegado al icono
    zIndex: 100,

    maxWidth: "80%",
    backgroundColor: colors.card2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  save: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  saveTxt: {
    fontWeight: "900",
    fontStyle: "italic",
  },

  backBtn: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  backBtnTxt: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // 🔥 esto lo pega
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  tooltip: {
    maxWidth: "85%",
    alignSelf: "auto", // 🔥 clave (no centrado)
    backgroundColor: colors.card2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  tooltipTitle: {
    color: "#facc15",
    fontWeight: "900",
    marginBottom: 10,
  },

  tooltipText: {
    color: "#facc15",
    fontWeight: "800",
    marginBottom: 6,
    flexShrink: 1, // 🔥 evita que se expanda raro
  },

  tooltipInline: {
    marginTop: 8,
    alignSelf: "flex-start", // 🔥 clave (no centrado)
    maxWidth: "80%",
    backgroundColor: colors.card2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
