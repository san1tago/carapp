import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../src/lib/supabase";
import { colors } from "../src/theme/colors";
export default function Perfil() {
  const [name, setName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);

    if (data.session) {
      getProfile();
    }
  }

  // 🔐 REGISTRO
  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Usuario creado ✅");
    }
  }

  // 🔑 LOGIN
  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Bienvenido 🔥");
      getProfile();
    }
  }

  // 🚪 LOGOUT
  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  // 📥 OBTENER PERFIL
  async function getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      await supabase.from("profiles").insert({
        id: user.id,
        name: "",
      });
    }

    if (data) {
      setName(data.name);
    }
  }

  // 💾 GUARDAR PERFIL
  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("No hay usuario autenticado");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: name,
    });

    if (error) {
      console.log("Error guardando:", error);
      alert("Error al guardar ❌");
    } else {
      alert("Perfil guardado ✅");
    }
  }

  // 🔴 SI NO HAY SESIÓN → LOGIN
  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <Text style={styles.title}>Bienvenido</Text>

          <TextInput
            placeholder="Correo"
            placeholderTextColor="gray"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="gray"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.homeBtn} onPress={signIn}>
            <Text style={styles.homeTxt}>🔑 Iniciar sesión</Text>
          </Pressable>

          <Pressable style={styles.homeBtn} onPress={signUp}>
            <Text style={styles.homeTxt}>🆕 Crear cuenta</Text>
          </Pressable>

          <Pressable
            style={styles.homeBtn}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.homeTxt}>🏠 Volver a inicio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 🟢 SI HAY SESIÓN → PERFIL
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

        {/* FOTO PERFIL */}
        <View style={styles.avatar}>
          <Text style={{ fontSize: 34 }}>👤</Text>
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

        {/* LOGOUT */}
        <Pressable style={styles.homeBtn} onPress={signOut}>
          <Text style={styles.homeTxt}>🚪 Cerrar sesión</Text>
        </Pressable>

        {/* DOCUMENTOS */}
        <Text style={styles.section}>Mis documentos personales</Text>

        <View style={styles.row}>
          <Pressable style={styles.card} onPress={() => router.push("/cedula")}>
            <Text style={styles.icon}>🪪</Text>
            <Text style={styles.cardTitle}>Cédula</Text>
            <Text style={styles.cardSub}>Añadir fotos</Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => router.push("/licencia")}
          >
            <Text style={styles.icon}>🟩</Text>
            <Text style={styles.cardTitle}>Licencia de conducción</Text>
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
            <View>
              <Text style={styles.inviteTitle}>Invitar amigos</Text>
              <Text style={styles.inviteSub}>
                Comparte CarApp con tus amigos y familiares
              </Text>
            </View>

            <Pressable style={styles.shareBtn}>
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
            Desarrollado para ayudarte a mantener tus documentos vehiculares al
            día
          </Text>

          <Text style={styles.copy}>
            © 2024 CarApp. Todos los derechos reservados.
          </Text>
        </View>

        {/* BOTON */}
        <Pressable
          style={styles.homeBtn}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.homeTxt}>🏠 Volver a inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  body: {
    padding: 18,
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inviteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  back: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },

  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  label: {
    color: colors.white,
    fontWeight: "900",
  },

  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.card2,
    paddingHorizontal: 12,
    color: colors.white,
  },

  help: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },

  section: {
    marginTop: 10,
    color: colors.white,
    fontWeight: "900",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  card: {
    flex: 1,
    backgroundColor: colors.card2,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  icon: {
    fontSize: 22,
  },

  cardTitle: {
    color: colors.white,
    fontWeight: "900",
  },

  cardSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },

  homeBtn: {
    marginTop: 10,
    backgroundColor: "#e5e7eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  homeTxt: {
    fontWeight: "900",
  },

  warning: {
    backgroundColor: "#3b2400",
    padding: 12,
    borderRadius: 10,
  },

  warningTxt: {
    color: "#facc15",
    fontWeight: "800",
  },

  inviteCard: {
    backgroundColor: colors.card2,
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },

  inviteTitle: {
    color: colors.white,
    fontWeight: "900",
  },

  inviteSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },

  shareBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  shareTxt: {
    fontWeight: "900",
  },

  info: {
    backgroundColor: "#0b1e3b",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 12,
    padding: 14,
  },

  infoTxt: {
    color: "#60a5fa",
    fontWeight: "900",
  },

  about: {
    backgroundColor: colors.card2,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },

  aboutTitle: {
    color: colors.white,
    fontWeight: "900",
  },

  aboutTxt: {
    color: "rgba(255,255,255,0.7)",
  },

  copy: {
    marginTop: 10,
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
});
