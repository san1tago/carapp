import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type Props = {
  value?: string | null;
  onChange: (uri: string) => void;
  fileName: string;
};

export default function PhotoInput({ value, onChange, fileName }: Props) {
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

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permiso necesario", "Activa la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    try {
      const documentDir = (FileSystem as any).documentDirectory ?? "";
      const newPath = documentDir + fileName;

      // borrar anterior
      if (value) {
        await FileSystem.deleteAsync(value, { idempotent: true });
      }

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      onChange(newPath);
    } catch (error) {
      console.log("Error guardando imagen:", error);
      onChange(uri);
    }
  };

  return (
    <TouchableOpacity style={styles.box} onPress={handlePick}>
      {value ? (
        <Image source={{ uri: value }} style={styles.image} />
      ) : (
        <>
          <Text style={styles.title}>Tomar foto</Text>
          <Text style={styles.sub}>Añade una foto</Text>
        </>
      )}
    </TouchableOpacity>
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
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
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
});