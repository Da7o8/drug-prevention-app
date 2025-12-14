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

    const isCounselorOrAdmin =
        user?.role === 'counselor' || user?.role === 'admin';
    const isRegularUser = user?.role === 'user';

    const formatDateTimeVN = (iso: string) => {
        const d = new Date(iso);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hour}:${minute}`;
    };

    const formatTimeVN = (iso: string) => {
        const d = new Date(iso);
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        return `${hour}:${minute}`;
    };

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                setIsLoading(true);
                const data = await getMyAppointments();

                // Sắp xếp: lịch gần nhất ở trên
                const sorted = [...data].sort(
                    (a, b) =>
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime()
                );

                setAppointments(sorted);
            } catch (err) {
                console.error(err);
                setError('Không thể tải lịch hẹn. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointments();
    }, []);

    const handleStatusUpdate = async (
        appointmentId: number,
        newStatus: AppointmentStatus
    ) => {
        if (
            !isCounselorOrAdmin ||
            !window.confirm(`Bạn có chắc muốn chuyển trạng thái sang ${newStatus}?`)
        ) {
            return;
        }

        const toastId = toast.loading('Đang cập nhật trạng thái...');

        try {
            const updatedAppt = await updateAppointmentStatus(
                appointmentId,
                newStatus
            );

            setAppointments((prev) =>
                prev.map((a) =>
                    a.appointment_id === appointmentId ? updatedAppt : a
                )
            );

            toast.success('Cập nhật trạng thái thành công', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Cập nhật thất bại. Kiểm tra quyền hoặc trạng thái.', {
                id: toastId,
            });
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>
                Lịch hẹn {isCounselorOrAdmin ? 'Đã gán' : 'Của tôi'}
            </h1>

            {isRegularUser && (
                <div className={styles.bookingAction}>
                    <Link to="/appointments/book" className={styles.bookButton}>
                        + Đặt lịch hẹn mới
                    </Link>
                </div>
            )}

            {isLoading && (
                <div className={styles.loading}>Đang tải lịch hẹn...</div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            {!isLoading && !error && (
                <>
                    <p className={styles.subHeader}>
                        {isCounselorOrAdmin
                            ? `Bạn đang xem ${appointments.length} lịch hẹn.`
                            : `Bạn có ${appointments.length} lịch hẹn.`}
                    </p>

                    <div className={styles.appointmentList}>
                        {appointments.length === 0 ? (
                            <p className={styles.noData}>Hiện tại không có lịch hẹn nào.</p>
                        ) : (
                            appointments.map((appt) => (
                                <div
                                    key={appt.appointment_id}
                                    className={`${styles.appointmentCard} ${styles[appt.status]
                                        }`}
                                >
                                    <div className={styles.info}>
                                        <p>
                                            <strong>ID:</strong> {appt.appointment_id}
                                        </p>
                                        <p>
                                            <strong>Thời gian:</strong>{' '}
                                            {formatDateTimeVN(appt.start_time)} - {formatTimeVN(appt.end_time)}
                                        </p>
                                        <p>
                                            <strong>Lý do:</strong> {appt.reason}
                                        </p>
                                        <p>
                                            <strong>Chuyên viên:</strong>{' '}
                                            {appt.counselor_name || 'Đang chờ'}
                                        </p>
                                    </div>

                                    <div className={styles.statusGroup}>
                                        <span className={styles.statusBadge}>
                                            {appt.status.toUpperCase()}
                                        </span>

                                        {/* Action buttons theo permissions */}
                                        {appt.permissions?.can_update_status && (
                                            <div className={styles.actionButtons}>
                                                {appt.permissions.allowed_next_status.map(
                                                    (status: AppointmentStatus) => (
                                                        <button
                                                            key={status}
                                                            onClick={() =>
                                                                handleStatusUpdate(
                                                                    appt.appointment_id,
                                                                    status
                                                                )
                                                            }
                                                        >
                                                            {status}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AppointmentListPage;
