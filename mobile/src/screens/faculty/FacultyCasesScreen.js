import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getFacultyCases, updateFacultyCaseStatus } from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function FacultyCasesScreen() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const rows = await getFacultyCases();
      setItems(Array.isArray(rows) ? rows : []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load faculty cases");
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return undefined;
    }, [load]),
  );

  const setStatus = async (id, status) => {
    try {
      await updateFacultyCaseStatus(id, { status });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || `Failed to set status: ${status}`);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Assigned Cases</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item._id || item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No assigned cases</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Department: {item.department}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>
            <Text style={styles.meta}>
              Student: {item?.assignedStudent?.name || "-"}
            </Text>
            <Text style={styles.meta}>
              Patient: {item?.patient?.name || "-"}
              {item?.patient?.mrn ? ` (${item.patient.mrn})` : ""}
            </Text>
            <Text style={styles.meta}>Complaint: {item?.complaint || "-"}</Text>
            <Text style={styles.meta}>Diagnosis: {item?.diagnosis || "-"}</Text>
            <Text style={styles.meta}>
              Procedure: {item?.procedure || "-"}
              {item?.toothNo ? ` (Tooth ${item.toothNo})` : ""}
            </Text>
            <Text style={styles.meta}>Notes: {item?.notes || "-"}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => setStatus(item._id || item.id, "Approved")}
              >
                <Text style={styles.btnPrimaryText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDanger}
                onPress={() => setStatus(item._id || item.id, "Rejected")}
              >
                <Text style={styles.btnDangerText}>Reject</Text>
              </TouchableOpacity>
            </View>
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
  error: { color: ui.colors.danger, marginBottom: 8 },
  empty: { textAlign: "center", color: ui.colors.muted, marginTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: ui.colors.text },
  meta: { marginTop: 3, color: ui.colors.muted },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  btnPrimary: {
    backgroundColor: ui.colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDanger: {
    borderWidth: 1,
    borderColor: ui.colors.danger,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnDangerText: { color: ui.colors.danger, fontWeight: "700" },
  card: {
    backgroundColor: ui.colors.card,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 14,
    marginBottom: 10,
    ...ui.cardShadow,
  },
});
