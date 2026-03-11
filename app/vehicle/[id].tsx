import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicles } from "../../src/store/vehicles";
import { colors } from "../../src/theme/colors";

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicle, updateVehicle } = useVehicles();
  const v = getVehicle(String(id));
  if (!v) return null;

  const soatDate = v.soat?.purchaseDate;
  const soatVigente = !!soatDate;

  const tecnoDate = v.tecnomecanica?.reviewDate;
  const tecnoVigente = !!tecnoDate;

  const extintorDate = v.extintor?.purchaseDate;
  const extintorVigente = !!extintorDate;

  const kitItems = v.kitCarretera?.items ?? [];
  const kitTotal = kitItems.filter(Boolean).length;

  const documentosItems = v.documentos?.items ?? [];
  const documentosBase = documentosItems.filter(Boolean).length;

  const soatDoc = v.soat?.purchaseDate ? 1 : 0;
  const tecnoDoc = v.tecnomecanica?.reviewDate ? 1 : 0;

  const documentosTotal = documentosBase + soatDoc + tecnoDoc;

  const seguroActivo = !!v.seguroAdicional?.type;

  const tarjetaActiva = !!v.tarjetaOperacion?.expeditionDate;
  const extractoActivo = !!v.extractoContrato?.info;

  const initial = useMemo(
    () => ({
      name: v.name ?? "",
      model: v.model ?? "",
      plate: v.plate ?? "",
    }),
    [v.id],
  );

  const [name, setName] = useState(initial.name);
  const [model, setModel] = useState(initial.model);
  const [plate, setPlate] = useState(initial.plate);

  const canSave =
    name !== initial.name || model !== initial.model || plate !== initial.plate;

  const save = () => {
    updateVehicle(v.id, { name, model, plate });
  };

  const goSoat = () => {
    router.push({
      pathname: "/vehicle/[id]/soat",
      params: { id: String(v.id) },
    });
  };

  const getKitColor = () => {
    if (kitTotal === 0) return "#ff4d4f"; // rojo
    if (kitTotal === 8) return "#22c55e"; // verde
    return "#facc15"; // amarillo
  };

  const getDocsColor = () => {
    if (documentosTotal === 0) return "#ff4d4f";
    if (documentosTotal === 5) return "#22c55e";
    return "#facc15";
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.title}>
          {name?.trim() ? name : "Nuevo vehículo"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre del vehículo (Ej: Mi Carro)"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Modelo del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />

        <TextInput
          value={plate}
          onChangeText={setPlate}
          placeholder="Placa del vehículo"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
          autoCapitalize="characters"
        />

        <Pressable style={styles.photoBox}>
          <Text style={styles.photoTitle}>Tomar foto del vehículo</Text>
          <Text style={styles.photoSub}>Añade una foto de tu carro</Text>
        </Pressable>

        <View style={{ height: 18 }} />

        <Pressable style={styles.bigCard} onPress={goSoat}>
          <Text style={styles.cardTitle}>SOAT</Text>
          {soatVigente ? (
            <>
              <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                ✓ SOAT vigente
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}
              >
                Se vence el: {soatDate}
              </Text>
            </>
          ) : (
            <View style={styles.cardBtn}>
              <Text style={styles.cardBtnTxt}>Añadir SOAT</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.bigCard}
          onPress={() =>
            router.push({
              pathname: "/vehicle/[id]/tecnicomecanica",
              params: { id: String(v.id) },
            })
          }
        >
          <Text style={styles.cardTitle}>Revisión Técnico Mecánica</Text>
          {tecnoVigente ? (
            <>
              <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                ✓ Revisión vigente
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}
              >
                Se vence el: {tecnoDate}
              </Text>
            </>
          ) : (
            <View style={styles.cardBtn}>
              <Text style={styles.cardBtnTxt}>Añadir Revisión</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.row}>
          <Pressable
            style={[styles.bigCard, { flex: 1 }]}
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]/extintor",
                params: { id: String(v.id) },
              })
            }
          >
            <Text style={styles.cardTitle}>Extintor</Text>
            {extintorVigente ? (
              <>
                <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                  ✓ Extintor vigente
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontStyle: "italic",
                  }}
                >
                  Se vence el: {extintorDate}
                </Text>
              </>
            ) : (
              <View style={styles.cardBtn}>
                <Text style={styles.cardBtnTxt}>Añadir Extintor</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.bigCard, { flex: 1 }]}
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]/kitcarretera",
                params: { id: String(v.id) },
              })
            }
          >
            <Text style={styles.cardTitle}>
              Demás elementos kit de carretera
            </Text>
            <Text style={{ color: getKitColor(), fontWeight: "900" }}>
              ✓ {kitTotal} de 8
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.bigCard}
          onPress={() =>
            router.push({
              pathname: "/vehicle/[id]/documentos",
              params: { id: String(v.id) },
            })
          }
        >
          <Text style={styles.cardTitle}>Documentos necesarios</Text>
          <Text style={{ color: getDocsColor(), fontWeight: "900" }}>
            ✓ {documentosTotal} de 5 documentos
          </Text>
        </Pressable>

        <Pressable
          style={styles.bigCard}
          onPress={() =>
            router.push({
              pathname: "/vehicle/[id]/seguro",
              params: { id: String(v.id) },
            })
          }
        >
          <Text style={styles.cardTitle}>Seguro adicional</Text>

          {seguroActivo ? (
            <>
              <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                ✓ Seguro registrado
              </Text>

              <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                Tipo: {v.seguroAdicional?.type}
              </Text>

              {v.seguroAdicional?.endDate && (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontStyle: "italic",
                  }}
                >
                  Se vence el: {v.seguroAdicional.endDate}
                </Text>
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

        <Text style={styles.sectionLabel}>
          Solo en vehículos de servicio público:
        </Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.smallCard, { flex: 1 }]}
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]/tarjeta-operacion",
                params: { id: String(v.id) },
              })
            }
          >
            <Text style={styles.cardTitle}>Tarjeta de operación</Text>

            {tarjetaActiva ? (
              <>
                <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                  ✓ Tarjeta vigente
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontStyle: "italic",
                  }}
                >
                  Se vence el: {v.tarjetaOperacion?.expeditionDate}
                </Text>
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
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]/extracto-contrato",
                params: { id: String(v.id) },
              })
            }
          >
            <Text style={styles.cardTitle}>Extracto de contrato</Text>

            {extractoActivo ? (
              <>
                <Text style={{ color: "#22c55e", fontWeight: "900" }}>
                  ✓ Registrado
                </Text>

                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                  Info: {v.extractoContrato?.info}
                </Text>
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

      <View style={styles.footer}>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.save, { opacity: canSave ? 1 : 0.35 }]}
        >
          <Text style={styles.saveTxt}>Guardar cambios</Text>
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
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
  },

  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 4,
    color: colors.white,
    fontWeight: "800",
    fontStyle: "italic",
  },

  photoBox: {
    marginTop: 10,
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 18,
  },
  photoSub: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "800",
    fontStyle: "italic",
  },

  bigCard: {
    borderRadius: 18,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },

  smallCard: {
    borderRadius: 18,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 16,
    gap: 12,
  },

  counterRed: {
    color: "#ff4d4f",
    fontWeight: "900",
    fontStyle: "italic",
  },

  optional: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "800",
    fontStyle: "italic",
  },

  optionalSmall: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontStyle: "italic",
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 18,
  },
  cardBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBtnTxt: { color: colors.white, fontWeight: "900", fontStyle: "italic" },

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
