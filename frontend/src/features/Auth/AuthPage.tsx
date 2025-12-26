import React from 'react';
import { useLocation} from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className={styles.page}>
      {/* LEFT – VISUAL / EMOTION */}
      <div className={styles.visual}>
        <div className={styles.visualOverlay}>
          <h1>Bắt đầu hành trình cân bằng tâm trí</h1>
          <p>
            Bạn luôn có chúng tôi đồng hành, lắng nghe và hỗ trợ
            trong quá trình phục hồi và nâng cao sức khỏe tinh thần.
          </p>

          <div className={styles.securityNote}>
            🔒 Dữ liệu cá nhân của bạn được mã hóa và bảo mật tuyệt đối
          </div>
        </div>
      </div>

      {/* RIGHT – AUTH FORM */}
      <div className={styles.formWrapper}>
        <div className={styles.authBox}>
          <h2 className={styles.title}>
            {isLogin ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản mới'}
          </h2>

          <p className={styles.subTitle}>
            {isLogin
              ? 'Đăng nhập để tiếp tục sử dụng hệ thống tư vấn'
              : 'Bắt đầu kết nối với chuyên viên tư vấn'}
          </p>

          {isLogin ? <LoginForm /> : <RegisterForm />}

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
