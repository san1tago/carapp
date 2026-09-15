import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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

  // 🔥 FUNCIÓN DE ICONO (ahora con íconos vectoriales, no emojis)
  const getVehicleIcon = (type?: string) => {
    const t = type?.toLowerCase();
    const size = 26;
    const color = colors.white;

    switch (t) {
      case "carro":
      case "auto":
        return <Ionicons name="car-outline" size={size} color={color} />;

      case "moto":
      case "motocicleta":
        return (
          <MaterialCommunityIcons name="motorbike" size={size} color={color} />
        );

      case "camion":
      case "camión":
        return (
          <MaterialCommunityIcons
            name="truck-outline"
            size={size}
            color={color}
          />
        );

      case "bus":
      case "buseta":
        return <Ionicons name="bus-outline" size={size} color={color} />;

      case "van":
        return (
          <MaterialCommunityIcons
            name="van-utility"
            size={size}
            color={color}
          />
        );

      case "bicicleta":
        return <Ionicons name="bicycle-outline" size={size} color={color} />;

      case "taxi":
        return <Ionicons name="car-outline" size={size} color={color} />;

      default:
        return <Ionicons name="car-outline" size={size} color={color} />;
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
                  <View style={styles.vehicleIcon}>
                    {getVehicleIcon(item.type)}
                  </View>

                  <Text style={styles.vehicleName}>{item.name}</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>

      {/* Barra inferior */}
      <View style={styles.bottomBar}>
        {vehicles.length > 0 && (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/add-vehicle")}
          >
            <Text style={styles.addTxt}>＋</Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.push("/perfil")}>
          <Ionicons
            name="person-outline"
            size={30}
            color="rgba(255,255,255,0.8)"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
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
    height: 110,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingBottom: 10,
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
    marginBottom: 22,
    marginTop: 22,
  },

  vehicleCard: {
    flex: 1,
    height: 132,
    borderRadius: 18,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },

  list: {
    paddingBottom: 40,
    gap: 16,
  },

  vehicleIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  vehicleName: {
    color: colors.white,
    fontWeight: "900",
    fontStyle: "italic",
  },

  addBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  addTxt: {
    fontSize: 28,
    fontWeight: "900",
  },
});
