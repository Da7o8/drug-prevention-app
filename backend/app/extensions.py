from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from celery import Celery
from flask_migrate import Migrate

# Khởi tạo các đối tượng Extensions
db = SQLAlchemy()
jwt = JWTManager()
celery = Celery() # Khởi tạo đối tượng Celery cơ bản
migrate = Migrate()

# Hàm cấu hình Celery để đảm bảo nó chạy trong bối cảnh Flask
def init_celery(app):
    # Cấu hình từ config Flask
    celery.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND'],
        task_ignore_result=True, # Tối ưu hóa: không lưu kết quả tác vụ nếu không cần
        task_serializer='json',
        accept_content=['json'],
        timezone='Asia/Ho_Chi_Minh', # Đặt múi giờ cho Celery
        enable_utc=False
    )
    
    # Tạo class ContextTask để Celery có thể truy cập config và extensions của Flask
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            # Đảm bảo mỗi task chạy trong bối cảnh ứng dụng Flask
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# Hàm thiết lập Celery làm default, gọi trong app/init.py
def set_default():
    # Giả định init_celery đã được gọi trước đó
    return celery