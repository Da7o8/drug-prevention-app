from datetime import datetime
from app.extensions import db
from app.models.course import Course
from app.models.course_progress import UserCourseProgress
from app.models.user import User
from app.models.course_module import CourseModule
from sqlalchemy import or_

class CourseService:
    @staticmethod
    def get_all_courses(target_audience=None, search_term=None):
        """Lấy danh sách tất cả khóa học, tùy chọn lọc theo đối tượng và tìm kiếm."""
        
        query = Course.query.filter_by(is_active=True)
        
        if target_audience:
            query = query.filter(Course.target_audience.ilike(target_audience))    

        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                or_(
                    Course.title.ilike(search_pattern),
                    Course.description.ilike(search_pattern)
                )
            )
        
        return [course.to_dict() for course in query.all()]
    
    @staticmethod
    def create_course(title, description, audience, modules_data):
        """Tạo khóa học mới và các module đi kèm (dành cho Admin/Counselor)."""
        new_course = Course(
            title=title, 
            description=description, 
            target_audience=audience
        )
        db.session.add(new_course)
        db.session.flush() # Lấy ID của course để dùng cho modules
        
        for index, module_data in enumerate(modules_data):
            module = CourseModule(
                course_id=new_course.id,
                title=module_data['title'],
                content=module_data['content'],
                module_order=index + 1
            )
            db.session.add(module)
            
        db.session.commit()
        return new_course.to_dict()
    
    @staticmethod
    def register_user_for_course(user_id, course_id):
        user = User.query.get(user_id)
        course = Course.query.get(course_id)

        if not user or not course:
            raise ValueError("User ID hoặc Course ID không hợp lệ.")

        existing_progress = UserCourseProgress.query.filter_by(user_id=user_id,course_id=course_id).first()

        if existing_progress:
            raise ValueError("Người dùng đã đăng ký khóa học này.")

        first_module = (CourseModule.query.filter_by(course_id=course_id).order_by(CourseModule.module_order.asc()).first())

        new_progress = UserCourseProgress(
            user_id=user_id,
            course_id=course_id,
            last_module_id=first_module.id if first_module else None,
            is_completed=False
        )

        try:
            db.session.add(new_progress)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return new_progress.to_dict()
  
    @staticmethod
    def get_user_course_progress(user_id):
        """Lấy danh sách Khóa học đã đăng ký và tiến trình của người dùng."""
        
        progress_records = UserCourseProgress.query.filter_by(user_id=user_id).all()

        results = []
        for record in progress_records:
            course = Course.query.get(record.course_id)
            
            current_module = CourseModule.query.get(record.last_module_id)

            if course:
                results.append({
                    'course_id': course.id,
                    'course_title': course.title,

                    'progress_id': record.id,
                    'is_completed': record.is_completed,
                    'last_module': current_module.to_dict() if current_module else None,
                    'completion_date': record.completion_date.isoformat() if record.completion_date else None
                })
        
        return results
    
    @staticmethod
    def complete_module(user_id, course_id, module_id):
        """Đánh dấu một module là đã hoàn thành và chuyển sang module tiếp theo."""

        progress = UserCourseProgress.query.filter_by(
            user_id=user_id, 
            course_id=course_id
        ).first()

        if not progress:
            raise ValueError("Người dùng chưa đăng ký khóa học này.")

        if progress.last_module_id != module_id:
            raise ValueError("Module này không phải là module hiện tại của bạn.")

        current_module = CourseModule.query.get(module_id)
        if not current_module:
             raise ValueError("Module không tồn tại.")

        all_modules = CourseModule.query.filter_by(
            course_id=course_id
        ).order_by(CourseModule.module_order).all()

        current_index = all_modules.index(current_module)

        if current_index < len(all_modules) - 1:
            next_module = all_modules[current_index + 1]
            progress.last_module_id = next_module.id
            message = f"Hoàn thành Module '{current_module.title}'. Chuyển sang Module '{next_module.title}'."
        else:
            progress.last_module_id = module_id 
            progress.is_completed = True
            progress.completion_date = datetime.utcnow()
            message = f"Hoàn thành Khóa học '{Course.query.get(course_id).title}'! Chúc mừng!"

        db.session.commit()
        return {"message": message, "progress": progress.to_dict()}
    
    @staticmethod
    def get_course_details_with_user(course_id, user_id):
        """Lấy chi tiết khóa học + tiến trình hiện tại của user (nếu có)."""

        course = Course.query.get(course_id)
        if not course:
            raise ValueError("Khóa học không tồn tại.")
    
        modules = CourseModule.query.filter_by(course_id=course_id).order_by(CourseModule.module_order).all()
        module_dicts = [m.to_dict() for m in modules]

        if not user_id:
            return {
                "course": course.to_dict(),
                "modules": module_dicts,
                "currentModule": None,
                "isCompleted": False
            }
        
        progress = UserCourseProgress.query.filter_by(user_id=user_id, course_id=course_id).first()

        if not progress:
            return {
                "course": course.to_dict(),
                "modules": module_dicts,
                "currentModule": None,
                "isCompleted": False
            }

        current_module = CourseModule.query.get(progress.last_module_id)

        return {
            "course": course.to_dict(),
            "modules": module_dicts,
            "currentModule": current_module.to_dict() if current_module else None,
            "isCompleted": progress.is_completed
        }

