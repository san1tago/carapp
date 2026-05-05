import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  value?: string | null;
  onChange: (uri: string) => void;
  fileName: string;
};

export default function PhotoInput({ value, onChange, fileName }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  const handlePress = () => {
    if (value) {
      // Si hay foto: mostrar opciones — ver, cambiar
      Alert.alert("Foto", "¿Qué deseas hacer?", [
        { text: "Cancelar", style: "cancel" },
        { text: "👁 Ver foto", onPress: () => setShowPreview(true) },
        { text: "📷 Cambiar foto", onPress: handlePick },
      ]);
    } else {
      handlePick();
    }
  };

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
    <>
      <TouchableOpacity style={styles.box} onPress={handlePress}>
        {value ? (
          <>
            <Image source={{ uri: value }} style={styles.image} />
            {/* Badge encima de la imagen */}
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>👁 Ver · ✏️ Cambiar</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>📷 Tomar foto</Text>
            <Text style={styles.sub}>Añade una foto</Text>
          </>
        )}
      </TouchableOpacity>

      {/* MODAL PREVIEW */}
      <Modal visible={showPreview} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowPreview(false)}>
          {/* Botón X */}
          <Pressable style={styles.closeBtn} onPress={() => setShowPreview(false)}>
            <Text style={styles.closeTxt}>✕</Text>
          </Pressable>

          {value ? (
            <Image
              source={{ uri: value }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoTxt}>No hay foto registrada</Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 140,
    borderRadius: 14,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  badge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 6,
    alignItems: "center",
  },
  badgeTxt: {
    color: "#fff",
    fontWeight: "800",
    fontStyle: "italic",
    fontSize: 12,
  },
  title: {
    color: "#fff",
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 18,
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "800",
    fontStyle: "italic",
  },

  // Modal preview
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeTxt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  previewImage: {
    width: "95%",
    height: "75%",
    borderRadius: 16,
  },
  noPhoto: {
    padding: 30,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  noPhotoTxt: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "800",
    fontStyle: "italic",
    fontSize: 16,
  },
});