import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
  value?: string;
  onChange: (date: string) => void;
  label?: string;
  allowPastDates?: boolean; // 👈 NUEVO
};

export default function DateInput({
  value,
  onChange,
  label,
  allowPastDates = true, // 👈 default permite pasado
}: Props) {
  const [show, setShow] = useState(false);

  const date = value ? new Date(value) : new Date();

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === "ios") {
      setShow(false);
    }

    if (!selectedDate) return;

    const iso = selectedDate.toISOString().split("T")[0];
    onChange(iso);
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        minimumDate: allowPastDates ? undefined : new Date(), // 🔥 CLAVE
        onChange: handleChange,
      });
    } else {
      setShow(true);
    }
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.input} onPress={openPicker}>
        <Text style={styles.text}>
          {value || "Seleccionar fecha"}
        </Text>
      </Pressable>

      {Platform.OS === "ios" && show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={handleChange}
          minimumDate={allowPastDates ? undefined : new Date()} // 🔥 CLAVE
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  label: {
    color: "#fff",
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  text: {
    color: "#fff",
    fontWeight: "800",
    fontStyle: "italic",
  },
});