import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

export default function CedulaScreen() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean, isFront: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      isFront ? setFrontImage(uri) : setBackImage(uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        {/* FRENTE */}
        <Pressable
          style={styles.photoBox}
          onPress={() => pickImage(true, true)}
        >
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.camera}>📷 Frente</Text>
          )}
        </Pressable>

        {/* REVERSO */}
        <Pressable
          style={styles.photoBox}
          onPress={() => pickImage(false, false)}
        >
          {backImage ? (
            <Image source={{ uri: backImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.camera}>📷 Reverso</Text>
          )}
        </Pressable>
      </ScrollView>
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
imagePreview: {
  width: "100%",
  height: "100%",
  borderRadius: 14,
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
