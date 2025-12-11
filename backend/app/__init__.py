from flask import Flask
from .extensions import db, jwt, init_celery, migrate 
from . import models
from .api import register_blueprints 
from flask_cors import CORS

def create_app(config_object='config.Config'):
    app = Flask(__name__)
    
    # 1. Tải cấu hình
    app.config.from_object(config_object)
    
    # 2. Khởi tạo Extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Khởi tạo Celery 
    init_celery(app) 
    
    migrate.init_app(app, db)
    
    # KÍCH HOẠT CORS CHO TOÀN BỘ ỨNG DỤNG 
    CORS(app, resources={r"/*": {"origins": "*"}}) 
    
    # 3. Đăng ký Blueprints (Routes/API)
    register_blueprints(app)
    
    # 4. Thêm một route kiểm tra
    @app.route('/health')
    def health_check():
        return {"status": "ok", "service": "api"}, 200

    return app