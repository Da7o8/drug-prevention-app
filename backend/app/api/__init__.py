from flask import Flask

# Import Blueprints
from .auth import auth_bp
from .courses import course_bp
from .appointments import appointment_bp

def register_blueprints(app: Flask):
    app.register_blueprint(auth_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(appointment_bp)
    # Các Blueprints khác (appointments, surveys) sẽ được thêm vào đây