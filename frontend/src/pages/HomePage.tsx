import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.heroSection}>
                <h1 className={styles.welcomeTitle}>
                    Xin chào, {user?.name || user?.email}!
                </h1>
                <p className={styles.welcomeSubtitle}>
                    Vai trò: <strong>
                        {user?.role === 'admin' ? 'Quản trị viên' :
                            user?.role === 'counselor' ? 'Chuyên viên tư vấn' :
                                'Người dùng'}
                    </strong>
                </p>
            </div>

            <div className={styles.featuresGrid}>
                <Link to="/courses" className={styles.featureCard}>
                    <div className={styles.featureIcon}>📚</div>
                    <h3>Khóa học Phòng ngừa</h3>
                    <p>Xem và tham gia các khóa học giáo dục về phòng ngừa ma túy</p>
                </Link>

                <Link to="/appointments" className={styles.featureCard}>
                    <div className={styles.featureIcon}>🗓️</div>
                    <h3>Lịch hẹn Tư vấn</h3>
                    <p>Đặt lịch hoặc quản lý các buổi tư vấn cá nhân</p>
                </Link>

                {user?.role === 'admin' && (
                    <Link to="/admin" className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚙️</div>
                        <h3>Quản trị Hệ thống</h3>
                        <p>Quản lý người dùng, khóa học và lịch hẹn</p>
                    </Link>
                )}
            </div>

            <button onClick={logout} className={styles.logoutButton}>
                Đăng xuất
            </button>
        </div>
    );
};

export default HomePage;