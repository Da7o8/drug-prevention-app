// Định nghĩa trạng thái lịch hẹn
export type AppointmentStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

// Thông tin cơ bản về một lịch hẹn
export interface Appointment {
    appointment_id: number;
    user_id: number; // Người dùng đặt lịch
    counselor_id: number; // Chuyên viên được gán
    start_time: string; // ISO 8601 string
    end_time: string; // ISO 8601 string
    reason: string;
    status: AppointmentStatus;
    created_at: string;
    counselor_name?: string; // Tên chuyên viên
    user_name?: string; // Tên người dùng
}

// Thông tin profile chuyên viên tư vấn
export interface CounselorProfile {
    counselor_id: number;
    name: string;
    specialization: string;
    qualifications: string;
}