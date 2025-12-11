from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash 

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    name = db.Column(db.String(64))
    is_active = db.Column(db.Boolean, default=True)

    # Khóa ngoại: Liên kết với bảng roles (1-N)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)

    # Mối quan hệ 1-1 với CounselorProfile
    profile = db.relationship('CounselorProfile', backref='counselor', uselist=False)

    # Phương thức bảo mật
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'