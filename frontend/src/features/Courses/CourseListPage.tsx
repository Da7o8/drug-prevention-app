// frontend/src/features/Courses/CourseListPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { getAllCourses, registerCourse, getMyProgress } from '../../services/courseService';
import type { Course, CourseProgress, CourseAudience } from '../../types/course';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import styles from './CourseListPage.module.css';

type SortKey = 'newest' | 'popular';

const PILL_OPTIONS: { label: string; value: CourseAudience | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Học sinh / Sinh viên', value: 'student' },
  { label: 'Phụ huynh', value: 'parent' },
  { label: 'Mọi đối tượng', value: 'all' },
];


const CourseListPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [userProgress, setUserProgress] = useState<CourseProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activePill, setActivePill] = useState<string>(''); // target_audience
    const [sortKey, setSortKey] = useState<SortKey>('newest');

    useEffect(() => {
        const loadCoursesAndProgress = async () => {
            try {
                const courseData = await getAllCourses(searchTerm, activePill);
                setCourses(courseData);

                if (user) {
                    const progressData = await getMyProgress();
                    setUserProgress(progressData);
                }
            } catch (err) {
                console.error(err);
                setError('Không thể tải dữ liệu khóa học. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };
        loadCoursesAndProgress();
    }, [user, searchTerm, activePill]);

    const isRegistered = (courseId: number): boolean => {
        return userProgress.some((p) => p.course_id === courseId);
    };

    const getProgressLabel = (courseId: number) => {
        const p = userProgress.find((x) => x.course_id === courseId);
        if (!p) return '';
        return p.is_completed ? 'Hoàn thành' : 'Đang học';
    };

    const handleRegister = async (courseId: number, courseTitle: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn đăng ký khóa học: ${courseTitle}?`)) return;

        try {
            await registerCourse(courseId);
            toast.success(`Đăng ký khóa học "${courseTitle}" thành công!`);
            // Optional: reload progress list for immediate UI update
            if (user) {
                const progressData = await getMyProgress();
                setUserProgress(progressData);
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Lỗi đăng ký không xác định.';
            toast.error(`Đăng ký thất bại: ${errMsg}`);
        }
    };

    // Mock metadata (UI only)
    const courseMeta = useMemo(() => {
        const map = new Map<number, { lessons: number; hours: number; rating: number; views: number }>();
        courses.forEach((c) => {
            const seed = (c.id * 9301 + 49297) % 233280;
            const rand = (n: number) => ((seed + n * 7919) % 233280) / 233280;
            const lessons = 8 + Math.floor(rand(1) * 14); // 8 - 21
            const hours = 1 + Math.floor(rand(2) * 5); // 1 - 5
            const rating = Math.round((4.2 + rand(3) * 0.7) * 10) / 10; // 4.2 - 4.9
            const views = 200 + Math.floor(rand(4) * 3800); // 200 - 4000
            map.set(c.id, { lessons, hours, rating, views });
        });
        return map;
    }, [courses]);

    const sortedCourses = useMemo(() => {
        const list = [...courses];
        if (sortKey === 'popular') {
            list.sort((a, b) => (courseMeta.get(b.id)?.views ?? 0) - (courseMeta.get(a.id)?.views ?? 0));
            return list;
        }
        // newest: assume higher id is newer (demo-safe)
        list.sort((a, b) => b.id - a.id);
        return list;
    }, [courses, sortKey, courseMeta]);

    if (isLoading) return <div className={styles.loading}>Đang tải danh sách khóa học...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.headerGroup}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.header}>Khóa học</h1>
                        <p className={styles.subHeader}>Trang bị kiến thức – vững vàng tâm lý – hỗ trợ phục hồi bền vững.</p>
                    </div>

                    {user?.role === 'admin' && (
                        <Link to="/courses/new" className={styles.createButton}>
                            + Tạo khóa học
                        </Link>
                    )}
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.searchWrap}>
                        <span className={styles.searchIcon} aria-hidden="true">⌕</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên khóa học hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.sortWrap}>
                        <label className={styles.sortLabel} htmlFor="sortKey">Sắp xếp</label>
                        <select
                            id="sortKey"
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className={styles.sortSelect}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="popular">Phổ biến</option>
                        </select>
                    </div>
                </div>

                <div className={styles.pillsRow}>
                    {PILL_OPTIONS.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            className={`${styles.pill} ${activePill === p.value ? styles.pillActive : ''}`}
                            onClick={() => setActivePill(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className={styles.courseGrid}>
                    {sortedCourses.map((course, idx) => {
                        const meta = courseMeta.get(course.id);
                        const toneClass =
                            idx % 3 === 0 ? styles.tone_trust : idx % 3 === 1 ? styles.tone_calm : styles.tone_hope;

                        const audienceLabel =
                            course.target_audience === 'student'
                                ? 'Dành cho Học sinh / Sinh viên'
                                : course.target_audience === 'parent'
                                    ? 'Dành cho Phụ huynh'
                                    : 'Dành cho tất cả';

                        const audienceShort =
                            course.target_audience ? course.target_audience.toUpperCase() : 'ALL';

                        return (
                            <div key={course.id} className={styles.courseCard}>
                                <div className={`${styles.thumb} ${toneClass}`}>
                                    <span className={styles.badge}>{audienceLabel}</span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.cardTop}>
                                        <span className={styles.audienceTag}>{audienceShort}</span>
                                        <span className={styles.metaViews}>👁 {meta?.views.toLocaleString('vi-VN')}</span>
                                    </div>

                                    <h2 className={styles.courseTitle} title={course.title}>
                                        {course.title}
                                    </h2>

                                    <p className={styles.courseDesc}>{course.description}</p>

                                    <div className={styles.statsRow}>
                                        <span className={styles.statItem}>🕒 {meta?.hours} giờ</span>
                                        <span className={styles.statDot}>•</span>
                                        <span className={styles.statItem}>📚 {meta?.lessons} bài</span>
                                        <span className={styles.statDot}>•</span>
                                        <span className={styles.statItem}>⭐ {meta?.rating}</span>
                                    </div>

                                    {user && user.role === 'user' && (
                                        <div className={styles.userRow}>
                                            {isRegistered(course.id) ? (
                                                <div className={styles.registeredStatus}>
                                                    Đã đăng ký · <strong>{getProgressLabel(course.id)}</strong>
                                                </div>
                                            ) : (
                                                <button
                                                    className={styles.registerButton}
                                                    onClick={() => handleRegister(course.id, course.title)}
                                                >
                                                    Đăng ký
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className={styles.cardFooter}>
                                        <Link to={`/courses/${course.id}`} className={styles.exploreBtn}>
                                            Khám phá ngay →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {sortedCourses.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyTitle}>Chưa có khóa học phù hợp</div>
                            <div className={styles.emptyDesc}>Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseListPage;
