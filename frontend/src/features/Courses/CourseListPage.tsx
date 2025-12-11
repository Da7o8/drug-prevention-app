import React, { useState, useEffect } from 'react';
import { getAllCourses, registerCourse, getMyProgress } from '../../services/courseService';
import type { Course, CourseProgress } from '../../types/course';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Import CSS Module
import styles from './CourseListPage.module.css';

const AUDIENCE_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Học sinh/Sinh viên', value: 'student' },
    { label: 'Phụ huynh', value: 'parent' },
];

const CourseListPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [userProgress, setUserProgress] = useState<CourseProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterAudience, setFilterAudience] = useState(''); 

    useEffect(() => {
        const loadCoursesAndProgress = async () => { 
            try {
                const courseData = await getAllCourses(searchTerm, filterAudience);
                setCourses(courseData);

                if (user) {
                    const progressData = await getMyProgress();
                    setUserProgress(progressData);
                }

            } catch (err: any) {
                setError('Không thể tải dữ liệu khóa học. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCoursesAndProgress();
    }, [user, searchTerm, filterAudience]);

    const isRegistered = (courseId: number): boolean => {
            return userProgress.some(p => p.course_id === courseId);
        };

    const handleRegister = async (courseId: number, courseTitle: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn đăng ký khóa học: ${courseTitle}?`)) {
            return;
        }
        try {
            await registerCourse(courseId);
            toast.success(`Đăng ký khóa học "${courseTitle}" thành công!`);          
            // loadCourses(); 
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Lỗi đăng ký không xác định.';
            toast.error(`Đăng ký thất bại: ${errMsg}`);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Đang tải danh sách khóa học...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerGroup}>
                <h1 className={styles.header}>Danh sách Khóa học</h1>

                {/* Create button for Admin */}
                {user?.role === 'admin' && (
                    <Link to="/courses/new" className={styles.createButton}>
                        + Tạo Khóa học Mới
                    </Link>
                )}
            </div>

            <div className={styles.filterBar}>
                {/* Thanh Tìm kiếm */}
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khóa học hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />

                {/* Bộ lọc Đối tượng */}
                <select
                    value={filterAudience}
                    onChange={(e) => setFilterAudience(e.target.value)}
                    className={styles.filterSelect}
                >
                    {AUDIENCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.courseGrid}>
                {courses.map(course => (
                    <div key={course.id} className={styles.courseCard}>
                        <h2 className={styles.courseTitle}>{course.title}</h2>
                        <p className={styles.courseDesc}>{course.description}</p>
                        <span className={styles.audienceTag}>{course.target_audience.toUpperCase()}</span>

                        {user && user.role === 'user' && (
                            <>
                                {isRegistered(course.id) ? (
                                    <div className={styles.registeredStatus}>
                                        Đã Đăng ký (Tiến trình: {userProgress.find(p => p.course_id === course.id)?.is_completed ? 'Hoàn thành' : 'Đang học'})
                                    </div>
                                ) : (
                                    <button 
                                        className={styles.registerButton}
                                        onClick={() => handleRegister(course.id, course.title)}
                                    >
                                        Đăng ký Khóa học
                                    </button>
                                )}
                            </>
                        )}

                        {/* Xem chi tiết */}
                        <Link to={`/courses/${course.id}`} className={styles.viewButton}>
                            Xem chi tiết
                        </Link>
                    </div>
                ))}
                {courses.length === 0 && <p>Chưa có khóa học nào được tạo.</p>}
            </div>
        </div>
    );
};

export default CourseListPage;