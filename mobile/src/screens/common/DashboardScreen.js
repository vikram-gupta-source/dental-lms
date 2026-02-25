import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import client from "../../api/client";
import { getMyDashboard } from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState({ title: "Dashboard", cards: [] });
  const [err, setErr] = useState("");

  const [stats, setStats] = useState({
    usersCount: 0,
    appointmentsCount: 0,
    casesCount: 0,
  });

  const load = async () => {
    try {
      const { data } = await getMyDashboard();
      setStats({
        usersCount: data?.usersCount ?? 0,
        appointmentsCount: data?.appointmentsCount ?? 0,
        casesCount: data?.casesCount ?? 0,
      });
    } catch (e) {
      setStats({ usersCount: 0, appointmentsCount: 0, casesCount: 0 }); // safe fallback
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{data.title}</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      <View style={styles.grid}>
        {(data.cards || []).map((c) => (
          <TouchableOpacity
            key={c.key || c.label}
            style={styles.card}
            onPress={() => c.route && navigation.navigate(c.route)}
          >
            <Text style={styles.value}>{c.value ?? 0}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80, // add
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  error: { color: ui.colors.danger, marginBottom: 8 },
  grid: { gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  value: { fontSize: 34, fontWeight: "800", color: "#2563EB" },
  label: { marginTop: 4, color: "#475569", fontSize: 17, fontWeight: "600" },
});
