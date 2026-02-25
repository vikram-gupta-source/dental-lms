import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { getStudentProfile, updateStudentProfile } from "../../api/endpoints";
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

export default function StudentProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [studentYear, setStudentYear] = useState("1");
  const [rollNo, setRollNo] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    try {
      const doc = await getStudentProfile();
      setName(doc?.name || "");
      setPhone(doc?.phone || "");
      setAddress(doc?.address || "");
      setDepartment(doc?.department || "");
      setStudentYear(String(doc?.studentYear ?? 1));
      setRollNo(doc?.rollNo || "");
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return undefined;
    }, [load]),
  );

  const onSave = async () => {
    try {
      await updateStudentProfile({
        name,
        phone,
        address,
        department,
        studentYear: Number(studentYear) || 1,
        rollNo,
      });
      setOk("Profile updated");
      setErr("");
    } catch (e) {
      setOk("");
      setErr(e?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Student Profile</Text>
      {!!err && <Text style={styles.error}>{err}</Text>}
      {!!ok && <Text style={styles.ok}>{ok}</Text>}

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

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
          placeholder="Year"
          value={studentYear}
          onChangeText={setStudentYear}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Roll No"
          value={rollNo}
          onChangeText={setRollNo}
        />

        <TouchableOpacity style={styles.btn} onPress={onSave}>
          <Text style={styles.btnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 26,
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
    ...ui.cardShadow,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    backgroundColor: "#fff",
    marginBottom: 10,
    overflow: "hidden",
  },
  btn: {
    backgroundColor: ui.colors.primary,
    borderRadius: ui.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  error: { color: ui.colors.danger, marginBottom: 8 },
  ok: { color: "#16A34A", marginBottom: 8, fontWeight: "700" },
});
