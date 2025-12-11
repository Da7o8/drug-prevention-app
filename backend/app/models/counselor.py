from ..extensions import db

class CounselorProfile(db.Model):
    __tablename__ = 'counselor_profiles'
    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại 1-1 với bảng users
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Thông tin chuyên môn
    qualifications = db.Column(db.Text) # Bằng cấp, chứng chỉ
    specialization = db.Column(db.String(128)) # Chuyên môn 
    bio = db.Column(db.Text) # Giới thiệu ngắn

    # Lịch làm việc (Chúng ta sẽ dùng một bảng Schedule riêng sau, đây là thông tin chung)
    
    # Mối quan hệ N-1 với Appointment
    appointments = db.relationship('Appointment', backref='counselor_assigned', lazy='dynamic')

    def __repr__(self):
        return f'<CounselorProfile {self.specialization} for User ID {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialization': self.specialization,
            'qualifications': self.qualifications,
        }