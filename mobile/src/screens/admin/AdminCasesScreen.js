import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import client from "../../api/client";
import { ui } from "../../theme/ui";

export default function AdminCasesScreen() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setErr("");
      const { data } = await client.get("/admin/cases");
      setRows(data?.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load cases");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Cases</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      <FlatList
        data={rows}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(i, idx) => String(i._id || idx)}
        ListEmptyComponent={<Text style={styles.empty}>No cases found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.main}>
              {item.department || "General Dentistry"}
            </Text>
            <Text style={styles.meta}>Status: {item.status || "N/A"}</Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ui.colors.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 12,
  },
  error: { color: ui.colors.danger, marginBottom: 8 },
  empty: { marginTop: 20, textAlign: "center", color: ui.colors.muted },
  card: {
    backgroundColor: ui.colors.card,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 14,
    marginBottom: 10,
    ...ui.cardShadow,
  },
  main: { fontSize: 16, fontWeight: "700", color: ui.colors.text },
  meta: { color: ui.colors.muted, marginTop: 3 },
});
