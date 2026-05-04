import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

function PhotoInput({
  value,
  onChange,
  fileName,
}: {
  value?: string | null;
  onChange: (uri: string) => void;
  fileName: string;
}) {
  const handlePick = async () => {
    Alert.alert("Añadir foto", "Selecciona una opción", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Galería", onPress: pickFromGallery },
    ]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permiso necesario", "Activa la cámara");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) processImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permiso necesario", "Activa la galería");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) processImage(result.assets[0].uri);
  };

  const processImage = async (uri: string) => {
    try {
      const documentDir = (FileSystem as any).documentDirectory ?? "";
      const newPath = documentDir + fileName;
      if (value) await FileSystem.deleteAsync(value, { idempotent: true });
      await FileSystem.copyAsync({ from: uri, to: newPath });
      onChange(newPath);
    } catch (error) {
      console.log("Error guardando imagen:", error);
      onChange(uri);
    }
  };

  return (
    <TouchableOpacity style={styles.photoBox} onPress={handlePick}>
      {value ? (
        <Image source={{ uri: value }} style={styles.image} />
      ) : (
        <>
          <Text style={styles.camera}>📷</Text>
          <Text style={styles.photoTitle}>Tomar foto</Text>
          <Text style={styles.photoSub}>Añade una foto</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function CedulaScreen() {
  const [openInfo, setOpenInfo] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("cedula_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.front) setFrontUri(parsed.front);
          if (parsed.back) setBackUri(parsed.back);
        }
      } catch (e) {
        console.log("Error cargando cédula:", e);
      }
    })();
  }, []);

  const saveCedula = async () => {
    await AsyncStorage.setItem(
      "cedula_data",
      JSON.stringify({ front: frontUri, back: backUri })
    );
    alert("Cédula guardada ✅");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
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
              <Text style={styles.tooltipTitle}>📄 Consejos para una buena foto:</Text>
              <Text style={styles.tooltipText}>• Asegúrate de tener buena iluminación</Text>
              <Text style={styles.tooltipText}>• Mantén la cédula plana y sin reflejos</Text>
              <Text style={styles.tooltipText}>• Centra la cédula en el encuadre</Text>
              <Text style={styles.tooltipText}>• Verifica que todos los datos sean legibles</Text>
            </View>
          )}
          <PhotoInput value={frontUri} onChange={setFrontUri} fileName="cedula_front.jpg" />
        </View>

        {/* FOTO REVERSO */}
        <View>
          <Text style={styles.label}>Foto del reverso de la cédula</Text>
          <PhotoInput value={backUri} onChange={setBackUri} fileName="cedula_back.jpg" />
        </View>

        {/* INFO */}
        <Pressable style={styles.infoBox} onPress={() => setOpenInfo(!openInfo)}>
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

      <View style={styles.footer}>
        <Pressable style={styles.save} onPress={saveCedula}>
          <Text style={styles.saveTxt}>Guardar cédula</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.push("/perfil")}>
          <Text style={styles.backBtnTxt}>Volver al perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  back: { color: colors.white, fontSize: 22, fontWeight: "900" },
  title: { color: colors.white, fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  body: { padding: 18, gap: 18 },
  containerRelative: { position: "relative" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  label: { color: colors.white, fontWeight: "900", fontStyle: "italic", marginBottom: 8 },
  infoIcon: { color: "#facc15" },
  photoBox: { height: 150, borderRadius: 14, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", gap: 6, overflow: "hidden" },
  image: { width: "100%", height: "100%", borderRadius: 14 },
  camera: { fontSize: 18 },
  photoTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  photoSub: { color: "rgba(255,255,255,0.5)", fontStyle: "italic", fontSize: 12 },
  tooltipFloating: { position: "absolute", top: 30, left: 50, zIndex: 100, maxWidth: "80%", backgroundColor: colors.card2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  tooltipTitle: { color: "#facc15", fontWeight: "900", marginBottom: 10 },
  tooltipText: { color: "#facc15", fontWeight: "800", marginBottom: 6, flexShrink: 1 },
  infoBox: { marginTop: 10, borderRadius: 14, padding: 14, backgroundColor: "#0b1e3b", borderWidth: 1, borderColor: "#1e3a8a" },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoTitle: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic" },
  chevron: { color: "#60a5fa", fontWeight: "900" },
  infoText: { marginTop: 10, color: "#60a5fa", fontWeight: "800" },
  footer: { padding: 18, gap: 10 },
  save: { height: 54, borderRadius: 14, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  saveTxt: { fontWeight: "900", fontStyle: "italic" },
  backBtn: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  backBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
});