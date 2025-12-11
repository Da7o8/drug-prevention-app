import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

import Input from '../../../components/ui/Input/Input'; 
import styles from './LoginForm.module.css'; 

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com'); // Giá trị mặc định để testing
  const [password, setPassword] = useState('Admin@123'); // Giá trị mặc định để testing
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Gọi API Đăng nhập
      const response = await api.post('/auth/login', { email, password });

      // 2. Cập nhật Auth Context và lưu token
      login(response.data); // response.data chứa { token, user_id, email, role }

      // 3. Chuyển hướng người dùng về trang chủ
      navigate('/', { replace: true });

    } catch (err: any) {
      // Xử lý lỗi từ Backend 
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <Input
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />

      {error && <div className={styles.errorBox}>{error}</div>}

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      <p className={styles.footerText}>
        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
      </p>
    </form>
  );
};

export default LoginForm;