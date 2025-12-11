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

    const handleStatusUpdate = async (appointmentId: number,newStatus: AppointmentStatus) => {
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
        <div className={styles.container}>
            <h1 className={styles.header}>Lịch hẹn {isCounselorOrAdmin ? 'Đã gán' : 'Của tôi'}</h1>

            {isRegularUser && (
                <div className={styles.bookingAction}>
                     <Link to="/appointments/book" className={styles.bookButton}>
                        + Đặt lịch hẹn mới
                    </Link>
                </div>
            )}

            {isLoading && <div className={styles.loading}>Đang tải lịch hẹn...</div>} 
            {error && <div className={styles.error}>{error}</div>}            
            
            {!isLoading && !error && (
                <div className={styles.appointmentList}>
                </div>
            )}

            <p className={styles.subHeader}>
                {isCounselorOrAdmin ? `Bạn đang xem ${appointments.length} lịch hẹn.` : `Bạn có ${appointments.length} lịch hẹn.`}
            </p>
            
            {error ? (
                <div className={styles.error}>{error}</div> 
            ) : (
                <div className={styles.appointmentList}>
                    {appointments.length === 0 ? (
                        <p className={styles.noData}>Hiện tại không có lịch hẹn nào.</p>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt.appointment_id} className={`${styles.appointmentCard} ${styles[appt.status]}`}>
                                <div className={styles.info}>
                                    <p><strong>ID:</strong> {appt.appointment_id}</p>
                                    <p><strong>Thời gian:</strong> {new Date(appt.start_time).toLocaleString()} - {new Date(appt.end_time).toLocaleTimeString()}</p>
                                    <p><strong>Lý do:</strong> {appt.reason}</p>
                                    <p><strong>Chuyên viên:</strong> {appt.counselor_name || 'Đang chờ'}</p>
                                </div>
                                <div className={styles.statusGroup}>
                                    <span className={styles.statusBadge}>{appt.status.toUpperCase()}</span>

                                    {/* Cập nhật trạng thái */}
                                    {isCounselorOrAdmin && appt.status === 'pending' && (
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={styles.confirmButton}
                                                onClick={() => handleStatusUpdate(appt.appointment_id, 'confirmed')}
                                            >
                                                Xác nhận
                                            </button>
                                            <button 
                                                className={styles.cancelButton}
                                                onClick={() => handleStatusUpdate(appt.appointment_id, 'canceled')}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentListPage;