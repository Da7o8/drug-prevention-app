// frontend/src/features/Appointments/AppointmentBookingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment, getAllCounselors } from '../../services/appointmentService';
import type { CounselorProfile } from '../../types/appointment';
import axios from 'axios';


import styles from './AppointmentBookingPage.module.css';

interface FormData {
    counselor_user_id: number | '';
    start_time: string;
    reason: string;
}

const AppointmentBookingPage: React.FC = () => {
    const navigate = useNavigate();
    const [counselors, setCounselors] = useState<CounselorProfile[]>([]);
    const [formData, setFormData] = useState<FormData>({
        counselor_user_id: '',
        start_time: '',
        reason: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 1. Tải danh sách chuyên viên khi component mount
    useEffect(() => {
        const loadCounselors = async () => {
            try {
                const data = await getAllCounselors();
                setCounselors(data);

                if (data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        counselor_user_id: data[0].counselor_id,
                    }));
                }
            } catch (error) {
                console.error(error);
                setError('Không thể tải danh sách chuyên viên. Vui lòng thử lại.');
            }
        };

        loadCounselors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'counselor_user_id' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (!formData.counselor_user_id || !formData.start_time || !formData.reason) {
            setError('Vui lòng điền đầy đủ các trường.');
            setIsLoading(false);
            return;
        }

        const selectedTime = new Date(formData.start_time);
        if (Number.isNaN(selectedTime.getTime())) {
            setError('Thời gian không hợp lệ.');
            setIsLoading(false);
            return;
        }

        if (selectedTime <= new Date()) {
            setError('Vui lòng chọn thời gian trong tương lai.');
            setIsLoading(false);
            return;
        }

        try {
            // 🔑 GỬI GIỜ LOCAL, KHÔNG UTC
            const startTimeISO = new Date(formData.start_time).toISOString();

            const newAppointment = await createAppointment({
                counselor_user_id: formData.counselor_user_id as number,
                start_time: startTimeISO,
                reason: formData.reason,
            });

            setSuccess(`Đặt lịch thành công! ID: ${newAppointment.appointment_id}`);
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (error) {
            let message = 'Lỗi khi đặt lịch.';

            if (axios.isAxiosError(error)) {
                const errorCode = error.response?.data?.error_code;
                const serverMessage = error.response?.data?.message;

                if (errorCode === 'APPOINTMENT_TIME_CONFLICT') {
                    message = 'Khung giờ này chuyên viên đã có lịch khác.';
                } else if (serverMessage) {
                    message = serverMessage;
                }
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Đặt lịch hẹn Chuyên viên</h1>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* 1. Chọn Chuyên viên */}
                <div className={styles.formGroup}>
                    <label htmlFor="counselor_id">Chọn Chuyên viên:</label>
                    <select
                        id="counselor_user_id"
                        name="counselor_user_id"
                        value={formData.counselor_user_id}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    >
                        {counselors.map(c => (
                            <option key={c.counselor_id} value={c.counselor_id}>
                                {c.name} - {c.specialization}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Chọn Thời gian */}
                <div className={styles.formGroup}>
                    <label htmlFor="start_time">Thời gian bắt đầu (Ngày và Giờ):</label>
                    <input
                        type="datetime-local"
                        id="start_time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    />
                    <p className={styles.hint}>Lịch hẹn thường kéo dài 1 giờ và phải được đặt trong tương lai.</p>
                </div>

                {/* 3. Nội dung */}
                <div className={styles.formGroup}>
                    <label htmlFor="reason">Nội dung/Vấn đề cần tư vấn:</label>
                    <textarea
                        id="reason"
                        name="reason"
                        rows={4}
                        value={formData.reason}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Đang đặt lịch...' : 'Đặt lịch hẹn'}
                </button>
            </form>
        </div>
    );
};

export default AppointmentBookingPage;