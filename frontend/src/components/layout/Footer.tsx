// src/components/layout/Footer.tsx
import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h3>Drug Prevention App</h3>
                    <p>Ứng dụng hỗ trợ phòng ngừa sử dụng ma túy trong cộng đồng</p>
                    <p>Do tổ chức tình nguyện phát triển • Vì một tương lai khỏe mạnh</p>
                </div>

                <div className={styles.center}>
                    <p><strong>Liên hệ hỗ trợ:</strong></p>
                    <p>Email: support@drugprevention.vn</p>
                    <p>Hotline: 1800-XXX-XXX (miễn phí)</p>
                </div>

                <div className={styles.right}>
                    <p>&copy; {new Date().getFullYear()} Tổ chức Tình nguyện Phòng ngừa Ma túy</p>
                    <p>Tất cả quyền được bảo lưu</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;