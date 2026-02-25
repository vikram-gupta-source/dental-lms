import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import RoleNavigator from "./RoleNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, booting } = useAuth();

  if (booting) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={RoleNavigator} />
      )}
    </Stack.Navigator>
  );
}
