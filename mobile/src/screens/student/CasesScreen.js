import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import {
  createStudentCase,
  fetchCases,
  getStudentPatients,
  updateStudentCase,
} from "../../api/endpoints";
import { ui } from "../../theme/ui";

const DEPARTMENTS = [
  "Oral Surgery",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Pedodontics",
  "General Dentistry",
];

export default function CasesScreen() {
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [toothNo, setToothNo] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Submitted");

  const load = useCallback(async () => {
    setError("");

    try {
      const patientRows = await getStudentPatients();
      setPatients(Array.isArray(patientRows) ? patientRows : []);
    } catch (e) {
      setPatients([]);
      setError(e?.response?.data?.message || "Unable to load patient list");
    }

    try {
      const data = await fetchCases();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError((prev) => prev || e?.response?.data?.message || "Unable to load cases");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openAdd = () => {
    setEditing(null);
    setPatientId("");
    setDepartment("");
    setComplaint("");
    setDiagnosis("");
    setProcedure("");
    setToothNo("");
    setNotes("");
    setStatus("Submitted");
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setPatientId(String(item?.patient?._id || item?.patient || ""));
    setDepartment(item?.department || "");
    setComplaint(item?.complaint || "");
    setDiagnosis(item?.diagnosis || "");
    setProcedure(item?.procedure || "");
    setToothNo(item?.toothNo || "");
    setNotes(item?.notes || "");
    setStatus(item?.status || "Submitted");
    setOpen(true);
  };

  const onSave = async () => {
    try {
      if (!patientId) {
        setError("Patient is required");
        return;
      }
      if (!department) {
        setError("Department is required");
        return;
      }

      const payload = {
        patient: patientId,
        department,
        complaint,
        diagnosis,
        procedure,
        toothNo,
        notes,
        status,
      };

      if (editing?._id) {
        await updateStudentCase(editing._id, payload);
      } else {
        await createStudentCase(payload);
      }

      setOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save case");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>My Cases</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>Add Case</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item, idx) => String(item._id || idx)}
        ListEmptyComponent={<Text style={styles.empty}>No cases found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
            <Text style={styles.caseTitle}>
              {item?.department || "General Dentistry"}
            </Text>
            <Text style={styles.meta}>
              Patient: {item?.patient?.name || "N/A"} - MRN: {item?.patient?.mrn || "N/A"}
            </Text>
            <Text style={styles.meta}>
              Procedure: {item?.procedure || "N/A"} {item?.toothNo ? `(Tooth ${item.toothNo})` : ""}
            </Text>
            <Text style={styles.meta}>Status: {item?.status || "Pending"}</Text>
            <Text style={styles.meta}>Diagnosis: {item?.diagnosis || "-"}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
            <Text style={styles.modalTitle}>{editing ? "Update Case" : "New Case"}</Text>
            
            <Text style={styles.label}>Patient *</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={patientId}
                onValueChange={setPatientId}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Patient --" value="" />
                {patients.map((patient) => (
                  <Picker.Item
                    key={String(patient._id)}
                    label={`${patient.name} (${patient.mrn})`}
                    value={String(patient._id)}
                  />
                ))}
              </Picker>
            </View>
            
            <Text style={styles.label}>Department *</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={department}
                onValueChange={setDepartment}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Department --" value="" />
                {DEPARTMENTS.map((dept) => (
                  <Picker.Item key={dept} label={dept} value={dept} />
                ))}
              </Picker>
            </View>
            
            <Text style={styles.label}>Chief Complaint</Text>
            <TextInput
              style={styles.input}
              value={complaint}
              onChangeText={setComplaint}
              placeholder="Patient's main concern"
            />
            
            <Text style={styles.label}>Diagnosis</Text>
            <TextInput
              style={styles.input}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Clinical diagnosis"
            />
            
            <Text style={styles.label}>Procedure</Text>
            <TextInput
              style={styles.input}
              value={procedure}
              onChangeText={setProcedure}
              placeholder="e.g., RCT, Extraction, Filling"
            />
            
            <Text style={styles.label}>Tooth Number</Text>
            <TextInput
              style={styles.input}
              value={toothNo}
              onChangeText={setToothNo}
              placeholder="e.g., 36, 14-16"
              keyboardType="default"
            />
            
            <Text style={styles.label}>Clinical Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
                <Picker.Item label="Draft" value="Draft" />
                <Picker.Item label="Submitted" value="Submitted" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={onSave}>
              <Text style={styles.addBtnText}>{editing ? "Update" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: ui.colors.primary,
    borderRadius: ui.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: ui.radius.md,
    padding: 14,
    width: "100%",
    maxWidth: 900,
    maxHeight: "90%",
    gap: 10,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: ui.colors.text },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ui.colors.text,
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 46,
    color: ui.colors.text,
  },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  closeBtnText: { color: ui.colors.text, fontWeight: "600" },
});
