drug-prevention-app/
├── backend/                                # Thư mục gốc chứa mã nguồn Python Flask
│   ├── app/                                # Package chính của ứng dụng Flask
│   │   ├── __init__.py                     # Khởi tạo ứng dụng Flask, Extensions (DB, JWT, Migrate)
│   │   ├── extensions.py                   # Định nghĩa các Flask Extensions (DB, Migrate, JWT)
│   │   ├── models/                         # Định nghĩa các Model (Bảng DB)
│   │   │   ├── __init__.py                 # Import tất cả Models (để Alembic nhận diện)
│   │   │   ├── user.py                     # Model User (Thông tin cơ bản, hash mật khẩu)
│   │   │   ├── role.py                     # Model Role (Admin, Counselor, User)
│   │   │   ├── course.py                   # Model Course (Khóa học)
│   │   │   ├── course_module.py            # Model CourseModule (Nội dung từng bài học)
│   │   │   ├── course_progress.py          # Model UserCourseProgress (Theo dõi tiến độ học)
│   │   │   ├── counselor.py                # Model CounselorProfile (Thông tin chuyên viên)
│   │   │   └── appointment.py              # Model Appointment (Lịch hẹn tư vấn)
│   │   ├── services/                       # Logic nghiệp vụ (Business Logic Layer)
│   │   │   ├── __init__.py                 # Đánh dấu là Python package
│   │   │   ├── user_service.py             # Logic đăng ký, đăng nhập, tạo/cập nhật Counselor Profile
│   │   │   ├── course_service.py           # Logic tạo, đọc Khóa học và Modules
│   │   │   └── appointment_service.py      # Logic lấy danh sách chuyên viên, tạo lịch hẹn
│   │   ├── api/                            # Lớp Controller (Flask Blueprints)
│   │   │   ├── __init__.py                 # Định nghĩa và đăng ký tất cả Blueprints
│   │   │   ├── auth/                       # Blueprint: Xác thực và Profile
│   │   │   │   ├── __init__.py             # Định nghĩa auth_bp
│   │   │   │   └── routes.py               # Routes: /auth/register, /auth/login, /auth/counselor-profile
│   │   │   ├── courses/                    # Blueprint: Quản lý Khóa học
│   │   │   │   ├── __init__.py             # Định nghĩa courses_bp
│   │   │   │   └── routes.py               # Routes: /courses/ (GET, POST)
│   │   │   └── appointments/               # Blueprint: Hẹn lịch tư vấn
│   │   │       ├── __init__.py             # Định nghĩa appointment_bp
│   │   │       └── routes.py               # Routes: /appointments/counselors, /appointments/ (POST)
│   │   └── utils/                          # Các tiện ích chung
│   │       └── decorators.py               # Decorator @role_required (RBAC)
│   ├── migrations/                         # Thư mục quản lý Database Migration (do Alembic tạo)
│   │   └── versions/                       # Chứa các file migration (.py) đã tạo (ví dụ: clean initial schema)
│   ├── seeds.py                            # Script Seeder: Tạo Roles và tài khoản Admin mặc định
│   ├── run.py                              # Entry point chính để khởi chạy Flask App
│   └── requirements.txt                    # Danh sách các thư viện Python (Flask, SQLAlchemy, JWT, etc.)
├── docker-compose.yml                      # Định nghĩa các services (api, db, redis, rabbitmq)
└── Dockerfile                              # Hướng dẫn build image cho service API

