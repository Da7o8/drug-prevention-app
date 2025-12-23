// frontend/src/features/Appointments/AppointmentBookingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment, getAllCounselors } from '../../services/appointmentService';
import type { CounselorProfile } from '../../types/appointment';

import styles from './AppointmentBookingPage.module.css';

interface FormData {
    counselor_id: number | '';
    start_time: string; // Định dạng yyyy-MM-ddTHH:mm
    reason: string;
}

const AppointmentBookingPage: React.FC = () => {
    const navigate = useNavigate();
    const [counselors, setCounselors] = useState<CounselorProfile[]>([]);
    const [formData, setFormData] = useState<FormData>({
        counselor_id: '',
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
                // Nếu có chuyên viên, chọn người đầu tiên làm mặc định
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, counselor_id: data[0].counselor_id }));
                }
            } catch (err) {
                setError('Không thể tải danh sách chuyên viên. Vui lòng thử lại.');
            }
        };
        loadCounselors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'counselor_id' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (!formData.counselor_id || !formData.start_time || !formData.reason) {
            setError('Vui lòng điền đầy đủ các trường.');
            setIsLoading(false);
            return;
        }

        try {
            // Định dạng thời gian cho Backend (ISO 8601 string: 2025-12-09T14:30)
            const startTimeISO = formData.start_time + ':00Z'; // Thêm giây và Z cho UTC
            const newAppointment = await createAppointment({
                counselor_id: formData.counselor_id as number,
                start_time: startTimeISO,
                reason: formData.reason,
            });

            setSuccess(`Đặt lịch hẹn thành công! ID: ${newAppointment.appointment_id}. Lịch đang chờ Xác nhận.`);

            setTimeout(() => {
                navigate('/appointments');
            }, 3000);

        } catch (err: any) {
            const message = err.response?.data?.error || 'Lỗi khi đặt lịch hẹn. Vui lòng kiểm tra lại thời gian (chỉ có thể đặt trước) và thử lại.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.bookingCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Đặt lịch tư vấn chuyên gia</h1>
                    <p className={styles.subtitle}>Chọn chuyên viên và thời gian phù hợp để được hỗ trợ sớm nhất</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Chọn chuyên viên với avatar */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Chọn chuyên viên tư vấn</label>
                        <div className={styles.counselorGrid}>
                            {counselors.map(c => (
                                <div
                                    key={c.counselor_id}
                                    className={`${styles.counselorCard} ${formData.counselor_id === c.counselor_id ? styles.selected : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, counselor_id: c.counselor_id }))}
                                >
                                    <div className={styles.avatar}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.counselorInfo}>
                                        <h4 className={styles.counselorName}>{c.name}</h4>
                                        <p className={styles.specialization}>{c.specialization}</p>
                                    </div>
                                    {formData.counselor_id === c.counselor_id && (
                                        <span className={styles.checkmark}>✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thời gian */}
                    <div className={styles.fieldGroup}>
                        <label htmlFor="start_time" className={styles.label}>
                            Thời gian mong muốn *
                        </label>
                        <input
                            type="datetime-local"
                            id="start_time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().slice(0, 16)} // Không cho chọn quá khứ
                            className={styles.datetimeInput}
                        />
                        <p className={styles.hint}>
                            Lịch hẹn kéo dài 60 phút • Chỉ đặt được từ giờ hiện tại trở đi
                        </p>
                    </div>

                    {/* Lý do */}
                    <div className={styles.fieldGroup}>
                        <label htmlFor="reason" className={styles.label}>
                            Nội dung cần tư vấn *
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={5}
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            placeholder="Mô tả ngắn gọn vấn đề bạn đang gặp phải (ví dụ: lo âu, áp lực học tập, gia đình...)"
                            className={styles.textarea}
                        />
                    </div>

                    {error && <div className={styles.errorBox}>{error}</div>}
                    {success && <div className={styles.successBox}>{success}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Đang gửi yêu cầu...' : 'Xác nhận đặt lịch'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentBookingPage;