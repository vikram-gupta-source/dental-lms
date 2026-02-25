import React, { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import client from "../../api/client";
import { PATIENT_PROFILE } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth"; // ✅ add

export default function PatientProfileScreen() {
  const { user } = useAuth(); // ✅ add

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [guardianName, setGuardianName] = useState(user?.guardianName || "");
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes || "");

  const save = async () => {
    await client.patch(PATIENT_PROFILE, {
      fullName,
      phone,
      address,
      guardianName,
      medicalNotes,
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
      />
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
        multiline
      />

      <Pressable style={styles.primaryBtn} onPress={save}>
        <Text style={styles.primaryBtnText}>Save Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
  },
};
