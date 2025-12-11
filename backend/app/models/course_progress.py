from ..extensions import db
from datetime import datetime

class UserCourseProgress(db.Model):
    __tablename__ = 'user_course_progress'
    id = db.Column(db.Integer, primary_key=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Mối quan hệ N-1 với CourseModule 
    last_module_id = db.Column(db.Integer, db.ForeignKey('course_modules.id'), nullable=True)
    
    is_completed = db.Column(db.Boolean, default=False)
    completion_date = db.Column(db.DateTime, nullable=True)
    
    # Đảm bảo mỗi người dùng chỉ có một progress record cho mỗi khóa học
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='_user_course_uc'),)

    def to_dict(self):
        """Chuyển đổi đối tượng UserCourseProgress sang dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'last_module_id': self.last_module_id, 
            'is_completed': self.is_completed,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None
        }