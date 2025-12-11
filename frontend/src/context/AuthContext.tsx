import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthData, UserProfile } from '../types/auth';
import type { AuthContextType } from '../types/auth';
import api from '../services/api';

// Tạo Context với giá trị mặc định là null hoặc các hàm rỗng
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Định nghĩa Props cho Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

// Hàm chuyển đổi AuthData thành UserProfile cơ bản
const mapAuthDataToProfile = (data: AuthData): UserProfile => ({
  id: data.user_id,
  email: data.email,
  name: data.email.split('@')[0],
  role: data.role,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  // Hàm Đăng nhập: Lưu token vào state và localStorage
  const login = (data: AuthData) => {
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('role', data.role); 
    
    setToken(data.token);
    setUser(mapAuthDataToProfile(data));
  };

  // Hàm Đăng xuất: Xóa token và reset state
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  // Hàm tải Profile từ API (khi refresh trang)
  const fetchProfile = useCallback(async () => {
    // Kiểm tra xem token đã có chưa. Nếu có, set header mặc định.
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/profile'); 
      const profileData = response.data.profile || {};

      if (!profileData.id && !profileData.user_id) { 
          logout();
          return;
      }

      setUser({
          id: profileData.id || profileData.user_id,
          email: profileData.email,
          name: profileData.name || profileData.email.split('@')[0],
          role: profileData.role,
      });
      setToken(storedToken);

    } catch (error) {
      console.error("Lỗi tải profile:", error);
      logout(); // Nếu token hết hạn hoặc lỗi, đăng xuất
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect chạy khi component mount lần đầu
  useEffect(() => {
    // Thử lấy token đã lưu trong localStorage
    const storedToken = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('role') as AuthData['role'] | null;

    if (storedToken && storedRole) {
      // Khi có token gọi lấy thông tin chi tiết qua API (fetchProfile), khi chưa có gọi để xác thực token.
      fetchProfile(); 
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);


  // Giá trị Context cung cấp ra ngoài
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    fetchProfile,
  };

  // Nếu đang tải, có thể trả về một Spinner (tùy chọn)
  if (isLoading) {
      // return <LoadingSpinner />; // Tùy chọn: hiển thị màn hình loading
  }


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook sử dụng Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};