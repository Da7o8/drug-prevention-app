from app.extensions import db
from app.models.role import Role
from app.models.user import User
from app.models.counselor import CounselorProfile
from werkzeug.security import generate_password_hash
from app.models.course import Course
from app.models.course_module import CourseModule 


def seed_roles():
    roles_data = [
        {'name': 'admin', 'description': 'Quản trị viên toàn hệ thống'},
        {'name': 'counselor', 'description': 'Chuyên viên tư vấn'},
        {'name': 'user', 'description': 'Người dùng cộng đồng'},
    ]

    for data in roles_data:
        if not Role.query.filter_by(name=data['name']).first():
            db.session.add(Role(**data))
            print(f"Đã thêm vai trò: {data['name']}")

    db.session.commit()


def seed_admin_user():
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        return

    email = 'admin@example.com'
    if User.query.filter_by(email=email).first():
        return

    admin = User(
        email=email,
        name='System Admin',
        role_id=admin_role.id
    )
    admin.password_hash = generate_password_hash('Admin@123')
    db.session.add(admin)
    db.session.commit()

    print("Đã tạo tài khoản Admin mặc định")


def seed_counselor_user():
    counselor_role = Role.query.filter_by(name='counselor').first()
    if not counselor_role:
        return

    email = 'counselor@example.com'
    if User.query.filter_by(email=email).first():
        return

    counselor = User(
        email=email,
        name='Chuyên viên G',
        role_id=counselor_role.id
    )
    counselor.password_hash = generate_password_hash('Counselor@123')
    db.session.add(counselor)

    db.session.flush()  
    print("Counselor user id:", counselor.id)

    profile = CounselorProfile(
        user_id=counselor.id,
        specialization='Tư vấn cai nghiện',
        qualifications='Thạc sĩ tâm lý lâm sàng'
    )
    db.session.add(profile)

    db.session.commit()
    print("Đã tạo Counselor + Profile")


def seed_courses():
    course_title = 'Khóa học Cơ bản về Cai nghiện'

    if Course.query.filter_by(title=course_title).first():
        print(f"Khóa học '{course_title}' đã tồn tại, bỏ qua.")
        return

    course = Course(
        title=course_title,
        description='Khóa học giới thiệu về các giai đoạn cai nghiện và các kỹ năng đối phó ban đầu.',
        target_audience='student',  
        is_active=True               
    )

    db.session.add(course)
    db.session.flush() 

    modules = [
        CourseModule(
            course_id=course.id,
            title='Module 1: Hiểu về Nghiện',
            content='Nội dung cơ bản về sinh lý học của sự nghiện.',
            module_order=1
        ),
        CourseModule(
            course_id=course.id,
            title='Module 2: Kỹ năng đối phó',
            content='Các kỹ thuật thư giãn và xử lý cơn thèm.',
            module_order=2
        ),
        CourseModule(
            course_id=course.id,
            title='Module 3: Lập kế hoạch phục hồi',
            content='Hướng dẫn thiết lập mạng lưới hỗ trợ cá nhân.',
            module_order=2
        ),
    ]

    db.session.add_all(modules)
    db.session.commit()

    print(f"Đã tạo khóa học: {course_title}")