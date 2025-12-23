import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isLogin ? 'Chào mừng trở lại' : 'Tham gia cùng chúng tôi'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Đăng nhập để tiếp tục hỗ trợ phòng ngừa ma túy'
              : 'Đăng ký để tham gia cộng đồng nâng cao nhận thức'}
          </p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default AuthPage;