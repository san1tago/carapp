import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhotoInput from "../../components/PhotoInput";
import { useVehicles } from "../../src/store/vehicles";
import { colors } from "../../src/theme/colors";

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function formatDateLong(dateStr: string): string {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("/").map(Number);
  if (!d || !m || !y) return dateStr;
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const v = getVehicle(String(id));
  if (!v) return null;

  const [photo, setPhoto] = useState<string | null>(v.photoUri ?? null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── SOAT ─────────────────────────────────────────────────────────────────
  const soatExpiryDate = v.soat?.expiryDate;
  const soatVigente = !!soatExpiryDate;

  // ── Técnico mecánica ──────────────────────────────────────────────────────
  const tecnoExpiryDate = v.tecnomecanica?.expiryDate;
  const tecnoReviewDate = v.tecnomecanica?.reviewDate;
  const tecnoVigente = !!tecnoExpiryDate;

  // ── Extintor ──────────────────────────────────────────────────────────────
  const extintorExpiryDate = v.extintor?.expiryDate;
  const extintorVigente = !!extintorExpiryDate;

  // ── Kit carretera ─────────────────────────────────────────────────────────
  const kitItems = v.kitCarretera?.items ?? [];
  const kitTotal = kitItems.filter(Boolean).length;

  // ── Documentos ────────────────────────────────────────────────────────────
  const documentosItems = v.documentos?.items ?? [];
  const documentosBase = documentosItems.filter(Boolean).length;
  const soatDoc = soatVigente ? 1 : 0;
  const tecnoDoc = tecnoVigente ? 1 : 0;
  const documentosTotal = documentosBase + soatDoc + tecnoDoc;

  // ── Seguro / Tarjeta / Extracto ───────────────────────────────────────────
  const seguroActivo = !!v.seguroAdicional?.type;
  const tarjetaActiva = !!v.tarjetaOperacion?.expiryDate;
  const extractoActivo = !!v.extractoContrato?.info;

  const initial = useMemo(
    () => ({ name: v.name ?? "", model: v.model ?? "", plate: v.plate ?? "" }),
    [v.id],
  );

  const [name, setName] = useState(initial.name);
  const [model, setModel] = useState(initial.model);
  const [plate, setPlate] = useState(initial.plate);

  const canSave = name !== initial.name || model !== initial.model || plate !== initial.plate;

  const save = () => {
    updateVehicle(v.id, { name, model, plate });
    router.replace("/home");
  };

  const handleDelete = () => {
    deleteVehicle(String(id));
    setShowDeleteModal(false);
    router.replace("/home");
  };

  const getKitColor = () => {
    if (kitTotal === 0) return "#ff4d4f";
    if (kitTotal === 8) return "#22c55e";
    return "#facc15";
  };

  const getDocsColor = () => {
    if (documentosTotal === 0) return "#ff4d4f";
    if (documentosTotal === 5) return "#22c55e";
    return "#facc15";
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.title}>{name?.trim() ? name : "Nuevo vehículo"}</Text>
        {/* 🗑 Caneca roja */}
        <Pressable style={styles.deleteIconBtn} onPress={() => setShowDeleteModal(true)}>
          <Text style={styles.deleteIconTxt}>🗑</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={name} onChangeText={setName}
          placeholder="Nombre del vehículo (Ej: Mi Carro)"
          placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input}
        />
        <TextInput
          value={model} onChangeText={setModel}
          placeholder="Modelo del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input}
        />
        <TextInput
          value={plate} onChangeText={setPlate}
          placeholder="Placa del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)" style={styles.input}
          autoCapitalize="characters"
        />

        <PhotoInput
          value={photo}
          fileName={`vehicle_${v.id}.jpg`}
          onChange={(uri) => { setPhoto(uri); updateVehicle(v.id, { photoUri: uri }); }}
        />
        <View style={{ height: 18 }} />

        {/* SOAT */}
        <Pressable
          style={styles.bigCard}
          onPress={() => router.push({ pathname: "/vehicle/[id]/soat", params: { id: String(v.id) } })}
        >
          <Text style={styles.cardTitle}>SOAT</Text>
          {soatVigente ? (
            <>
              <Text style={styles.activeTxt}>✓ SOAT vigente</Text>
              <Text style={styles.expiryTxt}>🔴 Se vence el: {formatDateLong(soatExpiryDate!)}</Text>
            </>
          ) : (
            <View style={styles.cardBtn}>
              <Text style={styles.cardBtnTxt}>Añadir SOAT</Text>
            </View>
          )}
        </Pressable>

        {/* TÉCNICO MECÁNICA */}
        <Pressable
          style={styles.bigCard}
          onPress={() => router.push({ pathname: "/vehicle/[id]/tecnicomecanica", params: { id: String(v.id) } })}
        >
          <Text style={styles.cardTitle}>Revisión Técnico Mecánica</Text>
          {tecnoVigente ? (
            <>
              <Text style={styles.activeTxt}>✓ Revisión vigente</Text>
              {tecnoReviewDate && (
                <Text style={styles.reviewTxt}>✅ Revisado el: {formatDateLong(tecnoReviewDate)}</Text>
              )}
              <Text style={styles.expiryTxt}>🔴 Se vence el: {formatDateLong(tecnoExpiryDate!)}</Text>
            </>
          ) : (
            <View style={styles.cardBtn}>
              <Text style={styles.cardBtnTxt}>Añadir Revisión</Text>
            </View>
          )}
        </Pressable>

        {/* EXTINTOR + KIT */}
        <View style={styles.row}>
          <Pressable
            style={[styles.bigCard, { flex: 1 }]}
            onPress={() => router.push({ pathname: "/vehicle/[id]/extintor", params: { id: String(v.id) } })}
          >
            <Text style={styles.cardTitle}>Extintor</Text>
            {extintorVigente ? (
              <>
                <Text style={styles.activeTxt}>✓ Extintor vigente</Text>
                <Text style={styles.expiryTxt}>🔴 Se vence el: {formatDateLong(extintorExpiryDate!)}</Text>
              </>
            ) : (
              <View style={styles.cardBtn}>
                <Text style={styles.cardBtnTxt}>Añadir Extintor</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.bigCard, { flex: 1 }]}
            onPress={() => router.push({ pathname: "/vehicle/[id]/kitcarretera", params: { id: String(v.id) } })}
          >
            <Text style={styles.cardTitle}>Demás elementos kit de carretera</Text>
            <Text style={{ color: getKitColor(), fontWeight: "900" }}>✓ {kitTotal} de 8</Text>
          </Pressable>
        </View>

        {/* DOCUMENTOS */}
        <Pressable
          style={styles.bigCard}
          onPress={() => router.push({ pathname: "/vehicle/[id]/documentos", params: { id: String(v.id) } })}
        >
          <Text style={styles.cardTitle}>Documentos necesarios</Text>
          <Text style={{ color: getDocsColor(), fontWeight: "900" }}>✓ {documentosTotal} de 5 documentos</Text>
        </Pressable>

        {/* SEGURO */}
        <Pressable
          style={styles.bigCard}
          onPress={() => router.push({ pathname: "/vehicle/[id]/seguro", params: { id: String(v.id) } })}
        >
          <Text style={styles.cardTitle}>Seguro adicional</Text>
          {seguroActivo ? (
            <>
              <Text style={styles.activeTxt}>✓ Seguro registrado</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)" }}>Tipo: {v.seguroAdicional?.type}</Text>
              {v.seguroAdicional?.endDate && (
                <Text style={styles.expiryTxt}>🔴 Se vence el: {formatDateLong(v.seguroAdicional.endDate)}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.optional}>Opcional - No obligatorio</Text>
              <View style={styles.cardBtn}>
                <Text style={styles.cardBtnTxt}>Añadir seguro</Text>
              </View>
            </>
          )}
        </Pressable>

        <Text style={styles.sectionLabel}>Solo en vehículos de servicio público:</Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.smallCard, { flex: 1 }]}
            onPress={() => router.push({ pathname: "/vehicle/[id]/tarjeta-operacion", params: { id: String(v.id) } })}
          >
            <Text style={styles.cardTitle}>Tarjeta de operación</Text>
            {tarjetaActiva ? (
              <>
                <Text style={styles.activeTxt}>✓ Tarjeta vigente</Text>
                <Text style={styles.expiryTxt}>🔴 Se vence el: {formatDateLong(v.tarjetaOperacion?.expiryDate ?? "")}</Text>
              </>
            ) : (
              <>
                <Text style={styles.optionalSmall}>Solo servicio público</Text>
                <View style={styles.cardBtn}>
                  <Text style={styles.cardBtnTxt}>Añadir tarjeta</Text>
                </View>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.smallCard, { flex: 1 }]}
            onPress={() => router.push({ pathname: "/vehicle/[id]/extracto-contrato", params: { id: String(v.id) } })}
          >
            <Text style={styles.cardTitle}>Extracto de contrato</Text>
            {extractoActivo ? (
              <>
                <Text style={styles.activeTxt}>✓ Registrado</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>Info: {v.extractoContrato?.info}</Text>
              </>
            ) : (
              <>
                <Text style={styles.optionalSmall}>Solo servicio público</Text>
                <View style={styles.cardBtn}>
                  <Text style={styles.cardBtnTxt}>Añadir extracto</Text>
                </View>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable onPress={save} disabled={!canSave} style={[styles.save, { opacity: canSave ? 1 : 0.35 }]}>
          <Text style={styles.saveTxt}>Guardar cambios</Text>
        </Pressable>
      </View>

      {/* MODAL ELIMINAR */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable style={styles.modalClose} onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.modalCloseTxt}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>¿Eliminar vehículo?</Text>
            <Text style={styles.modalBody}>
              ¿Estás seguro de que deseas eliminar{" "}
              <Text style={{ fontWeight: "900" }}>"{name || "este vehículo"}"</Text>?
              {"\n"}Esta acción no se puede deshacer y se eliminarán todos los documentos asociados.
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancelTxt}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalDelete} onPress={handleDelete}>
                <Text style={styles.modalDeleteTxt}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { padding: 6, width: 40 },
  backTxt: { color: colors.white, fontSize: 22, fontWeight: "900" },
  title: { color: colors.white, fontSize: 20, fontWeight: "900", fontStyle: "italic", flex: 1, textAlign: "center" },
  deleteIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,77,79,0.15)", borderWidth: 1, borderColor: "rgba(255,77,79,0.4)", alignItems: "center", justifyContent: "center" },
  deleteIconTxt: { fontSize: 18 },
  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  input: { height: 48, borderRadius: 10, backgroundColor: "transparent", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.18)", paddingHorizontal: 4, color: colors.white, fontWeight: "800", fontStyle: "italic" },
  bigCard: { borderRadius: 18, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 16, gap: 14 },
  row: { flexDirection: "row", gap: 12 },
  smallCard: { borderRadius: 18, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 16, gap: 12 },
  activeTxt: { color: "#22c55e", fontWeight: "900", fontStyle: "italic" },
  expiryTxt: { color: "#ff4d4f", fontWeight: "900", fontStyle: "italic", fontSize: 13 },
  reviewTxt: { color: "#22c55e", fontWeight: "800", fontStyle: "italic", fontSize: 13 },
  optional: { color: "rgba(255,255,255,0.5)", fontWeight: "800", fontStyle: "italic" },
  optionalSmall: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontStyle: "italic" },
  sectionLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 16, marginBottom: 4 },
  cardTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic", fontSize: 18 },
  cardBtn: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  cardBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  footer: { padding: 18, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  save: { height: 54, borderRadius: 14, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  saveTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center" },
  modal: { width: "88%", backgroundColor: "#0d1b2e", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  modalClose: { position: "absolute", top: 14, right: 16 },
  modalCloseTxt: { color: "rgba(255,255,255,0.5)", fontSize: 18 },
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: "900", fontStyle: "italic", textAlign: "center", marginBottom: 12 },
  modalBody: { color: "rgba(255,255,255,0.7)", fontStyle: "italic", fontWeight: "800", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  modalCancelTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  modalDelete: { flex: 1, height: 50, borderRadius: 14, backgroundColor: "#ff4d4f", alignItems: "center", justifyContent: "center" },
  modalDeleteTxt: { color: "#fff", fontWeight: "900", fontStyle: "italic" },
});