from app.extensions import db
from app.models.role import Role
from app.models.user import User
from app.models.counselor import CounselorProfile
from werkzeug.security import generate_password_hash
from app.models.course import Course
from app.models.course_module import CourseModule
from datetime import datetime

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
    
    courses_data = [
        # Khóa học GỐC (Dành cho Student)
        {
            'title': 'Khóa học Cơ bản về Cai nghiện',
            'description': 'Khóa học giới thiệu về các giai đoạn cai nghiện và các kỹ năng đối phó ban đầu.',
            'target_audience': 'student',
            'modules': [
                {'title': 'Module 1: Hiểu về Nghiện', 'content': 'Nội dung cơ bản về sinh lý học của sự nghiện.'},
                {'title': 'Module 2: Kỹ năng đối phó', 'content': 'Các kỹ thuật thư giãn và xử lý cơn thèm.'},
                {'title': 'Module 3: Lập kế hoạch phục hồi', 'content': 'Hướng dẫn thiết lập mạng lưới hỗ trợ cá nhân.'},
            ]
        },
        # Khóa học MỚI 1 (Dành cho Parent) - Chú trọng vào giao tiếp
        {
            'title': 'Khóa học dành cho Phụ huynh: Giao tiếp với con',
            'description': 'Học cách giao tiếp hiệu quả và hỗ trợ con cái trong quá trình cai nghiện.',
            'target_audience': 'parent',
            'modules': [
                {'title': 'Module 1: Lắng nghe chủ động', 'content': 'Thực hành kỹ năng lắng nghe không phán xét.'},
                {'title': 'Module 2: Thiết lập ranh giới', 'content': 'Cách tạo ra một môi trường an toàn và có trật tự.'},
            ]
        },
        # Khóa học MỚI 2 (Dành cho Professional) - Chú trọng chuyên môn
        {
            'title': 'Kỹ thuật Can thiệp Khủng hoảng',
            'description': 'Khóa học nâng cao dành cho chuyên gia về các phương pháp can thiệp trong tình huống khủng hoảng nghiện.',
            'target_audience': 'professional',
            'modules': [
                {'title': 'Module 1: Đánh giá nguy cơ', 'content': 'Quy trình đánh giá nguy cơ tự sát và bạo lực.'},
                {'title': 'Module 2: Ổn định cảm xúc', 'content': 'Kỹ thuật giúp thân chủ ổn định trong cơn khủng hoảng.'},
                {'title': 'Module 3: Chuyển tuyến', 'content': 'Hướng dẫn chuyển tuyến an toàn cho thân chủ.'},
            ]
        },
        # Khóa học MỚI 3 (Dành cho Student) - Chủ đề khác
        {
            'title': 'Quản lý Cảm xúc và Stress',
            'description': 'Học cách quản lý stress và cảm xúc tiêu cực mà không cần dùng đến chất gây nghiện.',
            'target_audience': 'student',
            'modules': [
                {'title': 'Module 1: Nhận diện cảm xúc', 'content': 'Phân biệt các loại cảm xúc và phản ứng.'},
                {'title': 'Module 2: Kỹ thuật thở', 'content': 'Thực hành các bài tập thở giúp giảm căng thẳng.'},
            ]
        },
        # Khóa học MỚI 4 (Dành cho Parent) - Chủ đề Hỗ trợ
        {
            'title': 'Hỗ trợ Phục hồi tại nhà',
            'description': 'Cung cấp kiến thức để tạo ra môi trường hỗ trợ và động viên cho người thân đang phục hồi.',
            'target_audience': 'parent',
            'modules': [
                {'title': 'Module 1: Vai trò của gia đình', 'content': 'Hiểu về vai trò và giới hạn của gia đình trong quá trình phục hồi.'},
                {'title': 'Module 2: Tự chăm sóc', 'content': 'Quan trọng của việc tự chăm sóc cho người hỗ trợ.'},
            ]
        },
    ]

    for data in courses_data:
        if Course.query.filter_by(title=data['title']).first():
            print(f"Khóa học '{data['title']}' đã tồn tại, bỏ qua.")
            continue
        
        course = Course(
            title=data['title'],
            description=data['description'],
            target_audience=data['target_audience'],
            is_active=True
        )

        db.session.add(course)
        db.session.flush() # Lấy course.id

        modules_to_add = []
        for index, module_data in enumerate(data['modules']):
            module = CourseModule(
                course_id=course.id,
                title=module_data['title'],
                content=module_data['content'],
                module_order=index + 1
            )
            modules_to_add.append(module)

        db.session.add_all(modules_to_add)
        db.session.commit()
        
        print(f"Đã tạo khóa học: {data['title']}")

def seed_all():
    print("--- Bắt đầu Seeding Dữ liệu ---")
    seed_roles()
    seed_admin_user()
    seed_counselor_user()
    seed_default_user()
    seed_courses()
    print("--- Hoàn tất Seeding thành công ---")
    
def seed_default_user():
    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        return

    email = 'user1@example.com'
    if User.query.filter_by(email=email).first():
        return

    user = User(
        email=email,
        name='Người dùng Test',
        role_id=user_role.id
    )
    user.password_hash = generate_password_hash('Admin@123')
    db.session.add(user)
    db.session.commit()
    print("Đã tạo tài khoản User mặc định: user1@example.com")