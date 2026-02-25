import client from "./client";

export const fetchCases = async () => {
  const { data } = await client.get("/student/cases");
  return data;
};

export const fetchProcedureLogs = async () => {
  const { data } = await client.get("/student/procedure-log");
  return data;
};

const apiEndpoints = { fetchCases, fetchProcedureLogs };
export default apiEndpoints;

export const registerUser = async (payload) => {
  const { data } = await client.post("/auth/register", payload);
  return data;
};

export const getMyDashboard = async (client) => {
  const { data } = await client.get("/dashboard/me");
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await client.get("/admin/users");
  return data?.items || [];
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await client.patch(`/admin/users/${id}`, payload);
  return data;
};

export const getAdminAppointments = async () => {
  const { data } = await client.get("/admin/appointments");
  return data?.items || [];
};

export const updateAdminAppointment = async (id, payload) => {
  const { data } = await client.patch(`/admin/appointments/${id}`, payload);
  return data;
};

export const PATIENT_APPOINTMENTS = "/patient/appointments";
export const PATIENT_RESCHEDULE_APPOINTMENT = (id) =>
  `/patient/appointments/${id}/reschedule`;
export const PATIENT_PROFILE = "/patient/profile";
