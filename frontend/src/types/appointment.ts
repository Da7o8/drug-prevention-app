// Định nghĩa trạng thái lịch hẹn
export type AppointmentStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

// Thông tin cơ bản về một lịch hẹn
export interface Appointment {
  appointment_id: number;
  user_id: number;
  counselor_user_id: number;
  start_time: string;
  end_time: string;
  reason: string;
  status: AppointmentStatus;
  created_at: string;
  counselor_name?: string;
  user_name?: string;
  permissions?: AppointmentPermissions;
}

// Thông tin profile chuyên viên tư vấn
export interface CounselorProfile {
    counselor_id: number;
    name: string;
    specialization: string;
    qualifications: string;
}

export interface AppointmentPermissions {
  can_update_status: boolean;
  allowed_next_status: AppointmentStatus[];
}
