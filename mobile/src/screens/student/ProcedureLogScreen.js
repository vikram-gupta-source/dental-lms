import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyProcedureLogs,
  getStudentPatients,
  createProcedureLog,
  updateProcedureLog,
  deleteProcedureLog,
} from "../../api/endpoints";
import { Picker } from "@react-native-picker/picker";
import { ui } from "../../theme/ui";

const COMMON_PROCEDURES = [
  "RCT",
  "Extraction",
  "Filling",
  "RPD",
  "Scaling",
  "Crown Preparation",
  "Bridge",
  "Denture",
  "Implant",
  "Orthodontic Adjustment",
];

const ProcedureLogScreen = () => {
  const [logs, setLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [count, setCount] = useState("1");
  const [requiredQuota, setRequiredQuota] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const patientRows = await getStudentPatients();
      setPatients(Array.isArray(patientRows) ? patientRows : []);

      const data = await getMyProcedureLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openAdd = () => {
    setEditing(null);
    setPatientId("");
    setProcedureType("");
    setCount("1");
    setRequiredQuota("");
    setNotes("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setPatientId(String(item?.patient?._id || item?.patient || ""));
    setProcedureType(item.procedureType || "");
    setCount(String(item.count || 1));
    setRequiredQuota(String(item.requiredQuota || ""));
    setNotes(item.notes || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!procedureType.trim()) {
        Alert.alert("Error", "Procedure type is required");
        return;
      }

      const payload = {
        patient: patientId || undefined,
        procedureType: procedureType.trim(),
        count: parseInt(count) || 1,
        requiredQuota: parseInt(requiredQuota) || 0,
        notes: notes.trim(),
      };

      if (editing) {
        await updateProcedureLog(editing._id, payload);
      } else {
        await createProcedureLog(payload);
      }

      setModalOpen(false);
      await load();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save log");
    }
  };

  const handleDelete = (item) => {
    Alert.alert("Delete Log", `Delete ${item.procedureType}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProcedureLog(item._id);
            await load();
          } catch (e) {
            Alert.alert("Error", "Failed to delete log");
          }
        },
      },
    ]);
  };

  const getProgressPercent = (item) => {
    if (!item.requiredQuota || item.requiredQuota === 0) return null;
    return Math.round((item.count / item.requiredQuota) * 100);
  };

  const renderLog = ({ item }) => {
    const percent = getProgressPercent(item);
    const isComplete = percent && percent >= 100;

    return (
      <TouchableOpacity style={styles.logCard} onPress={() => openEdit(item)}>
        <View style={styles.logHeader}>
          <Text style={styles.procedureName}>{item.procedureType}</Text>
          {isComplete && <Text style={styles.completeBadge}>✓ Complete</Text>}
        </View>

        {!!item?.patient?.name && (
          <Text style={styles.patientText}>
            Patient: {item.patient.name}
            {item?.patient?.mrn ? ` (${item.patient.mrn})` : ""}
          </Text>
        )}

        <View style={styles.logStats}>
          <Text style={styles.countText}>
            Count: <Text style={styles.countValue}>{item.count}</Text>
          </Text>
          {item.requiredQuota > 0 && (
            <>
              <Text style={styles.quotaText}>
                / {item.requiredQuota} required
              </Text>
              <Text
                style={[
                  styles.percentText,
                  percent >= 100 && styles.percentComplete,
                ]}
              >
                ({percent}%)
              </Text>
            </>
          )}
        </View>

        {item.requiredQuota > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percent, 100)}%`,
                  backgroundColor:
                    percent >= 100 ? ui.colors.success : ui.colors.primary,
                },
              ]}
            />
          </View>
        )}

        {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}

        <View style={styles.logActions}>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Procedure Log</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add Log</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No procedure logs yet. Tap "+ Add Log" to create one.
          </Text>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>
                {editing ? "Update Log" : "New Procedure Log"}
              </Text>

              <Text style={styles.label}>Patient (Optional)</Text>
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
                      label={`${patient.name}${patient?.mrn ? ` (${patient.mrn})` : ""}`}
                      value={String(patient._id)}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Procedure Type *</Text>
              <TextInput
                style={styles.input}
                value={procedureType}
                onChangeText={setProcedureType}
                placeholder="e.g., RCT, Extraction, Filling"
              />

              <Text style={styles.quickSelect}>Quick Select:</Text>
              <View style={styles.chipsContainer}>
                {COMMON_PROCEDURES.map((proc) => (
                  <TouchableOpacity
                    key={proc}
                    style={[
                      styles.chip,
                      procedureType === proc && styles.chipSelected,
                    ]}
                    onPress={() => setProcedureType(proc)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        procedureType === proc && styles.chipTextSelected,
                      ]}
                    >
                      {proc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Count *</Text>
              <TextInput
                style={styles.input}
                value={count}
                onChangeText={setCount}
                placeholder="Number of procedures performed"
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Required Quota (Optional)</Text>
              <TextInput
                style={styles.input}
                value={requiredQuota}
                onChangeText={setRequiredQuota}
                placeholder="Target number for this procedure"
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional details"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalOpen(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalBtnText}>
                    {editing ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: ui.colors.text,
  },
  addBtn: {
    backgroundColor: ui.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 32,
    color: ui.colors.muted,
  },
  errorText: {
    color: ui.colors.danger,
    padding: 16,
    textAlign: "center",
  },
  list: {
    padding: 16,
  },
  logCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  procedureName: {
    fontSize: 16,
    fontWeight: "700",
    color: ui.colors.text,
  },
  completeBadge: {
    backgroundColor: ui.colors.success,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: ui.colors.muted,
  },
  countValue: {
    fontWeight: "700",
    color: ui.colors.text,
    fontSize: 16,
  },
  quotaText: {
    fontSize: 14,
    color: ui.colors.muted,
    marginLeft: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "600",
    color: ui.colors.primary,
    marginLeft: 8,
  },
  percentComplete: {
    color: ui.colors.success,
  },
  progressBar: {
    height: 8,
    backgroundColor: ui.colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  notesText: {
    fontSize: 13,
    color: ui.colors.muted,
    marginBottom: 8,
    fontStyle: "italic",
  },
  patientText: {
    fontSize: 13,
    color: ui.colors.muted,
    marginBottom: 8,
  },
  logActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: ui.colors.muted,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    color: ui.colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: ui.colors.muted,
    marginTop: 32,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: ui.colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ui.colors.text,
    marginBottom: 4,
    marginTop: 12,
  },
  quickSelect: {
    fontSize: 12,
    fontWeight: "500",
    color: ui.colors.muted,
    marginTop: 8,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: ui.colors.bg,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  chipSelected: {
    backgroundColor: ui.colors.primary,
    borderColor: ui.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: ui.colors.text,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
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
    borderRadius: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 48,
    color: ui.colors.text,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 100,
  },
  cancelBtn: {
    backgroundColor: "#95a5a6",
  },
  saveBtn: {
    backgroundColor: ui.colors.primary,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ProcedureLogScreen;
