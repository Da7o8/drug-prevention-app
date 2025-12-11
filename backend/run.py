import os
import click 
from app import create_app
from app.extensions import db

# IMPORT TẤT CẢ CÁC HÀM SEED TỪ FILE seed.py
from seed import seed_roles, seed_admin_user, seed_counselor_user, seed_courses

# 1. Lấy biến môi trường FLASK_ENV
env_name = os.environ.get('FLASK_ENV', 'development')

# 2. Ánh xạ tên môi trường sang tên Class cấu hình
def get_config_object(env):
    if env == 'production':
        return 'config.ProductionConfig'
    elif env == 'testing':
        return 'config.TestingConfig'
    else: 
        return 'config.DevelopmentConfig' 

# 3. Lấy tên đối tượng cấu hình chính xác
config_object_name = get_config_object(env_name)

# 4. Truyền tên Class cấu hình vào create_app
app = create_app(config_object_name)

@app.cli.command("seed") 
def seed_command():
    """Tạo dữ liệu ban đầu cho ứng dụng."""
    with app.app_context():
        print("--- Bắt đầu Seeding Dữ liệu ---")
        try:
            seed_roles()
            seed_admin_user()
            seed_counselor_user()
            seed_courses()
            
            print("--- Hoàn tất Seeding thành công ---")
            
        except Exception as e:
            db.session.rollback()
            print(f"--- LỖI SEEDING CẤP CAO: {e} ---") 
            print("--- Seeding thất bại ---")
        
        db.session.remove()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)