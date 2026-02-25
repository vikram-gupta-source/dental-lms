import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import client from "../api/client";

export const AuthContext = createContext(null);

const isUsableToken = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed === "null" || trimmed === "undefined") return false;
  return true;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web") {
          await AsyncStorage.multiRemove(["token", "user"]);
          delete client.defaults.headers.common.Authorization;
          setToken(null);
          setUser(null);
          return;
        }

        const t = await AsyncStorage.getItem("token");
        const u = await AsyncStorage.getItem("user");
        const parsedUser = u ? JSON.parse(u) : null;

        if (isUsableToken(t)) {
          client.defaults.headers.common.Authorization = `Bearer ${t}`;
          try {
            const { data } = await client.get("/auth/me");
            setToken(t);
            setUser(data?.user || parsedUser || null);
          } catch {
            delete client.defaults.headers.common.Authorization;
            await AsyncStorage.multiRemove(["token", "user"]);
            setToken(null);
            setUser(null);
          }
        } else {
          await AsyncStorage.multiRemove(["token", "user"]);
          setToken(null);
          setUser(null);
        }
      } catch {
        await AsyncStorage.multiRemove(["token", "user"]);
        setToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    const t = data?.token || data?.accessToken;
    const u = data?.user;

    if (!t) throw new Error("Token missing in login response");

    setToken(t);
    setUser(u || null);
    client.defaults.headers.common.Authorization = `Bearer ${t}`;
    await AsyncStorage.setItem("token", t);
    await AsyncStorage.setItem("user", JSON.stringify(u || null));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete client.defaults.headers.common.Authorization;
    await AsyncStorage.multiRemove(["token", "user"]);
  };

  const value = useMemo(
    () => ({ user, token, booting, login, logout }),
    [user, token, booting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
