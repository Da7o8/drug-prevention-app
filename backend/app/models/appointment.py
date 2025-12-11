from ..extensions import db
from datetime import datetime

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại: Người dùng đặt lịch
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Khóa ngoại: Chuyên viên được đặt
    counselor_id = db.Column(db.Integer, db.ForeignKey('counselor_profiles.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Chi tiết cuộc hẹn
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(32), default='pending') # pending, confirmed, cancelled, completed
    
    # Lý do đặt lịch
    reason = db.Column(db.Text) 
    
    # Mối quan hệ N-1 với User
    user = db.relationship('User', backref=db.backref('booked_appointments', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Appointment ID:{self.id} Status:{self.status}>'