import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Platform } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

if (
  __DEV__ &&
  Platform.OS === "web" &&
  typeof globalThis !== "undefined" &&
  !globalThis.__pointerEventsDeprecationWarningSuppressed
) {
  const warningText = "props.pointerEvents is deprecated. Use style.pointerEvents";
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.warn = (...args) => {
    const firstArg = args[0];
    if (typeof firstArg === "string" && firstArg.includes(warningText)) return;
    originalConsoleWarn(...args);
  };

  console.error = (...args) => {
    const firstArg = args[0];
    if (typeof firstArg === "string" && firstArg.includes(warningText)) return;
    originalConsoleError(...args);
  };

  globalThis.__pointerEventsDeprecationWarningSuppressed = true;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
