from flask import current_app
from app.extensions import db
from app.models.user import User
from app.models.role import Role
from flask_jwt_extended import create_access_token
from app.models.counselor import CounselorProfile

class UserService:

    @staticmethod
    def register_user(email, password, name=None, role_name='user'):
        """Logic đăng ký người dùng cộng đồng (default role)."""
        if User.query.filter_by(email=email).first():
            raise ValueError("Email đã tồn tại.")

        # Lấy Role: Nếu có role_name, tìm role đó. Nếu không, dùng 'user'.
        target_role = Role.query.filter_by(name=role_name).first()
        if not target_role:
            raise Exception(f"Vai trò '{role_name}' không tồn tại trong hệ thống.")

        new_user = User(email=email, name=name, role_id=target_role.id)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()
        
        return new_user

    @staticmethod
    def authenticate_user(email, password):
        """Logic xác thực và tạo JWT."""
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            # Lấy vai trò của người dùng
            user_role_name = user.role.name
            
            # Tạo Access Token
            # Thêm role_name vào claims để JWT chứa thông tin phân quyền
            access_token = create_access_token(identity=str(user.id), additional_claims={'role': user_role_name})
            
            return {
                'user_id': user.id,
                'email': user.email,
                'role': user_role_name,
                'token': access_token
            }
        
        raise ValueError("Email hoặc mật khẩu không chính xác.")

    @staticmethod
    def update_counselor_profile(user_id, specialization, qualifications, contact_info):
        """Cập nhật/Tạo CounselorProfile cho một User."""
        user = User.query.get(user_id)

        if not user or user.role.name != 'counselor':
             raise ValueError("Người dùng không tồn tại hoặc không phải là chuyên viên.")
             
        profile = CounselorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = CounselorProfile(user_id=user_id)
            db.session.add(profile)
        
        profile.specialization = specialization
        profile.qualifications = qualifications
        profile.contact_info = contact_info
        
        db.session.commit()
        return profile.to_dict() # Giả sử CounselorProfile có hàm to_dict