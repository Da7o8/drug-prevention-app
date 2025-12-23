import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as courseService from "../../services/courseService";
import type { Course, CourseModule } from "../../types/course";
import { useAuth } from "../../context/AuthContext";

// Import CSS Module
import styles from './CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                setLoading(true);
                const res = await courseService.getCourseDetail(Number(courseId));
                setCourse(res.course);
                setModules(res.modules);
                setCurrentModule(res.currentModule || null);
                setIsCompleted(res.isCompleted || false);

            } catch (err) {
                setError("Không thể tải thông tin khóa học");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetail();
        }
    }, [courseId]);

    const handleCompleteModule = async () => {
        if (!currentModule) return;

        try {
            await courseService.completeModule(Number(courseId), currentModule.id);
            window.location.reload();
        } catch (err) {
            alert("Không thể hoàn thành module");
        }
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải dữ liệu khóa học...</div>;
    }

    if (error || !course) {
        return <div className={styles.error}>{error || "Không thể tải khóa học"}</div>;
    }

    // Tính tiến độ % (nếu có currentModule)
    const progressPercent = modules.length > 0
        ? Math.round(((modules.findIndex(m => m.id === currentModule?.id) + 1) / modules.length) * 100)
        : 0;

    return (
        <div className={styles.container}>
            {/* Hero header với tiêu đề + mô tả */}
            <div className={styles.heroHeader}>
                <h1 className={styles.courseTitle}>{course.title}</h1>
                <p className={styles.courseDesc}>{course.description}</p>

                {/* Progress Status + Bar */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressStatus}>
                        {isCompleted ? (
                            <span className={styles.completedBadge}>✅ Đã hoàn thành khóa học</span>
                        ) : currentModule ? (
                            <span className={styles.inProgressBadge}>📚 Đang học</span>
                        ) : user?.role === "user" ? (
                            <span className={styles.notRegisteredBadge}>⚠️ Chưa đăng ký khóa học</span>
                        ) : null}
                    </div>

                    {currentModule && !isCompleted && (
                        <div className={styles.progressBarWrapper}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>{progressPercent}% hoàn thành</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Sidebar: Danh sách module */}
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Nội dung khóa học ({modules.length} module)</h3>
                    <ul className={styles.moduleList}>
                        {modules.map((module, index) => {
                            const isCurrent = module.id === currentModule?.id;
                            const isPast = currentModule && index < modules.findIndex(m => m.id === currentModule.id);
                            return (
                                <li
                                    key={module.id}
                                    className={`${styles.moduleItem} ${isCurrent ? styles.currentModule : ''} ${isPast ? styles.pastModule : ''}`}
                                >
                                    <div className={styles.moduleInfo}>
                                        <span className={styles.moduleNumber}>{index + 1}</span>
                                        <span className={styles.moduleName}>{module.title}</span>
                                    </div>
                                    {isCurrent && <span className={styles.currentTag}>Đang học</span>}
                                    {isPast && <span className={styles.completedTag}>✓</span>}
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {currentModule ? (
                        <div className={styles.moduleContent}>
                            <div className={styles.moduleHeader}>
                                <h2>{currentModule.title}</h2>
                                <span className={styles.moduleLabel}>Module hiện tại</span>
                            </div>
                            <div className={styles.contentText}>
                                {currentModule.content || "Nội dung module sẽ được hiển thị tại đây."}
                            </div>

                            <button
                                className={styles.completeButton}
                                onClick={handleCompleteModule}
                                disabled={isCompleted}
                            >
                                {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành module này →'}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.noContent}>
                            <p>Bạn chưa bắt đầu khóa học này.</p>
                            <p>Hãy quay lại sau khi đăng ký và bắt đầu module đầu tiên.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseDetailPage;