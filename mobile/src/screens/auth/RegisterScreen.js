import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Picker,
  Image,
} from "react-native";
import { registerUser } from "../../api/endpoints";

const roles = ["student", "faculty", "patient", "admin"];
const ROLE_OPTIONS = [
  { label: "Student", value: "student" },
  {
    label: "Faculty",
    value: "faculty",
  },
  {
    label: "Patient",
    value: "patient",
  },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onRegister = async () => {
    try {
      setError("");
      if (!name || !email || !password || !role) {
        setError("All fields are required");
        return;
      }

      setLoading(true);
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      navigation.navigate("Login");
    } catch (e) {
      setError(e?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to continue</Text>

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
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.roleLabel}>Role</Text>
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r.value}
              onPress={() => setRole(r.value)}
              style={[
                styles.roleChip,
                role === r.value && styles.roleChipActive,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  role === r.value && styles.roleTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          onPress={onRegister}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { marginTop: 4, marginBottom: 14, color: "#64748B" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: "#0F172A",
    backgroundColor: "#fff",
  },
  roleLabel: {
    marginTop: 2,
    marginBottom: 8,
    color: "#475569",
    fontWeight: "600",
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  roleChipActive: { backgroundColor: "#DBEAFE", borderColor: "#2563EB" },
  roleText: { color: "#334155", fontWeight: "600" },
  roleTextActive: { color: "#1D4ED8" },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  link: {
    marginTop: 12,
    textAlign: "center",
    color: "#1D4ED8",
    fontWeight: "600",
  },
  error: { color: "#DC2626", marginBottom: 8 },
  pickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
