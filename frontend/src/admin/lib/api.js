import { axiosInstance } from "../../lib/axios";

export async function getAdminUsers() {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
}

export async function updateAdminUserActiveStatus(userId, active) {
  const response = await axiosInstance.patch(`/admin/users/${userId}/active`, { active });
  return response.data;
}

export async function getAdminReports() {
  const response = await axiosInstance.get("/admin/reports");
  return response.data;
}
