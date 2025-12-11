export interface CourseModule {
    id: number;
    title: string;
    content: string;
    // progress_status: 'completed' | 'pending'; 
}

export interface Course {
    id: number;
    title: string;
    description: string;
    target_audience: 'user' | 'counselor' | 'all';
    modules?: CourseModule[]; 
}

export interface CourseProgress {
    id: number;
    user_id: number;
    course_id: number;
    last_module_id: number | null; 
    is_completed: boolean;
    completion_date: string | null;
    course_title?: string;
    last_module?: CourseModule | null;
    progress_id?: number;   
}