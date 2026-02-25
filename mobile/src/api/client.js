import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // e.g. http://localhost:5000/api
  timeout: 20000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(
    "API",
    config.method?.toUpperCase(),
    `${config.baseURL}${config.url}`,
  );
  return config;
});

export default client;
