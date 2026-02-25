import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { getAdminUsers, updateAdminUser } from "../../api/endpoints";
import { ui } from "../../theme/ui";

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [studentYear, setStudentYear] = useState("1");
  const [rollNo, setRollNo] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const load = useCallback(async () => {
    try {
      setErr("");
      setUsers(await getAdminUsers());
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openEdit = (u) => {
    setEditing(u);
    setName(u?.name || u?.fullName || "");
    setRole(String(u?.role || "student").toLowerCase());
    setDepartment(u?.department || "");
    setIsActive(u?.isActive !== false);
    setPassword("");
    setPhone(u?.phone || "");
    setAddress(u?.address || "");
    setDesignation(u?.designation || "");
    setExperienceYears(String(u?.experienceYears ?? 0));
    setStudentYear(String(u?.studentYear ?? 1));
    setRollNo(u?.rollNo || "");
    setGuardianName(u?.guardianName || "");
    setMedicalNotes(u?.medicalNotes || "");
  };

  const saveEdit = async () => {
    const payload = {
      name,
      role,
      isActive,
      phone,
      address,
    };

    if (password.trim()) payload.password = password.trim();

    if (role === "faculty") {
      payload.department = department;
      payload.designation = designation;
      payload.experienceYears = Number(experienceYears) || 0;
    }

    if (role === "student") {
      payload.department = department;
      payload.studentYear = Number(studentYear) || 1;
      payload.rollNo = rollNo;
    }

    if (role === "patient") {
      payload.guardianName = guardianName;
      payload.medicalNotes = medicalNotes;
    }

    await updateAdminUser(editing._id, payload);
    setEditing(null);
    load();
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>User Management</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}

      <FlatList
        data={users}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(i, idx) => String(i._id || idx)}
        ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || item.fullName}</Text>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.meta}>Role: {item.role}</Text>
            <Text
              style={[
                styles.status,
                {
                  color:
                    item.isActive === false
                      ? ui.colors.danger
                      : ui.colors.success,
                },
              ]}
            >
              {item.isActive === false ? "Inactive" : "Active"}
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => openEdit(item)}
              >
                <Text style={styles.btnPrimaryText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDanger}
                onPress={() =>
                  updateAdminUser(item._id, {
                    isActive: item.isActive === false,
                  }).then(load)
                }
              >
                <Text style={styles.btnDangerText}>
                  {item.isActive === false ? "Activate" : "Inactivate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={!!editing}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
            />
            <View style={styles.pickerWrap}>
              <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="Admin" value="admin" />
                <Picker.Item label="Faculty" value="faculty" />
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Patient" value="patient" />
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="New Password (optional)"
              secureTextEntry
            />
            <View style={styles.switchRow}>
              <Text style={styles.meta}>Active</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
            />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
            />
            {role === "faculty" && (
              <>
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="Department"
                />
                <TextInput
                  style={styles.input}
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="Designation"
                />
                <TextInput
                  style={styles.input}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  placeholder="Experience (Years)"
                  keyboardType="number-pad"
                />
              </>
            )}
            {role === "student" && (
              <>
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="Department"
                />
                <TextInput
                  style={styles.input}
                  value={studentYear}
                  onChangeText={setStudentYear}
                  placeholder="Year"
                  keyboardType="number-pad"
                />
                <TextInput
                  style={styles.input}
                  value={rollNo}
                  onChangeText={setRollNo}
                  placeholder="Roll No"
                />
              </>
            )}
            {role === "patient" && (
              <>
                <TextInput
                  style={styles.input}
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="Guardian Name"
                />
                <TextInput
                  style={styles.input}
                  value={medicalNotes}
                  onChangeText={setMedicalNotes}
                  placeholder="Medical Notes"
                />
              </>
            )}

            <View style={styles.row}>
              <TouchableOpacity style={styles.btnPrimary} onPress={saveEdit}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setEditing(null)}
              >
                <Text style={styles.btnGhostText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  empty: { textAlign: "center", color: ui.colors.muted, marginTop: 20 },
  card: {
    backgroundColor: ui.colors.card,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 14,
    marginBottom: 10,
    ...ui.cardShadow,
  },
  name: { fontSize: 16, fontWeight: "700", color: ui.colors.text },
  meta: { color: ui.colors.muted, marginTop: 2 },
  status: { marginTop: 6, fontWeight: "700" },
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
  btnGhost: {
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnGhostText: { color: "#334155", fontWeight: "700" },
  modalWrap: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: ui.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "600",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selectText: { color: "#0F172A", fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  roleSheet: {
    backgroundColor: "#fff",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  roleItem: { padding: 12, borderRadius: 10 },
  roleItemActive: { backgroundColor: "#EFF6FF" },
  roleText: { color: "#0F172A", fontWeight: "600" },
  roleTextActive: { color: "#2563EB", fontWeight: "800" },
});
