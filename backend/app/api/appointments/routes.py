from flask import request, jsonify
from . import appointment_bp
from app.services.appointment_service import AppointmentService
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt 
from app.utils.decorators import role_required 
import logging

# --- ROUTE LẤY DANH SÁCH CHUYÊN VIÊN ---
@appointment_bp.route('/counselors', methods=['GET'])
def get_counselors():
    """Lấy danh sách các chuyên viên tư vấn."""
    counselors = AppointmentService.get_available_counselors()
    return jsonify(counselors), 200

# Thiết lập logger
logger = logging.getLogger(__name__)

# [1] Xử lý GET: Lấy danh sách lịch hẹn 
@appointment_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_appointments():
    """Lấy danh sách lịch hẹn của người dùng hiện tại (lọc theo role)."""
    current_user_id = get_jwt_identity()
    try:
        current_user_role = get_jwt()['role']
    except Exception:
        return jsonify({"msg": "Token không hợp lệ hoặc thiếu claim role"}), 401

    try:
        appointments = AppointmentService.get_appointments_by_role(
            user_id=int(current_user_id),
            role=current_user_role
        )
        return jsonify(appointments), 200
        
    except Exception as e:
        # IN LỖI RA LOG DOCKER
        logger.error(f"Lỗi khi tải lịch hẹn: {e}", exc_info=True)
        return jsonify({"msg": "Lỗi hệ thống khi tải lịch hẹn", "error": str(e)}), 500

# [2] Xử lý POST: Đặt lịch hẹn mới
@appointment_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('user')
def book_appointment():
    """Đặt lịch hẹn mới."""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    required_fields = ['counselor_id', 'start_time', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Thiếu các trường bắt buộc"}), 400

    try:
        result = AppointmentService.create_appointment(
            user_id=int(current_user_id),
            counselor_id=data['counselor_id'],
            start_time_str=data['start_time'],
            reason=data['reason']
        )
        return jsonify({"msg": "Đã gửi yêu cầu hẹn lịch thành công", "appointment": result}), 201

    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": "Lỗi hệ thống khi đặt lịch", "error": str(e)}), 500


# --- ROUTE CẬP NHẬT TRẠNG THÁI ---
@appointment_bp.route('/<int:appointment_id>/status', methods=['POST'])
@jwt_required()
@role_required(['admin', 'counselor'])
def update_appointment_status(appointment_id):
    # ... (logic giữ nguyên) ...
    data = request.get_json()
    status = data.get('status')
    if status not in ['pending', 'confirmed', 'canceled', 'completed']:
         return jsonify({"msg": "Trạng thái không hợp lệ"}), 400
    
    try:
        updated_appointment = AppointmentService.update_status(appointment_id, status)
        return jsonify(updated_appointment), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": "Lỗi hệ thống khi cập nhật trạng thái", "error": str(e)}), 500