// frontend/src/services/appointmentService.ts
import api from './api';
import type { Appointment, CounselorProfile, AppointmentStatus } from '../types/appointment';

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
export const createAppointment = async (data: { counselor_id: number, start_time: string, reason: string }): Promise<Appointment> => {
    try {
        const response = await api.post(APPOINTMENT_ENDPOINTS.GET_MY_APPOINTMENTS, data);
        return response.data.appointment;
    } catch (error) {
        console.error("Lỗi khi đặt lịch hẹn:", error);
        throw error;
    }
};

// Lấy danh sách lịch hẹn
export const getMyAppointments = async (): Promise<Appointment[]> => {
    try {
        // Hiển thị dựa trên JWT
        const response = await api.get(APPOINTMENT_ENDPOINTS.GET_MY_APPOINTMENTS);
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi tải lịch hẹn của tôi:", error);
        throw error;
    }
};

// Cập nhật trạng thái lịch hẹn 
export const updateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus): Promise<Appointment> => {
    try {
        const response = await api.post(
            APPOINTMENT_ENDPOINTS.UPDATE_APPOINTMENT_STATUS(appointmentId), 
            { status }
        );
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái lịch hẹn ${appointmentId}:`, error);
        throw error;
    }
};