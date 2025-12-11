import api from './api';
import type { Course, CourseProgress } from '../types/course';

// Các endpoints:
const COURSE_ENDPOINTS = {
    GET_ALL_COURSES: 'api/courses/',
    GET_COURSE_DETAIL: (courseId: number) => `api/courses/${courseId}`,
    CREATE_COURSE: 'api/courses/',
    REGISTER_COURSE: '/api/courses/register',
    GET_MY_PROGRESS: '/api/courses/my-progress',
    COMPLETE_MODULE: (courseId: number) => `/api/courses/complete-module/${courseId}`
};

// Hàm lấy tất cả các khóa học
export const getAllCourses = async (): Promise<Course[]> => {
    try {
        const response = await api.get(COURSE_ENDPOINTS.GET_ALL_COURSES);

        return response.data; 
    } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
        throw error;
    }
};

// Hàm lấy chi tiết một khóa học
export const getCourseDetail = async (courseId: number) => {
    const res = await api.get(`api/courses/${courseId}`);
    return res.data;
};

// Hàm hoàn thành module
export const completeModule = async (courseId: number, moduleId: number): Promise<any> => {
    try {
        const response = await api.post(
            COURSE_ENDPOINTS.COMPLETE_MODULE(courseId), 
            { module_id: moduleId }
        );
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi hoàn thành module:", error);
        throw error;
    }
};

// Hàm tạo khóa học
export const createCourse = async (courseData: any): Promise<Course> => {
    try {
        const response = await api.post(COURSE_ENDPOINTS.CREATE_COURSE, courseData);
        return response.data.course; 
    } catch (error) {
        console.error("Lỗi khi tạo khóa học:", error);
        throw error;
    }
};

// Hàm đăng ký khóa học
export const registerCourse = async (courseId: number): Promise<{ message: string, progress: CourseProgress }> => {
    try {
        const response = await api.post(COURSE_ENDPOINTS.REGISTER_COURSE, { course_id: courseId });
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi đăng ký khóa học:", error);
        throw error;
    }
};

// Hàm xem tiến trình khoá học
export const getMyProgress = async (): Promise<CourseProgress[]> => {
    try {
        const response = await api.get<{ progress: CourseProgress[] }>(COURSE_ENDPOINTS.GET_MY_PROGRESS);
        // Backend trả về { message, progress: [...] }
        return response.data.progress; 
    } catch (error) {
        console.error("Lỗi khi tải tiến trình khóa học:", error);
        throw error;
    }
};