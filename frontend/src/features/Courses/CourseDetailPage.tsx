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
        return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (error || !course) {
        return <div className={styles.error}>{error || "Dữ liệu không hợp lệ"}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDesc}>{course.description}</p>

            <div className={styles.progressStatus}>
                {isCompleted ? (
                    <span className={styles.completed}>Đã hoàn thành khóa học</span>
                ) : currentModule ? (
                    <span className={styles.inProgress}>Đang học</span>
                ) : (
                    <>
                        {user?.role === "user" && (
                            <span className={styles.notRegistered}>
                                Chưa đăng ký khóa học
                            </span>
                        )}
                    </>
                )}  
        </div>
                    
            {currentModule && (
                <div className={styles.moduleContent}>
                    <h2>{currentModule.title}</h2>
                    <p>{currentModule.content}</p>

                    <button
                        className={styles.completeButton}
                        onClick={handleCompleteModule}
                        disabled={isCompleted}
                    >
                        Hoàn thành module
                    </button>
                </div>
            )}

            <h3 className={styles.structureHeader}>Nội dung khóa học</h3>
            <ul className={styles.moduleList}>
                {modules.map((module) => (
                    <li
                        key={module.id}
                        className={
                            module.id === currentModule?.id
                                ? styles.currentModule
                                : ""
                        }
                    >
                        <span>{module.title}</span>

                        {module.id === currentModule?.id && (<span className={styles.inProgress}>Đang thực hiện</span>)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseDetailPage;