import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVehicles } from "../src/store/vehicles";
import { colors } from "../src/theme/colors";

export default function Home() {
  const { vehicles } = useVehicles();

  // 🔥 FUNCIÓN DE ICONO
  const getVehicleIcon = (type?: string) => {
    const t = type?.toLowerCase();

    switch (t) {
      case "carro":
      case "auto":
        return "🚗";

      case "moto":
      case "motocicleta":
        return "🏍️";

      case "camion":
      case "camión":
        return "🚛";

      case "bus":
      case "buseta":
        return "🚌";

      case "van":
        return "🚐";

      case "bicicleta":
        return "🚲";

      case "taxi":
        return "🚕"; // ✅ TAXI

      default:
        return "🚗";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.wrap,
          vehicles.length === 0 && {
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        {vehicles.length === 0 ? (
          <Pressable
            onPress={() => router.push("/add-vehicle")}
            style={styles.emptyCard}
          >
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.txt}>Añadir vehículo</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.section}>Mis vehículos</Text>

            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.list}
              columnWrapperStyle={{ gap: 16 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.vehicleCard}
                  onPress={() =>
                    router.push({
                      pathname: "/vehicle/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  {/* 🔥 ICONO DINÁMICO */}
                  <Text style={styles.vehicleIcon}>
                    {getVehicleIcon(item.type)}
                  </Text>

                  <Text style={styles.vehicleName}>{item.name}</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>

      {/* Barra inferior */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => router.push("/perfil")}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>

        {vehicles.length > 0 && (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/add-vehicle")}
          >
            <Text style={styles.addTxt}>＋</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: {
    flex: 1,
    padding: 20,
  },

  plus: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
  },
  txt: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
  },

  bottomBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  emptyCard: {
    width: 140,
    height: 170,
    borderRadius: 16,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  section: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 14,
  },

  vehicleCard: {
    flex: 1,
    height: 90,
    borderRadius: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  list: {
    paddingBottom: 120,
    gap: 16,
  },

  vehicleIcon: {
    fontSize: 22, // 🔥 un poco más grande para que se vea mejor
  },

  vehicleName: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  profileIcon: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
  },

  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  addTxt: {
    fontSize: 28,
    fontWeight: "900",
  },
});
