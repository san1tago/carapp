import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { SelectCard } from "../src/components/SelectCard";
import { colors } from "../src/theme/colors";

type Step = 0 | 1;

export default function Question() {
  const steps = useMemo(
    () => [
      {
        h1: "Cuéntanos más sobre ti",
        h2: "¿Por qué quieres usar nuestra app?",
        options: [
          "Se me olvida pagar el SOAT",
          "Se me olvida pagar la revisión tecnicomecanica",
          "No quiero pagar multas por documentos vencidos",
          "Quiero recordar cuando renovar documentos",
        ],
      },
      {
        h1: "Cuéntanos más sobre ti",
        h2: "¿Cómo nos conociste?",
        options: ["Lo vi en redes sociales", "Me contó un amigo", "Me enteré en un taller", "Otro"],
      },
    ],
    []
  );

  const [step, setStep] = useState<0 | 1>(0);
  const [selected0, setSelected0] = useState<Set<number>>(new Set());
  const [selected1, setSelected1] = useState<Set<number>>(new Set());

  const selected = step === 0 ? selected0 : selected1;
  const setSelected = step === 0 ? setSelected0 : setSelected1;

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const { h1, h2, options } = steps[step];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>{h1}</Text>
        <Text style={styles.h2}>{h2}</Text>

        <View style={{ height: 18 }} />

        <View style={styles.list}>
          {options.map((t, idx) => (
            <SelectCard
  key={t}
  label={t}
  selected={selected.has(idx)}
  onPress={() => toggle(idx)}
/>
          ))}
        </View>

        <View style={{ height: 22 }} />

        <Pressable
          onPress={() => {
            if (step === 0) setStep(1);
            else router.push("/paywall");
          }}
          style={({ pressed }) => [styles.fab, pressed ? { opacity: 0.9 } : null]}
        >
          <Text style={styles.fabTxt}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },
  h1: { color: colors.white, fontSize: 26, fontWeight: "900", fontStyle: "italic", marginBottom: 6, textAlign: "center" },
  h2: { color: colors.muted, fontSize: 16, fontWeight: "800", fontStyle: "italic", textAlign: "center" },
  list: { width: "100%", maxWidth: 520, gap: 14 },
  fab: { width: 64, height: 64, borderRadius: 999, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  fabTxt: { color: colors.black, fontSize: 22, fontWeight: "900" },
});
