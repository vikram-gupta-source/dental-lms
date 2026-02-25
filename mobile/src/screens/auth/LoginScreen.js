import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { ui } from "../../theme/ui";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onLogin = async () => {
    try {
      setErr("");
      await login(email.trim(), password);
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Image
          source={require("../../../assets/icon.png")}
          style={{
            width: 90,
            height: 90,
            alignSelf: "center",
            marginBottom: 12,
          }}
          resizeMode="contain"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={ui.colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={ui.colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {!!err && <Text style={styles.error}>{err}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Create a new account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ui.colors.bg,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: ui.colors.card,
    borderRadius: ui.radius.lg,
    padding: 18,
    ...ui.shadow,
  },
  title: { fontSize: 26, fontWeight: "700", color: ui.colors.text },
  subtitle: { marginTop: 4, marginBottom: 16, color: ui.colors.muted },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: ui.colors.text,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: ui.colors.primary,
    paddingVertical: 12,
    borderRadius: ui.radius.md,
  },
  primaryBtnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  link: {
    marginTop: 14,
    textAlign: "center",
    color: ui.colors.primaryDark,
    fontWeight: "600",
  },
  error: { color: ui.colors.danger, marginBottom: 8 },
});
