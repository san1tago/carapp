import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateInput from "../../../components/DateInput";
import PhotoInput from "../../../components/PhotoInput";



import {
  cancelNotifications,
  scheduleSoatReminders,
} from "../../../src/notifications/scheduler";

import { useVehicles } from "../../../src/store/vehicles";
import { colors } from "../../../src/theme/colors";

const reminderOptions = [
  { label: "1 día", days: 1 },
  { label: "3 días", days: 3 },
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mes", days: 30 },
];

export default function ExtintorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));

  if (!v) return null;

  const initial = useMemo(() => {
    return {
      purchaseDate: v.extintor.purchaseDate ?? "",
      reminders: v.extintor.remindersDaysBefore ?? [],
      notificationIds: v.extintor.notificationIds ?? [],
    };
  }, [v]);

  const [purchaseDate, setPurchaseDate] = useState(initial.purchaseDate);
  const [reminders, setReminders] = useState<number[]>(initial.reminders || []);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const canSave =
    purchaseDate !== initial.purchaseDate ||
    JSON.stringify(reminders.sort()) !==
      JSON.stringify(initial.reminders.sort());

  useEffect(() => {
    setPurchaseDate(initial.purchaseDate);
    setReminders(initial.reminders);
  }, [initial.purchaseDate, JSON.stringify(initial.reminders)]);

  const addReminder = () => {
    if (!purchaseDate) return;
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

  const save = async () => {
    if (!purchaseDate) return;

    setSaving(true);

    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }

    await cancelNotifications(initial.notificationIds);

    const ids = await scheduleSoatReminders({
      vehicleName: v.name,
      purchaseDate: new Date(purchaseDate),
      reminderDaysBefore: reminders,
    });

    updateVehicle(v.id, {
      extintor: {
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

        <Text style={styles.h1}>Extintor - {v.name}</Text>
      </View>

<View style={styles.body}>
        <DateInput
          label="Fecha de compra del Extintor"
          value={purchaseDate}
          onChange={setPurchaseDate}
          allowPastDates={true}

        />

        <Text style={[styles.label, { marginTop: 18 }]}>Foto del extintor</Text>

       <PhotoInput
          value={v.extintor?.photoUri}
          fileName={`extintor_${v.id}.jpg`}
          onChange={(uri) =>
            updateVehicle(v.id, {
              extintor: { ...v.extintor, photoUri: uri },
            })
          }
        />

        <View style={styles.remHeader}>
          <Text style={styles.remTitle}>Recordatorios</Text>

          <Pressable style={styles.addBtn} onPress={addReminder}>
            <Text style={styles.addBtnTxt}>+ Añadir</Text>
          </Pressable>
        </View>

        <View style={styles.remList}>
          {reminders.length === 0 && (
            <Text style={styles.emptyTxt}>
              No hay recordatorios configurados
            </Text>
          )}

          {reminders.map((days, index) => {
            const selectedOption =
              reminderOptions.find((o) => o.days === days)?.label || "";

            return (
              <View
                key={index}
                style={[
                  styles.reminderCard,
                  openIndex === index && { zIndex: 1000 },
                ]}
              >
                <Text style={styles.reminderText}>🔔 Recordar</Text>

                <Pressable
                  style={styles.dropdown}
                  onPress={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <Text style={styles.dropdownTxt}>{selectedOption}</Text>
                </Pressable>

                <Text style={styles.reminderText}>antes</Text>

                <Pressable onPress={() => removeReminder(index)}>
                  <Text style={styles.deleteTxt}>🗑</Text>
                </Pressable>

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
              💡 Recomendamos configurar recordatorios múltiples para mayor
              seguridad
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave || !purchaseDate}
          style={[styles.save, { opacity: canSave && purchaseDate ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>
            {saving ? "Guardando..." : "Guardar extintor"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  back: { padding: 6 },
  backTxt: { color: colors.white, fontSize: 22, fontWeight: "900" },
  h1: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
  },

  body: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  label: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 8,
  },
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

  remHeader: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 18,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },

  emptyTxt: {
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
  },

  reminderCard: {
    backgroundColor: colors.card2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },

  reminderText: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  dropdown: {
    backgroundColor: "#2e3b4e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  dropdownTxt: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  deleteTxt: {
    color: "#ff4d4f",
    fontSize: 16,
  },

  dropdownMenu: {
    position: "absolute",
    top: 60,
    left: 80,
    backgroundColor: "#1f2a38",
    borderRadius: 12,
    paddingVertical: 8,
    width: 160,
    elevation: 20, // Android
  },

  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  dropdownItemTxt: {
    color: colors.white,
    fontWeight: "800",
  },

  remList: {
    marginTop: 10,
    gap: 10,
  },

  recommendTxt: {
    marginTop: 10,
    color: "#ffc107",
    fontWeight: "900",
    fontStyle: "italic",
  },
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

  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
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
