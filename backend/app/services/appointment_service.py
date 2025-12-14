from app.extensions import db
from app.models.counselor import CounselorProfile
from app.models.appointment import Appointment
from app.models.user import User
from app.models.role import Role
from datetime import datetime, timedelta, timezone
from app.utils.errors import BusinessError, NotFoundError

class AppointmentService:
   
   # '''Dịch vụ quản lý lịch hẹn tư vấn.'''
   @staticmethod
   def _map_appointment_to_dict(appointment, current_user_id, role):
        user = User.query.get(appointment.user_id)
        counselor_profile = CounselorProfile.query.get(appointment.counselor_id)

        counselor = None
        if counselor_profile:
            counselor = User.query.get(counselor_profile.user_id)

        counselor_name = counselor.name if counselor and counselor.name else "Chuyên viên bị xóa"
        user_name = user.name if user and user.name else "Người dùng bị xóa"

        # 🔑 BẮT BUỘC: trả UTC có offset
        start_time_iso = (
            appointment.start_time.astimezone(timezone.utc).isoformat()
            if appointment.start_time else None
        )
        end_time_iso = (
            appointment.end_time.astimezone(timezone.utc).isoformat()
            if appointment.end_time else None
        )
        created_at_iso = (
            appointment.created_at.astimezone(timezone.utc).isoformat()
            if appointment.created_at else None
        )

        permissions = AppointmentService._get_permissions(
            appointment=appointment,
            current_user_id=current_user_id,
            role=role
        )

        return {
            "appointment_id": appointment.id,
            "user_id": appointment.user_id,
            "counselor_user_id": counselor.id if counselor else None,
            "start_time": start_time_iso,
            "end_time": end_time_iso,
            "reason": appointment.reason,
            "status": appointment.status,
            "created_at": created_at_iso,
            "user_name": user_name,
            "counselor_name": counselor_name,
            "permissions": permissions
        }
      
   
   # '''' Lấy danh sách lịch hẹn theo vai trò người dùng '''
   @staticmethod
   def get_appointments_by_role(user_id, role, page=1, limit=10):
        if not role or not user_id:
            return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "total_pages": 0}}

        if role == "admin":
            query = Appointment.query
        elif role == "counselor":
            counselor_profile = CounselorProfile.query.filter_by(user_id=user_id).first()
            if not counselor_profile:
                return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "total_pages": 0}}
            query = Appointment.query.filter_by(counselor_id=counselor_profile.id)
        elif role == "user":
            query = Appointment.query.filter_by(user_id=user_id)
        else:
            return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "total_pages": 0}}

        total = query.count()

        # 🔑 LỊCH GẦN NHẤT Ở TRÊN
        appointments = (
            query
            .order_by(Appointment.start_time.asc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        data = [
            AppointmentService._map_appointment_to_dict(a, user_id, role)
            for a in appointments
        ]

        return {
            "data": data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        }

   
   
   # ''' Lấy danh sách chuyên viên tư vấn có hồ sơ '''
   @staticmethod
   def get_available_counselors():
      
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


   # ''' Tạo lịch hẹn mới '''
   @staticmethod
   def create_appointment(user_id, counselor_user_id, start_time_str, reason):
        counselor_user = User.query.get(counselor_user_id)
        if not counselor_user:
            raise NotFoundError("COUNSELOR_NOT_FOUND", "Chuyên viên không tồn tại.")

        if counselor_user.role.name != "counselor":
            raise BusinessError("INVALID_COUNSELOR_ROLE", "Người dùng này không phải là chuyên viên.")

        counselor_profile = CounselorProfile.query.filter_by(user_id=counselor_user_id).first()
        if not counselor_profile:
            raise BusinessError("COUNSELOR_PROFILE_NOT_FOUND", "Chuyên viên chưa có hồ sơ tư vấn.")

        try:
            start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        except ValueError:
            raise BusinessError("INVALID_DATETIME_FORMAT", "Định dạng thời gian không hợp lệ.")

        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        else:
            start_time = start_time.astimezone(timezone.utc)

        if start_time <= datetime.now(timezone.utc):
            raise BusinessError("APPOINTMENT_TIME_IN_PAST", "Không thể đặt lịch trong quá khứ.")

        end_time = start_time + timedelta(hours=1)

        conflict = Appointment.query.filter(
            Appointment.counselor_id == counselor_profile.id,
            Appointment.status == "confirmed",
            Appointment.start_time < end_time,
            Appointment.end_time > start_time
        ).first()

        if conflict:
            raise BusinessError("APPOINTMENT_TIME_CONFLICT", "Thời gian này chuyên viên đã có lịch khác.")

        appointment = Appointment(
            user_id=user_id,
            counselor_id=counselor_profile.id,
            start_time=start_time,
            end_time=end_time,
            reason=reason,
            status="pending"
        )

        db.session.add(appointment)
        db.session.commit()

        return {
            "appointment_id": appointment.id,
            "status": appointment.status,
            "counselor_user_id": counselor_user_id
        }


   # ''' Cập nhật trạng thái lịch hẹn '''
   @staticmethod
   def update_status(appointment_id, new_status, current_user_id, role):
      appointment = Appointment.query.get(appointment_id)
      if not appointment:
         raise NotFoundError(
               "APPOINTMENT_NOT_FOUND",
               "Lịch hẹn không tồn tại."
         )

      db.session.refresh(appointment)
      current_status = appointment.status

      if current_status in ['completed', 'canceled']:
         raise BusinessError(
               "APPOINTMENT_STATUS_FINAL",
               "Lịch hẹn đã kết thúc, không thể thay đổi trạng thái."
         )

      allowed_transitions = {
         'pending': {
               'counselor': ['confirmed', 'canceled'],
               'admin': ['confirmed', 'canceled']
         },
         'confirmed': {
               'admin': ['completed', 'canceled']
         }
      }

      allowed_statuses = allowed_transitions.get(current_status, {}).get(role, [])
      if new_status not in allowed_statuses:
         raise BusinessError(
               "APPOINTMENT_STATUS_INVALID_TRANSITION",
               f"Không được phép chuyển từ '{current_status}' sang '{new_status}'."
         )

      # CONFLICT CHECK – ONLY FOR CONFIRMED
      if new_status == 'confirmed':
         conflict = Appointment.query.filter(
               Appointment.counselor_id == appointment.counselor_id,
               Appointment.id != appointment.id,
               Appointment.status == 'confirmed',
               Appointment.start_time < appointment.end_time,
               Appointment.end_time > appointment.start_time
         ).with_for_update().first()

         if conflict:
               raise BusinessError(
                  "APPOINTMENT_TIME_CONFLICT",
                  "Khung giờ này đã có lịch hẹn được xác nhận."
               )

      # Ownership check cho counselor
      if role == 'counselor':
         counselor_profile = CounselorProfile.query.filter_by(
               user_id=current_user_id
         ).first()

         if not counselor_profile:
               raise BusinessError(
                  "COUNSELOR_PROFILE_NOT_FOUND",
                  "Không tìm thấy hồ sơ chuyên viên."
               )

         if appointment.counselor_id != counselor_profile.id:
               raise BusinessError(
                  "APPOINTMENT_FORBIDDEN",
                  "Bạn không có quyền cập nhật lịch hẹn này."
               )

      appointment.status = new_status
      db.session.commit()

      return AppointmentService._map_appointment_to_dict(
         appointment,
         current_user_id=current_user_id,
         role=role
      )
   
   
   # ''' Lấy quyền cập nhật trạng thái lịch hẹn '''
   @staticmethod
   def _get_permissions(appointment, current_user_id, role):
      current_status = appointment.status

      # Trạng thái kết thúc
      if current_status in ['completed', 'canceled']:
         return {
            "can_update_status": False,
            "allowed_next_status": []
         }

      # Định nghĩa luồng trạng thái
      allowed_transitions = {
         'pending': {
            'counselor': ['confirmed', 'canceled'],
            'admin': ['confirmed', 'canceled']
         },
         'confirmed': {
            'admin': ['completed', 'canceled']
         }
      }

      role_rules = allowed_transitions.get(current_status, {})
      allowed_next_status = role_rules.get(role, [])

      # User thường không được update
      if role == 'user':
         return {
            "can_update_status": False,
            "allowed_next_status": []
         }

      # Counselor chỉ được update lịch của mình
      if role == 'counselor':
         counselor_profile = CounselorProfile.query.filter_by(
            user_id=current_user_id
         ).first()

         if not counselor_profile or appointment.counselor_id != counselor_profile.id:
            return {
                  "can_update_status": False,
                  "allowed_next_status": []
            }

      return {
         "can_update_status": len(allowed_next_status) > 0,
         "allowed_next_status": allowed_next_status
      }