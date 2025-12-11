from app.extensions import db
from app.models.counselor import CounselorProfile
from app.models.appointment import Appointment
from app.models.user import User
from app.models.role import Role
from datetime import datetime, timedelta 

class AppointmentService:

    @staticmethod
    def _map_appointment_to_dict(appointment):
        """Chuyển đổi đối tượng Appointment SQLAlchemy thành Dictionary JSON an toàn."""
        
        user = User.query.get(appointment.user_id)
        counselor_profile = CounselorProfile.query.filter_by(id=appointment.counselor_id).first()


        counselor = None 
        if counselor_profile:
            counselor = User.query.get(counselor_profile.user_id)

        counselor_name = "Chuyên viên bị xóa"
        if counselor:
            counselor_name = counselor.name if counselor.name else counselor.email

        user_name = "Người dùng bị xóa"
        if user:
            user_name = user.name if user.name else user.email

        start_time_iso = appointment.start_time.isoformat() if appointment.start_time else None
        end_time_iso = appointment.end_time.isoformat() if appointment.end_time else None
        
        created_at_iso = appointment.created_at.isoformat() if appointment.created_at else None

        return {
            'appointment_id': appointment.id, 
            'user_id': appointment.user_id,
            'counselor_id': appointment.counselor_id,
            'start_time': start_time_iso, 
            'end_time': end_time_iso,
            'reason': appointment.reason,
            'status': appointment.status,
            'created_at': created_at_iso,
            
            'user_name': user_name,
            'counselor_name': counselor_name,
        }
        
    @staticmethod
    def get_appointments_by_role(user_id, role):  
       
        if not role or not user_id:
            return []
        if role == 'admin':
            query = Appointment.query
        elif role == 'counselor':
            counselor_profile = CounselorProfile.query.filter_by(user_id=user_id).first()
            if not counselor_profile:
                return [] 
            
            query = Appointment.query.filter_by(counselor_id=counselor_profile.id) 
        elif role == 'user':
            query = Appointment.query.filter_by(user_id=user_id)
        else: 
            return []
            
        appointments = query.order_by(Appointment.start_time.desc()).all()

        return [AppointmentService._map_appointment_to_dict(a) for a in appointments]
    
    @staticmethod
    def get_available_counselors():
        """Lấy danh sách tất cả chuyên viên tư vấn (đã có profile)."""
        
        counselor_role = Role.query.filter_by(name='counselor').first()
        if not counselor_role or not counselor_role.id:
            return []

        counselors_data = db.session.query(User, CounselorProfile).join(
            CounselorProfile, User.id == CounselorProfile.user_id 
        ).filter(
            User.role_id == counselor_role.id 
        ).all()
        
        results = []
        for user, profile in counselors_data: 
            if profile: 
                results.append({
                    'counselor_id': user.id,
                    'name': user.name or user.email,
                    'specialization': profile.specialization,
                    'qualifications': profile.qualifications
                })
        return results

    @staticmethod
    def create_appointment(user_id, counselor_id, start_time_str, reason):
        """Tạo lịch hẹn mới."""
        
        # 1. Kiểm tra Counselor ID hợp lệ
        counselor_profile = CounselorProfile.query.filter_by(user_id=counselor_id).first()         
        if not counselor_profile:
            raise ValueError(f"ID chuyên viên tư vấn ({counselor_id}) không hợp lệ hoặc không có Profile.")
            
        # 2. Xử lý thời gian
        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = start_time + timedelta(hours=1)
        except ValueError:
            raise ValueError("Định dạng thời gian không hợp lệ (cần ISO 8601).")

        # 3. Tạo lịch hẹn
        new_appointment = Appointment(
            user_id=user_id,
            counselor_id=counselor_profile.id,
            start_time=start_time,
            end_time=end_time,
            reason=reason,
            status='pending'
        )
        db.session.add(new_appointment)
        db.session.commit()
        return {
            'appointment_id': new_appointment.id,
            'status': new_appointment.status,
            'counselor_id': counselor_id 
        }