import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import client from "../../api/client";
import {
  PATIENT_APPOINTMENTS,
  PATIENT_RESCHEDULE_APPOINTMENT,
} from "../../api/endpoints";
import ui from "../../theme/ui";
import { Picker } from "@react-native-picker/picker";

const DEPARTMENTS = [
  "Oral Surgery",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Pedodontics",
  "General Dentistry",
];

export default function PatientAppointmentsScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");

  const load = async () => {
    const { data } = await client.get(PATIENT_APPOINTMENTS);
    setUpcoming(data?.upcoming || []);
    setHistory(data?.history || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createAppointment = async () => {
    await client.post(PATIENT_APPOINTMENTS, { department, date });
    setDepartment("");
    setDate("");
    setAddOpen(false);
    load();
  };

  const reschedule = async () => {
    await client.patch(PATIENT_RESCHEDULE_APPOINTMENT(selectedId), { date });
    setDate("");
    setSelectedId(null);
    setEditOpen(false);
    load();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Text style={styles.title}>Patient Appointments</Text>

        <Pressable style={styles.primaryBtn} onPress={() => setAddOpen(true)}>
          <Text style={styles.primaryBtnText}>Add Appointment</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcoming.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.department}</Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleString()}
            </Text>
            <Text>Status: {item.status}</Text>
            <Pressable
              style={styles.outlineBtn}
              onPress={() => {
                setSelectedId(item._id);
                setDate(new Date(item.date).toISOString().slice(0, 16));
                setEditOpen(true);
              }}
            >
              <Text style={styles.outlineBtnText}>Reschedule</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>History</Text>
        {history.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.department}</Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleString()}
            </Text>
            <Text>Status: {item.status}</Text>
          </View>
        ))}
      </ScrollView>

      {addOpen && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Appointment</Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={department} onValueChange={setDepartment}>
                  <Picker.Item label="Select Department" value="" />
                  {DEPARTMENTS.map((dept) => (
                    <Picker.Item key={dept} label={dept} value={dept} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DDTHH:mm)"
                value={date}
                onChangeText={setDate}
              />
              <Pressable style={styles.primaryBtn} onPress={createAppointment}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </Pressable>
              <Pressable onPress={() => setAddOpen(false)}>
                <Text>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {editOpen && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DDTHH:mm)"
                value={date}
                onChangeText={setDate}
              />
              <Pressable style={styles.primaryBtn} onPress={reschedule}>
                <Text style={styles.primaryBtnText}>Update</Text>
              </Pressable>
              <Pressable onPress={() => setEditOpen(false)}>
                <Text>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
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
    fontSize: 24,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ui.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ui.colors.text,
    marginBottom: 4,
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
  date: { fontSize: 14, color: ui.colors.text, marginBottom: 4 },
  primaryBtn: {
    backgroundColor: ui.colors.primary,
    padding: 12,
    borderRadius: ui.radius.md,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
  outlineBtn: {
    marginTop: 8,
    backgroundColor: ui.colors.border,
    padding: 10,
    borderRadius: ui.radius.md,
    alignItems: "center",
  },
  outlineBtnText: { fontSize: 14, fontWeight: "700", color: ui.colors.text },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: ui.colors.card,
    padding: 16,
    borderRadius: ui.radius.md,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: ui.colors.text },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: 12,
    borderRadius: ui.radius.md,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
});
