import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhotoInput from "../../../components/PhotoInput";
import { cancelNotifications, scheduleDocumentReminders } from "../../../src/notifications/reminderEngine";
import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const reminderOptions = [
  { label: "1 día", days: 1 },
  { label: "3 días", days: 3 },
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mes", days: 30 },
];

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function formatDateLong(dateStr: string): string {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("/").map(Number);
  if (!d || !m || !y) return dateStr;
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function getReminderDate(expiryDateStr: string, daysBefore: number): string {
  if (!expiryDateStr) return "";
  const [d, m, y] = expiryDateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - daysBefore);
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

function NativeDatePicker({ visible, onConfirm, onCancel, allowPast = false }: {
  visible: boolean;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  allowPast?: boolean;
}) {
  const [tempDate, setTempDate] = useState(new Date());
  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={tempDate} mode="date" display="spinner"
        minimumDate={allowPast ? undefined : new Date()}
        onChange={(event, date) => {
          if (event.type === "dismissed") { onCancel(); return; }
          if (date) onConfirm(date);
        }}
      />
    );
  }

  return (
    <View style={styles.dpContainer}>
      <Text style={styles.dpTitle}>📅 Selecciona la fecha</Text>
      <DateTimePicker
        value={tempDate} mode="date" display="spinner"
        minimumDate={allowPast ? undefined : new Date()}
        locale="es-ES" textColor="#ffffff" themeVariant="dark"
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

export default function SeguroAdicionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));

  const initial = useMemo(() => ({
    type: v?.seguroAdicional?.type ?? "",
    startDate: v?.seguroAdicional?.startDate ?? "",
    endDate: v?.seguroAdicional?.endDate ?? "",
    reminders: v?.seguroAdicional?.remindersDaysBefore ?? [],
    notificationIds: v?.seguroAdicional?.notificationIds ?? [],
  }), [v]);

  const [type, setType] = useState(initial.type);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [reminders, setReminders] = useState<number[]>(initial.reminders);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const canSave = !saving && (
    type !== initial.type ||
    startDate !== initial.startDate ||
    endDate !== initial.endDate ||
    JSON.stringify(reminders.slice().sort()) !== JSON.stringify(initial.reminders.slice().sort())
  );

  useEffect(() => {
    setType(initial.type);
    setStartDate(initial.startDate);
    setEndDate(initial.endDate);
    setReminders(initial.reminders);
  }, [initial]);

  if (!v) return null;

  const addReminder = () => { if (!endDate) return; setReminders((prev) => [...prev, 7]); };

  const updateReminder = (index: number, days: number) => {
    setReminders((prev) => { const copy = [...prev]; copy[index] = days; return copy; });
    setOpenIndex(null);
  };

  const removeReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartConfirm = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setStartDate(`${d}/${m}/${date.getFullYear()}`);
    setShowStartPicker(false);
  };

  const handleEndConfirm = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setEndDate(`${d}/${m}/${date.getFullYear()}`);
    setShowEndPicker(false);
  };

  // Convierte dd/mm/yyyy → Date
  function parseDMY(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }

  const save = async () => {
    if (!endDate) return;
    setSaving(true);
    try {
      const perm = await Notifications.getPermissionsAsync();
      if (perm.status !== "granted") await Notifications.requestPermissionsAsync();

      await cancelNotifications(initial.notificationIds);

      const start = parseDMY(startDate);
      const end = parseDMY(endDate);

      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert("Fechas inválidas"); setSaving(false); return;
      }
      if (end <= start) {
        alert("La fecha de vencimiento debe ser mayor a la de inicio"); setSaving(false); return;
      }

      const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const ids = await scheduleDocumentReminders({
        title: "🛡️ Seguro adicional por vencer",
        body: `El seguro adicional de ${v.name} vence pronto`,
        baseDate: end,
        durationDays: 0,
        reminderDaysBefore: reminders,
      });

      updateVehicle(v.id, {
        seguroAdicional: {
          type,
          startDate,
          endDate,
          remindersDaysBefore: reminders,
          notificationIds: ids,
        },
      });

      router.back();
    } catch (error) {
      console.log("Error guardando seguro adicional:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.h1}>Seguro adicional - {v.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* TIPO */}
        <Text style={styles.label}>Tipo de seguro adicional</Text>
        <TextInput
          value={type} onChangeText={setType}
          placeholder="Ej: Todo riesgo, Responsabilidad civil ampliada"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />
        <Text style={styles.help}>Especifica el tipo de seguro adicional que tienes contratado</Text>

        {/* FECHA INICIO */}
        <Text style={styles.label}>Fecha de inicio del seguro</Text>
        <Pressable style={styles.dateInput} onPress={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}>
          {startDate
            ? <Text style={styles.reviewText}>✅ Inicia el: {formatDateLong(startDate)}</Text>
            : <Text style={styles.datePlaceholder}>Selecciona la fecha</Text>}
          <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>
        <NativeDatePicker visible={showStartPicker} onConfirm={handleStartConfirm} onCancel={() => setShowStartPicker(false)} allowPast={true} />

        {/* FECHA VENCIMIENTO */}
        <Text style={[styles.label, { marginTop: 16 }]}>Fecha de vencimiento del seguro</Text>
        <Pressable style={styles.dateInput} onPress={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}>
          {endDate
            ? <Text style={styles.expiryText}>🔴 Se vence el: {formatDateLong(endDate)}</Text>
            : <Text style={styles.datePlaceholder}>Selecciona la fecha</Text>}
          <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>
        <NativeDatePicker visible={showEndPicker} onConfirm={handleEndConfirm} onCancel={() => setShowEndPicker(false)} allowPast={false} />

        <Text style={styles.help}>Los seguros pueden tener diferentes temporalidades (6 meses, 1 año, etc.)</Text>

        {/* FOTO */}
        <Text style={styles.label}>Foto del seguro</Text>
        <PhotoInput
          value={v.seguroAdicional?.photoUri}
          fileName={`seguro_adicional_${v.id}.jpg`}
          onChange={(uri) => updateVehicle(v.id, { seguroAdicional: { ...v.seguroAdicional, photoUri: uri } })}
        />

        {/* RECORDATORIOS */}
        <View style={styles.remHeader}>
          <Text style={styles.remTitle}>🔔 Recordatorios</Text>
          <Pressable style={[styles.addBtn, { opacity: endDate ? 1 : 0.35 }]} onPress={addReminder} disabled={!endDate}>
            <Text style={styles.addBtnTxt}>+ Añadir</Text>
          </Pressable>
        </View>

        {!endDate && <Text style={styles.emptyTxt}>Ingresa la fecha de vencimiento para añadir recordatorios</Text>}

        <View style={styles.remList}>
          {endDate && reminders.length === 0 && <Text style={styles.emptyTxt}>No hay recordatorios configurados</Text>}

          {reminders.map((days, index) => {
            const selected = reminderOptions.find((o) => o.days === days)?.label || "";
            const reminderDate = getReminderDate(endDate, days);
            return (
              <View key={index} style={[styles.reminderCard, openIndex === index && { zIndex: 1000 }]}>
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderText}>🔔 Recordar</Text>
                  <Pressable style={styles.dropdown} onPress={() => setOpenIndex(openIndex === index ? null : index)}>
                    <Text style={styles.dropdownTxt}>{selected}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </Pressable>
                  <Text style={styles.reminderText}>antes</Text>
                  <Pressable onPress={() => removeReminder(index)}>
                    <Text style={styles.deleteTxt}>🗑</Text>
                  </Pressable>
                </View>
                {reminderDate ? <Text style={styles.reminderDateTxt}>📩 Se enviará el {reminderDate}</Text> : null}
                {openIndex === index && (
                  <View style={styles.dropdownMenu}>
                    {reminderOptions.map((opt) => (
                      <Pressable key={opt.days} style={styles.dropdownItem} onPress={() => updateReminder(index, opt.days)}>
                        <Text style={styles.dropdownItemTxt}>{opt.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          {reminders.length > 0 && <Text style={styles.recommendTxt}>💡 Recomendamos configurar recordatorios múltiples para mayor seguridad</Text>}
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTxt}>
            💡 Los seguros adicionales como todo riesgo no son obligatorios por ley, pero ofrecen mayor protección para tu vehículo.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={save} disabled={!canSave || !endDate} style={[styles.save, { opacity: canSave && endDate ? 1 : 0.35 }]}>
          <Text style={styles.saveTxt}>{saving ? "Guardando..." : "Guardar seguro adicional"}</Text>
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
  h1: { color: colors.white, fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  body: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 0 },
  label: { color: colors.white, fontWeight: "900", fontStyle: "italic", marginBottom: 8 },
  input: { height: 48, borderRadius: 10, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12, color: colors.white, fontWeight: "800", fontStyle: "italic" },
  help: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 6, marginBottom: 16, fontStyle: "italic" },
  dateInput: { minHeight: 54, borderRadius: 12, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  datePlaceholder: { color: "rgba(255,255,255,0.35)", fontWeight: "800", fontStyle: "italic" },
  reviewText: { color: "#22c55e", fontWeight: "900", fontStyle: "italic", fontSize: 14, flex: 1, flexWrap: "wrap" },
  expiryText: { color: "#ff4d4f", fontWeight: "900", fontStyle: "italic", fontSize: 14, flex: 1, flexWrap: "wrap" },
  calendarIcon: { fontSize: 18, marginLeft: 8 },
  remHeader: { marginTop: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  remTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic", fontSize: 18 },
  addBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  emptyTxt: { color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginTop: 10 },
  remList: { marginTop: 10, gap: 10, zIndex: 100 },
  reminderCard: { backgroundColor: colors.card2, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 14, position: "relative", gap: 8 },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reminderText: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  reminderDateTxt: { color: "#60a5fa", fontWeight: "800", fontStyle: "italic", fontSize: 12, marginLeft: 2 },
  dropdown: { backgroundColor: "#2e3b4e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  dropdownTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  dropdownArrow: { color: "rgba(255,255,255,0.4)", fontSize: 10 },
  deleteTxt: { color: "#ff4d4f", fontSize: 16 },
  dropdownMenu: { position: "absolute", top: 60, left: 80, backgroundColor: "#1f2a38", borderRadius: 12, paddingVertical: 8, width: 160, elevation: 20 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownItemTxt: { color: colors.white, fontWeight: "800" },
  recommendTxt: { marginTop: 10, color: "#ffc107", fontWeight: "900", fontStyle: "italic" },
  infoBox: { marginTop: 20, borderRadius: 14, padding: 16, backgroundColor: "#0b1e3b", borderWidth: 1, borderColor: "#1e3a8a" },
  infoTxt: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic" },
  footer: { padding: 18, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  save: { height: 54, borderRadius: 14, backgroundColor: colors.card2, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  saveTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  dpContainer: { backgroundColor: "#0b1e3b", borderRadius: 14, borderWidth: 1, borderColor: "#1e3a8a", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, marginTop: 10, marginBottom: 4 },
  dpTitle: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic", marginBottom: 4, textAlign: "center" },
  dpPicker: { width: "100%", height: 180 },
  dpActions: { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 8 },
  dpCancelBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  dpCancelTxt: { color: "rgba(255,255,255,0.7)", fontWeight: "800" },
  dpConfirmBtn: { flex: 1, height: 42, borderRadius: 10, backgroundColor: "#1e3a8a", alignItems: "center", justifyContent: "center" },
  dpConfirmTxt: { color: "#60a5fa", fontWeight: "900" },
});