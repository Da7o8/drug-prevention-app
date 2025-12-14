import api from './api';
import type { CounselorProfile, AppointmentStatus } from '../types/appointment';

const APPOINTMENT_ENDPOINTS = {
    // Lấy danh sách chuyên viên
    GET_COUNSELORS: '/appointments/counselors',
    // Lấy danh sách lịch
    GET_MY_APPOINTMENTS: '/appointments/', 
    // Endpoint cập nhật trạng thái
    UPDATE_APPOINTMENT_STATUS: (appointmentId: number) => `/appointments/${appointmentId}/status`,
};

// Lấy danh sách chuyên viên
export const getAllCounselors = async (): Promise<CounselorProfile[]> => {
    try {
        const response = await api.get(APPOINTMENT_ENDPOINTS.GET_COUNSELORS);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải danh sách chuyên viên:", error);
        throw error;
    }
};

// Đặt lịch hẹn mới
export const createAppointment = async (data: {
  counselor_user_id: number;
  start_time: string;
  reason: string;
}) => {
  const response = await api.post(APPOINTMENT_ENDPOINTS.GET_MY_APPOINTMENTS, data);
  return response.data.data;
};

// Lấy danh sách lịch hẹn
export const getMyAppointments = async () => {
  const response = await api.get(APPOINTMENT_ENDPOINTS.GET_MY_APPOINTMENTS);
  return response.data.data;
};

// Cập nhật trạng thái
export const updateAppointmentStatus = async (
  appointmentId: number,
  status: AppointmentStatus
) => {
  const response = await api.post(
    APPOINTMENT_ENDPOINTS.UPDATE_APPOINTMENT_STATUS(appointmentId),
    { status }
  );
  return response.data.data;
};