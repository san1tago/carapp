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
                  <Text style={styles.vehicleIcon}>🚗</Text>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>

      {/* Barra inferior “fake” como en tu screenshot */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => router.push("/perfil")}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>

        {/* SOLO aparece si hay vehículos */}
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

  card: {
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
  userIcon: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
  },

  profileBtn: {
    alignItems: "center",
    justifyContent: "center",
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileTxt: {
    fontSize: 18,
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
    color: colors.white,
    fontSize: 18,
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
