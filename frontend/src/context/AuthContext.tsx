// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthData, UserProfile, AuthContextType } from '../types/auth';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Đăng nhập – lưu đầy đủ vào localStorage
  const login = (data: AuthData) => {
    const profile: UserProfile = {
      id: data.user_id,
      email: data.email,
      name: data.email.split('@')[0],
      role: data.role,
    };

    setUser(profile);
    setToken(data.token);

    // LƯU ĐẦY ĐỦ VÀO LOCALSTORAGE – QUAN TRỌNG NHẤT
    localStorage.setItem('authData', JSON.stringify({
      token: data.token,
      user: profile,
    }));
  };

  // Đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authData');
  };

  // Verify token bằng user_id từ backend
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile');
      const backendUserId = response.data.user_id;

      if (!backendUserId) {
        throw new Error('Backend không trả user_id');
      }

      // Lấy dữ liệu đã lưu từ localStorage
      const storedStr = localStorage.getItem('authData');
      if (!storedStr) {
        throw new Error('No stored auth data');
      }

      const stored = JSON.parse(storedStr);
      if (stored.user.id !== backendUserId) {
        throw new Error('User ID không khớp');
      }

      // Token hợp lệ → khôi phục user
      setUser(stored.user);
      setToken(stored.token);

    } catch (error) {
      console.error('Token không hợp lệ hoặc hết hạn:', error);
      logout();
    }
  };

  // Khi app load (F5)
  useEffect(() => {
    const initAuth = async () => {
      const storedStr = localStorage.getItem('authData');

      if (!storedStr) {
        setIsLoading(false);
        return;
      }

      try {
        const stored = JSON.parse(storedStr);

        if (stored.token && stored.user) {
          setToken(stored.token);
          setUser(stored.user);

          // Verify token còn sống
          await verifyToken();
        } else {
          throw new Error('Stored data không đầy đủ');
        }
      } catch (error) {
        console.error('Lỗi khởi tạo auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    fetchProfile: verifyToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};