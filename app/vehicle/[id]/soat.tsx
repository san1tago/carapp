import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cancelNotifications, scheduleSoatReminders } from "../../../src/notifications/scheduler";
import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const reminderPresets = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mes", days: 30 },
];

export default function SoatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));

  const initial = useMemo(() => {
    return {
      purchaseDate: v?.soat.purchaseDate ?? "",
      reminders: v?.soat.remindersDaysBefore ?? [],
      notificationIds: v?.soat.notificationIds ?? [],
    };
  }, [v]);

  const [purchaseDate, setPurchaseDate] = useState(initial.purchaseDate);
  const [reminders, setReminders] = useState<number[]>(initial.reminders);
  const [saving, setSaving] = useState(false);

  // Dirty check (habilita Guardar cuando cambie algo)
  const canSave =
    !saving &&
    (purchaseDate !== initial.purchaseDate ||
      JSON.stringify(reminders.slice().sort()) !== JSON.stringify(initial.reminders.slice().sort()));

  useEffect(() => {
    setPurchaseDate(initial.purchaseDate);
    setReminders(initial.reminders);
  }, [initial.purchaseDate, JSON.stringify(initial.reminders)]);

  if (!v) return null;

  const toggleReminder = (days: number) => {
    setReminders((prev) => (prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days]));
  };

  const save = async () => {
    if (!purchaseDate) return;

    setSaving(true);

    // permisos notificaciones
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }

    // cancela notificaciones viejas
    await cancelNotifications(initial.notificationIds);

    // programa nuevas
    const ids = await scheduleSoatReminders({
      vehicleName: v.name,
      purchaseDate: new Date(purchaseDate),
      reminderDaysBefore: reminders,
    });

    updateVehicle(v.id, {
      soat: {
        ...v.soat,
        purchaseDate,
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
        <Text style={styles.h1}>SOAT - {v.name}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Fecha de compra del SOAT</Text>
        <TextInput
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="dd/mm/aaaa (ej: 2026-01-19)"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 18 }]}>Foto del SOAT</Text>
        <Pressable style={styles.photoBox}>
          <Text style={styles.photoTxt}>Tomar foto del SOAT</Text>
        </Pressable>

        <View style={styles.remHeader}>
          <Text style={styles.remTitle}>Recordatorios</Text>
          <Pressable style={styles.addBtn}>
            <Text style={styles.addBtnTxt}>+ Añadir</Text>
          </Pressable>
        </View>

        <View style={styles.remList}>
          {reminderPresets.map((r) => {
            const on = reminders.includes(r.days);
            return (
              <Pressable
                key={r.days}
                onPress={() => toggleReminder(r.days)}
                style={[styles.remRow, on && styles.remRowOn]}
              >
                <Text style={styles.remRowTxt}>Recordar {r.label} antes</Text>
                <Text style={styles.remRowMini}>{on ? "✓" : ""}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave || !purchaseDate}
          style={[styles.save, { opacity: canSave && purchaseDate ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>{saving ? "Guardando..." : "Guardar SOAT"}</Text>
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

  body: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  label: { color: colors.white, fontWeight: "900", fontStyle: "italic", marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    color: colors.white,
    fontWeight: "800",
    fontStyle: "italic",
  },
  photoBox: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },

  remHeader: { marginTop: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  remTitle: { color: colors.white, fontWeight: "900", fontStyle: "italic", fontSize: 18 },
  addBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },

  remList: { marginTop: 10, gap: 10 },
  remRow: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  remRowOn: { borderColor: "rgba(255,255,255,0.55)" },
  remRowTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
  remRowMini: { color: colors.white, fontWeight: "900" },

  footer: { padding: 18, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  save: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },
});
