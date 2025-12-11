import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

import Input from '../../../components/ui/Input/Input';
import styles from './LoginForm.module.css'; 

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Gọi API Đăng ký. Mặc định role là 'user'
      const response = await api.post('/auth/register', { email, password, name });

      setSuccess(response.data.msg || 'Đăng ký thành công! Vui lòng đăng nhập.');

      // Chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err: any) {
      // Xử lý lỗi từ Backend (ví dụ: 409 Conflict - Email đã tồn tại)
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Đã xảy ra lỗi hệ thống khi đăng ký.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.registerForm}>
      <Input
        label="Họ và Tên"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isLoading}
      />
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
      {success && <div className={styles.successBox}>{success}</div>} {/* Thêm hộp thông báo thành công */}

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>

      <p className={styles.footerText}>
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>
    </form>
  );
};

export default RegisterForm;