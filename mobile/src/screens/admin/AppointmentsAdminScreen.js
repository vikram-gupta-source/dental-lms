import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAdminAppointments,
  updateAdminAppointment,
} from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function AppointmentsAdminScreen() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setErr("");
      setRows(await getAdminAppointments());
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load appointments");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Appointments</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      <FlatList
        data={rows}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(i, idx) => String(i._id || idx)}
        ListEmptyComponent={
          <Text style={styles.empty}>No appointments found</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.main}>{item.department || "N/A"}</Text>
            <Text style={styles.meta}>
              Date:{" "}
              {item?.date ? new Date(item.date).toLocaleDateString() : "N/A"}
            </Text>
            <Text style={styles.meta}>
              Status: {item.status || "Scheduled"}
            </Text>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                updateAdminAppointment(item._id, { status: "Cancelled" }).then(
                  load,
                )
              }
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
  cancelBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: ui.colors.danger,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: { color: ui.colors.danger, fontWeight: "700" },
});
