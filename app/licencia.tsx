import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateInput from "../components/DateInput";
import { colors } from "../src/theme/colors";

export default function LicenciaScreen() {
  const [openInfo, setOpenInfo] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const categorias = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];

  const pickImage = async (fromCamera: boolean, isFront: boolean) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Permiso requerido");
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        isFront ? setFrontImage(uri) : setBackImage(uri);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mi Licencia de conducción</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* FOTO FRENTE */}
        <View style={styles.containerRelative}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Foto del frente de la licencia</Text>
            <Pressable onPress={() => setShowTips(!showTips)}>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.photoBox}
            onPress={() => pickImage(true, true)}
          >
            {frontImage ? (
              <Image source={{ uri: frontImage }} style={styles.imagePreview} />
            ) : (
              <>
                <Text style={styles.camera}>📷</Text>
                <Text style={styles.photoTitle}>Tomar foto del frente</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* FOTO REVERSO */}
        <View>
          <Text style={styles.label}>Foto del reverso de la licencia</Text>

          <Pressable
            style={styles.photoBox}
            onPress={() => pickImage(false, false)}
          >
            {backImage ? (
              <Image source={{ uri: backImage }} style={styles.imagePreview} />
            ) : (
              <>
                <Text style={styles.camera}>📷</Text>
                <Text style={styles.photoTitle}>Seleccionar imagen</Text>
              </>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.addCategory} onPress={() => setShowModal(true)}>
          <Text style={styles.addCategoryTitle}>＋ Añadir categoría</Text>
        </Pressable>
      </ScrollView>

      {/* MODAL */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.label}>Categoría</Text>

            <Pressable
              style={styles.input}
              onPress={() => setOpenDropdown(!openDropdown)}
            >
              <Text style={{ color: colors.white }}>
                {categoria || "Seleccionar"}
              </Text>
            </Pressable>

            {openDropdown &&
              categorias.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setCategoria(cat);
                    setOpenDropdown(false);
                  }}
                >
                  <Text style={{ color: colors.white }}>{cat}</Text>
                </Pressable>
              ))}

            <Text style={styles.label}>Fecha de vencimiento</Text>

            <DateInput
              label=""
              value={fecha}
              onChange={setFecha}
              allowPastDates={false}
            />

            <Pressable onPress={() => setShowModal(false)}>
              <Text style={{ color: "white" }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      )}
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

  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 12,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "90%",
    backgroundColor: colors.card2,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "visible",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 18,
  },

  close: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
  },

  dropdownContainer: {
    position: "relative",
    zIndex: 50, // 🔥 clave para que quede encima
  },

  dropdownOverlay: {
    position: "absolute",
    top: 55, // justo debajo del input
    left: 0,
    right: 0,

    backgroundColor: "#2e3b4e",
    borderRadius: 14,
    paddingVertical: 10,

    zIndex: 999, // 🔥 super importante
    elevation: 10, // Android

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  modalSub: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
    marginBottom: 16,
  },

  dropdownMenu: {
    backgroundColor: "#1f2a38",
    borderRadius: 12,
    marginTop: 6,
    paddingVertical: 8,
  },

  dropdownItem: {
    padding: 10,
  },

  dropdownItemTxt: {
    color: colors.white,
    fontWeight: "800",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelTxt: {
    color: colors.white,
    fontWeight: "900",
  },

  addBtnModal: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },

  addBtnTxt: {
    color: colors.white,
    fontWeight: "900",
  },

  modalTip: {
    marginTop: 14,
    color: "#60a5fa",
    textAlign: "center",
    fontWeight: "800",
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

  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  categoriesTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  categoriesCount: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "800",
    fontStyle: "italic",
  },

  emptyCategories: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  emptySub: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontStyle: "italic",
  },

  addCategory: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 16,
    alignItems: "center",
  },

  addCategoryTitle: {
    color: "#22c55e",
    fontWeight: "900",
    fontStyle: "italic",
  },
imagePreview: {
  width: "100%",
  height: "100%",
  borderRadius: 14,
},
  addCategorySub: {
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    marginTop: 4,
  },
});
