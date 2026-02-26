import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getMyDashboard } from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState({ title: "Dashboard", cards: [] });
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const payload = await getMyDashboard();
      setData({
        title: payload?.title || "Dashboard",
        cards: Array.isArray(payload?.cards) ? payload.cards : [],
      });
      setErr("");
    } catch (e) {
      setData({ title: "Dashboard", cards: [] });
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return undefined;
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{data.title}</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ui.colors.bg,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 14,
  },
  error: { color: ui.colors.danger, marginBottom: 8 },
  grid: {
    gap: 12,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: ui.colors.card,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: ui.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    ...ui.cardShadow,
  },
  value: {
    fontSize: 36,
    fontWeight: "800",
    color: ui.colors.primary,
    textAlign: "center",
  },
  label: {
    marginTop: 6,
    color: ui.colors.muted,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
