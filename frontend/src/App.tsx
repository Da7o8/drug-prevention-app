import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import các Pages/Features (sẽ tạo sau)
import HomePage from './pages/HomePage';
import AuthPage from './features/Auth/AuthPage';
import CourseListPage from './features/Courses/CourseListPage'; 
import CreateCoursePage from './features/Courses/CreateCoursePage';
import AppointmentListPage from './features/Appointments/AppointmentListPage';
import AppointmentBookingPage from './features/Appointments/AppointmentBookingPage';
import CourseDetailPage from './features/Courses/CourseDetailPage';

// Component bảo vệ Route
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Chuyển hướng về trang Đăng nhập nếu chưa xác thực
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


function App() {
  // Logic kiểm tra trạng thái isLoading có thể được thêm vào đây
  // const { isLoading } = useAuth(); 
  // if (isLoading) return <div>Đang tải ứng dụng...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

      {/* Protected Routes */}

        {/* Trang chủ */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

        {/* Danh sách khóa học */}
        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />

        {/* Tạo khóa học (Admin) */}
        <Route path="/courses/new" element={<ProtectedRoute><CreateCoursePage/></ProtectedRoute>} />

        {/* Danh sách lịch hẹn */}
        <Route path="/appointments" element={<ProtectedRoute><AppointmentListPage /></ProtectedRoute>} />

        {/* Đặt lịch hẹn */}
        <Route path="/appointments/book" element={<ProtectedRoute><AppointmentBookingPage /></ProtectedRoute>} />

        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        {/* Thêm route chi tiết khóa học sau: /courses/:id */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;