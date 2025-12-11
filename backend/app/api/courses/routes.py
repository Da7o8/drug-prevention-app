from flask import request, jsonify
from . import course_bp
from app.services.course_service import CourseService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.utils.decorators import role_required
from app.models.course import Course
from app.models.course_module import CourseModule

@course_bp.route('/', methods=['GET'])
def get_courses():
    """Lấy danh sách khóa học (Có thể lọc theo đối tượng)."""
    target = request.args.get('audience')
    courses = CourseService.get_all_courses(target)
    return jsonify(courses), 200

@course_bp.route('/', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_course():
    """Tạo khóa học mới (Chỉ Admin/Counselor)."""
    data = request.get_json()
    required_fields = ['title', 'description', 'target_audience', 'modules']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Thiếu các trường bắt buộc"}), 400

    try:
        course = CourseService.create_course(
            data['title'], 
            data['description'], 
            data['target_audience'], 
            data['modules']
        )
        return jsonify({"msg": "Khóa học đã được tạo", "course": course}), 201
    except Exception as e:
        # Lỗi DB, lỗi nghiệp vụ...
        return jsonify({"msg": "Lỗi tạo khóa học", "error": str(e)}), 500
    
@course_bp.route('/register', methods=['POST'])
@jwt_required() 
def register_for_course():
    """Endpoint Đăng ký Khóa học cho User."""
    data = request.get_json()
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"message": "Thiếu course_id"}), 400
    
    # Lấy user_id từ token JWT (đã đăng nhập)
    user_id = int(get_jwt_identity())

    try:
        # Gọi hàm service
        progress = CourseService.register_user_for_course(user_id, course_id)
        
        return jsonify({
            "message": "Đăng ký khóa học thành công",
            "progress": progress
        }), 201

    except ValueError as e:
        # Xử lý lỗi nghiệp vụ (User đã đăng ký, ID không hợp lệ)
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        print("REGISTER COURSE ERROR:", repr(e))
        return jsonify({"message": "Internal server error"}), 500
    
@course_bp.route('/my-progress', methods=['GET'])
@jwt_required()
def get_my_course_progress():
    """Endpoint Lấy tiến trình tất cả các khóa học đã đăng ký của User."""
    user_id = int(get_jwt_identity())

    try:
        progress_list = CourseService.get_user_course_progress(user_id)
        
        return jsonify({
            "message": "Lấy tiến trình khóa học thành công",
            "progress": progress_list
        }), 200

    except Exception as e:
        print(f"LỖI LẤY TIẾN TRÌNH KHÓA HỌC: {e}")
        return jsonify({"message": "Lỗi server nội bộ khi tải tiến trình"}), 500
    
@course_bp.route('/complete-module/<int:course_id>', methods=['POST'])
@jwt_required()
def complete_module_route(course_id):
    """Endpoint Hoàn thành một module trong khóa học."""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    module_id = data.get('module_id')

    if not module_id:
        return jsonify({"message": "Thiếu module_id"}), 400

    try:
        result = CourseService.complete_module(user_id, course_id, module_id)
        
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"LỖI HOÀN THÀNH MODULE: {e}")
        return jsonify({"message": "Lỗi server nội bộ khi hoàn thành module"}), 500
    
@course_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required(optional=True)  
def get_course_detail(course_id):
    user_id = get_jwt_identity()

    try:
        detail = CourseService.get_course_details_with_user(course_id, user_id)
        return jsonify(detail), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 404
    except Exception as e:
        print("ERROR GET COURSE DETAIL:", e)
        return jsonify({"message": "Internal server error"}), 500