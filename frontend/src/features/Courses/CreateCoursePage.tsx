import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../services/courseService';
import Input from '../../components/ui/Input/Input'; 
import toast from 'react-hot-toast';

// Import CSS Module
import styles from './CreateCoursePage.module.css';

interface ModuleInput {
    title: string;
    content: string;
}

const CreateCoursePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState<'user' | 'counselor' | 'all'>('user');
    const [modules, setModules] = useState<ModuleInput[]>([{ title: '', content: '' }]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    // Thêm Module mới vào mảng
    const handleAddModule = () => {
        setModules([...modules, { title: '', content: '' }]);
    };

    // Cập nhật giá trị của Module cụ thể
    const handleModuleChange = (index: number, field: keyof ModuleInput, value: string) => {
        const newModules = modules.map((module, i) => 
            i === index ? { ...module, [field]: value } : module
        );
        setModules(newModules);
    };

    const handleSubmit = async (e: React.FormEvent) => {e.preventDefault();setError(null);setIsLoading(true);
        const courseData = {
            title,
            description,
            target_audience: targetAudience,
            modules: modules.filter(m => m.title && m.content),
        };

        const toastId = toast.loading('Đang tạo khóa học...');

        try {
            await createCourse(courseData);

            toast.success('Khóa học đã được tạo thành công!', {
            id: toastId,
            });

            navigate('/courses', { replace: true });
        } catch (err: any) {
            let message = 'Lỗi hệ thống khi tạo khóa học. Vui lòng thử lại.';

            if (err.response?.status === 403) {
            message = 'Truy cập bị từ chối. Bạn không có quyền Admin.';
            } else if (err.response?.data?.msg) {
            message = err.response.data.msg;
            }

            toast.error(message, { id: toastId });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
        };
        
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Tạo Khóa học Mới</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* Phần Thông tin Khóa học */}
                <h2 className={styles.sectionHeader}>Thông tin Khóa học</h2>
                <Input
                    label="Tiêu đề Khóa học"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Mô tả</label>
                    <textarea
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Đối tượng Mục tiêu</label>
                    <select
                        className={styles.select}
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value as any)}
                    >
                        <option value="user">Người dùng thông thường</option>
                        <option value="counselor">Chuyên viên tư vấn</option>
                        <option value="all">Cả hai</option>
                    </select>
                </div>

                {/* Phần Modules */}
                <h2 className={styles.sectionHeader}>Nội dung Modules</h2>
                {modules.map((module, index) => (
                    <div key={index} className={styles.moduleCard}>
                        <h3>Module #{index + 1}</h3>
                        <Input
                            label="Tiêu đề Module"
                            value={module.title}
                            onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                            required
                        />
                         <div className={styles.inputGroup}>
                            <label className={styles.label}>Nội dung Module</label>
                            <textarea
                                className={styles.textarea}
                                value={module.content}
                                onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                                rows={5}
                                required
                            />
                        </div>
                    </div>
                ))}

                <button type="button" onClick={handleAddModule} className={styles.addModuleButton}>
                    + Thêm Module
                </button>

                {error && <div className={styles.errorBox}>{error}</div>}

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Đang tạo...' : 'Tạo Khóa học'}
                </button>
            </form>
        </div>
    );
};

export default CreateCoursePage;