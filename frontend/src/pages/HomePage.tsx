import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; 

import styles from './HomePage.module.css'; 

const HomePage: React.FC = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className={styles.container}> 
            <h1 className={styles.header}>Xin chào, {user?.name || user?.email}!</h1>
            <p className={styles.roleText}>Vai trò của bạn: <strong>{user?.role}</strong></p>

            <div className={styles.buttonGroup}> 
                <Link to="/courses" className={styles.viewCourseButton}>
                    Xem Khóa học
                </Link>

                <Link to="/appointments" className={styles.viewCourseButton}>
                    Xem Lịch hẹn
                </Link>
                {/* Thêm nút Admin Dashboard cho Admin sau này */}

                <button 
                    onClick={logout} 
                    className={styles.logoutButton}
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default HomePage;