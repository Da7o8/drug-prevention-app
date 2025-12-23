// frontend/src/features/Appointments/AppointmentListPage.tsx
import React, { useState, useEffect } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import styles from './AppointmentListPage.module.css';

const AppointmentListPage: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCounselorOrAdmin = user?.role === 'counselor' || user?.role === 'admin';
    const isRegularUser = user?.role === 'user';

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const data = await getMyAppointments();
                setAppointments(data);
            } catch (err: any) {
                setError('Không thể tải lịch hẹn. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadAppointments();
    }, []);

    const handleStatusUpdate = async (appointmentId: number, newStatus: AppointmentStatus) => {
        if (!isCounselorOrAdmin || !window.confirm(`Bạn có chắc muốn chuyển trạng thái sang ${newStatus}?`)) {
            return;
        }

        const toastId = toast.loading('Đang cập nhật trạng thái...');

        try {
            const updatedAppt = await updateAppointmentStatus(appointmentId, newStatus);

            setAppointments(prev =>
                prev.map(a =>
                    a.appointment_id === appointmentId ? updatedAppt : a
                )
            );

            toast.success('Cập nhật trạng thái thành công', { id: toastId });
        } catch (err) {
            toast.error('Cập nhật thất bại. Vui lòng kiểm tra quyền hạn!', {
                id: toastId
            });
            console.error(err);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.mainTitle}>
                    Lịch hẹn {isCounselorOrAdmin ? 'Đã gán cho bạn' : 'Của tôi'}
                </h1>
                <p className={styles.subtitle}>
                    {isCounselorOrAdmin
                        ? `Bạn đang quản lý ${appointments.length} lịch hẹn`
                        : `Bạn có ${appointments.length} lịch hẹn`}
                </p>

                {isRegularUser && (
                    <Link to="/appointments/book" className={styles.bookButton}>
                        + Đặt lịch hẹn mới
                    </Link>
                )}
            </div>

            {isLoading && <div className={styles.loading}>Đang tải danh sách lịch hẹn...</div>}
            {error && <div className={styles.errorBox}>{error}</div>}

            {!isLoading && !error && (
                <div className={styles.appointmentList}>
                    {appointments.length === 0 ? (
                        <div className={styles.noDataCard}>
                            <p>Hiện tại chưa có lịch hẹn nào.</p>
                            {isRegularUser && <Link to="/appointments/book">Đặt lịch ngay</Link>}
                        </div>
                    ) : (
                        appointments.map(appt => (
                            <div
                                key={appt.appointment_id}
                                className={`${styles.appointmentCard} ${styles[`status_${appt.status}`]}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatarPlaceholder}>
                                        {appt.counselor_name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                    <div className={styles.mainInfo}>
                                        <h3 className={styles.appointmentId}>Lịch hẹn #{appt.appointment_id}</h3>
                                        <p className={styles.counselor}>
                                            Chuyên viên: <strong>{appt.counselor_name || 'Chưa chỉ định'}</strong>
                                        </p>
                                    </div>
                                    <span className={styles.statusBadge}>
                                        {appt.status === 'pending' ? 'Chờ xác nhận' :
                                            appt.status === 'confirmed' ? 'Đã xác nhận' :
                                                'Đã hủy'}
                                    </span>
                                </div>

                                <div className={styles.details}>
                                    <p><strong>Thời gian:</strong> {new Date(appt.start_time).toLocaleString('vi-VN')} → {new Date(appt.end_time).toLocaleTimeString('vi-VN')}</p>
                                    <p><strong>Lý do tư vấn:</strong> {appt.reason}</p>
                                </div>

                                {isCounselorOrAdmin && appt.status === 'pending' && (
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.confirmButton}
                                            onClick={() => handleStatusUpdate(appt.appointment_id, 'confirmed')}
                                        >
                                            Xác nhận lịch
                                        </button>
                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => handleStatusUpdate(appt.appointment_id, 'canceled')}
                                        >
                                            Hủy lịch
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentListPage;