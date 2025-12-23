// src/components/layout/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Nếu không có user (trang login/register), không render Header
    if (!user) return null;

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo / Tên ứng dụng */}
                <Link to="/" className={styles.logo}>
                    Drug Prevention App
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link to="/" className={styles.navLink}>
                        Trang chủ
                    </Link>
                    <Link to="/courses" className={styles.navLink}>
                        Khóa học
                    </Link>
                    <Link to="/appointments" className={styles.navLink}>
                        Lịch hẹn
                    </Link>

                    {/* Chỉ hiện cho Admin */}
                    {user.role === 'admin' && (
                        <Link to="/admin" className={styles.navLink}>
                            Quản trị
                        </Link>
                    )}
                </nav>

                {/* User info + Logout */}
                <div className={styles.userSection}>
                    <span className={styles.userGreeting}>
                        Xin chào, <strong>{user.name || user.email}</strong>
                    </span>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;