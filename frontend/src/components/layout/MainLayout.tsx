// src/components/layout/MainLayout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from './MainLayout.module.css';
import { Outlet } from 'react-router-dom';


const MainLayout: React.FC = () => {
    return (
        <div className={styles.layoutWrapper}>
            {/* Header chung cho tất cả các trang đã đăng nhập */}
            <Header />

            {/* Nội dung chính của từng page (HomePage, CourseListPage, v.v.) */}
            <main className={styles.mainContent}>
                <Outlet /> {/* Đây là nơi các trang con sẽ được render */}
            </main>

            {/* Footer chung */}
            <Footer />
        </div>
    );
};

export default MainLayout;