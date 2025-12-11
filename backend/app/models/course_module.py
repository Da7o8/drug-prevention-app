from ..extensions import db

class CourseModule(db.Model):
    __tablename__ = 'course_modules'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text) # Nội dung bài học (HTML/Markdown)
    module_order = db.Column(db.Integer, default=1) # Thứ tự bài học

    # Mối quan hệ N-1 với Course 
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'title': self.title,
            'content': self.content,
            'module_order': self.module_order
        }

    def __repr__(self):
        return f'<Module {self.title} in Course {self.course_id}>'