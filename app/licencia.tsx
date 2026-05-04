import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

interface CategoriaItem {
  id: number;
  categoria: string;
  fecha: string;
}

// ─── PhotoInput (exactamente igual que el componente del SOAT) ────────────────
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

// ─── Native Date Picker ───────────────────────────────────────────────────────
function NativeDatePicker({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}) {
  const [tempDate, setTempDate] = useState(new Date());

  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="spinner"
        minimumDate={new Date()}
        onChange={(event, date) => {
          if (event.type === "dismissed") { onCancel(); return; }
          if (date) onConfirm(date);
        }}
      />
    );
  }

  return (
    <View style={styles.dpContainer}>
      <Text style={styles.dpTitle}>📅 Fecha de vencimiento</Text>
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="spinner"
        minimumDate={new Date()}
        locale="es-ES"
        textColor="#ffffff"
        themeVariant="dark"
        onChange={(_, date) => { if (date) setTempDate(date); }}
        style={styles.dpPicker}
      />
      <View style={styles.dpActions}>
        <Pressable style={styles.dpCancelBtn} onPress={onCancel}>
          <Text style={styles.dpCancelTxt}>Cancelar</Text>
        </Pressable>
        <Pressable style={styles.dpConfirmBtn} onPress={() => onConfirm(tempDate)}>
          <Text style={styles.dpConfirmTxt}>Confirmar ✓</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LicenciaScreen() {
  const [openInfo, setOpenInfo] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoriasList, setCategoriasList] = useState<CategoriaItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categorias = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("licencia_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.front) setFrontUri(parsed.front);
          if (parsed.back) setBackUri(parsed.back);
          if (parsed.categorias) setCategoriasList(parsed.categorias);
        }
      } catch (e) {
        console.log("Error cargando licencia:", e);
      }
    })();
  }, []);

  const saveLicencia = async () => {
    await AsyncStorage.setItem(
      "licencia_data",
      JSON.stringify({ front: frontUri, back: backUri, categorias: categoriasList })
    );
    alert("Licencia guardada ✅");
  };

  const addCategoria = () => {
    if (!categoria || !fecha) return;
    setCategoriasList((prev) => [...prev, { id: Date.now(), categoria, fecha }]);
    setCategoria("");
    setFecha("");
    setShowModal(false);
  };

  const removeCategoria = (id: number) => {
    setCategoriasList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDateConfirm = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setFecha(`${d}/${m}/${date.getFullYear()}`);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* HEADER */}
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
          {showTips && (
            <View style={styles.tooltipFloating}>
              <Text style={styles.tooltipTitle}>📄 Consejos para una buena foto:</Text>
              <Text style={styles.tooltipText}>• Asegúrate de tener buena iluminación</Text>
              <Text style={styles.tooltipText}>• Mantén la cédula plana y sin reflejos</Text>
              <Text style={styles.tooltipText}>• Centra la cédula en el encuadre</Text>
              <Text style={styles.tooltipText}>• Verifica que todos los datos sean legibles</Text>
            </View>
          )}
          <PhotoInput
            value={frontUri}
            onChange={setFrontUri}
            fileName="licencia_front.jpg"
          />
        </View>

        {/* FOTO REVERSO */}
        <View>
          <Text style={styles.label}>Foto del reverso de la licencia</Text>
          <PhotoInput
            value={backUri}
            onChange={setBackUri}
            fileName="licencia_back.jpg"
          />
        </View>

        {/* INFO */}
        <Pressable style={styles.infoBox} onPress={() => setOpenInfo(!openInfo)}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>🚗 Información</Text>
            <Text style={styles.chevron}>{openInfo ? "▲" : "▼"}</Text>
          </View>
          {openInfo && (
            <Text style={styles.infoText}>
              Registra todas tus categorías (si tienes varias) con sus respectivas fechas
              de vencimiento. Cada categoría puede tener una fecha diferente.
            </Text>
          )}
        </Pressable>

        {/* CATEGORÍAS HEADER */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Mis categorías de licencia</Text>
          <Text style={styles.categoriesCount}>
            {categoriasList.length} {categoriasList.length === 1 ? "categoría" : "categorías"}
          </Text>
        </View>

        {/* LISTA o EMPTY */}
        {categoriasList.length === 0 ? (
          <View style={styles.emptyCategories}>
            <View style={styles.emptyIcon}>
              <Text style={{ fontSize: 22 }}>🪪</Text>
            </View>
            <Text style={styles.emptyTitle}>No hay categorías registradas</Text>
            <Text style={styles.emptySub}>
              Añade las categorías de tu licencia de conducción para llevar un control
              completo de sus fechas de vencimiento
            </Text>
          </View>
        ) : (
          categoriasList.map((item) => (
            <View key={item.id} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryBadge}>{item.categoria}</Text>
                <Text style={styles.categoryFecha}>Vence: {item.fecha}</Text>
              </View>
              <Pressable onPress={() => removeCategoria(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteTxt}>🗑</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable style={styles.addCategory} onPress={() => setShowModal(true)}>
          <Text style={styles.addCategoryTitle}>＋ Añadir categoría</Text>
          <Text style={styles.addCategorySub}>Registra las categorías de tu licencia</Text>
        </Pressable>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.save} onPress={saveLicencia}>
          <Text style={styles.saveTxt}>Guardar Licencia</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.push("/perfil")}>
          <Text style={styles.backBtnTxt}>Volver al perfil</Text>
        </Pressable>
      </View>

      {/* MODAL: AÑADIR CATEGORÍA */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir categoría</Text>
              <Pressable onPress={() => {
                setShowModal(false);
                setOpenDropdown(false);
                setShowDatePicker(false);
              }}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.modalSub}>
              Registra las categorías de tu licencia de conducción
            </Text>

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.dropdownContainer}>
              <Pressable
                style={styles.input}
                onPress={() => { setOpenDropdown(!openDropdown); setShowDatePicker(false); }}
              >
                <Text style={{ color: categoria ? colors.white : "rgba(255,255,255,0.35)" }}>
                  {categoria || "Selecciona una categoría"}
                </Text>
                <Text style={styles.dropdownArrow}>{openDropdown ? "▲" : "▼"}</Text>
              </Pressable>
              {openDropdown && (
                <View style={styles.dropdownOverlay}>
                  {categorias.map((cat) => (
                    <Pressable
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => { setCategoria(cat); setOpenDropdown(false); }}
                    >
                      <Text style={styles.dropdownItemTxt}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.label}>Fecha de vencimiento</Text>
            <Pressable
              style={[styles.input, styles.dateInput]}
              onPress={() => { setShowDatePicker(!showDatePicker); setOpenDropdown(false); }}
            >
              <Text style={{ color: fecha ? colors.white : "rgba(255,255,255,0.35)" }}>
                {fecha || "dd/mm/aaaa"}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </Pressable>

            <NativeDatePicker
              visible={showDatePicker}
              onConfirm={handleDateConfirm}
              onCancel={() => setShowDatePicker(false)}
            />

            {!showDatePicker && (
              <>
                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => { setShowModal(false); setOpenDropdown(false); }}
                  >
                    <Text style={styles.cancelTxt}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.addBtnModal, { opacity: categoria && fecha ? 1 : 0.4 }]}
                    disabled={!categoria || !fecha}
                    onPress={addCategoria}
                  >
                    <Text style={styles.addBtnTxt}>＋ Añadir</Text>
                  </Pressable>
                </View>
                <Text style={styles.modalTip}>
                  💡 Puedes añadir tantas categorías como tengas en tu licencia
                </Text>
              </>
            )}
          </View>
        </View>
      )}
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
  tooltipText: { color: "#facc15", fontWeight: "800", marginBottom: 6 },
  infoBox: { borderRadius: 14, padding: 14, backgroundColor: "#0b1e3b", borderWidth: 1, borderColor: "#1e3a8a" },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoTitle: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic" },
  chevron: { color: "#60a5fa", fontWeight: "900" },
  infoText: { marginTop: 10, color: "#60a5fa", fontWeight: "800" },
  categoriesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoriesTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  categoriesCount: { color: "rgba(255,255,255,0.6)", fontWeight: "800", fontStyle: "italic" },
  emptyCategories: { borderRadius: 16, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 20, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  emptySub: { color: "rgba(255,255,255,0.5)", textAlign: "center", fontStyle: "italic" },
  categoryCard: { backgroundColor: colors.card2, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  categoryBadge: { color: "#22c55e", fontWeight: "900", fontStyle: "italic", fontSize: 16, backgroundColor: "rgba(34,197,94,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryFecha: { color: "rgba(255,255,255,0.7)", fontWeight: "800", fontStyle: "italic" },
  deleteBtn: { padding: 4 },
  deleteTxt: { fontSize: 18 },
  addCategory: { borderRadius: 14, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 16, alignItems: "center" },
  addCategoryTitle: { color: "#22c55e", fontWeight: "900", fontStyle: "italic" },
  addCategorySub: { color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginTop: 4 },
  footer: { padding: 18, gap: 10 },
  save: { height: 54, borderRadius: 14, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  saveTxt: { fontWeight: "900", fontStyle: "italic" },
  backBtn: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  backBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", zIndex: 999 },
  modal: { width: "90%", backgroundColor: colors.card2, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { color: colors.white, fontWeight: "900", fontSize: 18 },
  close: { color: "rgba(255,255,255,0.6)", fontSize: 18 },
  modalSub: { color: "rgba(255,255,255,0.5)", marginTop: 6, marginBottom: 16 },
  input: { height: 50, borderRadius: 12, backgroundColor: "#1a2535", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dateInput: { marginBottom: 0 },
  dropdownArrow: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  calendarIcon: { fontSize: 18 },
  dropdownContainer: { position: "relative", zIndex: 50 },
  dropdownOverlay: { position: "absolute", top: 55, left: 0, right: 0, backgroundColor: "#2e3b4e", borderRadius: 14, paddingVertical: 10, zIndex: 999, elevation: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  dropdownItem: { padding: 12, paddingHorizontal: 16 },
  dropdownItemTxt: { color: colors.white, fontWeight: "800" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cancelTxt: { color: colors.white, fontWeight: "900" },
  addBtnModal: { flex: 1, height: 48, borderRadius: 12, backgroundColor: "#374151", alignItems: "center", justifyContent: "center" },
  addBtnTxt: { color: colors.white, fontWeight: "900" },
  modalTip: { marginTop: 14, color: "#60a5fa", textAlign: "center", fontWeight: "800" },
  dpContainer: { backgroundColor: "#0b1e3b", borderRadius: 14, borderWidth: 1, borderColor: "#1e3a8a", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, marginTop: 10, marginBottom: 4 },
  dpTitle: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic", marginBottom: 4, textAlign: "center" },
  dpPicker: { width: "100%", height: 180 },
  dpActions: { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 8 },
  dpCancelBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  dpCancelTxt: { color: "rgba(255,255,255,0.7)", fontWeight: "800" },
  dpConfirmBtn: { flex: 1, height: 42, borderRadius: 10, backgroundColor: "#1e3a8a", alignItems: "center", justifyContent: "center" },
  dpConfirmTxt: { color: "#60a5fa", fontWeight: "900" },
});