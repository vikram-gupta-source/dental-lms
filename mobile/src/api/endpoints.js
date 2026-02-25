import client from "./client";

export const fetchCases = async () => {
  const { data } = await client.get("/student/cases");
  return data?.data || [];
};

export const fetchProcedureLogs = async () => {
  const { data } = await client.get("/student/procedure-log");
  return data?.data || [];
};

const apiEndpoints = { fetchCases, fetchProcedureLogs };
export default apiEndpoints;

export const registerUser = async (payload) => {
  const { data } = await client.post("/auth/register", payload);
  return data;
};

export const getMyDashboard = async () => {
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

export const getFacultyCases = async () => {
  const { data } = await client.get("/faculty/cases");
  return data?.data || [];
};

export const getFacultyApprovalQueue = async () => {
  const { data } = await client.get("/faculty/approval-queue");
  return data?.data || [];
};

export const updateFacultyCaseStatus = async (id, payload) => {
  const { data } = await client.patch(`/faculty/cases/${id}/status`, payload);
  return data?.data;
};

export const createStudentCase = async (payload) => {
  const { data } = await client.post("/student/cases", payload);
  return data?.data;
};

export const updateStudentCase = async (id, payload) => {
  const { data } = await client.patch(`/student/cases/${id}`, payload);
  return data?.data;
};

export const getStudentPatients = async () => {
  const { data } = await client.get("/student/patients");
  return data?.data || [];
};

export const getStudentProfile = async () => {
  const { data } = await client.get("/student/profile");
  return data;
};

export const updateStudentProfile = async (payload) => {
  const { data } = await client.patch("/student/profile", payload);
  return data;
};

export const PATIENT_APPOINTMENTS = "/patient/appointments";
export const PATIENT_RESCHEDULE_APPOINTMENT = (id) =>
  `/patient/appointments/${id}/reschedule`;
export const PATIENT_PROFILE = "/patient/profile";

// OPD Queue APIs
export const checkInPatient = async (payload) => {
  const { data } = await client.post("/opd/check-in", payload);
  return data?.data;
};

export const getOpdQueue = async (params) => {
  const { data } = await client.get("/opd/queue", { params });
  return data?.items || data?.data || [];
};

export const updateQueueStatus = async (id, payload) => {
  const { data } = await client.patch(`/opd/${id}/status`, payload);
  return data?.data;
};

// Procedure Log APIs
export const getMyProcedureLogs = async () => {
  const { data } = await client.get("/student/logs");
  return data?.data || [];
};

export const createProcedureLog = async (payload) => {
  const { data } = await client.post("/student/logs", payload);
  return data?.data;
};

export const updateProcedureLog = async (id, payload) => {
  const { data } = await client.patch(`/student/logs/${id}`, payload);
  return data?.data;
};

export const deleteProcedureLog = async (id) => {
  const { data } = await client.delete(`/student/logs/${id}`);
  return data;
};
