import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

import DashboardScreen from "../screens/common/DashboardScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import AppointmentsAdminScreen from "../screens/admin/AppointmentsAdminScreen";
import AdminCasesScreen from "../screens/admin/AdminCasesScreen";
import OpdQueueScreen from "../screens/admin/OpdQueueScreen";
import FacultyCasesScreen from "../screens/faculty/FacultyCasesScreen";
import FacultyApprovalsScreen from "../screens/faculty/FacultyApprovalsScreen";
import FacultyQueueScreen from "../screens/faculty/FacultyQueueScreen";
import CasesScreen from "../screens/student/CasesScreen";
import ProcedureLogScreen from "../screens/student/ProcedureLogScreen";
import StudentProfileScreen from "../screens/student/StudentProfileScreen";
import StudentQueueScreen from "../screens/student/StudentQueueScreen";
import PatientAppointmentsScreen from "../screens/patient/PatientAppointmentsScreen";
import PatientProfileScreen from "../screens/patient/PatientProfileScreen";

const Tab = createBottomTabNavigator();

export default function RoleNavigator() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  const role = String(user?.role || "").toLowerCase();

  return (
    <Tab.Navigator
      key={role} // force fresh tabs per role
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height: 62,
          paddingTop: 4,
          paddingBottom: 6,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
        },
        sceneStyle: { backgroundColor: "#F1F5F9" },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Dashboard: "grid-outline",
            Users: "people-outline",
            Appointments: "calendar-outline",
            "My Appointments": "calendar-outline",
            "OPD Queue": "time-outline",
            Queue: "time-outline",
            Cases: "folder-open-outline",
            "Assigned Cases": "briefcase-outline",
            Approvals: "checkmark-done-outline",
            "My Cases": "folder-outline",
            "Procedure Log": "list-outline",
            Profile: "person-outline",
          };
          return (
            <Ionicons
              name={map[route.name] || "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 12 }}>
            <Text style={{ color: "#DC2626", fontWeight: "700" }}>Logout</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      {role === "admin" && (
        <>
          <Tab.Screen name="OPD Queue" component={OpdQueueScreen} />
          <Tab.Screen name="Users" component={UsersScreen} />
          <Tab.Screen name="Appointments" component={AppointmentsAdminScreen} />
          <Tab.Screen name="Cases" component={AdminCasesScreen} />
        </>
      )}

      {role === "faculty" && (
        <>
          <Tab.Screen name="Queue" component={FacultyQueueScreen} />
          <Tab.Screen name="Assigned Cases" component={FacultyCasesScreen} />
          <Tab.Screen name="Approvals" component={FacultyApprovalsScreen} />
        </>
      )}

      {role === "student" && (
        <>
          <Tab.Screen name="Queue" component={StudentQueueScreen} />
          <Tab.Screen name="My Cases" component={CasesScreen} />
          <Tab.Screen name="Procedure Log" component={ProcedureLogScreen} />
          <Tab.Screen name="Profile" component={StudentProfileScreen} />
        </>
      )}

      {role === "patient" && (
        <>
          <Tab.Screen
            name="My Appointments"
            component={PatientAppointmentsScreen}
          />
          <Tab.Screen name="Profile" component={PatientProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}
