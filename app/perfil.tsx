import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Perfil() {
  const [name, setName] = useState("");

  useEffect(() => { getProfile(); }, []);

  async function getProfile() {
    try {
      const savedName = await AsyncStorage.getItem("user_name");
      if (savedName) setName(savedName);
    } catch (error) {
      console.log("Error cargando perfil:", error);
    }
  }

  async function saveProfile() {
    try {
      await AsyncStorage.setItem("user_name", name);
      alert("Perfil guardado ✅");
    } catch (error) {
      console.log("Error guardando:", error);
      alert("Error al guardar ❌");
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem("user_name");
      setName("");
      alert("Sesión local cerrada");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: "Descarga CarApp y mantén tus documentos vehiculares al día 🚗",
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Mi perfil</Text>
        </View>

        {/* AVATAR */}
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={38} color="rgba(255,255,255,0.7)" />
        </View>

        {/* NOMBRE */}
        <Text style={styles.label}>Tu nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ingresa tu nombre"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />
        <Text style={styles.help}>Personaliza tu experiencia con CarApp</Text>

        {/* GUARDAR */}
        <Pressable style={styles.homeBtn} onPress={saveProfile}>
          <Text style={styles.homeTxt}>💾 Guardar perfil</Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={signOut}>
          <Text style={styles.homeTxt}>🚪 Limpiar datos</Text>
        </Pressable>

        {/* DOCUMENTOS */}
        <Text style={styles.section}>Mis documentos personales</Text>

        <View style={styles.row}>
          {/* CÉDULA */}
          <Pressable style={styles.card} onPress={() => router.push("/cedula")}>
            <View style={[styles.iconContainer, { backgroundColor: "#2563eb" }]}>
              <MaterialIcons name="badge" size={28} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Cédula</Text>
            <Text style={styles.cardSub}>Añadir fotos</Text>
          </Pressable>

          {/* LICENCIA */}
          <Pressable style={styles.card} onPress={() => router.push("/licencia")}>
            <View style={[styles.iconContainer, { backgroundColor: "#16a34a" }]}>
              <MaterialIcons name="credit-card" size={28} color="#fff" />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>
              Licencia de conducción
            </Text>
            <Text style={styles.cardSub}>Añadir información</Text>
          </Pressable>
        </View>

        {/* WARNING */}
        <View style={styles.warning}>
          <Text style={styles.warningTxt}>
            ⚠ Importante: Recuerda siempre llevar contigo la cédula y licencia
            de conducción en físico.
          </Text>
        </View>

        {/* INVITAR */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.inviteTitle}>Invitar amigos</Text>
              <Text style={styles.inviteSub}>
                Comparte CarApp con tus amigos y familiares
              </Text>
            </View>
            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <MaterialIcons name="share" size={18} color="#111" style={{ marginRight: 6 }} />
              <Text style={styles.shareTxt}>Compartir</Text>
            </Pressable>
          </View>
          <View style={styles.info}>
            <Text style={styles.infoTxt}>
              💡 Ayuda a tus seres queridos a mantener sus documentos al día y
              evitar multas
            </Text>
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.about}>
          <Text style={styles.aboutTitle}>Acerca de CarApp</Text>
          <Text style={styles.aboutTxt}>Versión: 1.0.0</Text>
          <Text style={styles.aboutTxt}>
            Desarrollado para ayudarte a mantener tus documentos vehiculares al día
          </Text>
          <Text style={styles.copy}>© 2024 CarApp. Todos los derechos reservados.</Text>
        </View>

        {/* BOTÓN HOME */}
        <Pressable style={styles.homeBtn} onPress={() => router.replace("/home")}>
          <Text style={styles.homeTxt}>🏠 Volver a inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  body: { padding: 18, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: { color: "white", fontSize: 22, fontWeight: "900" },
  title: { color: "white", fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  label: { color: "white", fontWeight: "900" },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    color: "white",
  },
  help: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
  section: { marginTop: 10, color: "white", fontWeight: "900", fontStyle: "italic", fontSize: 16 },
  row: { flexDirection: "row", gap: 12 },

  card: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cardTitle: {
    color: "white",
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 14,
  },
  cardSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },

  homeBtn: {
    marginTop: 4,
    backgroundColor: "#e5e7eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  homeTxt: { fontWeight: "900", fontStyle: "italic" },

  warning: { backgroundColor: "#3b2400", padding: 14, borderRadius: 12 },
  warningTxt: { color: "#facc15", fontWeight: "800", fontStyle: "italic" },

  inviteCard: { backgroundColor: "#1e293b", padding: 16, borderRadius: 14, gap: 12 },
  inviteRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inviteTitle: { color: "white", fontWeight: "900", fontStyle: "italic" },
  inviteSub: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontStyle: "italic", marginTop: 2 },
  shareBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  shareTxt: { fontWeight: "900", fontStyle: "italic" },

  info: {
    backgroundColor: "#0b1e3b",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 12,
    padding: 14,
  },
  infoTxt: { color: "#60a5fa", fontWeight: "900", fontStyle: "italic" },

  about: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, gap: 6 },
  aboutTitle: { color: "white", fontWeight: "900", fontStyle: "italic" },
  aboutTxt: { color: "rgba(255,255,255,0.7)", fontStyle: "italic" },
  copy: { marginTop: 10, color: "rgba(255,255,255,0.4)", fontSize: 12 },
});