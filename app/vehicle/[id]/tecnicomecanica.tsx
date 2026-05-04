import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhotoInput from "../../../components/PhotoInput";

import {
  cancelNotifications,
  scheduleDocumentReminders,
} from "../../../src/notifications/reminderEngine";

import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const reminderOptions = [
  { label: "1 día", days: 1 },
  { label: "3 días", days: 3 },
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mes", days: 30 },
];

const MESES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

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

function NativeDatePicker({
  visible,
  onConfirm,
  onCancel,
  allowPast = false,
}: {
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
        value={tempDate}
        mode="date"
        display="spinner"
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
        value={tempDate}
        mode="date"
        display="spinner"
        minimumDate={allowPast ? undefined : new Date()}
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

export default function TecnicoMecanicaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));
  if (!v) return null;

  const initial = useMemo(() => ({
    reviewDate: v.tecnomecanica?.reviewDate ?? "",
    expiryDate: v.tecnomecanica?.expiryDate ?? "",
    reminders: v.tecnomecanica?.remindersDaysBefore ?? [],
    notificationIds: v.tecnomecanica?.notificationIds ?? [],
  }), [v]);

  const [reviewDate, setReviewDate] = useState(initial.reviewDate);
  const [expiryDate, setExpiryDate] = useState(initial.expiryDate);
  const [reminders, setReminders] = useState<number[]>(initial.reminders || []);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showReviewPicker, setShowReviewPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const canSave =
    !saving && (
      reviewDate !== initial.reviewDate ||
      expiryDate !== initial.expiryDate ||
      JSON.stringify(reminders.slice().sort()) !==
        JSON.stringify(initial.reminders.slice().sort())
    );

  useEffect(() => {
    setReviewDate(initial.reviewDate);
    setExpiryDate(initial.expiryDate);
    setReminders(initial.reminders);
  }, [initial.reviewDate, initial.expiryDate, JSON.stringify(initial.reminders)]);

  const addReminder = () => {
    if (!expiryDate) return;
    setReminders((prev) => [...prev, 7]);
  };

  const updateReminder = (index: number, days: number) => {
    setReminders((prev) => {
      const copy = [...prev];
      copy[index] = days;
      return copy;
    });
    setOpenIndex(null);
  };

  const removeReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReviewConfirm = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setReviewDate(`${d}/${m}/${date.getFullYear()}`);
    setShowReviewPicker(false);
  };

  const handleExpiryConfirm = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setExpiryDate(`${d}/${m}/${date.getFullYear()}`);
    setShowExpiryPicker(false);
  };

  const save = async () => {
    if (!expiryDate) return;
    setSaving(true);

    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== "granted") await Notifications.requestPermissionsAsync();

    await cancelNotifications(initial.notificationIds);

    const [day, month, year] = expiryDate.split("/").map(Number);
    const expiryDateObj = new Date(year, month - 1, day);

    const ids = await scheduleDocumentReminders({
      title: "🔧 Revisión técnico mecánica por vencer",
      body: `La revisión técnico mecánica de ${v.name} vence pronto`,
      baseDate: expiryDateObj,
      durationDays: 0,
      reminderDaysBefore: reminders,
    });

    updateVehicle(v.id, {
      tecnomecanica: {
        ...v.tecnomecanica,
        reviewDate,
        expiryDate,
        remindersDaysBefore: reminders,
        notificationIds: ids,
      },
    });

    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.h1}>Técnico Mecánica - {v.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* FECHA ÚLTIMA REVISIÓN */}
        <Text style={styles.label}>Fecha de la última revisión</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => { setShowReviewPicker(!showReviewPicker); setShowExpiryPicker(false); }}
        >
          {reviewDate ? (
            <Text style={styles.reviewText}>✅ Revisado el: {formatDateLong(reviewDate)}</Text>
          ) : (
            <Text style={styles.datePlaceholder}>Selecciona la fecha</Text>
          )}
          <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>

        <NativeDatePicker
          visible={showReviewPicker}
          onConfirm={handleReviewConfirm}
          onCancel={() => setShowReviewPicker(false)}
          allowPast={true}
        />

        {/* FECHA VENCIMIENTO */}
        <Text style={[styles.label, { marginTop: 16 }]}>Fecha de vencimiento</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => { setShowExpiryPicker(!showExpiryPicker); setShowReviewPicker(false); }}
        >
          {expiryDate ? (
            <Text style={styles.expiryText}>🔴 Se vence el: {formatDateLong(expiryDate)}</Text>
          ) : (
            <Text style={styles.datePlaceholder}>Selecciona la fecha</Text>
          )}
          <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>

        <NativeDatePicker
          visible={showExpiryPicker}
          onConfirm={handleExpiryConfirm}
          onCancel={() => setShowExpiryPicker(false)}
          allowPast={false}
        />

        {/* FOTO */}
        <Text style={[styles.label, { marginTop: 18 }]}>Foto de la revisión técnica</Text>
        <PhotoInput
          value={v.tecnomecanica?.photoUri}
          fileName={`tecnomecanica_${v.id}.jpg`}
          onChange={(uri) =>
            updateVehicle(v.id, { tecnomecanica: { ...v.tecnomecanica, photoUri: uri } })
          }
        />

        {/* RECORDATORIOS */}
        <View style={styles.remHeader}>
          <Text style={styles.remTitle}>🔔 Recordatorios</Text>
          <Pressable
            style={[styles.addBtn, { opacity: expiryDate ? 1 : 0.35 }]}
            onPress={addReminder}
            disabled={!expiryDate}
          >
            <Text style={styles.addBtnTxt}>+ Añadir</Text>
          </Pressable>
        </View>

        {!expiryDate && (
          <Text style={styles.emptyTxt}>
            Ingresa la fecha de vencimiento para añadir recordatorios
          </Text>
        )}

        <View style={styles.remList}>
          {expiryDate && reminders.length === 0 && (
            <Text style={styles.emptyTxt}>No hay recordatorios configurados</Text>
          )}

          {reminders.map((days, index) => {
            const selected = reminderOptions.find((o) => o.days === days)?.label || "";
            const reminderDate = getReminderDate(expiryDate, days);

            return (
              <View
                key={index}
                style={[styles.reminderCard, openIndex === index && { zIndex: 1000 }]}
              >
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderText}>🔔 Recordar</Text>
                  <Pressable
                    style={styles.dropdown}
                    onPress={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <Text style={styles.dropdownTxt}>{selected}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </Pressable>
                  <Text style={styles.reminderText}>antes</Text>
                  <Pressable onPress={() => removeReminder(index)}>
                    <Text style={styles.deleteTxt}>🗑</Text>
                  </Pressable>
                </View>

                {reminderDate ? (
                  <Text style={styles.reminderDateTxt}>📩 Se enviará el {reminderDate}</Text>
                ) : null}

                {openIndex === index && (
                  <View style={styles.dropdownMenu}>
                    {reminderOptions.map((opt) => (
                      <Pressable
                        key={opt.days}
                        style={styles.dropdownItem}
                        onPress={() => updateReminder(index, opt.days)}
                      >
                        <Text style={styles.dropdownItemTxt}>{opt.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {reminders.length > 0 && (
            <Text style={styles.recommendTxt}>
              💡 Recomendamos configurar recordatorios múltiples para mayor seguridad
            </Text>
          )}
        </View>

        {/* INFO */}
        <Pressable style={styles.infoBox} onPress={() => setInfoOpen((prev) => !prev)}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTxt}>💡 Información sobre plazos de revisión técnica</Text>
            <Text style={styles.infoArrow}>{infoOpen ? "▲" : "▼"}</Text>
          </View>
          {infoOpen && (
            <View style={styles.infoContent}>
              <Text style={styles.infoBullet}>
                • En vehículos particulares la revisión técnico mecánica debe empezar a realizarse a los 5 años contados a partir de la fecha de matrícula, de ahí en adelante es anual.
              </Text>
              <Text style={styles.infoBullet}>
                • En vehículos de servicio público la revisión técnico mecánica debe empezar a realizarse a los 2 años contados a partir de la fecha de matrícula, de ahí en adelante es anual.
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave || !expiryDate}
          style={[styles.save, { opacity: canSave && expiryDate ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>
            {saving ? "Guardando..." : "Guardar revisión técnica"}
          </Text>
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
  h1: { color: colors.white, fontSize: 20, fontWeight: "900", fontStyle: "italic", flex: 1 },
  body: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 0 },
  label: { color: colors.white, fontWeight: "900", fontStyle: "italic", marginBottom: 8 },
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
  dropdownMenu: { position: "absolute", top: 60, left: 80, backgroundColor: "#1f2a38", borderRadius: 12, paddingVertical: 8, width: 160, elevation: 30, zIndex: 9999 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownItemTxt: { color: colors.white, fontWeight: "800" },
  recommendTxt: { marginTop: 10, color: "#ffc107", fontWeight: "900", fontStyle: "italic" },
  infoBox: { marginTop: 20, borderRadius: 14, padding: 16, backgroundColor: "#0b1e3b", borderWidth: 1, borderColor: "#1e3a8a", zIndex: 1 },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoTxt: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic", flex: 1 },
  infoArrow: { color: "#60a5fa", fontSize: 16, fontWeight: "900" },
  infoContent: { marginTop: 12, gap: 10 },
  infoBullet: { color: "#60a5fa", fontWeight: "800", fontStyle: "italic", lineHeight: 20 },
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