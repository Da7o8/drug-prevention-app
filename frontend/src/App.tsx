// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages & Features
import HomePage from './pages/HomePage';
import AuthPage from './features/Auth/AuthPage';
import CourseListPage from './features/Courses/CourseListPage';
import CreateCoursePage from './features/Courses/CreateCoursePage';
import CourseDetailPage from './features/Courses/CourseDetailPage';
import AppointmentListPage from './features/Appointments/AppointmentListPage';
import AppointmentBookingPage from './features/Appointments/AppointmentBookingPage';

// Layout & Protected Route
import MainLayout from './components/layout/MainLayout';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.4rem',
        color: '#4b5563',
        background: '#f0f9ff'
      }}>
        Đang tải ứng dụng...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* ==================== PROTECTED ROUTES (có Header + Footer) ==================== */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/new" element={<CreateCoursePage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/appointments" element={<AppointmentListPage />} />
          <Route path="/appointments/book" element={<AppointmentBookingPage />} />
          {/* Thêm các route protected khác ở đây nếu cần */}
        </Route>

        {/* ==================== REDIRECT MẶC ĐỊNH ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;