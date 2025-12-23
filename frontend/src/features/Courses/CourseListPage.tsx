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
    { label: 'Chuyên gia', value: 'professional' },
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
            {/* Header hấp dẫn hơn */}
            <div className={styles.heroHeader}>
                <h1 className={styles.mainTitle}>Khóa học Phòng ngừa Ma túy</h1>
                <p className={styles.subtitle}>Nâng cao nhận thức – Bảo vệ tương lai</p>
            </div>

            <div className={styles.headerGroup}>
                <h2 className={styles.sectionTitle}>Danh sách Khóa học</h2>
                {user?.role === 'admin' && (
                    <Link to="/courses/new" className={styles.createButton}>
                        + Tạo Khóa học Mới
                    </Link>
                )}
            </div>

            {/* Filter bar hiện đại hơn */}
            <div className={styles.filterBar}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên hoặc mô tả khóa học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <span className={styles.searchIcon}>🔍</span>
                </div>

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

            {/* Course Grid */}
            <div className={styles.courseGrid}>
                {courses.length === 0 ? (
                    <p className={styles.emptyText}>Chưa có khóa học nào phù hợp với bộ lọc.</p>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className={styles.courseCard}>
                            {/* Placeholder hình ảnh (có thể thay bằng course.image nếu có) */}
                            <div className={styles.courseImagePlaceholder}>
                                <span className={styles.imageIcon}>📚</span>
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.courseTitle}>{course.title}</h3>
                                <p className={styles.courseDesc}>{course.description}</p>

                                {/* Tag audience với màu khác nhau */}
                                <span className={`${styles.audienceTag} ${styles[`audience_${course.target_audience}`]}`}>
                                    {course.target_audience.toUpperCase()}
                                </span>

                                {user && user.role === 'user' && (
                                    <>
                                        {isRegistered(course.id) ? (
                                            <div className={styles.registeredStatus}>
                                                ✅ Đã đăng ký • Tiến độ: {
                                                    userProgress.find(p => p.course_id === course.id)?.is_completed
                                                        ? 'Hoàn thành' : 'Đang học'
                                                }
                                            </div>
                                        ) : (
                                            <button
                                                className={styles.registerButton}
                                                onClick={() => handleRegister(course.id, course.title)}
                                            >
                                                Đăng ký ngay
                                            </button>
                                        )}
                                    </>
                                )}

                                <Link to={`/courses/${course.id}`} className={styles.viewButton}>
                                    Xem chi tiết →
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseListPage;