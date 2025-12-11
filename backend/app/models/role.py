# backend/app/models/role.py
from ..extensions import db

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False) # 'user', 'counselor', 'admin'
    description = db.Column(db.String(256))

    # Định nghĩa mối quan hệ 1-N với User
    users = db.relationship('User', backref='role', lazy='dynamic')

    def __repr__(self):
        return f'<Role {self.name}>'