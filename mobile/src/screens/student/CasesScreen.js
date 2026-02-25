import React, { useCallback, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchCases } from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function CasesScreen() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await fetchCases();
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load cases");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>My Cases</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={items}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item, idx) => String(item._id || idx)}
        ListEmptyComponent={<Text style={styles.empty}>No cases found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.caseTitle}>
              {item?.department || "General Dentistry"}
            </Text>
            <Text style={styles.meta}>
              Patient: {item?.patientName || item?.patient?.name || "N/A"}
            </Text>
            <Text style={styles.meta}>Status: {item?.status || "Pending"}</Text>
          </View>
        )}
      />
    </SafeAreaView>
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
  card: {
    backgroundColor: ui.colors.card,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 14,
    marginBottom: 10,
    ...ui.cardShadow,
  },
  caseTitle: { fontSize: 16, fontWeight: "700", color: ui.colors.text },
  meta: { marginTop: 3, color: ui.colors.muted },
  error: { color: ui.colors.danger, marginBottom: 8 },
  empty: { textAlign: "center", color: ui.colors.muted, marginTop: 20 },
});
