from ..extensions import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    
    # Phân loại theo đối tượng (ví dụ: 'student', 'parent', 'teacher')
    target_audience = db.Column(db.String(64), nullable=False) 
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Mối quan hệ 1-N với CourseModule 
    modules = db.relationship('CourseModule', backref='course', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'target_audience': self.target_audience
        }
        
    def __repr__(self):
        return f'<Course {self.title} ({self.target_audience})>'