import os

class Config:
    # Cấu hình chung
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-fallback-secret-key')
    
    # Cấu hình SQLAlchemy (Kết nối Database)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://prevention_user:strong_password@db:5433/prevention_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cấu hình JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-jwt-key')
    
    # Cấu hình Celery (Message Broker)
    CELERY_BROKER_URL = os.environ.get('RABBITMQ_BROKER_URL', 'amqp://guest:guest@rabbitmq:5672//')
    CELERY_RESULT_BACKEND = 'redis://redis:6379/0' # Dùng Redis làm result backend
    
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:' # Dùng SQLite trong bộ nhớ cho kiểm thử
    
class ProductionConfig(Config):
    # Cấu hình production 
    DEBUG = False
    
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}